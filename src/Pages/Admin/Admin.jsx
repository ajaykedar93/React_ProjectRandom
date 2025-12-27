import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext.jsx";

/**
 * SIMPLE ADMIN PANEL
 * - Shows ONLY 2 allowed admins (name + email)
 * - Shows current logged-in admin (name + email)
 * - Update password for each admin
 *
 * Requires:
 *  GET  /admin        (Bearer admin_token)
 *  PUT  /admin/:id    (Bearer admin_token)  body: { password: "newPass" }
 *
 * Token source:
 *  localStorage.getItem("admin_token")  (same as your old Admin.jsx expects) :contentReference[oaicite:2]{index=2}
 */

const API_BASE = "https://express-projectrandom.onrender.com/admin";

const ALLOWED_EMAILS = new Set([
  "ajaykedar3790@gmail.com",
  "ajaykedar9657@gmail.com",
]);

export default function Admin() {
  const { user } = useAuth(); // from login: we saved admin with role=admin
  const token = localStorage.getItem("admin_token") || "";

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  // password input for each admin_id
  const [pw, setPw] = useState({}); // { [admin_id]: "newpass" }

  const [toast, setToast] = useState(null); // {type,msg}

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 2200);
  };

  const headers = useMemo(() => {
    const h = { "Content-Type": "application/json" };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  const fullName = (a) =>
    `${a?.first_name || ""} ${a?.last_name || ""}`.trim() || "Admin";

  const loggedEmail = String(user?.email_username || user?.email || "").toLowerCase();
  const loggedName = fullName(user);

  const allowedAdmins = useMemo(() => {
    return (Array.isArray(admins) ? admins : []).filter((a) =>
      ALLOWED_EMAILS.has(String(a?.email_username || "").toLowerCase())
    );
  }, [admins]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);

      if (!token) {
        setAdmins([]);
        showToast("err", "Admin token missing. Please login as Admin again.");
        return;
      }

      const res = await fetch(`${API_BASE}`, { headers });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        showToast("err", data?.message || "Failed to load admins");
        setAdmins([]);
        return;
      }

      setAdmins(Array.isArray(data) ? data : []);
    } catch {
      showToast("err", "Network error");
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updatePassword = async (adminId) => {
    const newPass = String(pw[adminId] || "").trim();
    if (!newPass) {
      showToast("err", "Enter new password");
      return;
    }

    setBusyId(adminId);
    try {
      const res = await fetch(`${API_BASE}/${adminId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ password: newPass }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        showToast("err", data?.message || "Password update failed");
        return;
      }

      showToast("ok", "Password updated");
      setPw((p) => ({ ...p, [adminId]: "" }));
    } catch {
      showToast("err", "Network error");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="ap">
      <style>{css}</style>

      {/* Top title only */}
      <div className="top">
        <div className="title">ADMIN PANEL</div>

        {/* Logged in admin (real-time) */}
        <div className="me">
          <div className="meLabel">Logged in:</div>
          <div className="meValue">
            <span className="meName">{loggedName}</span>
            <span className="meDot">•</span>
            <span className="meEmail">{loggedEmail || "—"}</span>
          </div>
        </div>

        <button className="refresh" type="button" onClick={fetchAdmins} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Full width list */}
      <div className="list">
        {loading ? (
          <div className="state">Loading admins...</div>
        ) : allowedAdmins.length === 0 ? (
          <div className="state">
            No allowed admins found. (Only 2 emails are allowed)
          </div>
        ) : (
          allowedAdmins.map((a) => {
            const id = a.admin_id;
            const email = String(a.email_username || "");
            const isLogged = email.toLowerCase() === loggedEmail;

            return (
              <div key={id} className={`row ${isLogged ? "active" : ""}`}>
                <div className="left">
                  <div className="nm">
                    {fullName(a)}
                    {isLogged ? <span className="badge">CURRENT</span> : null}
                  </div>
                  <div className="em">{email}</div>
                </div>

                <div className="right">
                  {/* User asked "show pass" — safest is: show password input for update (not existing password). */}
                  <input
                    className="pw"
                    type="password"
                    placeholder="New password"
                    value={pw[id] || ""}
                    onChange={(e) => setPw((p) => ({ ...p, [id]: e.target.value }))}
                  />
                  <button
                    className="btn"
                    type="button"
                    onClick={() => updatePassword(id)}
                    disabled={busyId === id}
                  >
                    {busyId === id ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {toast ? <div className={`toast ${toast.type}`}>{toast.msg}</div> : null}
    </div>
  );
}

const css = `
  *{ box-sizing:border-box; }
  html, body{ height:100%; }
  body{ margin:0; }

  /* FULL SIZE, NO EMPTY SPACE */
  .ap{
    min-height:100vh;
    width:100%;
    padding:0;               /* ✅ remove outer padding */
    margin:0;
    background:
      radial-gradient(900px 520px at 12% 12%, rgba(255, 0, 150, .16), transparent 60%),
      radial-gradient(900px 520px at 88% 16%, rgba(0, 200, 255, .14), transparent 58%),
      radial-gradient(1000px 650px at 50% 92%, rgba(0, 255, 150, .10), transparent 60%),
      linear-gradient(135deg, #fffbeb 0%, #eff6ff 34%, #ecfeff 67%, #f0fdf4 100%);
    display:flex;
    flex-direction:column;
  }

  /* TOP BAR - FULL WIDTH */
  .top{
    width:100%;
    padding:14px 12px;       /* inside padding ok */
    background: rgba(255,255,255,.78);
    border-bottom: 1px solid rgba(17,24,39,.10);
    backdrop-filter: blur(14px);
    display:flex;
    flex-direction:column;
    gap:10px;
  }

  .title{
    font-weight: 1000;
    letter-spacing: .6px;
    font-size: 18px;
    color:#0b1220;
  }

  .me{
    display:flex;
    gap:10px;
    flex-wrap:wrap;
    align-items:center;
  }
  .meLabel{
    font-weight:900;
    font-size:12px;
    color: rgba(11,18,32,.62);
  }
  .meValue{
    display:flex;
    gap:8px;
    flex-wrap:wrap;
    align-items:center;
    font-weight: 950;
    color:#0b1220;
  }
  .meName{ font-size:13px; }
  .meDot{ opacity:.5; }
  .meEmail{ font-size:13px; word-break: break-word; }

  .refresh{
    width:100%;
    border:none;
    border-radius: 14px;
    padding: 12px 12px;
    font-weight: 950;
    cursor:pointer;
    background: rgba(17,24,39,.08);
    color:#0b1220;
  }
  .refresh:disabled{ opacity:.7; cursor:not-allowed; }

  /* LIST FULL WIDTH */
  .list{
    width:100%;
    padding:12px;            /* inner padding only */
    display:flex;
    flex-direction:column;
    gap:12px;
    flex:1 1 auto;
  }

  .state{
    width:100%;
    padding:16px;
    border-radius: 16px;
    background: rgba(255,255,255,.75);
    border: 1px dashed rgba(17,24,39,.18);
    font-weight: 950;
    color: rgba(11,18,32,.68);
    text-align:center;
  }

  /* Each admin row - FULL WIDTH CARD */
  .row{
    width:100%;
    background: rgba(255,255,255,.84);
    border: 1px solid rgba(255,255,255,.65);
    border-radius: 18px;
    backdrop-filter: blur(14px);
    box-shadow: 0 18px 60px rgba(0,0,0,.08);
    padding: 14px;
    display:flex;
    flex-direction:column;   /* ✅ mobile first */
    gap: 12px;
  }
  .row.active{
    border-color: rgba(34,197,94,.35);
    box-shadow: 0 18px 60px rgba(34,197,94,.10);
  }

  .left{ min-width:0; }
  .nm{
    font-weight: 1000;
    color:#0b1220;
    display:flex;
    gap:10px;
    align-items:center;
    flex-wrap:wrap;
    font-size: 16px;
  }
  .badge{
    font-size: 11px;
    font-weight: 1000;
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(34,197,94,.14);
    border: 1px solid rgba(34,197,94,.22);
    color:#0f5132;
  }
  .em{
    margin-top: 6px;
    font-weight: 900;
    color: rgba(11,18,32,.65);
    word-break: break-word;
    font-size: 13px;
  }

  .right{
    display:flex;
    flex-direction:column;
    gap:10px;
    width:100%;
  }
  .pw{
    width:100%;
    padding: 12px 12px;
    border-radius: 14px;
    border: 1px solid rgba(17,24,39,.12);
    outline:none;
    font-weight: 900;
    background: rgba(255,255,255,.78);
  }
  .btn{
    width:100%;
    border:none;
    border-radius: 14px;
    padding: 12px 12px;
    font-weight: 1000;
    cursor:pointer;
    background: linear-gradient(90deg, #7c3aed 0%, #06b6d4 55%, #22c55e 100%);
    color:#fff;
  }
  .btn:disabled{ opacity:.75; cursor:not-allowed; }

  /* Desktop: keep full width, but row can become 2 columns */
  @media (min-width: 900px){
    .top{
      flex-direction:row;
      align-items:center;
      justify-content:space-between;
    }
    .refresh{ width: 180px; }
    .row{
      flex-direction:row;
      align-items:center;
      justify-content:space-between;
    }
    .right{
      width: 420px;
    }
  }

  .toast{
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    bottom: 16px;
    z-index: 9999;
    padding: 10px 12px;
    border-radius: 14px;
    font-weight: 950;
    border: 1px solid rgba(255,255,255,.60);
    backdrop-filter: blur(12px);
    box-shadow: 0 18px 60px rgba(0,0,0,.16);
    max-width: min(520px, 92vw);
    text-align:center;
  }
  .toast.ok{ background: rgba(34,197,94,.20); color:#0b1220; }
  .toast.err{ background: rgba(239,68,68,.18); color:#0b1220; }
`;
