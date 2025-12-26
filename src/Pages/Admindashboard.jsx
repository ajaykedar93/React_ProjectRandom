import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const authUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("auth_user") || "null");
    } catch {
      return null;
    }
  }, []);

  const adminName = "Ajay Kedar";
  const adminEmail = authUser?.email_address || authUser?.email || "";

  const [menuOpen, setMenuOpen] = useState(false);

  // ✅ Tabs only inside mobile menu (drawer)
  const tabs = [
    { key: "Dashboard", icon: "📊", path: "/admin/dashboard" },
    { key: "Users", icon: "👥", path: "/admin/users" },
    { key: "Settings", icon: "⚙️", path: "/admin/settings" },
  ];

  const activeKey = useMemo(() => {
    const hit = tabs.find((t) => location.pathname.startsWith(t.path));
    return hit?.key || "Dashboard";
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!authUser) navigate("/login", { replace: true });
  }, [authUser, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("auth_user");
    navigate("/login", { replace: true });
  };

  const goTab = (t) => {
    setMenuOpen(false);
    navigate(t.path);
  };

  return (
    <div className="ad">
      <style>{css}</style>

      {/* ✅ Safe-area top spacer (notch + small space) */}
      <div className="safeTop" />

      {/* Top Navbar (NO TABS here) */}
      <header className="nav">
        <div className="navLeft">
          <div className="brandMark" aria-hidden="true">
            A
          </div>
          <div className="brandText">
            <div className="brandTitle">Admin Panel</div>
            <div className="brandSub">{activeKey}</div>
          </div>
        </div>

        <div className="navRight">
          {/* ✅ Only burger (tabs show only after menu open) */}
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
      <div
        className={`overlay ${menuOpen ? "show" : ""}`}
        onClick={() => setMenuOpen(false)}
      >
        <aside
          className={`drawer ${menuOpen ? "show" : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
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

          {/* ✅ Tabs only here */}
          <div className="drawerTabs" aria-label="Admin tabs mobile">
            {tabs.map((t) => (
              <button
                key={t.key}
                className={`drawerTab ${activeKey === t.key ? "active" : ""}`}
                onClick={() => goTab(t)}
                type="button"
              >
                <span className="dIco" aria-hidden="true">
                  {t.icon}
                </span>
                <span className="dTxt">{t.key}</span>
              </button>
            ))}
          </div>

          {/* ✅ Bottom only logout button (no user dashboard link, no hint) */}
          <div className="drawerBottom">
            <button className="primaryBtn" type="button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </aside>
      </div>

      {/* Body */}
      <main className="main">
        {/* ✅ Dashboard content: NO page buttons */}
        <section className="heroOne">
          <div className="heroCard">
            <div className="badge">Admin</div>

            <h1 className="hTitle">
              Welcome, <span className="nameGlow">{adminName}</span>
            </h1>

            <p className="hDesc">
              Open the menu to manage <b>Users</b> and <b>Settings</b>.
            </p>

            <div className="miniRow">
              <div className="mini">
                <div className="miniLabel">Current</div>
                <div className="miniVal">{activeKey}</div>
              </div>
              <div className="mini">
                <div className="miniLabel">Role</div>
                <div className="miniVal">Administrator</div>
              </div>
            </div>
          </div>
        </section>

        {/* ✅ Footer: Admin full text + custom line */}
        <footer className="foot">
          <div className="footLeft">
            <span className="footTag">Admin</span>
            <span className="footName">{adminName}</span>
          </div>

          <div className="footRight">
            <div className="footLine1">Admin</div>
            <div className="footLine2">@ 2025 Develop by Ajay Kedar</div>
          </div>
        </footer>

        <div className="safeBottom" />
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

  /* ✅ Safe top spacing for notch + small gap */
  .safeTop{
    height: calc(env(safe-area-inset-top, 0px) + 6px);
    width: 100%;
  }

  .nav{
    position:sticky;
    top:0;
    z-index:50;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:12px;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(255,255,255,.55);
    background: rgba(255,255,255,.58);
    backdrop-filter: blur(14px);
  }

  .navLeft{ display:flex; align-items:center; gap:12px; min-width: 220px; }
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

  .navRight{ display:flex; align-items:center; justify-content:flex-end; width:100%; }

  .burger{
    width: 44px; height: 44px;
    border-radius: 16px;
    border: 1px solid rgba(11,18,32,.10);
    background: rgba(255,255,255,.70);
    display:flex;
    align-items:center; justify-content:center; gap:4px;
    flex-direction:column;
    cursor:pointer;
  }
  .burger span{ width:18px; height:2px; border-radius:99px; background: rgba(11,18,32,.85); }

  .overlay{
    position:fixed; inset:0;
    background: rgba(0,0,0,.35);
    z-index:60;
    opacity:0;
    pointer-events:none;
    transition: opacity .18s ease;
  }
  .overlay.show{ opacity:1; pointer-events:auto; }

  .drawer{
    position:absolute; top:0; right:0; height:100%;
    width: min(360px, 88vw);
    background: rgba(255,255,255,.92);
    border-left: 1px solid rgba(255,255,255,.70);
    backdrop-filter: blur(14px);
    transform: translateX(110%);
    transition: transform .18s ease;
    padding: 14px;
    display:flex; flex-direction:column; gap:12px;
  }
  .drawer.show{ transform: translateX(0); }

  .drawerTop{ display:flex; align-items:center; justify-content:space-between; }
  .drawerTitle{ font-weight:1000; }
  .closeBtn{
    border:none;
    background: rgba(11,18,32,.06);
    border: 1px solid rgba(11,18,32,.10);
    width: 40px; height: 40px;
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
  .role{ font-size: 12px; font-weight: 1000; color: rgba(11,18,32,.70); margin-bottom: 2px; }
  .pname{ font-size: 16px; font-weight: 1000; line-height: 1.1; }
  .shineName{
    background: linear-gradient(90deg, rgba(34,197,94,.95), rgba(59,130,246,.95), rgba(236,72,153,.95));
    -webkit-background-clip:text;
    background-clip:text;
    color: transparent;
    text-shadow: 0 10px 30px rgba(0,0,0,.10);
  }
  .pemail{ font-size: 12px; font-weight: 850; color: rgba(11,18,32,.62); margin-top: 3px; word-break: break-all; }

  .drawerTabs{ display:flex; flex-direction:column; gap:8px; }
  .drawerTab{
    width:100%;
    display:flex; align-items:center; gap:10px;
    border:none;
    padding: 12px 12px;
    border-radius: 16px;
    background: rgba(255,255,255,.72);
    border: 1px solid rgba(11,18,32,.08);
    cursor:pointer;
    font-weight: 950;
    color: rgba(11,18,32,.85);
  }
  .drawerTab.active{ background: rgba(34,197,94,.15); border-color: rgba(34,197,94,.30); }

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

  .main{
    max-width: 1120px;
    margin: 0 auto;
    padding: 14px 16px 0px;
  }

  .heroOne{ margin-top: 10px; }
  .heroCard{
    background: rgba(255,255,255,.72);
    border: 1px solid rgba(255,255,255,.62);
    border-radius: 24px;
    padding: 18px;
    box-shadow: var(--shadow);
    backdrop-filter: blur(14px);
  }

  .badge{
    display:inline-block;
    padding: 6px 10px;
    border-radius: 999px;
    font-weight: 1000;
    font-size: 12px;
    background: rgba(34,197,94,.14);
    border: 1px solid rgba(34,197,94,.25);
  }

  .hTitle{ margin: 10px 0 6px; font-size: clamp(22px, 3.2vw, 34px); font-weight: 1000; }
  .nameGlow{
    background: linear-gradient(90deg, rgba(34,197,94,1), rgba(59,130,246,1), rgba(236,72,153,1));
    -webkit-background-clip:text; background-clip:text; color: transparent;
  }
  .hDesc{ margin: 0 0 14px; color: var(--muted); font-weight: 850; line-height: 1.45; font-size: 14px; }

  .miniRow{
    display:grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-top: 10px;
  }
  .mini{
    background: rgba(255,255,255,.72);
    border: 1px solid rgba(11,18,32,.08);
    border-radius: 18px;
    padding: 12px;
  }
  .miniLabel{ font-size: 12px; font-weight: 950; color: rgba(11,18,32,.62); }
  .miniVal{ margin-top: 6px; font-size: 14px; font-weight: 1000; }

  .foot{
    margin-top: 14px;
    display:flex;
    align-items:flex-start;
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
    white-space: nowrap;
  }
  .footName{
    font-weight: 1000;
    white-space: nowrap;
  }

  .footRight{
    text-align:right;
    font-size: 12px;
    font-weight: 900;
    color: rgba(11,18,32,.70);
  }
  .footLine1{ font-weight: 1000; color: rgba(11,18,32,.75); }
  .footLine2{ margin-top: 4px; color: rgba(11,18,32,.62); }

  /* ✅ Footer bottom safe spacing */
  .safeBottom{
    height: calc(env(safe-area-inset-bottom, 0px) + 10px);
    width: 100%;
  }

  @media (max-width: 980px){
    .miniRow{ grid-template-columns: 1fr; }
    .foot{ flex-direction:column; align-items:flex-start; }
    .footRight{ text-align:left; }
  }
`;
