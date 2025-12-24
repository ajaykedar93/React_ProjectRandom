import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

/* Auth pages */
import Register from "./Auth/register";
import Login from "./Auth/login";
import Forgot from "./Auth/forgot";

/* Dashboard layout */
import Dashboard from "./Pages/dashboard";

/* Dashboard pages */
import DashboardHome from "./Pages/DashboardHome";
import DocumentUpload from "./Pages/document";
import DocumentGet from "./Pages/documentget";

/* Text document pages */
import Addtextdoc from "./Pages/Addtextdoc";
import Gettextdoc from "./Pages/Gettextdoc";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot" element={<Forgot />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<DashboardHome />} />
          <Route path="document" element={<DocumentUpload />} />
          <Route path="documentget" element={<DocumentGet />} />
          <Route path="addtextdoc" element={<Addtextdoc />} />
          <Route path="gettextdoc" element={<Gettextdoc />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
