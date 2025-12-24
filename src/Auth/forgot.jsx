import React, { useState } from "react";

export default function Forgot() {
  const API_BASE = "https://express-projectrandom.onrender.com";

  const [step, setStep] = useState("email"); // email -> otp -> reset
  const [emailLocked, setEmailLocked] = useState(false);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [verifyToken, setVerifyToken] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const [loading, setLoading] = useState({ send: false, verify: false, reset: false });
  const [errors, setErrors] = useState({});
  const [modal, setModal] = useState({ open: false, type: "info", title: "", message: "" });

  const openModal = (type, title, message) => setModal({ open: true, type, title, message });
  const closeModal = () => setModal((p) => ({ ...p, open: false }));

  const normalizeEmail = (e) => String(e || "").trim().toLowerCase();
  const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e || "").trim());

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
    } catch {}

    if (!res.ok) {
      throw new Error(data?.message || text || `Request failed (HTTP ${res.status})`);
    }
    return data || {};
  }

  // ✅ STEP 1: Check email exists in DB + send OTP
  const sendOtp = async () => {
    setErrors({});
    const em = normalizeEmail(email);

    if (!isValidEmail(em)) {
      setErrors({ email: "Enter valid email" });
      openModal("error", "Invalid Email", "Please enter a valid email address.");
      return;
    }

    try {
      setLoading((p) => ({ ...p, send: true }));

      // ✅ IMPORTANT:
      // Your current backend send-otp blocks emails that are already registered.
      // For Forgot Password, backend must allow sending OTP for existing email.
      // Use separate endpoint: /api/auth/forgot/send-otp (recommended)
      const data = await apiPost("/api/auth/forgot/send-otp", { email_address: em });

      setStep("otp");
      setEmailLocked(true);
      openModal("success", "OTP Sent", data?.message || "OTP sent to your email.");
    } catch (err) {
      openModal("error", "OTP Send Failed", err.message);
    } finally {
      setLoading((p) => ({ ...p, send: false }));
    }
  };

  // ✅ STEP 2: Verify OTP
  const verifyOtp = async () => {
    setErrors({});
    const em = normalizeEmail(email);

    if (!/^[0-9]{6}$/.test(String(otp || ""))) {
      setErrors({ otp: "OTP must be 6 digits" });
      openModal("error", "Invalid OTP", "Please enter 6 digit OTP.");
      return;
    }

    try {
      setLoading((p) => ({ ...p, verify: true }));

      // recommended endpoint for forgot flow:
      const data = await apiPost("/api/auth/forgot/verify-otp", { email_address: em, otp });

      setVerifyToken(data.verify_token || "");
      setStep("reset");
      openModal("success", "Verified", "OTP verified. Now reset your password.");
    } catch (err) {
      openModal("error", "OTP Verification Failed", err.message);
    } finally {
      setLoading((p) => ({ ...p, verify: false }));
    }
  };

  // ✅ STEP 3: Reset Password
  const resetPassword = async () => {
    setErrors({});
    if (!newPass || newPass.length < 6) {
      setErrors({ newPass: "Password must be at least 6 characters" });
      openModal("error", "Weak Password", "Password must be at least 6 characters.");
      return;
    }
    if (newPass !== confirmPass) {
      setErrors({ confirmPass: "Password not match" });
      openModal("error", "Not Match", "New password and confirm password not match.");
      return;
    }
    if (!verifyToken) {
      openModal("error", "Not Verified", "Please verify OTP first.");
      return;
    }

    try {
      setLoading((p) => ({ ...p, reset: true }));

      const data = await apiPost("/api/auth/forgot/reset-password", {
        email_address: normalizeEmail(email),
        new_password: newPass,
        verify_token: verifyToken,
      });

      openModal("success", "Password Updated", data?.message || "Password reset successfully ✅");

      setTimeout(() => {
        window.location.href = "/login";
      }, 900);
    } catch (err) {
      openModal("error", "Reset Failed", err.message);
    } finally {
      setLoading((p) => ({ ...p, reset: false }));
    }
  };

  return (
    <div className="fp">
      <style>{css}</style>
      <div className="bg" />

      {/* Center Modal */}
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

      <div className="card">
        <div className="head">
          <h2 className="title">Forgot Password</h2>
          <p className="sub">Verify Email • OTP • Reset Password</p>
        </div>

        {/* STEP 1: EMAIL */}
        {step === "email" ? (
          <>
            <div className="field">
              <label className="label">Email Address <span className="req">*</span></label>
              <input
                className={`input ${errors.email ? "err" : ""}`}
                placeholder="Enter registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              {errors.email ? <div className="eTxt">{errors.email}</div> : null}
            </div>

            <button className="btn" onClick={sendOtp} disabled={loading.send}>
              {loading.send ? "Sending OTP..." : "Send OTP"}
            </button>
          </>
        ) : null}

        {/* STEP 2: OTP */}
        {step === "otp" ? (
          <>
            <div className="field">
              <label className="label">Email Address</label>
              <input className="input locked" value={normalizeEmail(email)} readOnly />
            </div>

            <div className="otpBox">
              <div className="otpTop">
                <div className="otpTitle">Enter OTP</div>
                <div className="otpHint">Check inbox / spam</div>
              </div>

              <div className="otpRow">
                <input
                  className={`input ${errors.otp ? "err" : ""}`}
                  name="otp"
                  placeholder="6 digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  inputMode="numeric"
                  maxLength={6}
                />
                <button className="btn2" type="button" onClick={verifyOtp} disabled={loading.verify}>
                  {loading.verify ? "Verifying..." : "Verify OTP"}
                </button>
              </div>

              {errors.otp ? <div className="eTxt center">{errors.otp}</div> : null}

              <button className="linkBtn" type="button" onClick={sendOtp} disabled={loading.send}>
                {loading.send ? "Resending..." : "Resend OTP"}
              </button>
            </div>
          </>
        ) : null}

        {/* STEP 3: RESET */}
        {step === "reset" ? (
          <>
            <div className="field">
              <label className="label">Email Address</label>
              <input className="input locked" value={normalizeEmail(email)} readOnly />
            </div>

            <div className="field">
              <label className="label">New Password <span className="req">*</span></label>
              <input
                className={`input ${errors.newPass ? "err" : ""}`}
                type="password"
                placeholder="Enter new password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                autoComplete="new-password"
              />
              {errors.newPass ? <div className="eTxt">{errors.newPass}</div> : null}
            </div>

            <div className="field">
              <label className="label">Confirm Password <span className="req">*</span></label>
              <input
                className={`input ${errors.confirmPass ? "err" : ""}`}
                type="password"
                placeholder="Confirm new password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                autoComplete="new-password"
              />
              {errors.confirmPass ? <div className="eTxt">{errors.confirmPass}</div> : null}
            </div>

            <button className="btn" onClick={resetPassword} disabled={loading.reset}>
              {loading.reset ? "Updating..." : "Update Password"}
            </button>
          </>
        ) : null}

        <div className="links">
          <span className="link" onClick={() => (window.location.href = "/login")}>
            Back to Login
          </span>
          <span className="dot">•</span>
          <span className="link" onClick={() => (window.location.href = "/register")}>
            Register
          </span>
        </div>

        {/* small note */}
        {!emailLocked ? null : <div className="note">Email is locked after OTP step ✅</div>}
      </div>
    </div>
  );
}

