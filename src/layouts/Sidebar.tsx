// src/layouts/DashboardLayout.tsx
import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

const Sidebar: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="dashboard flex min-h-screen bg-gray-50 w-full">
      {/* Logout Button */}
      <form action="/logout" method="POST" className="fixed top-4 right-4 z-50">
        <button
          type="submit"
          className="logout-btn bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:translate-y-[-2px] transition-all"
        >
          <i className="fas fa-sign-out-alt mr-2"></i> Logout
        </button>
      </form>

      {/* Mobile Menu Toggle */}
      <button
        onClick={toggleSidebar}
        className="mobile-menu-toggle fixed bottom-4 right-4 bg-red-600 text-white rounded-full w-14 h-14 text-xl shadow-lg md:hidden z-50"
      >
        <i className="fas fa-bars"></i>
      </button>

      {/* Sidebar */}
      <div
        className={`sidebar w-72 bg-gradient-to-b from-blue-800 to-blue-900 text-white shadow-lg transform transition-transform duration-300 md:translate-x-0 fixed md:relative z-40 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="sidebar-header p-6 text-center border-b border-white/20">
          <img
            src="/images/LOGOGRAM-02.png"
            alt="BI Logo"
            className="w-20 h-auto mx-auto mb-2 filter invert"
          />
          <h2 className="text-xl font-bold">Bank Indonesia</h2>
          <p className="text-white/80 text-sm">Sistem Manajemen Suvenir</p>
        </div>

        <nav className="mt-4">
          {[
            { to: "/dashboard", icon: "fa-tachometer-alt", label: "Dashboard" },
            {
              to: "/dashboard/respondent",
              icon: "fa-users",
              label: "Data Responden",
            },
            {
              to: "/dashboard/souvenir",
              icon: "fa-gift",
              label: "Laporan Suvenir",
            },
            {
              to: "/dashboard/attendance",
              icon: "fa-calendar-check",
              label: "Absensi",
            },
            {
              to: "/dashboard/report",
              icon: "fa-chart-bar",
              label: "Laporan Analitik",
            },
            {
              to: "/dashboard/user",
              icon: "fa-user-cog",
              label: "Manajemen Pengguna",
            },
            { to: "/dashboard/setting", icon: "fa-cog", label: "Pengaturan" },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center px-6 py-3 text-white/80 hover:bg-white/10 transition-colors border-l-4 ${
                  isActive
                    ? "bg-white/10 text-white border-red-600"
                    : "border-transparent"
                }`
              }
            >
              <i className={`fas ${item.icon} mr-3 w-5 text-lg`}></i>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content flex-1 p-6 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default Sidebar;
