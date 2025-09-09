import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGift,
  faUserTie,
  faUser,
  faPlusCircle,
  faCalendar,
  faCalendarAlt,
  faSave,
  faImage,
  faCheck,
  faTimes,
  faTrash,
  faSearch,
  faFilter,
  faEdit,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useRef, useState } from "react";
import axios from "../../helpers/Axios";
import type { AxiosError } from "axios";
import Toast from "../../components/Toast";
import { useAuth } from "../../context/AuthContext";

type Flash = { type: "success" | "error"; text: string };

type LaporanItem = {
  id: string;
  nama: string;
  jenis: string;
  periodeBulan: string;
  periodeTahun: number;
  foto: string;
  catatan: string | null;
  respondenId: string;
  userId: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "TERLAMBAT";
  responden?: { nama: string };
  user?: { email: string };
  createdAt: string;
};

type RespondenOption = { id: string; nama: string };

const bulanOptions = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const LaporanSouvenir: React.FC = () => {
  const { user } = useAuth();

  const [flash, setFlash] = useState<Flash | null>(null);

  const absoluteUrl = (path: string | null | undefined) => {
    if (!path) return "";
    return /^https?:\/\//i.test(path)
      ? path
      : `${axios.defaults.baseURL}${path}`;
  };

  const [search, setSearch] = useState("");
  const [searchField, setSearchField] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searching, setSearching] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<number | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const filterRef = useRef<HTMLDivElement | null>(null);

  const [laporan, setLaporan] = useState<LaporanItem[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const [respondents, setRespondents] = useState<RespondenOption[]>([]);

  const [editId, setEditId] = useState<string | null>(null);
  const [formNama, setFormNama] = useState("");
  const [formJenis, setFormJenis] = useState("");
  const [formBulan, setFormBulan] = useState<string>(
    bulanOptions[new Date().getMonth()]
  );
  const [formTahun, setFormTahun] = useState<number>(new Date().getFullYear());
  const [formCatatan, setFormCatatan] = useState("");
  const [formRespondenId, setFormRespondenId] = useState("");
  const [formFoto, setFormFoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const closePreview = () => setPreviewSrc(null);

  const resetForm = () => {
    setEditId(null);
    setFormNama("");
    setFormJenis("");
    setFormBulan(bulanOptions[new Date().getMonth()]);
    setFormTahun(new Date().getFullYear());
    setFormCatatan("");
    setFormRespondenId("");
    setFormFoto(null);
  };

  const fetchRespondents = async () => {
    try {
      const res = await axios.get("/api/responden");
      const options: RespondenOption[] = (res.data?.responden || []).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (r: any) => ({ id: r.id, nama: r.nama })
      );
      setRespondents(options);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setFlash({
        type: "error",
        text: error?.response?.data?.message || error.message,
      });
    }
  };

  const fetchLaporan = async (q?: string, field?: string, status?: string) => {
    try {
      const params: Record<string, string> = {};
      if (q) params.q = q;
      if (field) params.field = field;
      if (status) params.status = status;
      const res = await axios.get("/api/laporan", {
        params: Object.keys(params).length ? params : undefined,
      });
      setLaporan(res.data?.laporan || []);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setFlash({
        type: "error",
        text: error?.response?.data?.message || error.message,
      });
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !formNama ||
      !formJenis ||
      !formBulan ||
      !formTahun ||
      !formRespondenId ||
      (!editId && !formFoto)
    )
      return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("nama", formNama);
      fd.append("jenis", formJenis);
      fd.append("periodeBulan", formBulan);
      fd.append("periodeTahun", String(formTahun));
      fd.append("catatan", formCatatan);
      fd.append("respondenId", formRespondenId);
      if (user?.id) fd.append("userId", user.id);
      if (formFoto) fd.append("foto", formFoto);

      if (editId) {
        const res = await axios.put(`/api/laporan/${editId}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setFlash({
          type: "success",
          text: res.data.message || "Laporan diperbarui",
        });
      } else {
        const res = await axios.post(`/api/laporan`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setFlash({
          type: "success",
          text: res.data.message || "Laporan dibuat",
        });
      }
      await fetchLaporan();
      resetForm();
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setFlash({
        type: "error",
        text: error?.response?.data?.message || error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const canEditItem = (item: LaporanItem) => {
    const role = user?.role?.name;
    if (role === "USER")
      return item.status !== "APPROVED" && item.userId === user?.id;
    return true;
  };

  const handleEdit = (item: LaporanItem) => {
    if (!canEditItem(item)) return;
    setEditId(item.id);
    setFormNama(item.nama);
    setFormJenis(item.jenis);
    setFormBulan(item.periodeBulan);
    setFormTahun(item.periodeTahun);
    setFormCatatan(item.catatan || "");
    setFormRespondenId(item.respondenId);
    setFormFoto(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const prev = laporan;
    setLaporan((lst) => lst.filter((l) => l.id !== id));
    try {
      const res = await axios.delete(`/api/laporan/${id}`);
      setFlash({
        type: "success",
        text: res.data.message || "Laporan dihapus",
      });
    } catch (err) {
      setLaporan(prev);
      const error = err as AxiosError<{ message: string }>;
      setFlash({
        type: "error",
        text: error?.response?.data?.message || error.message,
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleApprove = async (id: string) => {
    setApprovingId(id);
    const prev = laporan;
    setLaporan((lst) =>
      lst.map((l) => (l.id === id ? { ...l, status: "APPROVED" } : l))
    );
    try {
      const res = await axios.post(`/api/laporan/approve/${id}`);
      setFlash({
        type: "success",
        text: res.data.mesage || "Laporan disetujui",
      });
    } catch (err) {
      setLaporan(prev);
      const error = err as AxiosError<{ message: string }>;
      setFlash({
        type: "error",
        text: error?.response?.data?.message || error.message,
      });
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setRejectingId(id);
    const prev = laporan;
    setLaporan((lst) =>
      lst.map((l) => (l.id === id ? { ...l, status: "REJECTED" } : l))
    );
    try {
      const res = await axios.post(`/api/laporan/reject/${id}`);
      setFlash({ type: "success", text: res.data.mesage || "Laporan ditolak" });
    } catch (err) {
      setLaporan(prev);
      const error = err as AxiosError<{ message: string }>;
      setFlash({
        type: "error",
        text: error?.response?.data?.message || error.message,
      });
    } finally {
      setRejectingId(null);
    }
  };

  useEffect(() => {
    if (debounceTimer) window.clearTimeout(debounceTimer);
    setSearching(true);
    const id = window.setTimeout(() => {
      const q = search.trim();
      void fetchLaporan(
        q.length > 0 ? q : undefined,
        searchField || undefined,
        statusFilter || undefined
      );
    }, 350);
    setDebounceTimer(id);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, searchField, statusFilter]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilter(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchRespondents();
    fetchLaporan();
  }, []);

  return (
    <section id="souvenirs" className="w-full p-6">
      {flash && <Toast message={flash.text} type={flash.type} />}

      {/* Page Header */}
      <div className="mb-8 border-b-2 border-gray-200 pb-4">
        <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
          <FontAwesomeIcon icon={faGift} className="h-7 w-7 " />
          <span>Laporan Suvenir</span>
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Kelola laporan pemberian suvenir kepada responden
        </p>
      </div>

      {/* Regulation */}
      <div className="mb-8 overflow-hidden rounded-xl shadow-md bg-white">
        <div className="bg-gradient-to-br from-blue-50 to-blue-50 border-b border-blue-200 p-6">
          <h2 className="text-blue-600 text-xl font-bold flex items-center gap-2">
            <FontAwesomeIcon icon={faExclamationTriangle} className="h-6 w-6" />
            Peraturan Pemberian Souvenir
          </h2>
          <p className="text-blue-900/80 text-sm font-medium mt-1">
            Ketentuan dan aturan yang harus dipatuhi
          </p>
        </div>
        <div className="p-6 ">
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Setiap responden hanya dapat menerima 1 suvenir per periode</li>
            <li>Wajib melampirkan foto bukti pemberian suvenir</li>
            <li>
              <strong>
                Laporan dapat dibuat kapan saja dalam periode bulan yang
                bersangkutan
              </strong>
            </li>
            <li>
              <strong>
                Jika laporan dibuat setelah periode bulan berakhir, akan
                ditandai sebagai TERLAMBAT
              </strong>
            </li>
            <li>Data surveyor dan responden harus lengkap dan akurat</li>
            <li>Laporan akan direview oleh admin sebelum disetujui</li>
          </ul>
        </div>
      </div>

      {/* Create Report Card */}
      <div className="mb-8 overflow-hidden rounded-xl shadow-md bg-white">
        <div className="bg-gradient-to-br from-rose-50 to-red-50 border-b border-red-200 p-6">
          <h2 className="text-red-600 text-xl font-bold flex items-center gap-2">
            <FontAwesomeIcon icon={faPlusCircle} className="h-6 w-6" />
            {editId ? "Perbarui Laporan Suvenir" : "Buat Laporan Suvenir Baru"}
          </h2>
          <p className="text-red-900/80 text-sm font-medium mt-1">
            {editId
              ? "Perbarui data laporan suvenir"
              : "Laporkan pemberian suvenir kepada responden"}
          </p>
        </div>

        <div className="p-6">
          <form id="souvenirForm" className="space-y-6" onSubmit={handleSubmit}>
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="laporanNama"
                  className="block text-gray-700 font-semibold"
                >
                  <FontAwesomeIcon icon={faUserTie} className="mr-2 h-5 w-5" />
                  Nama Surveyor <span className="text-red-600">*</span>
                </label>
                <input
                  id="laporanNama"
                  type="text"
                  required
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  placeholder="Masukkan nama surveyor"
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-3 text-base focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="respondent"
                  className="block text-gray-700 font-semibold"
                >
                  <FontAwesomeIcon icon={faUser} className="mr-2 h-5 w-5" />
                  Responden <span className="text-red-600">*</span>
                </label>
                <select
                  id="respondent"
                  required
                  value={formRespondenId}
                  onChange={(e) => setFormRespondenId(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-3 text-base focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
                >
                  <option value="">Pilih responden</option>
                  {respondents.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nama}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="souvenirType"
                  className="block text-gray-700 font-semibold"
                >
                  <FontAwesomeIcon icon={faGift} className="mr-2 h-5 w-5" />
                  Jenis Suvenir <span className="text-red-600">*</span>
                </label>
                <input
                  id="souvenirType"
                  type="text"
                  placeholder="Ketik jenis suvenir"
                  required
                  value={formJenis}
                  onChange={(e) => setFormJenis(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-3 text-base focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="periodMonth"
                  className="block text-gray-700 font-semibold"
                >
                  <FontAwesomeIcon icon={faCalendar} className="mr-2 h-5 w-5" />
                  Periode Bulan <span className="text-red-600">*</span>
                </label>
                <select
                  id="periodMonth"
                  required
                  value={formBulan}
                  onChange={(e) => setFormBulan(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-3 text-base focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
                >
                  {bulanOptions.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="periodYear"
                  className="block text-gray-700 font-semibold"
                >
                  <FontAwesomeIcon
                    icon={faCalendarAlt}
                    className="mr-2 h-5 w-5"
                  />
                  Periode Tahun <span className="text-red-600">*</span>
                </label>
                <input
                  id="periodYear"
                  type="number"
                  min={2020}
                  max={2030}
                  required
                  value={formTahun}
                  onChange={(e) => setFormTahun(Number(e.target.value))}
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-3 text-base focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="photoProof"
                  className="block text-gray-700 font-semibold"
                >
                  Foto Bukti{" "}
                  {editId ? (
                    <span className="text-gray-400">(opsional)</span>
                  ) : (
                    <span className="text-red-600">*</span>
                  )}
                </label>
                {editId && (
                  <div className="mb-2">
                    <button
                      type="button"
                      onClick={() => {
                        const current = laporan.find(
                          (l) => l.id === editId
                        )?.foto;
                        if (current) setPreviewSrc(absoluteUrl(current));
                      }}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Lihat foto saat ini
                    </button>
                  </div>
                )}
                <input
                  id="photoProof"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormFoto(e.target.files?.[0] || null)}
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-3 text-base focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
                />
                <small className="text-gray-500 text-xs">
                  Format: JPG, PNG, maksimal 5MB
                </small>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label
                htmlFor="notes"
                className="block text-gray-700 font-semibold"
              >
                Catatan Tambahan
              </label>
              <textarea
                id="notes"
                value={formCatatan}
                onChange={(e) => setFormCatatan(e.target.value)}
                placeholder="Catatan atau keterangan tambahan (opsional)"
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-3 text-base focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
              ></textarea>
            </div>

            {/* Submit */}
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={submitting}
                className={`inline-flex items-center gap-2 rounded-lg ${
                  submitting
                    ? "bg-gray-400"
                    : "bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                } px-5 py-3 text-white font-semibold uppercase tracking-wide text-sm shadow transition-transform ${
                  submitting ? "cursor-not-allowed" : "hover:-translate-y-0.5"
                } focus:outline-none`}
              >
                <FontAwesomeIcon icon={faSave} className="h-5 w-5" />
                {editId ? "Update Laporan" : "Simpan Laporan"}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 cursor-pointer"
                >
                  Batal Edit
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Reports List */}
      <div className="rounded-xl shadow-md bg-white overflow-hidden">
        <div className="bg-gradient-to-br from-rose-50 to-red-50 border-b border-red-200 p-6">
          <h2 className="text-red-600 text-xl font-bold flex items-center gap-2">
            <FontAwesomeIcon icon={faGift} className="h-6 w-6" />
            Daftar Laporan Suvenir
          </h2>
          <p className="text-red-900/80 text-sm font-medium mt-1">
            Riwayat laporan yang telah dibuat
          </p>
        </div>
        <div className="p-6 space-y-6">
          {/* Toolbar */}
          <div className="relative mb-6 flex items-center gap-3">
            <div className="relative flex-1">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                id="searchSouvenir"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari laporan suvenir..."
                className="w-full rounded-full border-2 border-gray-200 pl-12 pr-4 py-2 text-base transition focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
              />
              {searching && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  Mencari...
                </span>
              )}
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-full border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-red-600"
              title="Filter Status"
            >
              <option value="">Semua Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Ditolak</option>
              <option value="TERLAMBAT">Terlambat</option>
            </select>

            {/* Field Filter Popover */}
            <div className="relative" ref={filterRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFilter((s) => !s);
                }}
                className={`rounded-full border-2 px-3 py-2 text-sm flex items-center gap-2 cursor-pointer transition ${
                  showFilter
                    ? "border-red-600 text-red-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
                title="Filter"
              >
                <FontAwesomeIcon icon={faFilter} />
                <span className="hidden sm:inline">Filter</span>
              </button>

              {showFilter && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg z-10">
                  <div className="p-3 text-sm text-gray-700">
                    <div className="font-semibold mb-2">Filter Kolom</div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="filterFieldSouvenir"
                          checked={searchField === ""}
                          onChange={() => setSearchField("")}
                        />
                        Semua Kolom
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="filterFieldSouvenir"
                          checked={searchField === "responden"}
                          onChange={() => setSearchField("responden")}
                        />
                        Nama Responden
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="filterFieldSouvenir"
                          checked={searchField === "surveyor"}
                          onChange={() => setSearchField("surveyor")}
                        />
                        Nama Surveyor
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="filterFieldSouvenir"
                          checked={searchField === "jenis"}
                          onChange={() => setSearchField("jenis")}
                        />
                        Jenis Suvenir
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="filterFieldSouvenir"
                          checked={searchField === "periode"}
                          onChange={() => setSearchField("periode")}
                        />
                        Periode
                      </label>
                    </div>
                    <div className="mt-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowFilter(false);
                        }}
                        className="px-3 py-1 text-xs rounded border border-gray-300 hover:bg-gray-50 cursor-pointer"
                      >
                        Tutup
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* List */}
          {laporan.length > 0 ? (
            laporan.map((item) => (
              <div
                key={item.id}
                className="border-2 border-gray-100 rounded-xl p-6 bg-white transition-all duration-300 hover:border-red-600 hover:shadow-[0_8px_25px_rgba(220,38,38,0.1)] animate-fadeIn"
              >
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {`Laporan Suvenir untuk ${item.responden?.nama || "-"}`}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Surveyor: {item.nama || "-"} •{" "}
                    {new Date(item.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-gray-700">
                      Jenis Suvenir
                    </h4>
                    <p>{item.jenis}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700">Periode</h4>
                    <p>
                      {item.periodeBulan} {item.periodeTahun}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700">Status</h4>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${
                        item.status === "APPROVED"
                          ? "bg-green-100 text-green-700 border-green-300"
                          : item.status === "REJECTED"
                          ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                          : item.status === "TERLAMBAT"
                          ? "bg-red-100 text-red-700 border-red-300"
                          : "bg-gray-100 text-gray-700 border-gray-300"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700">Catatan</h4>
                    <p>{item.catatan || "-"}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-wrap justify-end gap-2">
                  <a
                    href={absoluteUrl(item.foto)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 inline-flex items-center gap-2"
                    onClick={(e) => {
                      e.preventDefault();
                      setPreviewSrc(absoluteUrl(item.foto));
                    }}
                  >
                    <FontAwesomeIcon icon={faImage} className="h-4 w-4" /> Lihat
                    Foto
                  </a>

                  {canEditItem(item) && (
                    <button
                      onClick={() => handleEdit(item)}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 inline-flex items-center gap-2 cursor-pointer"
                    >
                      <FontAwesomeIcon icon={faEdit} className="h-4 w-4" /> Edit
                    </button>
                  )}

                  {(user?.role?.name === "SUPER ADMIN" ||
                    user?.role?.name === "ADMIN") && (
                    <>
                      <button
                        onClick={() => handleApprove(item.id)}
                        disabled={approvingId === item.id}
                        className={`px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 inline-flex items-center gap-2 cursor-pointer ${
                          approvingId === item.id
                            ? "opacity-60 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />{" "}
                        {approvingId === item.id ? "Menyetujui..." : "Approve"}
                      </button>
                      <button
                        onClick={() => handleReject(item.id)}
                        disabled={rejectingId === item.id}
                        className={`px-4 py-2 rounded-lg bg-yellow-600 text-white text-sm font-medium hover:bg-yellow-700 inline-flex items-center gap-2 cursor-pointer ${
                          rejectingId === item.id
                            ? "opacity-60 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />{" "}
                        {rejectingId === item.id ? "Menolak..." : "Tolak"}
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className={`px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 inline-flex items-center gap-2 cursor-pointer ${
                          deletingId === item.id
                            ? "opacity-60 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />{" "}
                        {deletingId === item.id ? "Menghapus..." : "Hapus"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="min-h-[120px]">
              <div className="text-center text-gray-500 py-12">
                <p className="font-medium">Belum ada laporan.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewSrc && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={closePreview}
        >
          <div
            className="max-w-3xl max-h-[85vh] p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewSrc}
              alt="Foto Laporan"
              className="max-h-[80vh] w-auto rounded shadow-lg"
            />
            <div className="text-center mt-3">
              <button
                onClick={closePreview}
                className="px-4 py-2 rounded-md bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default LaporanSouvenir;
