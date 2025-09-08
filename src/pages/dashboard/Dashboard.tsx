import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faUsers,
  faGift,
  faClock,
  faExclamationTriangle,
  faChartBar,
  faInbox,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import axios from "../../helpers/Axios";
import type { AxiosError } from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Toast from "../../components/Toast";

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  type Flash = { type: "success" | "error"; text: string };
  const navigationMsg = (location.state as { message?: Flash } | undefined)
    ?.message;
  const [flash, setFlash] = useState<Flash | null>(navigationMsg || null);

  useEffect(() => {
    if (!navigationMsg) {
      const raw = sessionStorage.getItem("flash");
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as Flash;
          setFlash(parsed);
          sessionStorage.removeItem("flash");
        } catch {
          sessionStorage.removeItem("flash");
        }
      }
    } else {
      // clean up the history state so refresh doesn't keep it
      navigate(location.pathname, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [responden, setResponden] = useState<{
    message: string;
    responden: Array<{
      nama: string;
      createdAt: string;
    }>;
    totalResponden: number;
  } | null>(null);

  const [laporanSuvenir, setLaporanSuvenir] = useState<{
    message: string;
    laporan: Array<[]>;
    totalLaporan: number;
    totalPending: number;
    totalTerlambat: number;
  } | null>(null);

  const fetchResponden = async () => {
    try {
      const res = await axios.get("/api/responden");
      setResponden(res.data);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setFlash({
        type: "error",
        text: error?.response?.data?.message || error.message,
      });
    }
  };

  const fetchLaporan = async () => {
    try {
      const res = await axios.get("/api/laporan");
      setLaporanSuvenir(res.data);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setFlash({
        type: "error",
        text: error?.response?.data?.message || error.message,
      });
    }
  };

  useEffect(() => {
    fetchResponden();
    fetchLaporan();
  }, []);

  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Page Header */}
        <div className="mb-8 border-b-2 border-gray-200 pb-4">
          <h1 className="flex items-center text-3xl font-bold text-gray-900">
            <FontAwesomeIcon icon={faHome} className="mr-2 h-7 w-7 " />{" "}
            Dashboard
          </h1>
          <p className="mt-1 text-gray-500">
            Selamat datang di sistem Bank Indonesia,{" "}
            <span className="font-semibold text-gray-700">User</span>
          </p>
        </div>

        {flash && <Toast message={flash.text} type={flash.type} />}

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Total Responden */}
          <div className="rounded-xl border-l-4 border-red-600 bg-white p-6 shadow-md transition-transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold uppercase tracking-wide text-gray-500">
                Total Responden
              </h3>
              <FontAwesomeIcon
                icon={faUsers}
                className="text-2xl text-emerald-500"
              />
            </div>
            <div
              className="text-3xl font-extrabold text-gray-900"
              id="totalRespondents"
            >
              {responden?.totalResponden || 0}
            </div>
            <div className="text-sm font-medium text-emerald-600">
              Terdaftar aktif
            </div>
          </div>

          {/* Total Laporan Suvenir */}
          <div className="rounded-xl border-l-4 border-red-600 bg-white p-6 shadow-md transition-transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold uppercase tracking-wide text-gray-500">
                Total Laporan Suvenir
              </h3>
              <FontAwesomeIcon
                icon={faGift}
                className="text-2xl text-red-600"
              />
            </div>
            <div
              className="text-3xl font-extrabold text-gray-900"
              id="totalSouvenirs"
            >
              {laporanSuvenir?.totalLaporan}
            </div>
            <div
              className="text-sm font-medium text-gray-500"
              id="souvenirGrowth"
            >
              Laporan terdata
            </div>
          </div>

          {/* Laporan Pending */}
          <div className="rounded-xl border-l-4 border-red-600 bg-white p-6 shadow-md transition-transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold uppercase tracking-wide text-gray-500">
                Laporan Pending
              </h3>
              <FontAwesomeIcon
                icon={faClock}
                className="text-2xl text-amber-500"
              />
            </div>
            <div
              className="text-3xl font-extrabold text-gray-900"
              id="pendingReports"
            >
              {laporanSuvenir?.totalPending}
            </div>
            <div className="text-sm font-medium text-gray-500">
              Menunggu approval
            </div>
          </div>

          {/* Laporan Terlambat */}
          <div className="rounded-xl border-l-4 border-red-600 bg-white p-6 shadow-md transition-transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold uppercase tracking-wide text-gray-500">
                Laporan Terlambat
              </h3>
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                className="text-2xl text-red-500"
              />
            </div>
            <div
              className="text-3xl font-extrabold text-gray-900"
              id="lateReports"
            >
              {laporanSuvenir?.totalTerlambat}
            </div>
            <div
              className="text-sm font-medium text-red-600"
              id="lateReportsStatus"
            >
              Perlu perhatian
            </div>
          </div>
        </div>

        {/* Card Aktivitas Terbaru */}
        <div className="rounded-xl bg-white shadow-md overflow-hidden">
          <div className="bg-red-50 border-b border-red-200 p-6">
            <h2 className="flex items-center text-xl font-bold text-red-600">
              <FontAwesomeIcon icon={faChartBar} className="mr-2 h-6 w-6" />{" "}
              Aktivitas Terbaru
            </h2>
            <p className="mt-1 text-sm font-medium text-red-900">
              Responden dan laporan terbaru
            </p>
          </div>
          <div className="p-6">
            {responden && responden.responden.length > 0 ? (
              <div className="space-y-4">
                {responden.responden.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-gray-200 border-l-4 border-l-green-600 bg-white p-6"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-lg font-semibold tracking-wide">
                        {item.nama || "Nama Responden"}
                      </h3>
                    </div>
                    <div className="text-gray-500" id="totalRespondents">
                      Responden Baru -{" "}
                      {new Date(item.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                    <div className="text-sm font-medium text-emerald-600 mt-3">
                      Terdaftar aktif
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                id="recentActivities"
                className="text-center py-12 text-gray-500"
              >
                <FontAwesomeIcon
                  icon={faInbox}
                  className="mx-auto mb-3 text-2xl opacity-30"
                />
                <p className="text-sm font-medium">
                  Belum ada aktivitas terbaru
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