const css = `
  :root{
    --txt:#0b1220;
    --muted:rgba(11,18,32,.65);
    --card:rgba(255,255,255,.90);
    --shadow: 0 26px 80px rgba(0,0,0,.18);
  }

  .fp{
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

  .card{
    width:100%;
    max-width:520px;
    background:var(--card);
    border:1px solid rgba(255,255,255,.55);
    border-radius:22px;
    padding:26px;
    box-shadow:var(--shadow);
    backdrop-filter: blur(14px);
    z-index:1;
    box-sizing:border-box;
  }

  .head{ text-align:center; margin-bottom:14px; }
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

  .field{ display:flex; flex-direction:column; margin-top:12px; }
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

  .btn{
    margin-top:16px;
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
  .btn:disabled{ opacity:.75; cursor:not-allowed; }

  .otpBox{
    margin-top:14px;
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

  .btn2{
    border:none;
    padding: 12px 14px;
    border-radius: 14px;
    cursor:pointer;
    color:#fff;
    font-weight:950;
    font-size: clamp(13px, 2.0vw, 14px);
    background: linear-gradient(90deg, #7c3aed 0%, #06b6d4 55%, #22c55e 100%);
    box-shadow: 0 14px 30px rgba(124,58,237,.18);
    white-space:nowrap;
  }
  .btn2:disabled{ opacity:.75; cursor:not-allowed; }

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

  .links{
    margin-top:14px;
    display:flex;
    justify-content:center;
    align-items:center;
    flex-wrap:wrap;
    gap:10px;
    color:var(--muted);
    font-weight:850;
    font-size: clamp(12px, 1.8vw, 14px);
  }
  .link{
    color:#7c3aed;
    font-weight:980;
    cursor:pointer;
    text-decoration: underline;
  }
  .dot{ opacity:.6; }

  .note{
    margin-top:10px;
    text-align:center;
    font-weight:850;
    font-size:12px;
    color:rgba(11,18,32,.65);
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

  @media (max-width: 640px){
    .fp{ padding:14px; }
    .card{ padding:16px; border-radius:18px; }
    .otpRow{ grid-template-columns: 1fr; }
    .btn2{ width:100%; }
  }
`;
