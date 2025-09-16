import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarCheck,
  faUserClock,
  faCamera,
  faSignInAlt,
  faSignOutAlt,
  faHistory,
  faSearch,
  faExclamationTriangle,
  faFilter,
  faTrash,
  faChartBar,
} from "@fortawesome/free-solid-svg-icons";
import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "../../helpers/Axios";
import type { AxiosError } from "axios";
import Toast from "../../components/Toast";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router";

type Flash = { type: "success" | "error"; text: string };

type AbsensiItem = {
  id: string;
  fotoClockIn: string;
  fotoClockOut?: string;
  clockIn: string;
  clockOut?: string;
  catatan: string;
  userId: string;
  user?: { email: string };
  createdAt: string;
};

type GroupedAbsensi = {
  date: string;
  entries: AbsensiItem[];
};

const Absensi: React.FC = () => {
  const { user } = useAuth();

  const [currentTime, setCurrentTime] = useState("--:--:--");
  const [currentDate, setCurrentDate] = useState("Loading...");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [clockedIn, setClockedIn] = useState(false);
  const [flash, setFlash] = useState<Flash | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [catatan, setCatatan] = useState("");

  const [search, setSearch] = useState("");
  const [searchField, setSearchField] = useState<string>("");
  const [searching, setSearching] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<number | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const filterRef = useRef<HTMLDivElement | null>(null);

  const [absensi, setAbsensi] = useState<AbsensiItem[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  // test
  const navigate = useNavigate();

  const absoluteUrl = (path: string | null | undefined) => {
    if (!path) return "";
    return /^https?:\/\//i.test(path)
      ? path
      : `${axios.defaults.baseURL}${path}`;
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("id-ID"));
      setCurrentDate(
        now.toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (debounceTimer) window.clearTimeout(debounceTimer);
    setSearching(true);
    const id = window.setTimeout(() => {
      const q = search.trim();
      void fetchAbsensi(q.length > 0 ? q : undefined, searchField || undefined);
    }, 350);
    setDebounceTimer(id);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, searchField]);

  const normalizeSearchQuery = (query: string): string => {
    // Try to normalize date formats
    const trimmed = query.trim();

    // Handle common Indonesian date formats
    if (
      trimmed.match(
        /^\d{1,2}\s+(september|oktober|november|desember|januari|februari|maret|april|mei|juni|juli|agustus)/i
      )
    ) {
      // Convert Indonesian month names to English
      const monthMap: Record<string, string> = {
        januari: "january",
        februari: "february",
        maret: "march",
        april: "april",
        mei: "may",
        juni: "june",
        juli: "july",
        agustus: "august",
        september: "september",
        oktober: "october",
        november: "november",
        desember: "december",
      };

      const parts = trimmed.split(" ");
      if (parts.length >= 2) {
        const day = parts[0];
        const month = monthMap[parts[1].toLowerCase()] || parts[1];
        const year = parts[2] || new Date().getFullYear().toString();
        return `${month} ${day}, ${year}`;
      }
    }

    return trimmed;
  };

  const fetchAbsensi = useCallback(async (q?: string, field?: string) => {
    try {
      const params: Record<string, string> = {};
      if (q) {
        params.q = normalizeSearchQuery(q);
      }
      if (field) params.field = field;

      const res = await axios.get("/api/absensi", {
        params: Object.keys(params).length ? params : undefined,
      });

      setAbsensi(res.data?.absensi || []);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      console.error("Search error:", error);
      setFlash({
        type: "error",
        text: error?.response?.data?.message || error.message,
      });
    } finally {
      setSearching(false);
    }
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

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
    fetchAbsensi();
    checkStatus();
  }, [fetchAbsensi]);

  const checkStatus = async () => {
    try {
      const res = await axios.get("/api/absensi/status");
      setClockedIn(res.data.mode === "clockIn");
    } catch {
      setClockedIn(false);
    }
  };

  const groupAbsensiByDate = (absensiList: AbsensiItem[]): GroupedAbsensi[] => {
    const grouped = absensiList.reduce((acc, item) => {
      const date = new Date(item.clockIn).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {} as Record<string, AbsensiItem[]>);

    return Object.entries(grouped).map(([date, entries]) => ({
      date,
      entries: entries.sort(
        (a, b) => new Date(a.clockIn).getTime() - new Date(b.clockIn).getTime()
      ),
    }));
  };

  const clockIn = async () => {
    if (!photoPreview) {
      setFlash({
        type: "error",
        text: "Anda harus mengupload foto terlebih dahulu",
      });
      return;
    }

    if (!catatan.trim()) {
      setFlash({
        type: "error",
        text: "Anda harus mengisi catatan terlebih dahulu",
      });
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      const fileInput = document.getElementById(
        "attendancePhoto"
      ) as HTMLInputElement;
      if (fileInput?.files?.[0]) {
        formData.append("fotoClockIn", fileInput.files[0]);
      }
      formData.append("catatan", catatan);

      const res = await axios.post("/api/absensi/clockin", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setClockedIn(true);
      setFlash({
        type: "success",
        text: res.data.message || "Clock In berhasil dilakukan",
      });
      await fetchAbsensi();
      setPhotoPreview(null);
      setCatatan("");
      if (fileInput) fileInput.value = "";
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setFlash({
        type: "error",
        text: error?.response?.data?.message || "Gagal melakukan Clock In",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const clockOut = async () => {
    if (!photoPreview) {
      setFlash({
        type: "error",
        text: "Anda harus mengupload foto terlebih dahulu",
      });
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      const fileInput = document.getElementById(
        "attendancePhoto"
      ) as HTMLInputElement;
      if (fileInput?.files?.[0]) {
        formData.append("fotoClockOut", fileInput.files[0]);
      }

      const res = await axios.put("/api/absensi/clockout", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setClockedIn(false);
      setFlash({
        type: "success",
        text: res.data.message || "Clock Out berhasil dilakukan",
      });
      await fetchAbsensi();
      setPhotoPreview(null);
      if (fileInput) fileInput.value = "";
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setFlash({
        type: "error",
        text: error?.response?.data?.message || "Gagal melakukan Clock Out",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const prev = absensi;
    setAbsensi((lst) => lst.filter((a) => a.id !== id));
    try {
      const res = await axios.delete(`/api/absensi/${id}`);
      setFlash({
        type: "success",
        text: res.data.message || "Data absensi dihapus",
      });
    } catch (err) {
      setAbsensi(prev);
      const error = err as AxiosError<{ message: string }>;
      setFlash({
        type: "error",
        text: error?.response?.data?.message || error.message,
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section id="attendance" className="w-full p-6">
      {flash && <Toast message={flash.text} type={flash.type} />}

      {/* Page Header */}
      <div className="mb-8 border-b-2 border-gray-200 pb-4">
        <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
          <FontAwesomeIcon icon={faCalendarCheck} className="h-7 w-7" />
          <span>Sistem Absensi</span>
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Kelola absensi surveyor dan karyawan Bank Indonesia
        </p>
        <button
          type="button"
          onClick={() => navigate("/dashboard/report")}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-red-600 to-red-700 px-4 py-2 text-white font-semibold uppercase tracking-wide text-sm shadow transition-transform hover:-translate-y-0.5 hover:shadow-lg focus:outline-none cursor-pointer"
        >
          <FontAwesomeIcon icon={faChartBar} className="mr-1 h-7 w-7 " />
          <span>Lihat Laporan Analitik</span>
        </button>
      </div>

      {/* Regulation */}
      <div className="mb-8 overflow-hidden rounded-xl shadow-md bg-white">
        <div className="bg-gradient-to-br from-blue-50 to-blue-50 border-b border-blue-200 p-6">
          <h2 className="text-blue-600 text-xl font-bold flex items-center gap-2">
            <FontAwesomeIcon icon={faExclamationTriangle} className="h-6 w-6" />
            Peraturan Absensi
          </h2>
          <p className="text-blue-900/80 text-sm font-medium mt-1">
            Ketentuan dan aturan yang harus dipatuhi
          </p>
        </div>
        <div className="p-6 ">
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Jam kerja: 08:00 - 17:00 WIB (Senin - Jumat)</li>
            <li>
              <strong>Wajib upload foto selfie untuk setiap absensi</strong>
            </li>
          </ul>
        </div>
      </div>

      {/* Absensi Hari Ini */}
      <div className="mb-8 overflow-hidden rounded-xl shadow-md bg-white">
        <div className="bg-gradient-to-br from-rose-50 to-red-50 border-b border-red-200 p-6">
          <h2 className="text-red-600 text-xl font-bold flex items-center gap-2">
            <FontAwesomeIcon icon={faUserClock} className="h-6 w-6" />
            Absen Hari Ini
          </h2>
          <p className="text-red-900/80 text-sm font-medium mt-1">
            Catat kehadiran Anda untuk hari ini
          </p>
        </div>
        <div className="p-6">
          <div className="text-center mb-8">
            <div className="text-3xl font-bold text-red-600 mb-2">
              {currentTime}
            </div>
            <div className="text-lg text-gray-500">{currentDate}</div>
          </div>

          {/* Upload Foto */}
          <div className="mb-8">
            <h3 className=" text-red-600 font-semibold mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faCamera} className="h-5 w-5" />
              Upload Foto (Wajib)
            </h3>
            <div
              className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() =>
                document.getElementById("attendancePhoto")?.click()
              }
            >
              {!photoPreview ? (
                <div>
                  <FontAwesomeIcon
                    icon={faCamera}
                    className="text-3xl text-gray-400 mb-2"
                  />
                  <p className="text-gray-500 mb-2">
                    Klik atau drag foto Anda ke sini
                  </p>
                  <p className="text-gray-400 text-sm">
                    Format: JPG, PNG • Maksimal 5MB
                  </p>
                </div>
              ) : (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="mx-auto max-h-48 rounded-lg shadow"
                />
              )}
            </div>
            <input
              type="file"
              id="attendancePhoto"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </div>

          {/* Catatan */}
          <div className="mb-6">
            <h3 className=" text-red-600 font-semibold mb-4 flex items-center  gap-2">
              <FontAwesomeIcon icon={faUserClock} className="h-5 w-5" />
              Catatan Kegiatan (Wajib)
            </h3>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Masukkan catatan kegiatan yang akan dilakukan..."
              className="w-full rounded-lg border-2 border-gray-200 px-3 py-3 text-base focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
              rows={3}
            />
          </div>

          {/* Tombol */}
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              className={`inline-flex items-center gap-2 rounded-lg ${
                submitting || clockedIn
                  ? "bg-gray-400"
                  : "bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
              } px-5 py-3 text-white font-semibold uppercase tracking-wide text-sm shadow transition-transform ${
                submitting || clockedIn
                  ? "cursor-not-allowed"
                  : "hover:-translate-y-0.5"
              } focus:outline-none`}
              onClick={clockIn}
              disabled={clockedIn || submitting}
            >
              <FontAwesomeIcon icon={faSignInAlt} className="h-5 w-5" />
              {submitting ? "Memproses..." : "Clock In"}
            </button>
            <button
              className={`inline-flex items-center gap-2 rounded-lg ${
                submitting || !clockedIn
                  ? "bg-gray-400"
                  : "bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              } px-5 py-3 text-white font-semibold uppercase tracking-wide text-sm shadow transition-transform ${
                submitting || !clockedIn
                  ? "cursor-not-allowed"
                  : "hover:-translate-y-0.5"
              } focus:outline-none`}
              onClick={clockOut}
              disabled={!clockedIn || submitting}
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="h-5 w-5" />
              {submitting ? "Memproses..." : "Clock Out"}
            </button>
          </div>
        </div>
      </div>

      {/* Riwayat Absensi */}
      <div className="rounded-xl shadow-md bg-white overflow-hidden">
        <div className="bg-gradient-to-br from-rose-50 to-red-50 border-b border-red-200 p-6">
          <h2 className="text-red-600 text-xl font-bold flex items-center gap-2">
            <FontAwesomeIcon icon={faHistory} className="h-6 w-6" />
            Riwayat Absensi
          </h2>
          <p className="text-red-900/80 text-sm font-medium mt-1">
            Daftar kehadiran dalam 30 hari terakhir
          </p>
        </div>
        <div className="p-6">
          {/* Search Box */}
          <div className="relative mb-6 flex items-center gap-3">
            <div className="relative flex-1">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari berdasarkan tanggal (9 September) atau catatan..."
                className="w-full rounded-full border-2 border-gray-200 pl-12 pr-4 py-2 text-base transition focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
              />
              {searching && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  Mencari...
                </span>
              )}
            </div>

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
                          name="filterFieldAbsensi"
                          checked={searchField === ""}
                          onChange={() => setSearchField("")}
                        />
                        Semua Kolom
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="filterFieldAbsensi"
                          checked={searchField === "catatan"}
                          onChange={() => setSearchField("catatan")}
                        />
                        Catatan
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="filterFieldAbsensi"
                          checked={searchField === "tanggal"}
                          onChange={() => setSearchField("tanggal")}
                        />
                        Tanggal
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

          {/* Attendance List */}
          {absensi.length > 0 ? (
            groupAbsensiByDate(absensi).map((group) => (
              <div
                key={group.date}
                className="border-2 border-gray-100 rounded-xl p-6 bg-white transition-all duration-300 hover:border-red-600 hover:shadow-[0_8px_25px_rgba(220,38,38,0.1)] animate-fadeIn mb-6"
              >
                <div className="flex flex-col gap-4 mb-6">
                  <h3 className="text-gray-900 font-bold text-lg sm:text-xl">
                    {group.date}
                  </h3>
                  <div className="space-y-2">
                    {group.entries.map((entry, index) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium text-gray-600">
                            #{index + 1}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">
                              Clock In:{" "}
                              {new Date(entry.clockIn).toLocaleTimeString(
                                "id-ID"
                              )}
                            </p>
                            {entry.clockOut && (
                              <p className="text-sm text-gray-600">
                                Clock Out:{" "}
                                {new Date(entry.clockOut).toLocaleTimeString(
                                  "id-ID"
                                )}
                              </p>
                            )}
                            {entry.catatan && (
                              <p className="text-xs text-gray-500 mt-1">
                                Catatan: {entry.catatan}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Photo Buttons */}
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                setPreviewSrc(absoluteUrl(entry.fotoClockIn));
                              }}
                              className="px-2 py-1 rounded-md bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 inline-flex items-center gap-1 cursor-pointer"
                              title="Lihat Foto Clock In"
                            >
                              <FontAwesomeIcon
                                icon={faCamera}
                                className="h-3 w-3"
                              />
                              In
                            </button>
                            {entry.fotoClockOut && (
                              <button
                                onClick={() => {
                                  setPreviewSrc(
                                    absoluteUrl(entry.fotoClockOut)
                                  );
                                }}
                                className="px-2 py-1 rounded-md bg-green-600 text-white text-xs font-medium hover:bg-green-700 inline-flex items-center gap-1 cursor-pointer"
                                title="Lihat Foto Clock Out"
                              >
                                <FontAwesomeIcon
                                  icon={faCamera}
                                  className="h-3 w-3"
                                />
                                Out
                              </button>
                            )}
                          </div>

                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${
                              entry.clockOut
                                ? "bg-green-100 text-green-700 border-green-300"
                                : "bg-yellow-100 text-yellow-700 border-yellow-300"
                            }`}
                          >
                            {entry.clockOut ? "Selesai" : "Sedang Bekerja"}
                          </span>

                          {(user?.role?.name === "SUPER ADMIN" ||
                            user?.role?.name === "ADMIN") && (
                            <button
                              onClick={() => handleDelete(entry.id)}
                              disabled={deletingId === entry.id}
                              className={`px-3 py-1 rounded-md text-white text-xs font-medium hover:bg-red-700 inline-flex items-center gap-1 cursor-pointer ${
                                deletingId === entry.id
                                  ? "opacity-60 cursor-not-allowed bg-gray-400"
                                  : "bg-red-600"
                              }`}
                            >
                              <FontAwesomeIcon
                                icon={faTrash}
                                className="h-3 w-3"
                              />
                              {deletingId === entry.id
                                ? "Menghapus..."
                                : "Hapus"}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-red-600 text-xs sm:text-sm font-semibold uppercase tracking-wide mb-2">
                      Total Sesi
                    </h4>
                    <p className="text-gray-700 font-medium">
                      {group.entries.length} sesi
                    </p>
                  </div>
                  <div>
                    <h4 className="text-red-600 text-xs sm:text-sm font-semibold uppercase tracking-wide mb-2">
                      Total Durasi
                    </h4>
                    <p className="text-gray-700 font-medium">
                      {(() => {
                        const totalMs = group.entries.reduce((total, entry) => {
                          if (entry.clockOut) {
                            const duration =
                              new Date(entry.clockOut).getTime() -
                              new Date(entry.clockIn).getTime();
                            return total + duration;
                          }
                          return total;
                        }, 0);

                        if (totalMs > 0) {
                          const totalHours = Math.floor(
                            totalMs / (1000 * 60 * 60)
                          );
                          const totalMinutes = Math.floor(
                            (totalMs % (1000 * 60 * 60)) / (1000 * 60)
                          );

                          if (totalHours > 0 && totalMinutes > 0) {
                            return `${totalHours} jam ${totalMinutes} menit`;
                          } else if (totalHours > 0) {
                            return `${totalHours} jam`;
                          } else {
                            return `${totalMinutes} menit`;
                          }
                        }
                        return "Belum selesai";
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="min-h-[120px]">
              <div className="text-center text-gray-500 py-12">
                <p className="font-medium">Belum ada data absensi.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Photo Preview Modal */}
      {previewSrc && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setPreviewSrc(null)}
        >
          <div
            className="max-w-3xl max-h-[85vh] p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewSrc}
              alt="Foto Absensi"
              className="max-h-[80vh] w-auto rounded shadow-lg"
            />
            <div className="text-center mt-3">
              <button
                onClick={() => setPreviewSrc(null)}
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

export default Absensi;
