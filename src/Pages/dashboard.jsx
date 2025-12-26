import React, { useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout: ctxLogout } = useAuth();

  const tabs = useMemo(
    () => [
      { label: "Home", path: "/dashboard" },
      { label: "Document", path: "/dashboard/document" },
      { label: "Get Document", path: "/dashboard/documentget" },

      // ✅ TEXT DOC
      { label: "Add Text Doc", path: "/dashboard/addtextdoc" },
      { label: "Get Text Docs", path: "/dashboard/gettextdoc" },

    
    ],
    []
  );

  // ✅ user from AuthContext (ProtectedRoute ensures this exists)
  const [me, setMe] = useState(null);

  useEffect(() => {
    setMe(user || null);
  }, [user]);

  const displayName =
    me?.full_name ||
    [me?.first_name, me?.last_name].filter(Boolean).join(" ") ||
    me?.name ||
    me?.displayName ||
    "User";

  const displayEmail = me?.email_address || me?.email || "";

  const logout = () => {
    try {
      // ✅ preferred: context logout (if your context supports it)
      if (typeof ctxLogout === "function") ctxLogout();
    } catch {}

    // ✅ keep your old cleanup also (safe)
    try {
      localStorage.removeItem("auth_user");
    } catch {}

    navigate("/login", { replace: true });
  };

  const activePath = location?.pathname || "/dashboard";
  const getIsActive = (tabPath) => {
    if (tabPath === "/dashboard") return activePath === "/dashboard";
    return activePath === tabPath || activePath.startsWith(tabPath + "/");
  };

  // ✅ tab scroll refs
  const tabListRef = useRef(null);
  const tabRefs = useRef({});

  const scrollActiveTabIntoView = () => {
    const activeTab = tabs.find((t) => getIsActive(t.path));
    if (!activeTab) return;

    const container = tabListRef.current;
    const el = tabRefs.current[activeTab.path];
    if (!container || !el) return;

    const isHorizontal = window.matchMedia("(max-width: 740px)").matches;
    if (!isHorizontal) return;

    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    const left = elRect.left - containerRect.left;
    const right = elRect.right - containerRect.left;

    if (left < 0 || right > containerRect.width) {
      const target =
        container.scrollLeft + (left - containerRect.width / 2 + elRect.width / 2);

      container.scrollTo({
        left: Math.max(0, target),
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    scrollActiveTabIntoView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePath]);

  return (
    <div className="dash">
      <style>{css}</style>
      <div className="bg" />

      <header className="top">
        <div className="brand">
          <div className="logo">D</div>
          <div className="brandText">
            <div className="brandTitle">Dashboard</div>
            <div className="brandSub">Home • Document • Get Document</div>
          </div>
        </div>

        <div className="right">
          <button className="logoutBtn" onClick={logout} type="button">
            Logout
          </button>

          <div className="me">
            <div className="devline" aria-label="developer-credit">
              <span className="codeIcon" aria-hidden="true">
                {"</>"}
              </span>
              <span className="devText">Develope by Ajay Kedar</span>
            </div>

            <div className="meName">{displayName}</div>
            {displayEmail ? <div className="meEmail">{displayEmail}</div> : null}
          </div>
        </div>
      </header>

      <main className="wrap">
        <aside className="side">
          <div className="sideCard">
            <div className="sideTitle">Menu</div>

            <div className="tabStrip">
              <div
                ref={tabListRef}
                className="tabList"
                role="tablist"
                aria-label="Dashboard Tabs"
              >
                {tabs.map((t) => {
                  const active = getIsActive(t.path);
                  return (
                    <button
                      key={t.path}
                      ref={(el) => (tabRefs.current[t.path] = el)}
                      className={`tabBtn ${active ? "active" : ""}`}
                      onClick={() => navigate(t.path)}
                      type="button"
                      role="tab"
                      aria-selected={active}
                    >
                      <span className="tabDot" />
                      <span className="tabText">{t.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="fadeLeft" aria-hidden="true" />
              <div className="fadeRight" aria-hidden="true" />
            </div>
          </div>
        </aside>

        <section className="content">
          <div className="pageShell">
            <Outlet />
          </div>
        </section>
      </main>
    </div>
  );
}

const css = `
  :root{
    --txt:#071126;
    --muted: rgba(7,17,38,.62);
    --card: rgba(255,255,255,.86);
    --line: rgba(255,255,255,.58);
    --shadow: 0 30px 90px rgba(0,0,0,.18);

    --flameA: #ff6a00;
    --flameB: #ff2d55;
    --flameC: #ffd166;
    --flameBg: rgba(255,106,0,.12);
  }
  *{ box-sizing: border-box; }

  .dash{
    height: 100dvh;
    width: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
    overflow: hidden;
  }

  .bg{
    position: fixed; inset: 0;
    background:
      radial-gradient(900px 520px at 12% 12%, rgba(255, 0, 150, .26), transparent 60%),
      radial-gradient(900px 520px at 88% 16%, rgba(0, 200, 255, .22), transparent 58%),
      radial-gradient(1000px 650px at 50% 92%, rgba(0, 255, 150, .18), transparent 60%),
      radial-gradient(1200px 800px at 50% 50%, rgba(124,58,237,.10), transparent 70%),
      linear-gradient(135deg, #fff7ed 0%, #eff6ff 34%, #ecfeff 67%, #f0fdf4 100%);
    pointer-events:none;
    z-index:0;
  }

  .top{
    position: sticky;
    top: 0;
    z-index: 5;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 14px;
    background: rgba(255,255,255,.72);
    border-bottom: 1px solid rgba(255,255,255,.60);
    box-shadow: 0 18px 60px rgba(0,0,0,.12);
    backdrop-filter: blur(16px);
  }

  .brand{ display:flex; align-items:center; gap: 10px; min-width: 160px; flex: 1 1 auto; }
  .logo{
    width: 42px; height: 42px; border-radius: 16px;
    display:flex; align-items:center; justify-content:center;
    font-weight: 1100;
    color: #081018;
    background: linear-gradient(90deg, #fde047 0%, #fb7185 30%, #60a5fa 65%, #34d399 100%);
    box-shadow: 0 18px 40px rgba(0,0,0,.14);
    flex: 0 0 auto;
  }

  .brandTitle{ font-weight: 1100; color: var(--txt); font-size: 15px; }
  .brandSub{ font-weight: 900; color: var(--muted); font-size: 12px; margin-top: 2px; }

  .right{ display:flex; align-items:flex-start; justify-content:flex-end; gap: 10px; flex-wrap: wrap; }
  .logoutBtn{
    border:none; cursor:pointer; padding: 10px 12px; border-radius: 14px;
    color:#fff; font-weight: 1000;
    background: linear-gradient(90deg, #ff2d55 0%, #ef4444 55%, #fb7185 100%);
    box-shadow: 0 14px 30px rgba(255,45,85,.22);
    white-space: nowrap;
  }
  .me{ text-align: right; line-height: 1.15; min-width: min(260px, 70vw); max-width: 520px; }
  .devline{
    display:flex; align-items:center; justify-content:flex-end; gap: 10px;
    margin: 0 0 8px; padding: 8px 10px; border-radius: 16px;
    background: rgba(255,255,255,.55);
    border: 1px solid rgba(255,255,255,.55);
    backdrop-filter: blur(14px);
    box-shadow: 0 14px 40px rgba(0,0,0,.10);
    user-select:none;
  }
  .codeIcon{ font-weight: 1000; color:#ff2d55; font-size: 16px; }
  .devText{ font-weight: 1000; color: rgba(11,18,32,.88); font-size: 13px; }
  .meName{ font-size: 12px; font-weight: 1000; color: var(--txt); word-break: break-word; }
  .meEmail{ font-size: 11px; font-weight: 900; color: rgba(7,17,38,.55); word-break: break-word; margin-top: 2px; }

  .wrap{
    position: relative; z-index: 1;
    width: 100%; max-width: 1280px; margin: 0 auto;
    display: grid; grid-template-columns: 290px 1fr; gap: 14px;
    padding: 14px;
    flex: 1 1 auto;
    min-height: 0;
  }

  .side, .content{ min-height: 0; min-width: 0; }

  .sideCard{
    height: 100%;
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 24px;
    padding: 16px;
    box-shadow: var(--shadow);
    backdrop-filter: blur(16px);
    overflow: hidden;
  }
  .sideTitle{ font-weight: 1100; color: var(--txt); font-size: 14px; margin-bottom: 10px; }

  .tabStrip{ position: relative; }

  .tabList{
    display:flex;
    flex-direction: column;
    gap: 10px;
    overflow: hidden;
  }

  .tabBtn{
    width:100%;
    display:flex;
    align-items:center;
    gap: 10px;
    border:none;
    cursor:pointer;
    padding: 12px 12px;
    border-radius: 18px;
    background: rgba(255,255,255,.62);
    font-weight: 1000;
    color: rgba(7,17,38,.86);
    position: relative;
    flex: 0 0 auto;
  }
  .tabBtn.active{
    background: linear-gradient(180deg, var(--flameBg), rgba(255,255,255,.72));
    outline: 2px solid rgba(255,106,0,.28);
  }
  .tabBtn.active::after{
    content:"";
    position:absolute;
    left: 14px;
    right: 14px;
    bottom: 8px;
    height: 3px;
    border-radius: 999px;
    background: linear-gradient(90deg, var(--flameA), var(--flameB), var(--flameC));
  }

  .tabDot{ width: 10px; height: 10px; border-radius: 999px; background: rgba(255,106,0,.28); }
  .tabBtn.active .tabDot{ background: linear-gradient(90deg, var(--flameA), var(--flameB)); }
  .tabText{ white-space: nowrap; }

  .pageShell{
    height: 100%;
    width: 100%;
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 24px;
    padding: 16px;
    box-shadow: var(--shadow);
    backdrop-filter: blur(16px);
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 28px;
  }

  @media (max-width: 980px){
    .wrap{ grid-template-columns: 1fr; }
    .sideCard{ height: auto; }
  }

  @media (max-width: 740px){
    .top{ flex-direction: column; align-items: stretch; }
    .right{ width: 100%; justify-content: space-between; align-items: flex-start; }
    .me{ text-align: left; width: 100%; min-width: unset; }
    .devline{ justify-content: flex-start; }
    .brandSub{ display:none; }

    .tabList{
      flex-direction: row;
      flex-wrap: nowrap;
      overflow-x: auto;
      overflow-y: hidden;
      width: 100%;
      gap: 8px;
      padding: 6px 10px 10px;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior-x: contain;
      touch-action: pan-x;
      scroll-behavior: smooth;
      scrollbar-width: none;
    }
    .tabList::-webkit-scrollbar{ height: 0; }

    .tabBtn{
      width: auto;
      min-width: 20vw;
      max-width: 44vw;
      padding: 9px 10px;
      border-radius: 16px;
      font-size: 12px;
    }

    .fadeLeft,
    .fadeRight{
      position:absolute;
      top: 0; bottom: 0;
      width: 18px;
      pointer-events:none;
      display:block;
    }
    .fadeLeft{ left: 0; background: linear-gradient(90deg, rgba(255,255,255,.95), rgba(255,255,255,0)); }
    .fadeRight{ right: 0; background: linear-gradient(270deg, rgba(255,255,255,.95), rgba(255,255,255,0)); }
  }

  .fadeLeft, .fadeRight{ display:none; }
`;
