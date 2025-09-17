/* eslint-disable @typescript-eslint/no-unused-vars */
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCog,
  faLock,
  faKey,
  faShieldAlt,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import React, { useState } from "react";
import axios from "../../helpers/Axios";
import type { AxiosError } from "axios";
import Toast from "../../components/Toast";
import { useAuth } from "../../context/AuthContext";

type Flash = { type: "success" | "error"; text: string };

const Setting = () => {
  const { user } = useAuth();
  const [flash, setFlash] = useState<Flash | null>(null);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setFlash({
        type: "error",
        text: "Semua field password harus diisi",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setFlash({
        type: "error",
        text: "Password baru dan konfirmasi password tidak sama",
      });
      return;
    }

    if (newPassword.length < 8) {
      setFlash({
        type: "error",
        text: "Password baru minimal 8 karakter",
      });
      return;
    }

    // Check if new password is same as current password
    if (currentPassword === newPassword) {
      setFlash({
        type: "error",
        text: "Password baru harus berbeda dengan password lama",
      });
      return;
    }

    setChangingPassword(true);
    try {
      const res = await axios.put(`/api/auth/users/${user?.id}/password`, {
        currentPassword,
        newPassword,
      });
      setFlash({
        type: "success",
        text: res.data.message || "Password berhasil diubah",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setFlash({
        type: "error",
        text: error?.response?.data?.message || error.message,
      });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <section id="settings" className="w-full p-6">
      {flash && <Toast message={flash.text} type={flash.type} />}

      {/* Page Header */}
      <div className="mb-8 border-b-2 border-gray-200 pb-4">
        <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
          <FontAwesomeIcon icon={faCog} className="h-7 w-7" />
          <span>Pengaturan</span>
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Konfigurasi sistem dan profil pengguna
        </p>
      </div>

      {/* Keamanan Akun */}
      <div className="mb-8 overflow-hidden rounded-xl shadow-md bg-white">
        <div className="bg-gradient-to-br from-rose-50 to-red-50 border-b border-red-200 p-6">
          <h2 className="text-red-600 text-xl font-bold flex items-center gap-2">
            <FontAwesomeIcon icon={faLock} className="h-6 w-6" />
            Keamanan Akun
          </h2>
          <p className="text-red-900/80 text-sm font-medium mt-1">
            Ubah password untuk keamanan akun
          </p>
        </div>
        <div className="p-6">
          <form className="space-y-6" onSubmit={handlePasswordChange}>
            <div className="space-y-2">
              <label
                htmlFor="currentPassword"
                className="block text-gray-700 font-semibold"
              >
                <FontAwesomeIcon icon={faKey} className="mr-2 h-5 w-5" />
                Password Saat Ini <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Masukkan password saat ini"
                  required
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-3 pr-12 text-base focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  <FontAwesomeIcon
                    icon={showCurrentPassword ? faEye : faEyeSlash}
                    className="h-5 w-5"
                  />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="newPassword"
                  className="block text-gray-700 font-semibold"
                >
                  <FontAwesomeIcon icon={faLock} className="mr-2 h-5 w-5" />
                  Password Baru <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Masukkan password baru"
                    required
                    className="w-full rounded-lg border-2 border-gray-200 px-3 py-3 pr-12 text-base focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                  >
                    <FontAwesomeIcon
                      icon={showNewPassword ? faEye : faEyeSlash}
                      className="h-5 w-5"
                    />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="block text-gray-700 font-semibold"
                >
                  <FontAwesomeIcon icon={faLock} className="mr-2 h-5 w-5" />
                  Konfirmasi Password <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Konfirmasi password baru"
                    required
                    className="w-full rounded-lg border-2 border-gray-200 px-3 py-3 pr-12 text-base focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                  >
                    <FontAwesomeIcon
                      icon={showConfirmPassword ? faEye : faEyeSlash}
                      className="h-5 w-5"
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={changingPassword}
                className={`inline-flex items-center gap-2 rounded-lg cursor-pointer ${
                  changingPassword
                    ? "bg-gray-400"
                    : "bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                } px-5 py-3 text-white font-semibold uppercase tracking-wide text-sm shadow transition-transform ${
                  changingPassword
                    ? "cursor-not-allowed"
                    : "hover:-translate-y-0.5"
                } focus:outline-none`}
              >
                <FontAwesomeIcon icon={faShieldAlt} className="h-5 w-5" />
                {changingPassword ? "Mengubah..." : "Ubah Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Setting;
