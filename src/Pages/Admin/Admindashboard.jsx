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

      {/* ✅ Sticky Nav (safe top spacing + dark rose theme) */}
      <header className="navWrap">
        <div className="nav">
          <div className="navLeft" role="button" tabIndex={0} onClick={() => goTab(tabs[0])}>
            <div className="brandMark" aria-hidden="true">
              A
            </div>

            <div className="brandText">
              <div className="brandTitle">
                Admin Panel <span className="titleDot">•</span>
                <span className="brandTitleSub">Control</span>
              </div>
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

            <div className="drawerHint">Tip: ESC to close • Swipe / Click outside</div>
          </div>
        </aside>
      </div>

      {/* ✅ Main */}
      <main className="main">
        {/* ✅ Hero */}
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

        {/* ✅ Admin Info */}
        <section className="adminInfo">
          <div className="infoCard">
            <div className="infoHead">
              <div className="infoTitle">Admin Power & Responsibilities</div>
              <span className="infoBadge">Control Center</span>
            </div>

            <p className="infoDesc">
              This Admin Panel is designed to give you full authority over the system — secure access,
              real-time control, and clean management of users & operations.
            </p>

            <div className="infoGrid">
              <div className="infoItem">
                <div className="infoIcon">🧠</div>
                <div>
                  <div className="infoItemTitle">System Control</div>
                  <div className="infoItemText">
                    Manage settings, monitor activity, and maintain platform stability.
                  </div>
                </div>
              </div>

              <div className="infoItem">
                <div className="infoIcon">👥</div>
                <div>
                  <div className="infoItemTitle">User Management</div>
                  <div className="infoItemText">Create, verify, block, or update users with full tracking.</div>
                </div>
              </div>

              <div className="infoItem">
                <div className="infoIcon">🛡️</div>
                <div>
                  <div className="infoItemTitle">Security & Access</div>
                  <div className="infoItemText">Role-based access to protect sensitive data and actions.</div>
                </div>
              </div>

              <div className="infoItem">
                <div className="infoIcon">📈</div>
                <div>
                  <div className="infoItemTitle">Reports & Insights</div>
                  <div className="infoItemText">Quick overview of performance, growth, and important system actions.</div>
                </div>
              </div>
            </div>

            <div className="infoFooter">
              <span className="infoNote">Built for speed • Secure by design • Mobile-ready UI</span>
            </div>
          </div>
        </section>

        {/* ✅ Content */}
        <section className="tabArea">
          <div className="tabCard">
            <div className="tabHead">
              <div className="tabTitle">{activeKey}</div>
              <div className="tabPills">
                <span className="pill">Secure</span>
                <span className="pill soft">Live</span>
              </div>
            </div>

            <div className="tabBody">{isDashboard ? <DashboardStatic /> : <Outlet />}</div>
          </div>
        </section>

        {/* ✅ Footer (MATCHES navbar) */}
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

    /* ✅ SINGLE THEME for navbar + footer */
    --roseDark: rgba(190, 24, 93, 0.92);
    --roseBorder: rgba(255,255,255,.18);
    --roseGlow: rgba(190,24,93,.35);
    --roseSoft: rgba(255, 182, 213, .95);
  }

  *{ box-sizing:border-box; }
  html, body { height: 100%; }
  body{ margin:0; overflow-x:hidden; }
  #root{ min-height:100%; }

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
  .ad.lock{ height:100vh; overflow:hidden; }

  /* ✅ NAV WRAP: safe top spacing */
  .navWrap{
    position: sticky;
    top: 0;
    z-index: 80;
    padding-top: max(10px, env(safe-area-inset-top));
    background: transparent;
  }

  /* ✅ NAV: dark rose */
  .nav{
    width:100%;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:12px;

    margin:0;
    padding:12px 14px;

    background: var(--roseDark);
    backdrop-filter: blur(14px);

    border-top: 1px solid var(--roseBorder);
    border-bottom: 1px solid var(--roseBorder);
    box-shadow: 0 18px 45px var(--roseGlow);

    position:relative;
    overflow:hidden;
  }
  .nav::before{ content:none; }

  .navLeft{ display:flex; align-items:center; gap:12px; min-width:220px; cursor:pointer; position:relative; z-index:1; }

  .brandMark{
    width:42px; height:42px; border-radius:16px;
    display:flex; align-items:center; justify-content:center;
    font-weight:1100;
    background: rgba(255,255,255,.88);
    border: 1px solid rgba(255,255,255,.30);
    box-shadow: 0 18px 40px rgba(0,0,0,.12);
  }

  .brandTitle{
    font-weight: 1200;
    letter-spacing: .3px;
    font-size: 14px;
    line-height: 1.1;
    color: rgba(255,255,255,.96);
  }
  .brandTitleSub{
    font-weight: 1100;
    margin-left: 6px;
    color: var(--roseSoft);
  }
  .titleDot{
    margin: 0 6px;
    font-weight: 1100;
    color: rgba(255,255,255,.45);
  }
  .brandSub{
    font-weight:900;
    font-size:12px;
    margin-top:3px;
    color: rgba(255,255,255,.72);
  }

  .navRight{ display:flex; align-items:center; justify-content:flex-end; width:100%; position:relative; z-index:1; }

  .burger{
    width: 46px; height: 46px;
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,.22);
    background: rgba(255,255,255,.14);
    display:flex;
    align-items:center; justify-content:center; gap:4px;
    flex-direction:column;
    cursor:pointer;
    transition: transform .15s ease;
  }
  .burger:hover{ transform: translateY(-1px); }
  .burger span{ width:18px; height:2px; border-radius:99px; background: rgba(255,255,255,.92); }

  /* overlay */
  .overlay{
    position:fixed; inset:0;
    background: rgba(0,0,0,.38);
    z-index:90;
    opacity:0;
    pointer-events:none;
    transition: opacity .18s ease;
  }
  .overlay.show{ opacity:1; pointer-events:auto; }

  /* drawer */
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
  }

  .avatar{
    width: 48px; height: 48px; border-radius: 16px;
    display:flex; align-items:center; justify-content:center;
    font-weight: 1100;
    background: rgba(190,24,93,.14);
    border: 1px solid rgba(190,24,93,.22);
  }

  .role{ font-size: 12px; font-weight: 1100; color: rgba(11,18,32,.70); margin-bottom: 2px; }
  .pname{ font-size: 16px; font-weight: 1100; line-height: 1.1; }
  .shineName{
    color: rgba(11,18,32,.92);
    font-weight: 1100;
  }
  .pemail{ font-size: 12px; font-weight: 900; color: rgba(11,18,32,.62); margin-top: 3px; word-break: break-all; }

  .drawerTabs{ display:flex; flex-direction:column; gap:8px; }
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
  .drawerTab.active{ background: rgba(190,24,93,.12); border-color: rgba(190,24,93,.20); }
  .dIco{ width: 26px; display:inline-flex; justify-content:center; }
  .chev{ margin-left:auto; opacity:.7; font-weight:1100; }

  .drawerBottom{ margin-top:auto; display:flex; flex-direction:column; gap:10px; padding-bottom: 8px; }

  .primaryBtn{
    border:none;
    padding: 12px 14px;
    border-radius: 18px;
    font-weight: 1100;
    cursor:pointer;
    color:#fff;
    background: var(--roseDark);
    box-shadow: 0 18px 50px rgba(0,0,0,.14);
    transition: transform .14s ease;
    border: 1px solid rgba(255,255,255,.18);
  }
  .primaryBtn:hover{ transform: translateY(-1px); }

  .drawerHint{ font-size: 12px; font-weight: 900; color: rgba(11,18,32,.62); text-align:center; }

  /* MAIN edge-to-edge */
  .main{
    width: 100%;
    max-width: 100%;
    margin: 0;
    padding: 0;
  }

  /* section spacing */
  .heroOne{ padding: 12px 14px 0; }
  .adminInfo{ padding: 14px 14px 0; }
  .tabArea{ padding: 14px 14px 0; }
  .foot{ margin: 14px 14px 16px; }

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
    background: rgba(190,24,93,.10);
    border: 1px solid rgba(190,24,93,.18);
    color: rgba(11,18,32,.88);
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
    background: linear-gradient(90deg, rgba(190,24,93,1), rgba(59,130,246,1), rgba(34,197,94,1));
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

  .infoCard{
    width: 100%;
    background: rgba(255,255,255,.72);
    border: 1px solid rgba(255,255,255,.62);
    border-radius: 26px;
    padding: 14px;
    box-shadow: var(--shadow);
    backdrop-filter: blur(16px);
  }

  .infoHead{ display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom: 8px; }
  .infoTitle{ font-weight: 1100; font-size: 16px; }
  .infoBadge{
    font-size: 12px;
    font-weight: 1100;
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(190,24,93,.10);
    border: 1px solid rgba(190,24,93,.18);
    color: rgba(11,18,32,.86);
    white-space: nowrap;
  }

  .infoDesc{ margin: 0; font-size: 13px; font-weight: 900; color: rgba(11,18,32,.70); line-height: 1.55; }
  .infoGrid{ margin-top: 12px; display:grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }

  .infoItem{
    display:flex;
    gap:10px;
    padding: 12px;
    border-radius: 20px;
    background: rgba(255,255,255,.78);
    border: 1px solid rgba(11,18,32,.08);
  }

  .infoIcon{
    width: 38px; height: 38px;
    border-radius: 14px;
    display:flex; align-items:center; justify-content:center;
    background: rgba(190,24,93,.10);
    border: 1px solid rgba(190,24,93,.16);
    flex: 0 0 auto;
  }

  .infoItemTitle{ font-weight: 1100; font-size: 13px; }
  .infoItemText{ margin-top: 4px; font-weight: 900; font-size: 12px; color: rgba(11,18,32,.68); line-height: 1.45; }

  .infoFooter{ margin-top: 10px; }
  .infoNote{
    display:inline-block;
    font-size: 12px;
    font-weight: 900;
    color: rgba(11,18,32,.62);
    padding: 8px 10px;
    border-radius: 14px;
    background: rgba(190,24,93,.08);
    border: 1px solid rgba(190,24,93,.14);
  }

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
  .tabTitle{ font-weight: 1100; font-size: 16px; }
  .tabPills{ display:flex; gap: 8px; flex-wrap:wrap; }

  .pill{
    font-size: 12px;
    font-weight: 1100;
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(190,24,93,.10);
    border: 1px solid rgba(190,24,93,.18);
    color: rgba(11,18,32,.86);
  }
  .pill.soft{
    background: rgba(255, 182, 213, .18);
    border-color: rgba(255, 182, 213, .26);
    color: rgba(11,18,32,.86);
  }

  .tabBody{ padding-top: 14px; }

  /* ✅ FOOTER matches NAV */
  .foot{
    display:flex;
    align-items:flex-start;
    justify-content:space-between;
    gap:12px;

    padding: 12px 14px;
    border-radius: 20px;

    background: var(--roseDark);
    border: 1px solid var(--roseBorder);
    box-shadow: 0 18px 45px var(--roseGlow);

    backdrop-filter: blur(14px);
  }

  .footLeft{ display:flex; align-items:center; gap:10px; }
  .footTag{
    font-size: 12px;
    font-weight: 1100;
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(255,255,255,.14);
    border: 1px solid rgba(255,255,255,.20);
    color: rgba(255,255,255,.92);
    white-space: nowrap;
  }
  .footName{ font-weight: 1100; white-space: nowrap; color: rgba(255,255,255,.96); }
  .footSmall{ font-size: 12px; font-weight: 900; color: rgba(255,255,255,.78); }

  @media (max-width: 980px){
    .miniRow{ grid-template-columns: 1fr; }
    .infoGrid{ grid-template-columns: 1fr; }
    .foot{ flex-direction:column; align-items:flex-start; }
  }

  @media (max-width: 420px){
    .nav{ padding: 12px 12px; }
    .heroOne{ padding: 10px 12px 0; }
    .adminInfo{ padding: 12px 12px 0; }
    .tabArea{ padding: 12px 12px 0; }
    .foot{ margin: 12px 12px 14px; border-radius: 18px; }
    .heroCard{ padding: 14px; border-radius: 22px; }
    .infoCard{ padding: 12px; border-radius: 22px; }
    .tabCard{ padding: 12px; border-radius: 22px; }
    .drawer{ width: 92vw; padding: 12px; }
  }
`;
