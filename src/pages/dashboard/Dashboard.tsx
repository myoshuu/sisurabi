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

const Dashboard = () => {
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
              0
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
              0
            </div>
            <div
              className="text-sm font-medium text-gray-500"
              id="souvenirGrowth"
            >
              Belum ada data
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
              0
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
              0
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
            <div
              id="recentActivities"
              className="text-center py-12 text-gray-500"
            >
              <FontAwesomeIcon
                icon={faInbox}
                className="mx-auto mb-3 text-2xl opacity-30"
              />
              <p className="text-sm font-medium">Belum ada aktivitas terbaru</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
