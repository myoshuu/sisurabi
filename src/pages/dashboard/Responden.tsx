import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faChartBar,
  faUserPlus,
  faDatabase,
  faSearch,
  faBoxOpen,
  faSave,
  faStore,
  faUser,
  faPhone,
  faLayerGroup,
  faCity,
  faTrash,
  faExclamationTriangle,
  faEdit,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import axios from "../../helpers/Axios";
import type { AxiosError } from "axios";
import { useEffect, useMemo, useRef, useState } from "react";
import Toast from "../../components/Toast";

type Flash = { type: "success" | "error"; text: string };

type NestedName = { nama: string };

type RespondenItem = {
  id: string;
  nama: string;
  telp: string;
  level: string;
  kabupatenKota: NestedName & { id?: string };
  pasar: NestedName & { id?: string };
  createdAt: string;
  _count?: { LaporanSuvenir: number };
};

type Kabupaten = { id: string; nama: string };
type Pasar = { id: string; nama: string };

const Responden: React.FC = () => {
  const [responden, setResponden] = useState<{
    responden: Array<RespondenItem>;
    totalResponden: number;
  } | null>(null);

  const [flash, setFlash] = useState<Flash | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [confirmTarget, setConfirmTarget] = useState<RespondenItem | null>(
    null
  );
  const closeConfirm = () => setConfirmTarget(null);

  const [kabupatenList, setKabupatenList] = useState<Kabupaten[]>([]);
  const [pasarList, setPasarList] = useState<Pasar[]>([]);
  const [selectedKabupatenId, setSelectedKabupatenId] = useState<string>("");
  const [selectedPasarId, setSelectedPasarId] = useState<string>("");
  const [loadingPasar, setLoadingPasar] = useState(false);

  const [formNama, setFormNama] = useState("");
  const [formTelp, setFormTelp] = useState("");
  const [formLevel, setFormLevel] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [searchField, setSearchField] = useState<string>("");
  const [searching, setSearching] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<number | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const filterRef = useRef<HTMLDivElement | null>(null);

  const isFormValid = useMemo(() => {
    return (
      formNama.trim().length > 0 &&
      formLevel.trim().length > 0 &&
      selectedKabupatenId.trim().length > 0 &&
      selectedPasarId.trim().length > 0
    );
  }, [formNama, formLevel, selectedKabupatenId, selectedPasarId]);

  const resetForm = () => {
    setEditId(null);
    setFormNama("");
    setFormTelp("");
    setFormLevel("");
    setSelectedKabupatenId("");
    setSelectedPasarId("");
    setPasarList([]);
  };

  const fetchResponden = async (q?: string, field?: string) => {
    try {
      const params: Record<string, string> = {};
      if (q) params.q = q;
      if (field) params.field = field;
      const res = await axios.get("/api/responden", {
        params: Object.keys(params).length ? params : undefined,
      });
      setResponden(res.data);
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

  const fetchKabupaten = async () => {
    try {
      const res = await axios.get("/api/kabupaten");
      setKabupatenList(res.data.kabupatenKota || []);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setFlash({
        type: "error",
        text: error?.response?.data?.message || error.message,
      });
    }
  };

  const fetchPasarByKabupaten = async (
    kabupatenId: string
  ): Promise<Pasar[]> => {
    setLoadingPasar(true);
    try {
      const res = await axios.get(`/api/kabupaten/${kabupatenId}/pasar`);
      const list = (res.data.pasar || []) as Pasar[];
      setPasarList(list);
      return list;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setFlash({
        type: "error",
        text: error?.response?.data?.message || error.message,
      });
      setPasarList([]);
      return [];
    } finally {
      setLoadingPasar(false);
    }
  };

  const handleKabupatenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedKabupatenId(value);
    setSelectedPasarId("");
    setPasarList([]);
    if (value) void fetchPasarByKabupaten(value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormValid) return;
    setSubmitting(true);
    try {
      const formEl = e.currentTarget;
      const formData = new FormData(formEl);
      const entries = Object.fromEntries(formData.entries()) as {
        nama: string;
        telp: string;
        level: string;
        kabupatenKotaId: string;
        pasarId: string;
      };
      const payload = {
        nama: entries.nama,
        telp: entries.telp,
        level: entries.level,
        kabupatenKotaId: entries.kabupatenKotaId,
        pasarId: entries.pasarId,
      };

      if (editId) {
        const res = await axios.put(`/api/responden/${editId}`, payload);
        setFlash({ type: "success", text: res.data.message });
      } else {
        const res = await axios.post(`/api/responden`, payload);
        setFlash({ type: "success", text: res.data.message });
      }
      await fetchResponden();
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

  const actuallyDelete = async (id: string) => {
    if (!responden || !id) {
      setFlash({ type: "error", text: "ID responden tidak valid." });
      return;
    }

    setDeletingId(id);
    const prev = responden;
    const nextList = prev.responden.filter((r) => (r.id === id ? false : true));
    setResponden({
      responden: nextList,
      totalResponden: prev.totalResponden - 1,
    });

    try {
      const res = await axios.delete(`/api/responden/${id}`);
      setFlash({ type: "success", text: res.data.message });
      await fetchResponden();
    } catch (err) {
      setResponden(prev);
      const error = err as AxiosError<{ message: string }>;
      setFlash({
        type: "error",
        text: error?.response?.data?.message || error.message,
      });
    } finally {
      setDeletingId(null);
      closeConfirm();
    }
  };

  const handleDelete = (item: RespondenItem) => {
    if (item._count && item._count.LaporanSuvenir > 0) {
      setConfirmTarget(item);
    } else {
      actuallyDelete(item.id);
    }
  };

  const handleEdit = async (item: RespondenItem) => {
    setEditId(item.id);
    setFormNama(item.nama);
    setFormTelp(item.telp || "");
    setFormLevel(item.level);

    const kab = kabupatenList.find((k) => k.nama === item.kabupatenKota.nama);
    const kabId = kab ? kab.id : "";
    setSelectedKabupatenId(kabId);

    if (kabId) {
      const loadedPasar = await fetchPasarByKabupaten(kabId);
      const match = loadedPasar.find((p) => p.nama === item.pasar.nama);
      setSelectedPasarId(match ? match.id : "");
    } else {
      setSelectedPasarId("");
      setPasarList([]);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    fetchResponden();
    fetchKabupaten();
  }, []);

  useEffect(() => {
    if (debounceTimer) window.clearTimeout(debounceTimer);
    setSearching(true);
    const id = window.setTimeout(() => {
      const q = search.trim();
      void fetchResponden(
        q.length > 0 ? q : undefined,
        searchField || undefined
      );
    }, 350);
    setDebounceTimer(id);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, searchField]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilter(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <section id="respondents" className="w-full p-6">
      {flash && <Toast message={flash.text} type={flash.type} />}

      {/* Page Header */}
      <div className="mb-8 border-b-2 border-gray-200 pb-4">
        <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
          <FontAwesomeIcon icon={faUsers} className="mr-1 h-7 w-7 " />
          <span>Data Responden</span>
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Kelola database responden survey Bank Indonesia
        </p>
        <button
          type="button"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-red-600 to-red-700 px-4 py-2 text-white font-semibold uppercase tracking-wide text-sm shadow transition-transform hover:-translate-y-0.5 hover:shadow-lg focus:outline-none"
        >
          <FontAwesomeIcon icon={faChartBar} className="mr-1 h-7 w-7 " />
          <span>Lihat Laporan Analitik</span>
        </button>
      </div>

      {/* Tambah/Update Responden */}
      <div className="mb-8 overflow-hidden rounded-xl shadow-md bg-white">
        <div className="bg-gradient-to-br from-rose-50 to-red-50 border-b border-red-200 p-6">
          <h2 className="text-red-600 text-xl font-bold flex items-center gap-2">
            <FontAwesomeIcon icon={faUserPlus} className="mr-1 h-7 w-7 " />
            <span>{editId ? "Update Responden" : "Tambah Responden Baru"}</span>
          </h2>
          <p className="text-red-900/80 text-sm font-medium mt-1">
            {editId
              ? "Perbarui data responden"
              : "Daftarkan responden baru untuk survey"}
          </p>
        </div>
        <div className="p-6">
          <form
            id="respondentForm"
            className="space-y-6"
            onSubmit={handleSubmit}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nama Lengkap */}
              <div className="space-y-2">
                <label
                  htmlFor="respondentName"
                  className="block text-gray-700 font-semibold"
                >
                  <FontAwesomeIcon icon={faUser} className="mr-2 h-7 w-7 " />{" "}
                  Nama Lengkap <span className="text-red-600 text-none">*</span>
                </label>
                <input
                  id="respondentName"
                  type="text"
                  name="nama"
                  required
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  className="w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-3 text-base transition focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
                />
              </div>

              {/* Nomor Telepon */}
              <div className="space-y-2">
                <label
                  htmlFor="respondentPhone"
                  className="block text-gray-700 font-semibold"
                >
                  <FontAwesomeIcon icon={faPhone} className="mr-1 h-7 w-7 " />{" "}
                  Nomor Telepon
                </label>
                <input
                  id="respondentPhone"
                  type="tel"
                  name="telp"
                  value={formTelp}
                  onChange={(e) => setFormTelp(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-3 text-base transition focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Level */}
              <div className="space-y-2" id="respondentLevelGroup">
                <label
                  htmlFor="respondentLevel"
                  className="block text-gray-700 font-semibold"
                >
                  <FontAwesomeIcon
                    icon={faLayerGroup}
                    className="mr-1 h-7 w-7 "
                  />{" "}
                  Level <span className="text-red-600 text-none">*</span>
                </label>
                <select
                  id="respondentLevel"
                  required
                  name="level"
                  value={formLevel}
                  onChange={(e) => setFormLevel(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-3 text-base transition focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
                >
                  <option value="">Pilih level</option>
                  <option value="Pedagang Eceran">Pedagang Eceran</option>
                  <option value="Pedagang Besar">Pedagang Besar</option>
                  <option value="Pasokan">Pasokan</option>
                  <option value="Produsen">Produsen</option>
                  <option value="Pasar Modern">Pasar Modern</option>
                </select>
              </div>

              {/* Kabupaten/Kota */}
              <div className="space-y-2" id="kabupatenKotaGroup">
                <label
                  htmlFor="kabupatenKota"
                  className="block text-gray-700 font-semibold"
                >
                  <FontAwesomeIcon icon={faCity} className="mr-1 h-7 w-7 " />{" "}
                  Kabupaten/Kota{" "}
                  <span className="text-red-600 text-none">*</span>
                </label>
                <select
                  id="kabupatenKota"
                  required
                  name="kabupatenKotaId"
                  value={selectedKabupatenId}
                  onChange={handleKabupatenChange}
                  className="w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-3 text-base transition focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
                >
                  <option value="">Pilih Kabupaten/Kota</option>
                  {kabupatenList.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.nama}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              {/* Nama Pasar */}
              <div className="space-y-2" id="marketNameGroup">
                <label
                  htmlFor="marketName"
                  className="block text-gray-700 font-semibold"
                >
                  <FontAwesomeIcon icon={faStore} className="mr-1 h-7 w-7 " />{" "}
                  Nama Pasar <span className="text-red-600 text-none">*</span>
                </label>
                <select
                  id="marketName"
                  required
                  name="pasarId"
                  disabled={!selectedKabupatenId || loadingPasar}
                  value={selectedPasarId}
                  onChange={(e) => setSelectedPasarId(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-3 text-base transition focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="">
                    {selectedKabupatenId
                      ? "Pilih nama pasar"
                      : "Pilih kabupaten/kota terlebih dahulu"}
                  </option>
                  {pasarList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nama}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={!isFormValid || submitting}
                className={`inline-flex items-center gap-2 rounded-lg ${
                  submitting
                    ? "bg-gray-400"
                    : "bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                } px-5 py-3 text-white font-semibold uppercase tracking-wide text-sm shadow transition-transform ${
                  submitting ? "cursor-not-allowed" : "hover:-translate-y-0.5"
                } focus:outline-none`}
              >
                <FontAwesomeIcon icon={faSave} className="mr-1 h-7 w-7 " />
                <span>{editId ? "Update" : "Simpan Responden"}</span>
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

      {/* Database Responden */}
      <div className="mb-8 overflow-hidden rounded-xl shadow-md bg-white">
        <div className="bg-gradient-to-br from-rose-50 to-red-50 border-b border-red-200 p-6">
          <h2 className="text-red-600 text-xl font-bold flex items-center gap-2">
            <FontAwesomeIcon icon={faDatabase} className="mr-1 h-7 w-7 " />
            <span>Database Responden</span>
          </h2>
          <p className="text-red-900/80 text-sm font-medium mt-1">
            Daftar responden yang terdaftar dalam sistem
          </p>
        </div>

        <div className="p-6">
          <div className="relative mb-6 flex items-center gap-3">
            <div className="relative flex-1">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                id="searchRespondent"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari responden..."
                className="w-full rounded-full border-2 border-gray-200 pl-12 pr-4 py-2 text-base transition focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
              />
              {searching && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  Mencari...
                </span>
              )}
            </div>

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
                          name="filterField"
                          checked={searchField === ""}
                          onChange={() => setSearchField("")}
                        />
                        Semua Kolom
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="filterField"
                          checked={searchField === "nama"}
                          onChange={() => setSearchField("nama")}
                        />
                        Nama
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="filterField"
                          checked={searchField === "telp"}
                          onChange={() => setSearchField("telp")}
                        />
                        Telepon
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="filterField"
                          checked={searchField === "level"}
                          onChange={() => setSearchField("level")}
                        />
                        Level
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="filterField"
                          checked={searchField === "pasar"}
                          onChange={() => setSearchField("pasar")}
                        />
                        Nama Pasar
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="filterField"
                          checked={searchField === "kabupaten"}
                          onChange={() => setSearchField("kabupaten")}
                        />
                        Kabupaten/Kota
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

          {responden && responden.responden.length > 0 ? (
            responden.responden.map((item: RespondenItem) => (
              <div
                key={item.id}
                className="border-2 border-gray-100 rounded-xl p-6 mb-6 bg-white transition-all duration-300 hover:border-red-600 hover:shadow-[0_8px_25px_rgba(220,38,38,0.1)] animate-fadeIn"
              >
                {/* Report Header */}
                <div className="flex flex-col gap-4 mb-6">
                  <h3 className="text-gray-900 font-bold text-lg sm:text-xl">
                    {item.nama}
                  </h3>
                  <p className="text-gray-500 text-sm sm:text-base">
                    {item.level} dari {item.pasar.nama},{" "}
                    {item.kabupatenKota.nama}
                  </p>
                </div>

                {/* Report Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-red-600 text-xs sm:text-sm font-semibold uppercase tracking-wide mb-2">
                      Telepon
                    </h4>
                    <p className="text-gray-700 font-medium break-words">
                      {item.telp || "-"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-red-600 text-xs sm:text-sm font-semibold uppercase tracking-wide mb-2">
                      Tanggal Daftar
                    </h4>
                    <p className="text-gray-700 font-medium">
                      {new Date(item.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Action */}
                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    onClick={() => handleEdit(item)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-transform duration-200 hover:-translate-y-0.5 cursor-pointer"
                  >
                    <FontAwesomeIcon icon={faEdit} className="mr-2 h-7 w-7 " />{" "}
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    disabled={deletingId === item.id}
                    className={`bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-transform duration-200 hover:-translate-y-0.5 cursor-pointer ${
                      deletingId === item.id
                        ? "opacity-60 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <FontAwesomeIcon icon={faTrash} className="mr-2 h-7 w-7 " />{" "}
                    {deletingId === item.id ? "Menghapus..." : "Hapus"}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div id="respondentList" className="min-h-[120px]">
              <div className="text-center text-gray-500 py-12">
                <FontAwesomeIcon
                  icon={faBoxOpen}
                  className="text-5xl opacity-30 mb-3 block"
                />
                <p className="font-medium">Belum ada data responden.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Modal */}
      {confirmTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-start flex-col gap-3">
              <div className="flex items-center gap-3">
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className="text-yellow-500 text-xl h-8 w-8 mt-1"
                />
                <h3 className="text-xl font-semibold text-gray-900">
                  Konfirmasi Hapus
                </h3>
              </div>
              <div className="text-gray-600">
                Responden{" "}
                <span className="font-semibold">{confirmTarget.nama}</span>{" "}
                memiliki {confirmTarget._count?.LaporanSuvenir ?? 0} laporan
                suvenir terkait. Apakah Anda yakin ingin menghapus? Tindakan ini
                akan menghapus laporan terkait.
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeConfirm}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => actuallyDelete(confirmTarget.id)}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Responden;
