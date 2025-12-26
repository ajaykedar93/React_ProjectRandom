import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

/* ================== AUTH PAGES ================== */
import Register from "./Auth/register";
import Login from "./Auth/login";
import Forgot from "./Auth/forgot";

/* ================== DASHBOARD LAYOUT ================== */
import Dashboard from "./Pages/dashboard";

/* ================== DASHBOARD PAGES ================== */
import DashboardHome from "./Pages/DashboardHome";
import DocumentUpload from "./Pages/document";
import DocumentGet from "./Pages/documentget";
import Addtextdoc from "./Pages/Addtextdoc";
import Gettextdoc from "./Pages/Gettextdoc";

/* ================== ADMIN ================== */
import AdminDashboard from "./Pages/Admindashboard";
import UserAll from "./Pages/UserAll.jsx";
import SettingAll from "./Pages/SettingAll.jsx";

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

  // ✅ user role check
  if (user?.role !== "admin") return <Navigate to="/dashboard" replace />;

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================== AUTH ================== */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<Forgot />} />

        {/* ================== ADMIN ================== */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <UserAll />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/settings"
          element={
            <AdminRoute>
              <SettingAll />
            </AdminRoute>
          }
        />

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
          <Route path="document" element={<DocumentUpload />} />
          <Route path="documentget" element={<DocumentGet />} />
          <Route path="addtextdoc" element={<Addtextdoc />} />
          <Route path="gettextdoc" element={<Gettextdoc />} />
        </Route>

        {/* ================== DEFAULT / FALLBACK ================== */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
