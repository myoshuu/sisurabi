/* eslint-disable @typescript-eslint/no-unused-vars */
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserCog,
  faUsers,
  faUserPlus,
  faUser,
  faEnvelope,
  faUserTag,
  faEdit,
  faTrash,
  faSearch,
  faFilter,
  faExclamationTriangle,
  faKey,
  faToggleOn,
  faToggleOff,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "../../helpers/Axios";
import type { AxiosError } from "axios";
import Toast from "../../components/Toast";
import { useAuth } from "../../context/AuthContext";

type Flash = { type: "success" | "error"; text: string };

type UserItem = {
  id: string;
  email: string;
  disabled: boolean;
  role: { id: string; nama: string };
  createdAt: string;
  updatedAt: string;
};

const Management: React.FC = () => {
  const { user } = useAuth();

  const [flash, setFlash] = useState<Flash | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState("");
  const [searchField, setSearchField] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searching, setSearching] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<number | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const filterRef = useRef<HTMLDivElement | null>(null);

  const [editId, setEditId] = useState<string | null>(null);
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRoleId, setFormRoleId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Password change modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordUserId, setPasswordUserId] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [forceChange, setForceChange] = useState(false);

  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);

  // Password visibility states
  const [showFormPassword, setShowFormPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [roles, setRoles] = useState<{ id: string; nama: string }[]>([]);

  // All useEffect hooks must be called before any conditional returns
  useEffect(() => {
    if (debounceTimer) window.clearTimeout(debounceTimer);
    setSearching(true);
    const id = window.setTimeout(() => {
      const q = search.trim();
      void fetchUsers(
        q.length > 0 ? q : undefined,
        searchField || undefined,
        roleFilter || undefined,
        statusFilter || undefined
      );
    }, 350);
    setDebounceTimer(id);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, searchField, roleFilter, statusFilter]);

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
    fetchRoles();
    fetchUsers();
  }, []);

  // Check if user has admin privileges
  const isAdmin =
    user?.role?.name === "SUPER ADMIN" || user?.role?.name === "ADMIN";

  // Redirect to dashboard if user doesn't have admin privileges
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const resetForm = () => {
    setEditId(null);
    setFormEmail("");
    setFormPassword("");
    setFormRoleId("");
  };

  const fetchRoles = async () => {
    try {
      const res = await axios.get("/api/auth/roles");
      setRoles(res.data?.roles || []);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setFlash({
        type: "error",
        text: error?.response?.data?.message || error.message,
      });
    }
  };

  const fetchUsers = async (
    q?: string,
    field?: string,
    role?: string,
    status?: string
  ) => {
    try {
      const params: Record<string, string> = {};
      if (q) params.q = q;
      if (field) params.field = field;
      if (role) params.role = role;
      if (status) params.status = status;

      const res = await axios.get("/api/auth/users", {
        params: Object.keys(params).length ? params : undefined,
      });
      setUsers(res.data?.users || []);
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
    if (!formEmail || !formRoleId || (!editId && !formPassword)) return;
    setSubmitting(true);
    try {
      const data = {
        email: formEmail,
        password: formPassword,
        roleId: formRoleId,
      };

      if (editId) {
        const res = await axios.put(`/api/auth/users/${editId}`, data);
        setFlash({
          type: "success",
          text: res.data.message || "User diperbarui",
        });
      } else {
        const res = await axios.post(`/api/auth/users`, data);
        setFlash({
          type: "success",
          text: res.data.message || "User dibuat",
        });
      }
      await fetchUsers();
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

  const canEditUser = (item: UserItem) => {
    const role = user?.role?.name;
    return role === "SUPER ADMIN" || role === "ADMIN";
  };

  const handleEdit = (item: UserItem) => {
    if (!canEditUser(item)) return;
    setEditId(item.id);
    setFormEmail(item.email);
    setFormPassword("");
    setFormRoleId(item.role.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!passwordUserId || !newPassword || !confirmPassword) return;

    // If not force change, require current password
    if (!forceChange && !currentPassword) {
      setFlash({
        type: "error",
        text: "Password lama harus diisi",
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

    setChangingPassword(true);
    try {
      const res = await axios.put(
        `/api/auth/users/${passwordUserId}/password`,
        {
          currentPassword: forceChange ? undefined : currentPassword,
          newPassword,
          forceChange,
        }
      );
      setFlash({
        type: "success",
        text: res.data.message || "Password berhasil diubah",
      });
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordUserId(null);
      setForceChange(false);
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

  const handleToggleUserStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await axios.put(`/api/auth/users/${id}/status`, {
        disabled: !currentStatus,
      });
      setFlash({
        type: "success",
        text:
          res.data.message ||
          `User berhasil ${!currentStatus ? "dinonaktifkan" : "diaktifkan"}`,
      });
      await fetchUsers();
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setFlash({
        type: "error",
        text: error?.response?.data?.message || error.message,
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteUserId) return;

    setDeletingUser(true);
    try {
      const res = await axios.delete(`/api/auth/users/${deleteUserId}`);
      setFlash({
        type: "success",
        text: res.data.message || "User dihapus",
      });
      await fetchUsers();
      setShowDeleteModal(false);
      setDeleteUserId(null);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setFlash({
        type: "error",
        text: error?.response?.data?.message || error.message,
      });
    } finally {
      setDeletingUser(false);
    }
  };

  const openPasswordModal = (userId: string) => {
    setPasswordUserId(userId);
    setForceChange(false);
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setShowPasswordModal(true);
  };

  const openDeleteModal = (userId: string) => {
    setDeleteUserId(userId);
    setShowDeleteModal(true);
  };

  return (
    <section id="users" className="w-full p-6">
      {flash && <Toast message={flash.text} type={flash.type} />}

      {/* Page Header */}
      <div className="mb-8 border-b-2 border-gray-200 pb-4">
        <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
          <FontAwesomeIcon icon={faUserCog} className="h-7 w-7" />
          <span>Manajemen User</span>
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Kelola pengguna sistem Bank Indonesia
        </p>
      </div>

      {/* User Management Rules */}
      <div className="mb-8 overflow-hidden rounded-xl shadow-md bg-white">
        <div className="bg-gradient-to-br from-blue-50 to-blue-50 border-b border-blue-200 p-6">
          <h2 className="text-blue-600 text-xl font-bold flex items-center gap-2">
            <FontAwesomeIcon icon={faExclamationTriangle} className="h-6 w-6" />
            Peraturan Manajemen User
          </h2>
          <p className="text-blue-900/80 text-sm font-medium mt-1">
            Ketentuan dan aturan yang harus dipatuhi
          </p>
        </div>
        <div className="p-6">
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Hanya SUPER ADMIN dan ADMIN yang dapat mengelola user</li>
            <li>Email harus menggunakan domain @bi.go.id</li>
            <li>
              Password minimal 8 karakter dengan kombinasi huruf dan angka
            </li>
            <li>Setiap user harus memiliki role yang jelas</li>
            <li>User yang dihapus tidak dapat dipulihkan</li>
            <li>Perubahan role akan mempengaruhi akses user ke sistem</li>
          </ul>
        </div>
      </div>

      {/* Create User Card */}
      <div className="mb-8 overflow-hidden rounded-xl shadow-md bg-white">
        <div className="bg-gradient-to-br from-rose-50 to-red-50 border-b border-red-200 p-6">
          <h2 className="text-red-600 text-xl font-bold flex items-center gap-2">
            <FontAwesomeIcon icon={faUserPlus} className="h-6 w-6" />
            {editId ? "Perbarui User" : "Tambah User Baru"}
          </h2>
          <p className="text-red-900/80 text-sm font-medium mt-1">
            {editId
              ? "Perbarui data user"
              : "Daftarkan pengguna baru ke sistem"}
          </p>
        </div>

        <div className="p-6">
          <form id="userForm" className="space-y-6" onSubmit={handleSubmit}>
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="userEmail"
                  className="block text-gray-700 font-semibold"
                >
                  <FontAwesomeIcon icon={faEnvelope} className="mr-2 h-5 w-5" />
                  Email <span className="text-red-600">*</span>
                </label>
                <input
                  id="userEmail"
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="nama@bi.go.id"
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-3 text-base focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="userRole"
                  className="block text-gray-700 font-semibold"
                >
                  <FontAwesomeIcon icon={faUserTag} className="mr-2 h-5 w-5" />
                  Role <span className="text-red-600">*</span>
                </label>
                <select
                  id="userRole"
                  required
                  value={formRoleId}
                  onChange={(e) => setFormRoleId(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-3 text-base focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
                >
                  <option value="">Pilih role</option>
                  {roles.map((r) => (
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
                  htmlFor="userPassword"
                  className="block text-gray-700 font-semibold"
                >
                  <FontAwesomeIcon icon={faUser} className="mr-2 h-5 w-5" />
                  Password{" "}
                  {editId ? (
                    <span className="text-gray-400">
                      (kosongkan jika tidak diubah)
                    </span>
                  ) : (
                    <span className="text-red-600">*</span>
                  )}
                </label>
                <div className="relative">
                  <input
                    id="userPassword"
                    type={showFormPassword ? "text" : "password"}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="Masukkan password"
                    className="w-full rounded-lg border-2 border-gray-200 px-3 py-3 pr-12 text-base focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowFormPassword(!showFormPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                  >
                    <FontAwesomeIcon
                      icon={showFormPassword ? faEye : faEyeSlash}
                      className="h-5 w-5"
                    />
                  </button>
                </div>
                <small className="text-gray-500 text-xs">
                  Minimal 8 karakter dengan kombinasi huruf dan angka
                </small>
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={submitting}
                className={`inline-flex items-center gap-2 rounded-lg cursor-pointer ${
                  submitting
                    ? "bg-gray-400"
                    : "bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                } px-5 py-3 text-white font-semibold uppercase tracking-wide text-sm shadow transition-transform ${
                  submitting ? "cursor-not-allowed" : "hover:-translate-y-0.5"
                } focus:outline-none`}
              >
                <FontAwesomeIcon icon={faUserPlus} className="h-5 w-5" />
                {editId ? "Update User" : "Simpan User"}
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

      {/* Users List */}
      <div className="rounded-xl shadow-md bg-white overflow-hidden">
        <div className="bg-gradient-to-br from-rose-50 to-red-50 border-b border-red-200 p-6">
          <h2 className="text-red-600 text-xl font-bold flex items-center gap-2">
            <FontAwesomeIcon icon={faUsers} className="h-6 w-6" />
            Daftar Pengguna Sistem
          </h2>
          <p className="text-red-900/80 text-sm font-medium mt-1">
            Semua pengguna yang memiliki akses ke sistem
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
                id="searchUser"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari user..."
                className="w-full rounded-full border-2 border-gray-200 pl-12 pr-4 py-2 text-base transition focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
              />
              {searching && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  Mencari...
                </span>
              )}
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-full border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-red-600"
              title="Filter Role"
            >
              <option value="">Semua Role</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nama}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-full border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-red-600"
              title="Filter Status"
            >
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
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
                          name="filterFieldUser"
                          checked={searchField === ""}
                          onChange={() => setSearchField("")}
                        />
                        Semua Kolom
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="filterFieldUser"
                          checked={searchField === "email"}
                          onChange={() => setSearchField("email")}
                        />
                        Email
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="filterFieldUser"
                          checked={searchField === "role"}
                          onChange={() => setSearchField("role")}
                        />
                        Role
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
          {users.length > 0 ? (
            users.map((item) => (
              <div
                key={item.id}
                className="border-2 border-gray-100 rounded-xl p-6 bg-white transition-all duration-300 hover:border-red-600 hover:shadow-[0_8px_25px_rgba(220,38,38,0.1)] animate-fadeIn"
              >
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {item.email}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Dibuat:{" "}
                    {new Date(item.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-gray-700">Email</h4>
                    <p
                      className={
                        item.disabled ? "text-gray-400 line-through" : ""
                      }
                    >
                      {item.email}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700">Role</h4>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${
                        item.role.nama === "SUPER ADMIN"
                          ? "bg-purple-100 text-purple-700 border-purple-300"
                          : item.role.nama === "ADMIN"
                          ? "bg-blue-100 text-blue-700 border-blue-300"
                          : "bg-gray-100 text-gray-700 border-gray-300"
                      }`}
                    >
                      {item.role.nama}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700">Status</h4>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${
                        item.disabled
                          ? "bg-red-100 text-red-700 border-red-300"
                          : "bg-green-100 text-green-700 border-green-300"
                      }`}
                    >
                      {item.disabled ? "Nonaktif" : "Aktif"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-wrap justify-end gap-2">
                  {canEditUser(item) && (
                    <>
                      <button
                        onClick={() => handleEdit(item)}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 inline-flex items-center gap-2 cursor-pointer"
                      >
                        <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />{" "}
                        Edit
                      </button>
                      <button
                        onClick={() => openPasswordModal(item.id)}
                        className="px-4 py-2 rounded-lg bg-yellow-600 text-white text-sm font-medium hover:bg-yellow-700 inline-flex items-center gap-2 cursor-pointer"
                      >
                        <FontAwesomeIcon icon={faKey} className="h-4 w-4" />{" "}
                        Password
                      </button>
                      <button
                        onClick={() =>
                          handleToggleUserStatus(item.id, item.disabled)
                        }
                        className={`px-4 py-2 rounded-lg text-white text-sm font-medium inline-flex items-center gap-2 cursor-pointer ${
                          item.disabled
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-orange-600 hover:bg-orange-700"
                        }`}
                      >
                        <FontAwesomeIcon
                          icon={item.disabled ? faToggleOn : faToggleOff}
                          className="h-4 w-4"
                        />{" "}
                        {item.disabled ? "Aktifkan" : "Nonaktifkan"}
                      </button>
                      <button
                        onClick={() => openDeleteModal(item.id)}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 inline-flex items-center gap-2 cursor-pointer"
                      >
                        <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />{" "}
                        Hapus
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="min-h-[120px]">
              <div className="text-center text-gray-500 py-12">
                <p className="font-medium">Belum ada user.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-b border-yellow-200 p-6 rounded-t-xl">
              <h2 className="text-yellow-600 text-xl font-bold flex items-center gap-2">
                <FontAwesomeIcon icon={faKey} className="h-6 w-6" />
                Ubah Password
              </h2>
              <p className="text-yellow-900/80 text-sm font-medium mt-1">
                {forceChange
                  ? "Masukkan password baru (admin mode - skip current password)"
                  : "Masukkan password lama dan password baru"}
              </p>
            </div>
            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              {/* Force Change Option for Admins */}
              {user?.role?.name === "SUPER ADMIN" ||
              user?.role?.name === "ADMIN" ? (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={forceChange}
                      onChange={(e) => setForceChange(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-blue-800 font-medium">
                      Force Change (Admin) - Skip current password verification
                    </span>
                  </label>
                  <p className="text-blue-700 text-sm mt-1">
                    Silahkan checklist ini untuk mengganti password secara paksa
                    tanpa memasukkan password lama
                  </p>
                </div>
              ) : null}

              {!forceChange && (
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Password Lama <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Masukkan password lama"
                      required
                      className="w-full rounded-lg border-2 border-gray-200 px-3 py-3 pr-12 text-base focus:outline-none focus:border-yellow-600 focus:ring-4 focus:ring-yellow-600/10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                    >
                      <FontAwesomeIcon
                        icon={showCurrentPassword ? faEye : faEyeSlash}
                        className="h-5 w-5"
                      />
                    </button>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Password Baru <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Masukkan password baru"
                    required
                    className="w-full rounded-lg border-2 border-gray-200 px-3 py-3 pr-12 text-base focus:outline-none focus:border-yellow-600 focus:ring-4 focus:ring-yellow-600/10"
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
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Konfirmasi Password <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Konfirmasi password baru"
                    required
                    className="w-full rounded-lg border-2 border-gray-200 px-3 py-3 pr-12 text-base focus:outline-none focus:border-yellow-600 focus:ring-4 focus:ring-yellow-600/10"
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
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg cursor-pointer ${
                    changingPassword
                      ? "bg-gray-400"
                      : "bg-gradient-to-br from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
                  } px-4 py-3 text-white font-semibold text-sm shadow transition-transform ${
                    changingPassword
                      ? "cursor-not-allowed"
                      : "hover:-translate-y-0.5"
                  } focus:outline-none`}
                >
                  <FontAwesomeIcon icon={faKey} className="h-4 w-4" />
                  {changingPassword ? "Mengubah..." : "Ubah Password"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setPasswordUserId(null);
                    setForceChange(false);
                    setShowCurrentPassword(false);
                    setShowNewPassword(false);
                    setShowConfirmPassword(false);
                  }}
                  className="px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
            <div className="bg-gradient-to-br from-red-50 to-pink-50 border-b border-red-200 p-6 rounded-t-xl">
              <h2 className="text-red-600 text-xl font-bold flex items-center gap-2">
                <FontAwesomeIcon icon={faTrash} className="h-6 w-6" />
                Konfirmasi Hapus User
              </h2>
              <p className="text-red-900/80 text-sm font-medium mt-1">
                Tindakan ini tidak dapat dibatalkan
              </p>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-6">
                Apakah Anda yakin ingin menghapus user ini? Semua data yang
                terkait dengan user ini akan dihapus secara permanen.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={deletingUser}
                  className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg cursor-pointer ${
                    deletingUser
                      ? "bg-gray-400"
                      : "bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                  } px-4 py-3 text-white font-semibold text-sm shadow transition-transform ${
                    deletingUser
                      ? "cursor-not-allowed"
                      : "hover:-translate-y-0.5"
                  } focus:outline-none`}
                >
                  <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                  {deletingUser ? "Menghapus..." : "Ya, Hapus"}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteUserId(null);
                  }}
                  className="px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Management;
