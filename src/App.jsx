import React, { useEffect, useMemo, useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

/* ================== AUTH PAGES ================== */
import Register from "./Auth/register";
import Login from "./Auth/login";
import Forgot from "./Auth/forgot";

/* ================== USER DASHBOARD LAYOUT ================== */
import Dashboard from "./Pages/dashboard";

/* ================== USER DASHBOARD PAGES ================== */
import DashboardHome from "./Pages/DashboardHome";
import DocumentUpload from "./Pages/document";
import DocumentGet from "./Pages/documentget";
import Addtextdoc from "./Pages/Addtextdoc";
import Gettextdoc from "./Pages/Gettextdoc";
import Importantwork from "./Pages/Work/Importantwork";

/* ================== ADMIN LAYOUT ================== */
import AdminDashboard from "./Pages/Admin/Admindashboard.jsx";

/* ================== ADMIN PAGES ================== */
import AdminPage from "./Pages/Admin/Admin.jsx";
import UserAll from "./Pages/Admin/UserAll.jsx";
import FooterAdmin from "./Pages/Admin/FooterAdmin.jsx";

/* ================== AUTH CONTEXT ================== */
import { useAuth } from "./contexts/AuthContext.jsx";

/* ================== PROTECTED ROUTES ================== */
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const role = String(user?.role || "").toLowerCase();
  if (role !== "admin") return <Navigate to="/dashboard" replace />;

  return children;
}

/**
 * ✅ Global API warm-up (fast first login)
 * - Fix: /health 404 doesn't throw, so we check res.ok and fallback to "/"
 */
function ApiWarmup() {
  const API_BASE = useMemo(
    () =>
      import.meta?.env?.VITE_API_BASE?.trim() ||
      "https://express-projectrandom.onrender.com",
    []
  );

  useEffect(() => {
    let cancelled = false;

    const warm = async () => {
      try {
        const r1 = await fetch(`${API_BASE}/health`, { method: "GET", cache: "no-store" });
        if (!r1.ok) await fetch(`${API_BASE}/`, { method: "GET", cache: "no-store" });
      } catch {
        if (!cancelled) {
          // ignore warmup errors
        }
      }
    };

    warm();
    return () => {
      cancelled = true;
    };
  }, [API_BASE]);

  return null;
}

/**
 * ✅ Optional: Persist auth on refresh (if your AuthContext doesn't already)
 * - Reads saved user from localStorage (auth_user)
 * - Only runs once
 */
function AuthBootstrap({ children }) {
  const { user, loading, login } = useAuth();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    try {
      // If already logged-in or AuthContext still loading, skip
      if (user || loading) return;

      const raw = localStorage.getItem("auth_user");
      if (!raw) return;

      const parsed = JSON.parse(raw);
      if (parsed && typeof login === "function") {
        login(parsed);
      }
    } catch {
      // ignore
    }
  }, [user, loading, login]);

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      {/* ✅ Warm API once globally */}
      <ApiWarmup />

      {/* ✅ Ensure auth restore (optional) */}
      <AuthBootstrap>
        <Routes>
          {/* ================== AUTH ================== */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot" element={<Forgot />} />

          {/* ================== ADMIN ================== */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          >
            {/* ✅ index = /admin */}
            <Route index element={<AdminPage />} />

            {/* ✅ FIX: Your AdminDashboard tabs go to /admin/admin */}
            <Route path="admin" element={<AdminPage />} />

            <Route path="users" element={<UserAll />} />
            <Route path="footer-admin" element={<FooterAdmin />} />
          </Route>

          {/* ================== USER DASHBOARD ================== */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="importantwork" element={<Importantwork />} />
            <Route path="document" element={<DocumentUpload />} />
            <Route path="documentget" element={<DocumentGet />} />
            <Route path="addtextdoc" element={<Addtextdoc />} />
            <Route path="gettextdoc" element={<Gettextdoc />} />
          </Route>

          {/* ================== DEFAULT ================== */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthBootstrap>
    </BrowserRouter>
  );
}
