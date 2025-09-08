import axios from "../../helpers/Axios";
import { AxiosError } from "axios";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useAuth();

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const data = Object.fromEntries(formData.entries());

    try {
      const res = await axios.post("/api/auth/login", data);
      const rawUser = res.data.user as {
        id: string;
        email: string;
        role?: { name?: string; nama?: string };
      };
      const normalizedUser = rawUser
        ? {
            id: rawUser.id,
            email: rawUser.email,
            role: {
              name: (rawUser.role?.name || rawUser.role?.nama || "").toString(),
            },
          }
        : null;
      setUser(normalizedUser);
      const f = { type: "success" as const, text: res.data.message };
      sessionStorage.setItem("flash", JSON.stringify(f));
      navigate("/dashboard", { state: { message: f } });
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setMessage({
        type: "error",
        text: error?.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <section className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900">
        <div className="bg-white p-10 rounded-2xl shadow-2xl border-4 border-red-600 w-full max-w-md mx-4">
          {/* Logo */}
          <div className="text-center mb-8">
            <img
              src="/logobi.jpg"
              alt="Bank Indonesia Logo"
              className="w-72 mx-auto mb-4 object-contain"
            />
            <p className="text-gray-500 text-sm font-medium">
              Sistem Laporan Suvenir & Absensi
            </p>
          </div>
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg font-semibold text-center ${
                message.type === "success"
                  ? "bg-green-100 text-green-800 border border-green-300"
                  : "bg-red-100 text-red-800 border border-red-300"
              }`}
            >
              {message.text}
            </div>
          )}
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-gray-700 font-semibold"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="nama@bi.go.id"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-200 transition"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block mb-2 text-gray-700 font-semibold"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                placeholder="Masukkan password"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-200 transition"
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg text-white font-semibold uppercase tracking-wide transition transform cursor-pointer ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 hover:-translate-y-1 shadow-lg"
              }`}
            >
              {loading ? "Loading..." : "Login"}
            </button>
          </form>
          {/* Demo Accounts */}
          <div className="mt-8 p-6 rounded-lg border-l-4 border-red-600 bg-gradient-to-br from-red-50 to-red-100">
            <h3 className="text-red-600 font-bold mb-3 text-sm">
              <i className="fas fa-info-circle"></i> Demo Accounts:
            </h3>
            <p className="text-red-900 text-sm mb-1 font-medium">
              <strong>Super Admin:</strong> admin@bi.go.id / admin123
            </p>
            <p className="text-red-900 text-sm mb-1 font-medium">
              <strong>Admin:</strong> manager@bi.go.id / manager123
            </p>
            <p className="text-red-900 text-sm font-medium">
              <strong>User:</strong> user@bi.go.id / user123
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Login;
