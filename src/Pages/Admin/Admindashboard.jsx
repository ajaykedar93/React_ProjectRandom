import React, { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import DashboardStatic from "./DashboardStatic.jsx";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, loading, logout } = useAuth();

  const adminName = user?.name || user?.full_name || "Admin";
  const adminEmail = user?.email_address || user?.email || "";

  const [menuOpen, setMenuOpen] = useState(false);

  const tabs = useMemo(
    () => [
      { key: "Dashboard", icon: "📊", path: "/admin" },
      { key: "Admin", icon: "🛡️", path: "/admin/admin" },
      { key: "Users", icon: "👥", path: "/admin/users" },
    ],
    []
  );

  const activeKey = useMemo(() => {
    if (location.pathname === "/admin" || location.pathname === "/admin/") return "Dashboard";
    if (location.pathname.startsWith("/admin/admin")) return "Admin";
    if (location.pathname.startsWith("/admin/users")) return "Users";
    return "Dashboard";
  }, [location.pathname]);

  const isDashboard = activeKey === "Dashboard";

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) navigate("/login", { replace: true });
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    try {
      if (typeof logout === "function") await logout();
      else localStorage.removeItem("auth_user");
    } catch (e) {
      // ignore
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const goTab = (t) => {
    setMenuOpen(false);
    navigate(t.path);
  };

  if (loading) {
    return <div style={{ padding: 20, fontWeight: 900 }}>Loading...</div>;
  }

  return (
    <div className={`ad ${menuOpen ? "lock" : ""}`}>
      <style>{css}</style>

      {/* ✅ Sticky Nav */}
      <header className="nav">
        <div className="navLeft" role="button" tabIndex={0} onClick={() => goTab(tabs[0])}>
          <div className="brandMark" aria-hidden="true">
            A
          </div>
          <div className="brandText">
            <div className="brandTitle">Admin Panel</div>
            <div className="brandSub">{activeKey}</div>
          </div>
        </div>

        <div className="navRight">
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

      {/* ✅ Drawer */}
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
              {String(adminName || "A")
                .trim()
                .split(" ")
                .slice(0, 2)
                .map((x) => x[0]?.toUpperCase())
                .join("") || "A"}
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
                className={`drawerTab ${activeKey === t.key ? "active" : ""}`}
                onClick={() => goTab(t)}
                type="button"
              >
                <span className="dIco" aria-hidden="true">
                  {t.icon}
                </span>
                <span className="dTxt">{t.key}</span>
                <span className="chev" aria-hidden="true">
                  →
                </span>
              </button>
            ))}
          </div>

          <div className="drawerBottom">
            <button className="primaryBtn" type="button" onClick={handleLogout}>
              Logout
            </button>

            <div className="drawerHint">
              Tip: ESC to close • Swipe / Click outside
            </div>
          </div>
        </aside>
      </div>

      {/* ✅ Main (edge-to-edge on mobile, full on desktop) */}
      <main className="main">
        {/* ✅ Hero always visible */}
        <section className="heroOne">
          <div className="heroCard">
            <div className="heroTop">
              <div className="badge">Administrator</div>
              <div className="pulseDot" aria-hidden="true" />
            </div>

            <h1 className="hTitle">
              Welcome, <span className="nameGlow">{adminName}</span>
            </h1>

            <div className="miniRow">
              <div className="mini">
                <div className="miniLabel">Current</div>
                <div className="miniVal">{activeKey}</div>
              </div>
              <div className="mini">
                <div className="miniLabel">Role</div>
                <div className="miniVal">Administrator</div>
              </div>
              <div className="mini">
                <div className="miniLabel">Status</div>
                <div className="miniVal ok">Online</div>
              </div>
            </div>

            <div className="heroGlow" aria-hidden="true" />
          </div>
        </section>

        {/* ✅ Content area */}
        <section className="tabArea">
          <div className="tabCard">
            <div className="tabHead">
              <div className="tabTitle">{activeKey}</div>
              <div className="tabPills">
                <span className="pill">Secure</span>
                <span className="pill soft">Live</span>
              </div>
            </div>

            <div className="tabBody">
              {isDashboard ? <DashboardStatic /> : <Outlet />}
            </div>
          </div>
        </section>

        {/* ✅ Footer */}
        <footer className="foot">
          <div className="footLeft">
            <span className="footTag">Admin</span>
            <span className="footName">Ajay Kedar</span>
          </div>

          <div className="footRight">
            <span className="footSmall">© {new Date().getFullYear()} Admin Panel</span>
          </div>
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
    --shadow: 0 30px 90px rgba(0,0,0,.16);
    --glass: rgba(255,255,255,.62);
  }

  *{ box-sizing:border-box; }
  html, body { height: 100%; }
  body{ margin:0; overflow-x:hidden; }
  #root{ min-height:100%; }

  /* ✅ full screen base */
  .ad{
    min-height:100vh;
    width: 100%;
    background:
      radial-gradient(900px 540px at 10% 10%, rgba(255, 0, 150, .22), transparent 60%),
      radial-gradient(900px 540px at 90% 18%, rgba(0, 200, 255, .20), transparent 58%),
      radial-gradient(1000px 650px at 50% 95%, rgba(0, 255, 150, .16), transparent 60%),
      linear-gradient(135deg, var(--bg1) 0%, var(--bg2) 34%, var(--bg3) 67%, var(--bg4) 100%);
    color:var(--ink);
  }

  /* lock scroll when drawer open */
  .ad.lock{ height:100vh; overflow:hidden; }

  /* ✅ Sticky Nav edge-to-edge */
  .nav{
    position:sticky;
    top:0;
    z-index:50;
    width: 100%;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:12px;
    padding: 12px 14px; /* small safe padding */
    border-bottom: 1px solid rgba(255,255,255,.55);
    background: rgba(255,255,255,.55);
    backdrop-filter: blur(14px);
  }

  .navLeft{ display:flex; align-items:center; gap:12px; min-width: 220px; cursor:pointer; }
  .brandMark{
    width:42px; height:42px; border-radius:16px;
    display:flex; align-items:center; justify-content:center;
    font-weight:1100;
    background: rgba(255,255,255,.78);
    border: 1px solid rgba(11,18,32,.10);
    box-shadow: 0 18px 40px rgba(0,0,0,.10);
    position:relative;
    overflow:hidden;
  }
  .brandMark::after{
    content:"";
    position:absolute; inset:-40%;
    background: radial-gradient(circle, rgba(124,58,237,.20), transparent 60%);
    animation: floatGlow 6s ease-in-out infinite;
  }
  @keyframes floatGlow{
    0%,100%{ transform: translate(-6%, -6%) rotate(0deg); }
    50%{ transform: translate(8%, 10%) rotate(35deg); }
  }

  .brandTitle{ font-weight:1100; letter-spacing:.2px; }
  .brandSub{ font-weight:900; font-size:12px; color: var(--muted); margin-top:2px; }

  .navRight{ display:flex; align-items:center; justify-content:flex-end; width:100%; }

  .burger{
    width: 46px; height: 46px;
    border-radius: 16px;
    border: 1px solid rgba(11,18,32,.10);
    background: rgba(255,255,255,.75);
    display:flex;
    align-items:center; justify-content:center; gap:4px;
    flex-direction:column;
    cursor:pointer;
    transition: transform .15s ease;
  }
  .burger:hover{ transform: translateY(-1px); }
  .burger span{ width:18px; height:2px; border-radius:99px; background: rgba(11,18,32,.85); }

  /* ✅ overlay full */
  .overlay{
    position:fixed; inset:0;
    background: rgba(0,0,0,.38);
    z-index:60;
    opacity:0;
    pointer-events:none;
    transition: opacity .18s ease;
  }
  .overlay.show{ opacity:1; pointer-events:auto; }

  /* ✅ drawer full height, edge to edge */
  .drawer{
    position:absolute; top:0; right:0; height:100%;
    width: min(380px, 92vw);
    background: rgba(255,255,255,.92);
    border-left: 1px solid rgba(255,255,255,.70);
    backdrop-filter: blur(16px);
    transform: translateX(110%);
    transition: transform .20s ease;
    padding: 14px;
    display:flex; flex-direction:column; gap:12px;
    box-shadow: -30px 0 90px rgba(0,0,0,.18);
  }
  .drawer.show{ transform: translateX(0); }

  .drawerTop{ display:flex; align-items:center; justify-content:space-between; }
  .drawerTitle{ font-weight:1100; }
  .closeBtn{
    border:none;
    background: rgba(11,18,32,.06);
    border: 1px solid rgba(11,18,32,.10);
    width: 42px; height: 42px;
    border-radius: 16px;
    cursor:pointer;
    font-weight: 1100;
  }

  .drawerProfile{
    display:flex; gap:12px; align-items:center;
    padding: 12px;
    border-radius: 20px;
    background: rgba(255,255,255,.72);
    border: 1px solid rgba(11,18,32,.08);
    position:relative;
    overflow:hidden;
  }
  .drawerProfile::before{
    content:"";
    position:absolute; inset:-30%;
    background: radial-gradient(circle, rgba(34,197,94,.20), transparent 55%);
    filter: blur(2px);
  }

  .avatar{
    width: 48px; height: 48px; border-radius: 16px;
    display:flex; align-items:center; justify-content:center;
    font-weight: 1100;
    background: rgba(34,197,94,.18);
    border: 1px solid rgba(34,197,94,.25);
    position:relative;
    z-index:1;
  }
  .pinfo{ position:relative; z-index:1; }
  .role{ font-size: 12px; font-weight: 1100; color: rgba(11,18,32,.70); margin-bottom: 2px; }
  .pname{ font-size: 16px; font-weight: 1100; line-height: 1.1; }
  .shineName{
    background: linear-gradient(90deg, rgba(34,197,94,.95), rgba(59,130,246,.95), rgba(236,72,153,.95));
    -webkit-background-clip:text;
    background-clip:text;
    color: transparent;
    text-shadow: 0 10px 30px rgba(0,0,0,.10);
  }
  .pemail{ font-size: 12px; font-weight: 900; color: rgba(11,18,32,.62); margin-top: 3px; word-break: break-all; }

  .drawerTabs{ display:flex; flex-direction:column; gap:8px; margin-top: 2px; }
  .drawerTab{
    width:100%;
    display:flex; align-items:center; gap:10px;
    border:none;
    padding: 12px 12px;
    border-radius: 18px;
    background: rgba(255,255,255,.78);
    border: 1px solid rgba(11,18,32,.08);
    cursor:pointer;
    font-weight: 1000;
    color: rgba(11,18,32,.88);
    transition: transform .12s ease, background .12s ease;
  }
  .drawerTab:hover{ transform: translateY(-1px); background: rgba(255,255,255,.92); }
  .drawerTab.active{ background: rgba(34,197,94,.15); border-color: rgba(34,197,94,.30); }
  .dIco{ width: 26px; display:inline-flex; justify-content:center; }
  .chev{ margin-left:auto; opacity:.7; font-weight:1100; }

  .drawerBottom{
    margin-top:auto;
    display:flex;
    flex-direction:column;
    gap:10px;
    padding-bottom: 8px;
  }

  .primaryBtn{
    border:none;
    padding: 12px 14px;
    border-radius: 18px;
    font-weight: 1100;
    cursor:pointer;
    color:#0b1220;
    background: linear-gradient(90deg, rgba(34,197,94,.85), rgba(59,130,246,.75), rgba(236,72,153,.65));
    box-shadow: 0 18px 50px rgba(0,0,0,.14);
    transition: transform .14s ease;
  }
  .primaryBtn:hover{ transform: translateY(-1px); }

  .drawerHint{
    font-size: 12px;
    font-weight: 900;
    color: rgba(11,18,32,.62);
    text-align:center;
  }

  /* ✅ MAIN: edge-to-edge on mobile, full width on desktop */
  .main{
    width: 100%;
    max-width: 100%;
    margin: 0;
    padding: 14px 14px 18px; /* minimal padding */
  }

  .heroOne{ margin-top: 8px; }
  .heroCard{
    width: 100%;
    background: rgba(255,255,255,.72);
    border: 1px solid rgba(255,255,255,.62);
    border-radius: 26px;
    padding: 18px;
    box-shadow: var(--shadow);
    backdrop-filter: blur(16px);
    position:relative;
    overflow:hidden;
  }

  .heroTop{ display:flex; align-items:center; justify-content:space-between; gap:10px; }
  .badge{
    display:inline-block;
    padding: 7px 12px;
    border-radius: 999px;
    font-weight: 1100;
    font-size: 12px;
    background: rgba(34,197,94,.14);
    border: 1px solid rgba(34,197,94,.25);
  }

  .pulseDot{
    width: 10px; height: 10px; border-radius: 999px;
    background: rgba(34,197,94,.95);
    box-shadow: 0 0 0 0 rgba(34,197,94,.35);
    animation: pulse 1.4s ease-in-out infinite;
  }
  @keyframes pulse{
    0%{ box-shadow: 0 0 0 0 rgba(34,197,94,.35); }
    70%{ box-shadow: 0 0 0 14px rgba(34,197,94,0); }
    100%{ box-shadow: 0 0 0 0 rgba(34,197,94,0); }
  }

  .hTitle{ margin: 12px 0 6px; font-size: clamp(22px, 4.4vw, 36px); font-weight: 1100; }
  .nameGlow{
    background: linear-gradient(90deg, rgba(34,197,94,1), rgba(59,130,246,1), rgba(236,72,153,1));
    -webkit-background-clip:text; background-clip:text; color: transparent;
  }

  .miniRow{
    display:grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-top: 12px;
  }
  .mini{
    background: rgba(255,255,255,.76);
    border: 1px solid rgba(11,18,32,.08);
    border-radius: 18px;
    padding: 12px;
    min-width: 0;
  }
  .miniLabel{ font-size: 12px; font-weight: 1000; color: rgba(11,18,32,.62); }
  .miniVal{ margin-top: 6px; font-size: 14px; font-weight: 1100; }
  .miniVal.ok{ color: rgba(16,185,129,.95); }

  .heroGlow{
    position:absolute; inset:-40%;
    background: radial-gradient(circle, rgba(59,130,246,.18), transparent 55%);
    transform: rotate(12deg);
    pointer-events:none;
  }

  .tabArea{ margin-top: 14px; }
  .tabCard{
    width: 100%;
    background: rgba(255,255,255,.72);
    border: 1px solid rgba(255,255,255,.62);
    border-radius: 26px;
    padding: 14px;
    box-shadow: var(--shadow);
    backdrop-filter: blur(16px);
    overflow:hidden;
  }

  .tabHead{
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap: 10px;
    padding: 2px 2px 12px;
    border-bottom: 1px solid rgba(11,18,32,.08);
  }
  .tabTitle{
    font-weight: 1100;
    font-size: 16px;
  }
  .tabPills{ display:flex; gap: 8px; flex-wrap:wrap; }
  .pill{
    font-size: 12px;
    font-weight: 1100;
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(124,58,237,.12);
    border: 1px solid rgba(124,58,237,.18);
    color: rgba(76,29,149,.95);
  }
  .pill.soft{
    background: rgba(6,182,212,.12);
    border-color: rgba(6,182,212,.18);
    color: rgba(11,18,32,.86);
  }

  .tabBody{
    padding-top: 14px;
  }

  .foot{
    margin-top: 14px;
    width: 100%;
    display:flex;
    align-items:flex-start;
    justify-content:space-between;
    gap:12px;
    padding: 12px 14px;
    border-radius: 20px;
    background: rgba(255,255,255,.58);
    border: 1px solid rgba(255,255,255,.60);
    backdrop-filter: blur(14px);
  }
  .footLeft{ display:flex; align-items:center; gap:10px; }
  .footTag{
    font-size: 12px;
    font-weight: 1100;
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(34,197,94,.14);
    border: 1px solid rgba(34,197,94,.25);
    white-space: nowrap;
  }
  .footName{ font-weight: 1100; white-space: nowrap; }
  .footSmall{ font-size: 12px; font-weight: 900; color: rgba(11,18,32,.62); }

  /* ✅ Mobile perfect fit */
  @media (max-width: 980px){
    .miniRow{ grid-template-columns: 1fr; }
    .foot{ flex-direction:column; align-items:flex-start; }
  }

  /* ✅ True edge-to-edge on very small phones */
  @media (max-width: 420px){
    .nav{ padding: 10px 10px; }
    .main{ padding: 10px 10px 14px; }
    .heroCard{ padding: 14px; border-radius: 22px; }
    .tabCard{ padding: 12px; border-radius: 22px; }
    .drawer{ width: 92vw; padding: 12px; }
  }
`;
