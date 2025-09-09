import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/auth/Login";
import Sidebar from "./layouts/Sidebar";
import Dashboard from "./pages/dashboard/Dashboard";
import Responden from "./pages/dashboard/Responden";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import LaporanSouvenir from "./pages/dashboard/LaporanSouvenir";
import Absensi from "./pages/dashboard/Absensi";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          ></Route>

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Sidebar />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="/dashboard/responden" element={<Responden />} />
            <Route path="/dashboard/souvenir" element={<LaporanSouvenir />} />
            <Route path="/dashboard/absensi" element={<Absensi />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
