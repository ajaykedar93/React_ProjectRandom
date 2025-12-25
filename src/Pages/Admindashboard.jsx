import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();

  // ✅ Get logged user from localStorage (your login stores auth_user)
  const authUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("auth_user") || "null");
    } catch {
      return null;
    }
  }, []);

  const adminName = "Ajay Kedar"; // ✅ fixed display name (as you asked)
  const adminEmail = authUser?.email_address || authUser?.email || "";

  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("Dashboard"); // tabs

  // Close menu on ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Optional: simple guard (if not admin, send back to login)
  useEffect(() => {
    // If you store role on admin login: authUser.role === "admin"
    // If you don't, you can just allow it for now.
    if (!authUser) {
      navigate("/login", { replace: true });
    }
  }, [authUser, navigate]);

  const tabs = [
    { key: "Dashboard", icon: "📊" },
    { key: "Users", icon: "👥" },
    { key: "Documents", icon: "📄" },
    { key: "Settings", icon: "⚙️" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("auth_user");
    navigate("/login", { replace: true });
  };

  return (
    <div className="ad">
      <style>{css}</style>

      {/* Top Navbar */}
      <header className="nav">
        <div className="navLeft">
          <div className="brandMark" aria-hidden="true">
            A
          </div>
          <div className="brandText">
            <div className="brandTitle">Admin Panel</div>
            <div className="brandSub">Dashboard</div>
          </div>
        </div>

        <div className="navRight">
          {/* Desktop Tabs */}
          <nav className="tabsDesktop" aria-label="Admin tabs desktop">
            {tabs.map((t) => (
              <button
                key={t.key}
                className={`tabBtn ${active === t.key ? "active" : ""}`}
                onClick={() => setActive(t.key)}
                type="button"
              >
                <span className="tabIco" aria-hidden="true">
                  {t.icon}
                </span>
                <span className="tabTxt">{t.key}</span>
              </button>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="actionsDesktop">
            <button className="ghostBtn" type="button" onClick={handleLogout}>
              Logout
            </button>
          </div>

          {/* Mobile hamburger (right corner) */}
          <button
            className={`burger ${menuOpen ? "open" : ""}`}
            type="button"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div className={`overlay ${menuOpen ? "show" : ""}`} onClick={() => setMenuOpen(false)}>
        <aside className={`drawer ${menuOpen ? "show" : ""}`} onClick={(e) => e.stopPropagation()}>
          <div className="drawerTop">
            <div className="drawerTitle">Menu</div>
            <button className="closeBtn" type="button" onClick={() => setMenuOpen(false)}>
              ✕
            </button>
          </div>

          <div className="drawerProfile">
            <div className="avatar" aria-hidden="true">
              AK
            </div>
            <div className="pinfo">
              <div className="role">Admin</div>
              <div className="pname">
                <span className="shineName">{adminName}</span>
              </div>
              {adminEmail ? <div className="pemail">{adminEmail}</div> : null}
            </div>
          </div>

          <div className="drawerTabs" aria-label="Admin tabs mobile">
            {tabs.map((t) => (
              <button
                key={t.key}
                className={`drawerTab ${active === t.key ? "active" : ""}`}
                onClick={() => {
                  setActive(t.key);
                  setMenuOpen(false);
                }}
                type="button"
              >
                <span className="dIco" aria-hidden="true">
                  {t.icon}
                </span>
                <span className="dTxt">{t.key}</span>
              </button>
            ))}
          </div>

          <div className="drawerBottom">
            <button className="primaryBtn" type="button" onClick={handleLogout}>
              Logout
            </button>

            <Link className="smallLink" to="/dashboard" onClick={() => setMenuOpen(false)}>
              Go to User Dashboard →
            </Link>

            <div className="hint">Press ESC to close</div>
          </div>
        </aside>
      </div>

      {/* Body */}
      <main className="main">
        {/* Hero card */}
        <section className="hero">
          <div className="heroLeft">
            <div className="badge">Admin</div>

            <h1 className="hTitle">
              Welcome, <span className="nameGlow">{adminName}</span>
            </h1>

            <p className="hDesc">
              Manage users, documents and settings from one place. Use the tabs to switch sections.
            </p>

            <div className="quickRow">
              <div className="qCard">
                <div className="qLabel">Active Tab</div>
                <div className="qValue">{active}</div>
              </div>
              <div className="qCard">
                <div className="qLabel">Role</div>
                <div className="qValue">Administrator</div>
              </div>
              <div className="qCard">
                <div className="qLabel">Status</div>
                <div className="qValue ok">Secure</div>
              </div>
            </div>
          </div>

          <div className="heroRight">
            <div className="glass">
              <div className="glassTop">
                <div className="dot red" />
                <div className="dot yellow" />
                <div className="dot green" />
                <div className="glassTitle">{active}</div>
              </div>

              <div className="glassBody">
                {active === "Dashboard" && (
                  <div className="panel">
                    <div className="panelTitle">Overview</div>
                    <div className="panelGrid">
                      <div className="tile">
                        <div className="tKpi">Users</div>
                        <div className="tNum">—</div>
                        <div className="tSub">Connect API to show count</div>
                      </div>
                      <div className="tile">
                        <div className="tKpi">Documents</div>
                        <div className="tNum">—</div>
                        <div className="tSub">Connect API to show count</div>
                      </div>
                      <div className="tile">
                        <div className="tKpi">Uploads</div>
                        <div className="tNum">—</div>
                        <div className="tSub">Connect API to show count</div>
                      </div>
                      <div className="tile">
                        <div className="tKpi">System</div>
                        <div className="tNum">OK</div>
                        <div className="tSub">Health check running</div>
                      </div>
                    </div>
                  </div>
                )}

                {active === "Users" && (
                  <div className="panel">
                    <div className="panelTitle">Users</div>
                    <div className="panelText">
                      This area can show user list, search and delete actions. (UI ready)
                    </div>
                    <div className="panelHint">Next: connect to /api/auth/users</div>
                  </div>
                )}

                {active === "Documents" && (
                  <div className="panel">
                    <div className="panelTitle">Documents</div>
                    <div className="panelText">
                      This area can show documents list, status and actions. (UI ready)
                    </div>
                    <div className="panelHint">Next: connect to /api/documents</div>
                  </div>
                )}

                {active === "Settings" && (
                  <div className="panel">
                    <div className="panelTitle">Settings</div>
                    <div className="panelText">
                      Manage admin preferences and security settings here. (UI ready)
                    </div>
                    <div className="panelHint">Next: add theme / password reset</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Footer strip */}
        <footer className="foot">
          <div className="footLeft">
            <span className="footTag">Admin</span>
            <span className="footName">{adminName}</span>
          </div>
          <div className="footRight">© {new Date().getFullYear()} • Infinity Techno Solution</div>
        </footer>
      </main>
    </div>
  );
}

const css = `
  :root{
    --bg1:#fff7ed;
    --bg2:#eff6ff;
    --bg3:#ecfeff;
    --bg4:#f0fdf4;
    --ink:#0b1220;
    --muted: rgba(11,18,32,.65);
    --card: rgba(255,255,255,.84);
    --bd: rgba(11,18,32,.10);
    --shadow: 0 30px 90px rgba(0,0,0,.16);
  }

  *{ box-sizing:border-box; }
  body{ margin:0; }

  .ad{
    min-height:100vh;
    background:
      radial-gradient(900px 540px at 10% 10%, rgba(255, 0, 150, .22), transparent 60%),
      radial-gradient(900px 540px at 90% 18%, rgba(0, 200, 255, .20), transparent 58%),
      radial-gradient(1000px 650px at 50% 95%, rgba(0, 255, 150, .16), transparent 60%),
      linear-gradient(135deg, var(--bg1) 0%, var(--bg2) 34%, var(--bg3) 67%, var(--bg4) 100%);
    color:var(--ink);
  }

  /* Navbar */
  .nav{
    position:sticky;
    top:0;
    z-index:50;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:12px;
    padding: 14px 16px;
    border-bottom: 1px solid rgba(255,255,255,.55);
    background: rgba(255,255,255,.58);
    backdrop-filter: blur(14px);
  }

  .navLeft{
    display:flex; align-items:center; gap:12px;
    min-width: 220px;
  }

  .brandMark{
    width:40px; height:40px; border-radius:14px;
    display:flex; align-items:center; justify-content:center;
    font-weight:1000;
    background: rgba(255,255,255,.70);
    border: 1px solid rgba(11,18,32,.10);
    box-shadow: 0 18px 40px rgba(0,0,0,.10);
  }
  .brandTitle{ font-weight:1000; letter-spacing:.2px; }
  .brandSub{ font-weight:800; font-size:12px; color: var(--muted); margin-top:2px; }

  .navRight{
    display:flex; align-items:center; justify-content:flex-end; gap:10px;
    width:100%;
  }

  .tabsDesktop{
    display:flex; gap:8px;
    align-items:center;
  }

  .tabBtn{
    border:none;
    padding: 10px 12px;
    border-radius: 14px;
    background: rgba(255,255,255,.62);
    border: 1px solid rgba(11,18,32,.08);
    font-weight: 950;
    color: rgba(11,18,32,.84);
    cursor:pointer;
    display:flex; align-items:center; gap:8px;
    transition: transform .12s ease, box-shadow .12s ease;
  }
  .tabBtn:hover{ transform: translateY(-1px); box-shadow: 0 18px 40px rgba(0,0,0,.10); }
  .tabBtn.active{
    background: rgba(34,197,94,.15);
    border-color: rgba(34,197,94,.30);
  }
  .tabIco{ font-size: 14px; }
  .tabTxt{ font-size: 13px; }

  .actionsDesktop{ display:flex; align-items:center; gap:8px; }
  .ghostBtn{
    border:1px solid rgba(11,18,32,.12);
    background: rgba(255,255,255,.60);
    padding: 10px 12px;
    border-radius: 14px;
    font-weight: 950;
    cursor:pointer;
  }

  /* Mobile burger */
  .burger{
    width: 44px;
    height: 44px;
    border-radius: 16px;
    border: 1px solid rgba(11,18,32,.10);
    background: rgba(255,255,255,.70);
    display:none;
    align-items:center;
    justify-content:center;
    gap:4px;
    flex-direction:column;
    cursor:pointer;
  }
  .burger span{
    display:block;
    width:18px;
    height:2px;
    border-radius:99px;
    background: rgba(11,18,32,.85);
  }

  /* Drawer */
  .overlay{
    position:fixed;
    inset:0;
    background: rgba(0,0,0,.35);
    z-index:60;
    opacity:0;
    pointer-events:none;
    transition: opacity .18s ease;
  }
  .overlay.show{
    opacity:1;
    pointer-events:auto;
  }

  .drawer{
    position:absolute;
    top:0;
    right:0;
    height:100%;
    width: min(360px, 88vw);
    background: rgba(255,255,255,.92);
    border-left: 1px solid rgba(255,255,255,.70);
    backdrop-filter: blur(14px);
    transform: translateX(110%);
    transition: transform .18s ease;
    padding: 14px;
    display:flex;
    flex-direction:column;
    gap:12px;
  }
  .drawer.show{ transform: translateX(0); }

  .drawerTop{
    display:flex; align-items:center; justify-content:space-between;
  }
  .drawerTitle{ font-weight:1000; }
  .closeBtn{
    border:none;
    background: rgba(11,18,32,.06);
    border: 1px solid rgba(11,18,32,.10);
    width: 40px;
    height: 40px;
    border-radius: 14px;
    cursor:pointer;
    font-weight: 1000;
  }

  .drawerProfile{
    display:flex; gap:12px; align-items:center;
    padding: 12px;
    border-radius: 18px;
    background: rgba(255,255,255,.70);
    border: 1px solid rgba(11,18,32,.08);
  }
  .avatar{
    width: 46px; height: 46px; border-radius: 16px;
    display:flex; align-items:center; justify-content:center;
    font-weight: 1000;
    background: rgba(34,197,94,.18);
    border: 1px solid rgba(34,197,94,.25);
  }
  .role{
    font-size: 12px;
    font-weight: 1000;
    color: rgba(11,18,32,.70);
    margin-bottom: 2px;
  }
  .pname{
    font-size: 16px;
    font-weight: 1000;
    line-height: 1.1;
  }
  .shineName{
    font-weight: 1000;
    background: linear-gradient(90deg, rgba(34,197,94,.95), rgba(59,130,246,.95), rgba(236,72,153,.95));
    -webkit-background-clip:text;
    background-clip:text;
    color: transparent;
    text-shadow: 0 10px 30px rgba(0,0,0,.10);
  }
  .pemail{
    font-size: 12px;
    font-weight: 850;
    color: rgba(11,18,32,.62);
    margin-top: 3px;
    word-break: break-all;
  }

  .drawerTabs{
    display:flex;
    flex-direction:column;
    gap:8px;
  }
  .drawerTab{
    width:100%;
    display:flex;
    align-items:center;
    gap:10px;
    border:none;
    padding: 12px 12px;
    border-radius: 16px;
    background: rgba(255,255,255,.72);
    border: 1px solid rgba(11,18,32,.08);
    cursor:pointer;
    font-weight: 950;
    color: rgba(11,18,32,.85);
  }
  .drawerTab.active{
    background: rgba(34,197,94,.15);
    border-color: rgba(34,197,94,.30);
  }
  .dIco{ font-size: 16px; }
  .dTxt{ font-size: 14px; }

  .drawerBottom{
    margin-top:auto;
    display:flex;
    flex-direction:column;
    gap:10px;
  }
  .primaryBtn{
    border:none;
    padding: 12px 14px;
    border-radius: 16px;
    font-weight: 1000;
    cursor:pointer;
    color:#0b1220;
    background: linear-gradient(90deg, rgba(34,197,94,.85), rgba(59,130,246,.75), rgba(236,72,153,.65));
    box-shadow: 0 18px 50px rgba(0,0,0,.14);
  }
  .smallLink{
    font-weight: 900;
    color: rgba(11,18,32,.75);
    text-decoration: underline;
    text-align:center;
  }
  .hint{
    text-align:center;
    font-size: 11px;
    color: rgba(11,18,32,.55);
    font-weight: 850;
  }

  /* Main layout */
  .main{ max-width: 1120px; margin: 0 auto; padding: 18px 16px 24px; }

  .hero{
    display:grid;
    grid-template-columns: 1.05fr .95fr;
    gap: 14px;
    align-items: stretch;
    margin-top: 8px;
  }

  .heroLeft{
    background: rgba(255,255,255,.72);
    border: 1px solid rgba(255,255,255,.62);
    border-radius: 24px;
    padding: 18px;
    box-shadow: var(--shadow);
    backdrop-filter: blur(14px);
    overflow:hidden;
  }

  .badge{
    display:inline-block;
    padding: 6px 10px;
    border-radius: 999px;
    font-weight: 1000;
    font-size: 12px;
    background: rgba(34,197,94,.14);
    border: 1px solid rgba(34,197,94,.25);
    color: rgba(11,18,32,.85);
  }

  .hTitle{
    margin: 10px 0 6px;
    font-size: clamp(22px, 3.2vw, 34px);
    font-weight: 1000;
  }
  .nameGlow{
    background: linear-gradient(90deg, rgba(34,197,94,1), rgba(59,130,246,1), rgba(236,72,153,1));
    -webkit-background-clip:text;
    background-clip:text;
    color: transparent;
  }
  .hDesc{
    margin: 0 0 14px;
    color: var(--muted);
    font-weight: 850;
    line-height: 1.45;
    font-size: 14px;
  }

  .quickRow{
    display:grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-top: 10px;
  }
  .qCard{
    background: rgba(255,255,255,.72);
    border: 1px solid rgba(11,18,32,.08);
    border-radius: 18px;
    padding: 12px;
  }
  .qLabel{ font-size: 12px; font-weight: 950; color: rgba(11,18,32,.62); }
  .qValue{ margin-top: 6px; font-size: 14px; font-weight: 1000; }
  .qValue.ok{ color: rgba(34,197,94,1); }

  .heroRight{
    display:flex;
  }

  .glass{
    width:100%;
    background: rgba(255,255,255,.70);
    border: 1px solid rgba(255,255,255,.62);
    border-radius: 24px;
    box-shadow: var(--shadow);
    backdrop-filter: blur(14px);
    overflow:hidden;
  }
  .glassTop{
    display:flex;
    align-items:center;
    gap:8px;
    padding: 12px;
    border-bottom: 1px solid rgba(11,18,32,.08);
    background: rgba(255,255,255,.70);
  }
  .dot{ width:10px; height:10px; border-radius: 999px; }
  .dot.red{ background: rgba(239,68,68,.9); }
  .dot.yellow{ background: rgba(245,158,11,.9); }
  .dot.green{ background: rgba(34,197,94,.9); }
  .glassTitle{
    margin-left: 6px;
    font-weight: 1000;
    color: rgba(11,18,32,.85);
    font-size: 13px;
  }
  .glassBody{ padding: 14px; }

  .panelTitle{
    font-weight: 1000;
    font-size: 16px;
    margin-bottom: 8px;
  }
  .panelText{
    color: rgba(11,18,32,.70);
    font-weight: 850;
    line-height: 1.45;
    font-size: 14px;
  }
  .panelHint{
    margin-top: 10px;
    font-size: 12px;
    font-weight: 900;
    color: rgba(11,18,32,.55);
  }

  .panelGrid{
    margin-top: 10px;
    display:grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  .tile{
    background: rgba(255,255,255,.78);
    border: 1px solid rgba(11,18,32,.08);
    border-radius: 18px;
    padding: 12px;
  }
  .tKpi{ font-size: 12px; font-weight: 950; color: rgba(11,18,32,.62); }
  .tNum{ margin-top: 6px; font-size: 18px; font-weight: 1000; }
  .tSub{ margin-top: 4px; font-size: 12px; font-weight: 850; color: rgba(11,18,32,.55); }

  .foot{
    margin-top: 14px;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:12px;
    padding: 12px 14px;
    border-radius: 18px;
    background: rgba(255,255,255,.58);
    border: 1px solid rgba(255,255,255,.60);
    backdrop-filter: blur(14px);
  }
  .footLeft{ display:flex; align-items:center; gap:10px; }
  .footTag{
    font-size: 12px;
    font-weight: 1000;
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(34,197,94,.14);
    border: 1px solid rgba(34,197,94,.25);
  }
  .footName{ font-weight: 1000; }
  .footRight{ font-size: 12px; font-weight: 900; color: rgba(11,18,32,.60); }

  /* Responsive rules */
  @media (max-width: 980px){
    .tabsDesktop{ display:none; }
    .actionsDesktop{ display:none; }
    .burger{ display:flex; }
    .hero{ grid-template-columns: 1fr; }
    .quickRow{ grid-template-columns: 1fr; }
    .panelGrid{ grid-template-columns: 1fr; }
  }
`;
