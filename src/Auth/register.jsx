import React, { useMemo, useState } from "react";

export default function Register() {
  // ✅ Your working backend base URL
  const API_BASE = "https://express-projectrandom.onrender.com";

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    mobile_number: "",
    email_address: "",
    village_city: "",
    state: "",
    district: "",
    taluka: "",
    pincode: "",
    password: "",
    confirm_password: "",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [verifyToken, setVerifyToken] = useState("");

  const [loading, setLoading] = useState({ sendOtp: false, verifyOtp: false, register: false });

  const [errors, setErrors] = useState({});
  const [modal, setModal] = useState({
    open: false,
    type: "info", // success | error | info
    title: "",
    message: "",
  });

  const openModal = (type, title, message) => setModal({ open: true, type, title, message });
  const closeModal = () => setModal((p) => ({ ...p, open: false }));

  const normalizeEmail = (e) => String(e || "").trim().toLowerCase();
  const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e || "").trim());
  const isValidMobile = (m) => /^[0-9]{10}$/.test(String(m || "").trim());
  const isValidPincode = (p) => !p || /^[0-9]{6}$/.test(String(p || "").trim());

  const fields = useMemo(
    () => [
      { key: "first_name", label: "First Name", type: "text", required: true },
      { key: "last_name", label: "Last Name", type: "text", required: true },
      { key: "mobile_number", label: "Mobile Number", type: "tel", required: true, maxLength: 10 },
      { key: "email_address", label: "Email Address", type: "email", required: true },

      { key: "village_city", label: "Village / City (Optional)", type: "text", full: true },
      { key: "state", label: "State (Optional)", type: "text" },
      { key: "district", label: "District (Optional)", type: "text" },
      { key: "taluka", label: "Taluka (Optional)", type: "text" },
      { key: "pincode", label: "Pincode (Optional)", type: "text", maxLength: 6 },

      { key: "password", label: "Password", type: "password", required: true, full: true },
      { key: "confirm_password", label: "Confirm Password", type: "password", required: true, full: true },
    ],
    []
  );

  const setOneError = (key, msg) => setErrors((p) => ({ ...p, [key]: msg }));

  const handleChange = (e) => {
    const { name, value } = e.target;

    // numeric-only inputs
    if (name === "mobile_number") {
      const v = value.replace(/\D/g, "").slice(0, 10);
      setForm((p) => ({ ...p, mobile_number: v }));
      return;
    }
    if (name === "pincode") {
      const v = value.replace(/\D/g, "").slice(0, 6);
      setForm((p) => ({ ...p, pincode: v }));
      return;
    }
    if (name === "otp") {
      setOtp(value.replace(/\D/g, "").slice(0, 6));
      return;
    }

    // If email changes (allowed only before verification)
    if (name === "email_address" && !emailVerified) {
      setOtpSent(false);
      setOtp("");
      setVerifyToken("");
    }

    setForm((p) => ({ ...p, [name]: value }));
  };

  async function apiPost(path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    let data = null;
    try {
      data = JSON.parse(text);
    } catch {
      // not json
    }

    if (!res.ok) {
      throw new Error(data?.message || text || `Request failed (HTTP ${res.status})`);
    }
    return data || {};
  }

  const validate = () => {
    const err = {};

    if (!form.first_name.trim()) err.first_name = "First name required";
    if (!form.last_name.trim()) err.last_name = "Last name required";
    if (!isValidMobile(form.mobile_number)) err.mobile_number = "Mobile number must be 10 digits";

    const email = normalizeEmail(form.email_address);
    if (!isValidEmail(email)) err.email_address = "Invalid email address";

    if (!isValidPincode(form.pincode)) err.pincode = "Pincode must be 6 digits";

    if (!form.password) err.password = "Password required";
    if (String(form.password || "").length < 6) err.password = "Password must be at least 6 characters";
    if (!form.confirm_password) err.confirm_password = "Confirm password required";
    if (form.password !== form.confirm_password) err.confirm_password = "Password not match";

    if (!emailVerified || !verifyToken) err.email_verify = "Please verify your email OTP first";

    setErrors(err);

    if (err.email_verify) {
      openModal("error", "Email Not Verified", "Please verify OTP before Register.");
    }

    return Object.keys(err).length === 0;
  };

  // ✅ SEND OTP
  const sendOtp = async () => {
    setErrors({});

    const email = normalizeEmail(form.email_address);
    if (!isValidEmail(email)) {
      setOneError("email_address", "Enter valid email before OTP");
      openModal("error", "Invalid Email", "Enter valid email and click Send OTP.");
      return;
    }

    try {
      setLoading((p) => ({ ...p, sendOtp: true }));
      await apiPost("/api/auth/send-otp", { email_address: email });

      setOtpSent(true);
      setOtp("");
      setEmailVerified(false);
      setVerifyToken("");

      openModal("success", "OTP Sent", "OTP has been sent to your email. Please enter OTP and verify.");
    } catch (err) {
      openModal("error", "OTP Send Failed", err.message);
    } finally {
      setLoading((p) => ({ ...p, sendOtp: false }));
    }
  };

  // ✅ VERIFY OTP
  const verifyOtp = async () => {
    setErrors({});

    const email = normalizeEmail(form.email_address);
    if (!isValidEmail(email)) {
      setOneError("email_address", "Invalid email");
      openModal("error", "Invalid Email", "Please enter a valid email address.");
      return;
    }
    if (!/^[0-9]{6}$/.test(String(otp || ""))) {
      setOneError("email_verify", "OTP must be 6 digits");
      openModal("error", "Invalid OTP", "OTP must be 6 digits.");
      return;
    }

    try {
      setLoading((p) => ({ ...p, verifyOtp: true }));
      const data = await apiPost("/api/auth/verify-otp", { email_address: email, otp });

      setEmailVerified(true);
      setVerifyToken(data.verify_token || "");

      openModal("success", "Verified", "Email verified successfully ✅");
    } catch (err) {
      setEmailVerified(false);
      setVerifyToken("");
      openModal("error", "OTP Verification Failed", err.message);
    } finally {
      setLoading((p) => ({ ...p, verifyOtp: false }));
    }
  };

  // ✅ REGISTER
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      mobile_number: String(form.mobile_number).trim(),
      email_address: normalizeEmail(form.email_address),
      village_city: form.village_city?.trim() || null,
      state: form.state?.trim() || null,
      district: form.district?.trim() || null,
      taluka: form.taluka?.trim() || null,
      pincode: form.pincode?.trim() || null,
      password: form.password,
      verify_token: verifyToken,
    };

    try {
      setLoading((p) => ({ ...p, register: true }));
      const data = await apiPost("/api/auth/register", payload);

      openModal("success", "Registered", data?.message || "Account created successfully ✅");

      setTimeout(() => {
        window.location.href = "/login";
      }, 900);
    } catch (err) {
      openModal("error", "Register Failed", err.message);
    } finally {
      setLoading((p) => ({ ...p, register: false }));
    }
  };

  const emailLocked = emailVerified; // ✅ after verify, lock email

  return (
    <div className="rp">
      <style>{css}</style>
      <div className="bg" />

      {/* ✅ Center Modal (all alerts) */}
      {modal.open ? (
        <div className="mb" onClick={closeModal}>
          <div className="mc" onClick={(e) => e.stopPropagation()}>
            <div className={`pill ${modal.type}`}>{modal.type.toUpperCase()}</div>
            <h3 className="mt">{modal.title}</h3>
            <p className="mm">{modal.message}</p>
            <button className="mBtn" type="button" onClick={closeModal}>
              OK
            </button>
          </div>
        </div>
      ) : null}

      <form className="card" onSubmit={handleSubmit}>
        <div className="head">
          <h2 className="title">Register</h2>
          <p className="sub">Bright • Secure • OTP Verified</p>
        </div>

        <div className="grid">
          {fields.map((f) => {
            const isEmail = f.key === "email_address";
            const isMobile = f.key === "mobile_number";
            const isPin = f.key === "pincode";

            return (
              <div key={f.key} className={`field ${f.full ? "full" : ""}`}>
                <label className="label">
                  {f.label} {f.required ? <span className="req">*</span> : null}
                </label>

                <input
                  className={`input ${errors[f.key] ? "err" : ""} ${isEmail && emailLocked ? "locked" : ""}`}
                  name={f.key}
                  type={f.type || "text"}
                  placeholder={f.label.replace(" (Optional)", "")}
                  value={form[f.key]}
                  onChange={handleChange}
                  maxLength={f.maxLength}
                  inputMode={isMobile || isPin ? "numeric" : undefined}
                  readOnly={isEmail && emailLocked}
                  title={isEmail && emailLocked ? "Email locked after verification" : undefined}
                  autoComplete={
                    f.key === "email_address"
                      ? "email"
                      : f.key === "mobile_number"
                      ? "tel"
                      : f.key === "password" || f.key === "confirm_password"
                      ? "new-password"
                      : "off"
                  }
                />

                {errors[f.key] ? <div className="eTxt">{errors[f.key]}</div> : null}

                {/* ✅ Send OTP button below email (only before verified) */}
                {isEmail ? (
                  <div className="emailActions">
                    {!emailVerified ? (
                      <button
                        type="button"
                        className="otpBtn"
                        onClick={sendOtp}
                        disabled={loading.sendOtp}
                      >
                        {loading.sendOtp ? "Sending OTP..." : "Send Email OTP"}
                      </button>
                    ) : (
                      <div className="okBadge">✅ Email Verified (Locked)</div>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* ✅ OTP input appears only after Send OTP */}
        {!emailVerified && otpSent ? (
          <div className="otpBox">
            <div className="otpTop">
              <div className="otpTitle">Verify OTP</div>
              <div className="otpHint">Check your email inbox/spam</div>
            </div>

            <div className="otpRow">
              <input
                className={`input ${errors.email_verify ? "err" : ""}`}
                name="otp"
                placeholder="Enter 6 digit OTP"
                value={otp}
                onChange={handleChange}
                inputMode="numeric"
                maxLength={6}
              />

              <button type="button" className="otpBtn" onClick={verifyOtp} disabled={loading.verifyOtp}>
                {loading.verifyOtp ? "Verifying..." : "Verify OTP"}
              </button>
            </div>

            {errors.email_verify ? <div className="eTxt center">{errors.email_verify}</div> : null}

            <button type="button" className="linkBtn" onClick={sendOtp} disabled={loading.sendOtp}>
              {loading.sendOtp ? "Resending..." : "Resend OTP"}
            </button>
          </div>
        ) : null}

        <button type="submit" className="submit" disabled={loading.register}>
          {loading.register ? "Registering..." : "Register"}
        </button>

        <p className="foot">
          Already have an account?{" "}
          <span className="link" onClick={() => (window.location.href = "/login")}>
            Login
          </span>
        </p>
      </form>
    </div>
  );
}

const css = `
  :root{
    --txt:#0b1220;
    --muted:rgba(11,18,32,.65);
    --card:rgba(255,255,255,.90);
    --line:rgba(255,255,255,.30);
    --shadow: 0 26px 80px rgba(0,0,0,.18);
  }

  .rp{
    min-height:100vh;
    width:100%;
    position:relative;
    overflow-x:hidden;
    overflow-y:auto;
    display:flex;
    justify-content:center;
    align-items:flex-start;
    padding:20px;
    box-sizing:border-box;
  }

  /* ✅ Bright colorful gradient background */
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

  .card{
    width:100%;
    max-width:820px;
    margin:22px 0;
    background:var(--card);
    border:1px solid rgba(255,255,255,.55);
    border-radius:22px;
    padding:26px;
    box-shadow:var(--shadow);
    backdrop-filter: blur(14px);
    z-index:1;
    box-sizing:border-box;
  }

  .head{ text-align:center; margin-bottom:12px; }
  .title{
    margin:0;
    font-weight:950;
    letter-spacing:.2px;
    color:var(--txt);
    font-size: clamp(22px, 3.2vw, 30px);
  }
  .sub{
    margin:8px 0 0;
    color:var(--muted);
    font-weight:700;
    font-size: clamp(12px, 1.8vw, 14px);
  }

  .grid{
    display:grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap:14px;
    margin-top:16px;
  }
  .field{ display:flex; flex-direction:column; }
  .field.full{ grid-column: 1 / -1; }

  .label{
    font-size:12px;
    font-weight:900;
    color:rgba(11,18,32,.85);
    margin-bottom:6px;
  }
  .req{ color:#ff2d55; }

  .input{
    width:100%;
    padding: 12px 12px;
    border-radius:14px;
    border: 1px solid rgba(11,18,32,.10);
    background: rgba(255,255,255,.92);
    color: var(--txt);
    outline: none;
    box-sizing:border-box;
    font-size: clamp(13px, 1.9vw, 14px);
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
  .input.locked{
    opacity: .92;
    cursor:not-allowed;
    background: rgba(255,255,255,.70);
  }

  .eTxt{
    margin-top:6px;
    font-size:12px;
    font-weight:800;
    color:#ff2d55;
  }
  .eTxt.center{ text-align:center; margin-top:10px; }

  .emailActions{ margin-top:10px; }

  .otpBtn{
    border:none;
    width:100%;
    padding: 12px 14px;
    border-radius: 14px;
    cursor:pointer;
    color:#fff;
    font-weight:950;
    font-size: clamp(13px, 2.0vw, 14px);
    background: linear-gradient(90deg, #7c3aed 0%, #06b6d4 55%, #22c55e 100%);
    box-shadow: 0 14px 30px rgba(124,58,237,.18);
  }
  .otpBtn:disabled{ opacity:.75; cursor:not-allowed; }

  .okBadge{
    margin-top:8px;
    padding:10px 12px;
    border-radius:14px;
    border:1px solid rgba(34,197,94,.28);
    background: rgba(34,197,94,.10);
    color:#0f5132;
    font-weight:950;
    text-align:center;
  }

  .otpBox{
    margin-top:16px;
    padding:14px;
    border-radius:18px;
    border:1px solid rgba(124,58,237,.18);
    background:
      radial-gradient(600px 180px at 10% 10%, rgba(124,58,237,.12), transparent 60%),
      radial-gradient(600px 180px at 90% 30%, rgba(6,182,212,.10), transparent 60%),
      rgba(255,255,255,.55);
  }

  .otpTop{ display:flex; justify-content:space-between; gap:10px; align-items:center; margin-bottom:10px; flex-wrap:wrap; }
  .otpTitle{ font-weight:950; color:var(--txt); }
  .otpHint{ color:var(--muted); font-weight:800; font-size:12px; }

  .otpRow{
    display:grid;
    grid-template-columns: 1fr auto;
    gap:10px;
    align-items:center;
  }

  .linkBtn{
    margin-top:10px;
    width:100%;
    border:none;
    background: transparent;
    color:#7c3aed;
    font-weight:950;
    cursor:pointer;
    text-decoration: underline;
  }
  .linkBtn:disabled{ opacity:.7; cursor:not-allowed; }

  .submit{
    margin-top:18px;
    width:100%;
    border:none;
    padding: 14px 14px;
    border-radius: 16px;
    cursor:pointer;
    color:#081018;
    font-weight:980;
    font-size: clamp(14px, 2.2vw, 16px);
    background: linear-gradient(90deg, #fde047 0%, #fb7185 40%, #60a5fa 70%, #34d399 100%);
    box-shadow: 0 18px 40px rgba(0,0,0,.14);
  }
  .submit:disabled{ opacity:.75; cursor:not-allowed; }

  .foot{
    margin-top:14px;
    text-align:center;
    color:var(--muted);
    font-weight:800;
    font-size: clamp(12px, 1.8vw, 14px);
  }
  .link{
    color:#7c3aed;
    font-weight:980;
    cursor:pointer;
    text-decoration: underline;
  }

  /* ✅ CENTER MODAL */
  .mb{
    position:fixed;
    inset:0;
    display:flex;
    align-items:center;
    justify-content:center;
    background: rgba(0,0,0,.38);
    z-index:9999;
    padding:16px;
    box-sizing:border-box;
  }
  .mc{
    width:100%;
    max-width:440px;
    background: rgba(255,255,255,.94);
    border: 1px solid rgba(255,255,255,.70);
    border-radius:22px;
    padding:18px;
    text-align:center;
    box-shadow: 0 35px 95px rgba(0,0,0,.25);
    backdrop-filter: blur(14px);
  }
  .pill{
    display:inline-block;
    padding:6px 12px;
    border-radius:999px;
    font-weight:980;
    font-size:12px;
    margin-bottom:10px;
    border: 1px solid rgba(0,0,0,.08);
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

  /* ✅ Mobile responsive */
  @media (max-width: 640px){
    .rp{ padding:14px; }
    .card{ padding:16px; border-radius:18px; }
    .grid{ grid-template-columns: 1fr; gap:12px; }
    .otpRow{ grid-template-columns: 1fr; }
  }

  @media (max-width: 360px){
    .card{ padding:14px; }
  }
`;
