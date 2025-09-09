import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarCheck,
  faUserClock,
  faCamera,
  faSignInAlt,
  faSignOutAlt,
  faHistory,
  faDownload,
  faSearch,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import React, { useState, useEffect } from "react";
import Toast from "../../components/Toast";

type Flash = { type: "success" | "error"; text: string };

const Absensi: React.FC = () => {
  const [currentTime, setCurrentTime] = useState("--:--:--");
  const [currentDate, setCurrentDate] = useState("Loading...");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [attendanceLog, setAttendanceLog] = useState<string[]>([]);
  const [clockedIn, setClockedIn] = useState(false);
  const [flash, setFlash] = useState<Flash | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const clockIn = async () => {
    if (!photoPreview) {
      setFlash({
        type: "error",
        text: "Anda harus mengupload foto terlebih dahulu",
      });
      return;
    }

    setSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setAttendanceLog((prev) => [
        ...prev,
        `Clock In - ${new Date().toLocaleTimeString("id-ID")}`,
      ]);
      setClockedIn(true);
      setFlash({
        type: "success",
        text: "Clock In berhasil dilakukan",
      });
    } catch {
      setFlash({
        type: "error",
        text: "Gagal melakukan Clock In",
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setAttendanceLog((prev) => [
        ...prev,
        `Clock Out - ${new Date().toLocaleTimeString("id-ID")}`,
      ]);
      setClockedIn(false);
      setFlash({
        type: "success",
        text: "Clock Out berhasil dilakukan",
      });
    } catch {
      setFlash({
        type: "error",
        text: "Gagal melakukan Clock Out",
      });
    } finally {
      setSubmitting(false);
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
            <h3 className="text-center text-red-600 font-semibold mb-4 flex items-center justify-center gap-2">
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

          {/* Log Absensi Hari Ini */}
          <div className="mt-8 text-center">
            <h3 className="text-lg font-semibold">Log Absensi Hari Ini:</h3>
            <ul className="mt-4 space-y-2">
              {attendanceLog.map((log, idx) => (
                <li key={idx} className="text-gray-700">
                  {log}
                </li>
              ))}
            </ul>
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
          <div className="flex gap-4 mb-6 flex-wrap">
            <button className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 px-4 py-2 text-white font-semibold uppercase tracking-wide text-sm shadow transition-transform hover:-translate-y-0.5 focus:outline-none cursor-pointer">
              <FontAwesomeIcon icon={faDownload} className="h-4 w-4" />
              Download Log Book
            </button>
          </div>

          {/* Search Box */}
          <div className="relative mb-6 flex items-center gap-3">
            <div className="relative flex-1">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="text"
                placeholder="Cari berdasarkan tanggal atau status..."
                className="w-full rounded-full border-2 border-gray-200 pl-12 pr-4 py-2 text-base transition focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
              />
            </div>
          </div>

          {/* Dummy Attendance List */}
          <div className="space-y-3">
            <div className="border-2 border-gray-100 rounded-xl p-6 bg-white transition-all duration-300 hover:border-red-600 hover:shadow-[0_8px_25px_rgba(220,38,38,0.1)] animate-fadeIn">
              <div className="flex flex-col gap-4 mb-6">
                <h3 className="text-gray-900 font-bold text-lg sm:text-xl">
                  Senin, 2 September 2024
                </h3>
                <p className="text-gray-500 text-sm sm:text-base">
                  Clock In 08:05, Clock Out 17:10
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-red-600 text-xs sm:text-sm font-semibold uppercase tracking-wide mb-2">
                    Status
                  </h4>
                  <p className="text-gray-700 font-medium">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium border bg-green-100 text-green-700 border-green-300">
                      Hadir
                    </span>
                  </p>
                </div>
                <div>
                  <h4 className="text-red-600 text-xs sm:text-sm font-semibold uppercase tracking-wide mb-2">
                    Durasi Kerja
                  </h4>
                  <p className="text-gray-700 font-medium">9 jam 5 menit</p>
                </div>
              </div>
            </div>
            <div className="border-2 border-gray-100 rounded-xl p-6 bg-white transition-all duration-300 hover:border-red-600 hover:shadow-[0_8px_25px_rgba(220,38,38,0.1)] animate-fadeIn">
              <div className="flex flex-col gap-4 mb-6">
                <h3 className="text-gray-900 font-bold text-lg sm:text-xl">
                  Selasa, 3 September 2024
                </h3>
                <p className="text-gray-500 text-sm sm:text-base">
                  Clock In 08:10, Clock Out 17:00
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-red-600 text-xs sm:text-sm font-semibold uppercase tracking-wide mb-2">
                    Status
                  </h4>
                  <p className="text-gray-700 font-medium">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium border bg-green-100 text-green-700 border-green-300">
                      Hadir
                    </span>
                  </p>
                </div>
                <div>
                  <h4 className="text-red-600 text-xs sm:text-sm font-semibold uppercase tracking-wide mb-2">
                    Durasi Kerja
                  </h4>
                  <p className="text-gray-700 font-medium">8 jam 50 menit</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Absensi;
