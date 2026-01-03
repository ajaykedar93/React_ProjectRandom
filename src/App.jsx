
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
import Notes from "./Pages/Notes";
import ShareNote from "./Pages/ShareNote";

/* ================== ADMIN PAGES ================== */
import AdminDashboard from "./Pages/Admin/Admindashboard.jsx";
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
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        >
          <Route index element={<AdminPage />} />
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
          <Route path="document" element={<DocumentUpload />} />
          <Route path="documentget" element={<DocumentGet />} />
          <Route path="addtextdoc" element={<Addtextdoc />} />
          <Route path="gettextdoc" element={<Gettextdoc />} />
          <Route path="notes" element={<Notes />} />
        </Route>

        {/* ================== PUBLIC SHARE ================== */}
        <Route path="/share/:token" element={<ShareNote />} />

        {/* ================== DEFAULT ================== */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
