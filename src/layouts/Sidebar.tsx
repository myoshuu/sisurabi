// src/layouts/DashboardLayout.tsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTachometerAlt,
  faUsers,
  faGift,
  faCalendarCheck,
  faChartBar,
  faUserCog,
  faCog,
  faSignOutAlt,
  faBars,
} from "@fortawesome/free-solid-svg-icons";
import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import axios from "../helpers/Axios";
import type { AxiosError } from "axios";
import { useAuth } from "../context/AuthContext";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const navItems = [
    { to: "/dashboard", icon: faTachometerAlt, label: "Dashboard" },
    { to: "/dashboard/responden", icon: faUsers, label: "Data Responden" },
    { to: "/dashboard/souvenir", icon: faGift, label: "Laporan Suvenir" },
    { to: "/dashboard/absensi", icon: faCalendarCheck, label: "Absensi" },
    { to: "/dashboard/report", icon: faChartBar, label: "Laporan Analitik" },
    { to: "/dashboard/user", icon: faUserCog, label: "Manajemen Pengguna" },
    { to: "/dashboard/setting", icon: faCog, label: "Pengaturan" },
  ];

  const handleLogout = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await axios.post("/api/auth/logout");
      const flash = { type: "success" as const, text: res.data.message };
      sessionStorage.setItem("flash", JSON.stringify(flash));
      setUser(null);
      navigate("/", { state: { message: flash }, replace: true });
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      const flash = {
        type: "error" as const,
        text: error?.response?.data?.message || error.message,
      };
      sessionStorage.setItem("flash", JSON.stringify(flash));
      setUser(null);
      navigate("/", { state: { message: flash }, replace: true });
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 w-full">
      {/* Logout Button */}
      <form onSubmit={handleLogout} className="fixed top-4 right-4 z-50">
        <button
          type="submit"
          className="flex items-center bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="mr-2 w-5" />
          Logout
        </button>
      </form>

      {/* Mobile Menu Toggle */}
      <button
        onClick={toggleSidebar}
        className="fixed bottom-4 right-4 bg-red-600 text-white rounded-full w-14 h-14 text-2xl shadow-lg md:hidden z-50 flex items-center justify-center"
      >
        <FontAwesomeIcon icon={faBars} />
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen w-72 bg-gradient-to-b from-blue-800 to-blue-900 text-white shadow-lg transform transition-transform duration-300 z-40 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="p-6 text-center border-b border-white/20">
          <img
            src="/BI_GRAM_WHITE.webp"
            alt="BI Logo"
            className="w-20 h-auto mx-auto mb-2"
          />
          <h2 className="text-xl font-bold">Bank Indonesia</h2>
          <p className="text-white/80 text-sm">Sistem Manajemen Suvenir</p>
        </div>

        <nav className="mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/dashboard"}
              className={({ isActive }) =>
                `flex items-center px-6 py-3 hover:bg-white/10 transition-colors border-l-4 ${
                  isActive
                    ? "bg-white/10 text-white border-red-600"
                    : "text-white/80 border-transparent"
                }`
              }
            >
              <FontAwesomeIcon icon={item.icon} className="mr-3 w-5 text-lg" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto md:ml-72">
        <Outlet />
      </div>
    </div>
  );
};

export default Sidebar;
