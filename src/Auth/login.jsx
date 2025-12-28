import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; // ✅ correct path

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // ✅ same as your file
  const API_BASE = import.meta?.env?.VITE_API_BASE || "https://express-projectrandom.onrender.com";

  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);

  const [modal, setModal] = useState({
    open: false,
    type: "info",
    title: "",
    message: "",
  });

  const openModal = (type, title, message) =>
    setModal({ open: true, type, title, message });
  const closeModal = () => setModal((p) => ({ ...p, open: false }));

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && closeModal();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const validate = () => {
    const err = {};
    const username = form.username.trim();
    const password = form.password.trim();

    if (!username)
      err.username = isAdmin ? "Admin email required" : "Email or Mobile required";
    if (!password) err.password = "Password required";

    setErrors(err);

    if (Object.keys(err).length) {
      openModal(
        "error",
        "Missing Fields",
        isAdmin
          ? "Please enter Admin Email and Password."
          : "Please enter Email/Mobile and Password."
      );
    }
    return Object.keys(err).length === 0;
  };

  async function apiPost(path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "include", // ✅ safe (if backend uses cookies too)
    });

    const text = await res.text();
    let data = null;
    try {
      data = JSON.parse(text);
    } catch {}

    if (!res.ok) throw new Error(data?.message || text || `HTTP ${res.status}`);
    return data || {};
  }

  // ✅ Robust token extractor (fix for 401)
  function extractToken(data) {
    // Most common keys
    if (data?.token) return data.token;
    if (data?.accessToken) return data.accessToken;
    if (data?.jwt) return data.jwt;

    // Sometimes nested
    if (data?.user?.token) return data.user.token;
    if (data?.user?.accessToken) return data.user.accessToken;
    if (data?.user?.jwt) return data.user.jwt;

    // Sometimes inside "data"
    if (data?.data?.token) return data.data.token;
    if (data?.data?.accessToken) return data.data.accessToken;
    if (data?.data?.jwt) return data.data.jwt;

    return "";
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);

      const endpoint = isAdmin ? "/admin/login" : "/api/auth/login";

      const data = await apiPost(endpoint, {
        username: form.username.trim(),
        password: form.password.trim(),
      });

      if (isAdmin) {
        // ✅ Admin token (same logic)
        const adminToken = extractToken(data);
        if (adminToken) localStorage.setItem("admin_token", adminToken);

        // keep clean for user token
        localStorage.removeItem("token");

        const adminObj = data.admin || data.user || {};
        login({ ...adminObj, role: "admin" });

        openModal(
          "success",
          "Admin Login Success",
          data?.message || "Logged in successfully ✅"
        );

        setTimeout(() => navigate("/admin", { replace: true }), 600);
      } else {
        // ✅ USER token save (fix)
        localStorage.removeItem("admin_token");

        const userToken = extractToken(data);
        if (userToken) localStorage.setItem("token", userToken);
        else {
          // If backend truly doesn't return token, keep clean
          localStorage.removeItem("token");
        }

        // ✅ keep same login call
        login(data.user);

        openModal(
          "success",
          "Login Success",
          data?.message || "Logged in successfully ✅"
        );

        setTimeout(() => navigate("/dashboard", { replace: true }), 600);
      }
    } catch (err) {
      openModal(
        "error",
        isAdmin ? "Admin Login Failed" : "Login Failed",
        err.message || "Invalid credentials"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lp">
      <style>{css}</style>
      <div className="bg" />

      {modal.open && (
        <div className="mb" onClick={closeModal}>
          <div className="mc" onClick={(e) => e.stopPropagation()}>
            <div className={`pill ${modal.type}`}>{modal.type.toUpperCase()}</div>
            <h3 className="mt">{modal.title}</h3>
            <p className="mm">{modal.message}</p>
            <button className="mBtn" onClick={closeModal}>
              OK
            </button>
            <div className="mHint">Press ESC to close</div>
          </div>
        </div>
      )}

      <div className="wrap">
        <div className="devline">
          <span className="codeIcon">{"</>"}</span>
          <span className="devText">Develop by Ajay Kedar</span>
        </div>

        <form className="card" onSubmit={handleSubmit}>
          <div className="head">
            <h2 className="title">{isAdmin ? "Admin Login" : "Login"}</h2>
            <p className="sub">
              {isAdmin ? "Admin access • Secure Sign-in" : "Welcome back • Secure Sign-in"}
            </p>
          </div>

          <div className="modeRow">
            <span className={`modeTag ${!isAdmin ? "on" : ""}`}>User</span>
            <button
              type="button"
              className={`toggle ${isAdmin ? "on" : ""}`}
              onClick={() => setIsAdmin((p) => !p)}
            >
              <span className="knob" />
            </button>
            <span className={`modeTag ${isAdmin ? "on" : ""}`}>Admin</span>
          </div>

          <div className="field">
            <label className="label">
              {isAdmin ? "Admin Email" : "Email / Mobile"} <span className="req">*</span>
            </label>
            <input
              className={`input ${errors.username ? "err" : ""}`}
              name="username"
              value={form.username}
              onChange={handleChange}
            />
            {errors.username && <div className="eTxt">{errors.username}</div>}
          </div>

          <div className="field">
            <label className="label">
              Password <span className="req">*</span>
            </label>
            <input
              className={`input ${errors.password ? "err" : ""}`}
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
            />
            {errors.password && <div className="eTxt">{errors.password}</div>}
          </div>

          <button type="submit" className="submit" disabled={loading}>
            {loading ? "Logging in..." : isAdmin ? "Login as Admin" : "Login"}
          </button>

          <div className="links">
            {!isAdmin ? (
              <>
                <Link className="link" to="/register">
                  Register
                </Link>
                <span className="dot">•</span>
                <Link className="link" to="/forgot">
                  Forgot Password?
                </Link>
              </>
            ) : (
              <span className="dot">Admin mode enabled</span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

/* ✅ FULL CSS (same as your file) */
const css = `
  :root{
    --txt:#0b1220;
    --muted:rgba(11,18,32,.65);
    --card:rgba(255,255,255,.90);
    --shadow: 0 26px 80px rgba(0,0,0,.18);
  }

  .lp{
    min-height:100vh;
    width:100%;
    position:relative;
    overflow-x:hidden;
    overflow-y:auto;
    display:flex;
    justify-content:center;
    align-items:center;
    padding:20px;
    box-sizing:border-box;
  }

  .bg{
    position:fixed;
    inset:0;
    background:
      radial-gradient(900px 520px at 12% 12%, rgba(255, 0, 150, .26), transparent 60%),
      radial-gradient(900px 520px at 88% 16%, rgba(0, 200, 255, .22), transparent 58%),
      radial-gradient(1000px 650px at 50% 92%, rgba(0, 255, 150, .18), transparent 60%),
      linear-gradient(135deg, #fffbeb 0%, #eff6ff 34%, #ecfeff 67%, #f0fdf4 100%);
    z-index:0;
    pointer-events:none;
  }

  .wrap{ width:100%; max-width:520px; z-index:1; }

  .devline{
    width:100%;
    display:flex;
    align-items:center;
    justify-content:center;
    gap:10px;
    margin: 0 0 12px;
    padding: 10px 12px;
    border-radius: 16px;
    background: rgba(255,255,255,.55);
    border: 1px solid rgba(255,255,255,.55);
    backdrop-filter: blur(14px);
    box-shadow: 0 14px 40px rgba(0,0,0,.10);
    user-select:none;
  }
  .codeIcon{ font-weight: 1000; color:#ff2d55; font-size: 16px; letter-spacing: .2px; }
  .devText{ font-weight: 980; color: rgba(11,18,32,.88); font-size: 13px; letter-spacing: .3px; }

  .card{
    width:100%;
    background:rgba(255,255,255,.90);
    border:1px solid rgba(255,255,255,.55);
    border-radius:22px;
    padding:26px;
    box-shadow: 0 26px 80px rgba(0,0,0,.18);
    backdrop-filter: blur(14px);
    box-sizing:border-box;
  }

  .head{ text-align:center; margin-bottom:14px; }
  .title{ margin:0; font-weight:950; color:var(--txt); font-size: clamp(22px, 3.2vw, 30px); }
  .sub{ margin:8px 0 0; color:var(--muted); font-weight:700; font-size: clamp(12px, 1.8vw, 14px); }

  .modeRow{
    margin: 14px auto 4px;
    width: fit-content;
    display:flex;
    align-items:center;
    justify-content:center;
    gap:10px;
    padding: 8px 10px;
    border-radius: 999px;
    background: rgba(255,255,255,.65);
    border: 1px solid rgba(11,18,32,.08);
    backdrop-filter: blur(10px);
  }
  .modeTag{
    font-size: 12px;
    font-weight: 950;
    color: rgba(11,18,32,.55);
    letter-spacing:.2px;
  }
  .modeTag.on{ color: rgba(11,18,32,.88); }

  .toggle{
    width: 46px;
    height: 26px;
    border-radius: 999px;
    border: 1px solid rgba(11,18,32,.14);
    background: rgba(11,18,32,.10);
    position: relative;
    cursor: pointer;
    padding: 0;
    outline: none;
    transition: background .18s ease, border-color .18s ease;
  }
  .toggle.on{
    background: rgba(34,197,94,.22);
    border-color: rgba(34,197,94,.35);
  }
  .knob{
    position:absolute;
    top: 3px;
    left: 3px;
    width: 20px;
    height: 20px;
    border-radius: 999px;
    background: #fff;
    box-shadow: 0 10px 24px rgba(0,0,0,.18);
    transition: transform .18s ease;
  }
  .toggle.on .knob{ transform: translateX(20px); }

  .field{ display:flex; flex-direction:column; margin-top:12px; }
  .label{ font-size:12px; font-weight:900; color: rgba(11,18,32,.85); margin-bottom:6px; }
  .req{ color:#ff2d55; }

  .input{
    width:100%;
    padding:12px;
    border-radius:14px;
    border:1px solid rgba(11,18,32,.10);
    font-size: clamp(13px, 1.9vw, 14px);
    background: rgba(255,255,255,.92);
    outline:none;
    box-sizing:border-box;
    transition: box-shadow .15s ease, border-color .15s ease, transform .12s ease;
  }
  .input:focus{
    border-color: rgba(124,58,237,.35);
    box-shadow: 0 0 0 5px rgba(124,58,237,.12);
    transform: translateY(-1px);
  }
  .input.err{
    border-color: rgba(255,45,85,.55);
    box-shadow: 0 0 0 5px rgba(255,45,85,.10);
  }

  .eTxt{ margin-top:6px; font-size:12px; font-weight:800; color:#ff2d55; }

  .submit{
    margin-top:18px;
    width:100%;
    padding:14px;
    border:none;
    border-radius:16px;
    font-weight:980;
    cursor:pointer;
    background:linear-gradient(90deg,#fde047,#fb7185,#60a5fa,#34d399);
    box-shadow: 0 18px 40px rgba(0,0,0,.14);
    color:#081018;
    font-size: clamp(14px, 2.2vw, 16px);
  }
  .submit:disabled{ opacity:.75; cursor:not-allowed; }

  .links{
    margin-top:14px;
    display:flex;
    justify-content:center;
    align-items:center;
    flex-wrap:wrap;
    gap:10px;
    color: var(--muted);
    font-weight:850;
    font-size: clamp(12px, 1.8vw, 14px);
  }
  .link{
    color:#7c3aed;
    font-weight:980;
    cursor:pointer;
    text-decoration:underline;
  }
  .dot{ opacity:.6; }

  .mb{
    position:fixed;
    inset:0;
    display:flex;
    align-items:center;
    justify-content:center;
    background:rgba(0,0,0,.42);
    z-index:9999;
    padding:16px;
    box-sizing:border-box;
  }
  .mc{
    width:100%;
    max-width:460px;
    background: rgba(255,255,255,.92);
    border: 1px solid rgba(255,255,255,.60);
    border-radius:24px;
    padding:18px;
    text-align:center;
    box-shadow: 0 35px 95px rgba(0,0,0,.28);
    backdrop-filter: blur(14px);
  }
  .pill{
    display:inline-block;
    padding:6px 12px;
    border-radius:999px;
    font-weight:980;
    font-size:12px;
    border: 1px solid rgba(0,0,0,.08);
    margin-bottom:10px;
    background: rgba(124,58,237,.10);
    color:#4c1d95;
  }
  .pill.success{ background: rgba(34,197,94,.14); color:#0f5132; }
  .pill.error{ background: rgba(255,45,85,.12); color:#9f1239; }
  .pill.info{ background: rgba(124,58,237,.12); color:#4c1d95; }

  .mt{ margin:4px 0 6px; font-weight:980; color:var(--txt); font-size:18px; }
  .mm{ margin:0 0 14px; color:rgba(11,18,32,.78); font-weight:850; line-height:1.4; }

  .mBtn{
    width:100%;
    border:none;
    padding:12px 14px;
    border-radius:16px;
    background: linear-gradient(90deg, #111827 0%, #334155 100%);
    color:#fff;
    font-weight:980;
    cursor:pointer;
  }
  .mHint{
    margin-top:10px;
    font-size:11px;
    color: rgba(11,18,32,.55);
    font-weight:800;
  }

  @media (max-width: 640px){
    .lp{ padding:14px; }
    .card{ padding:16px; border-radius:18px; }
    .mc{ border-radius:20px; }
    .devline{ border-radius:14px; padding: 9px 10px; }
  }
`;
