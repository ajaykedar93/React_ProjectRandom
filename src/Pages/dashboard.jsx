import React, { useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

import NavbarDoc from "../components/NavbarDoc.jsx";
import FooterDoc from "../components/FooterDoc.jsx";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout: ctxLogout } = useAuth();

  // ✅ Added new tab: Imp
  const tabs = useMemo(
    () => [
      { label: "Home", path: "/dashboard" },
      { label: "Imp", path: "/dashboard/importantwork" }, // ✅ NEW
      { label: "Document", path: "/dashboard/document" },
      { label: "Get Document", path: "/dashboard/documentget" },
      { label: "Add Text Doc", path: "/dashboard/addtextdoc" },
      { label: "Get Text Docs", path: "/dashboard/gettextdoc" },
    ],
    []
  );

  const [me, setMe] = useState(null);
  useEffect(() => setMe(user || null), [user]);

  const displayName =
    me?.full_name ||
    [me?.first_name, me?.last_name].filter(Boolean).join(" ") ||
    me?.name ||
    me?.displayName ||
    "User";

  const displayEmail = me?.email_address || me?.email || "";

  const logout = () => {
    try {
      if (typeof ctxLogout === "function") ctxLogout();
    } catch (e) {}
    try {
      localStorage.removeItem("auth_user");
    } catch (e) {}
    navigate("/login", { replace: true });
  };

  const activePath = location?.pathname || "/dashboard";
  const getIsActive = (tabPath) => {
    if (tabPath === "/dashboard") return activePath === "/dashboard";
    return activePath === tabPath || activePath.startsWith(tabPath + "/");
  };

  const tabListRef = useRef(null);
  const tabRefs = useRef({});

  const [isMobile, setIsMobile] = useState(false);
  const [tabsOpen, setTabsOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 740px)");
    const sync = () => setIsMobile(mq.matches);
    sync();

    if (mq.addEventListener) {
      mq.addEventListener("change", sync);
      return () => mq.removeEventListener("change", sync);
    }
    mq.addListener(sync);
    return () => mq.removeListener(sync);
  }, []);

  useEffect(() => {
    if (!isMobile) setTabsOpen(true);
    else setTabsOpen(false);
  }, [isMobile]);

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
        container.scrollLeft +
        (left - containerRect.width / 2 + elRect.width / 2);
      container.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (tabsOpen) scrollActiveTabIntoView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePath, tabsOpen]);

  const onTabClick = (path) => {
    navigate(path);
    if (isMobile) setTabsOpen(false);
  };

  return (
    <div className="dash">
      <style>{css}</style>
      <div className="bg" aria-hidden="true" />

      <NavbarDoc
        displayName={displayName}
        displayEmail={displayEmail}
        logout={logout}
      />

      <main className="wrap">
        <aside className="side">
          <div className="sideCard">
            <div className="sideTopRow">
              <div className="sideTitle">Menu</div>

              {isMobile ? (
                <div className="miniControls">
                  {!tabsOpen ? (
                    <button
                      type="button"
                      className="miniIconBtn"
                      onClick={() => setTabsOpen(true)}
                      aria-label="Open tabs"
                    >
                      <span className="miniArrow">›</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="miniIconBtn close"
                      onClick={() => setTabsOpen(false)}
                      aria-label="Close tabs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ) : null}
            </div>

            {(tabsOpen || !isMobile) && (
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
                        onClick={() => onTabClick(t.path)}
                        type="button"
                        role="tab"
                        aria-selected={active}
                      >
                        <span className="tabDot" aria-hidden="true" />
                        <span className="tabText">{t.label}</span>
                        <span
                          className={`tabArrow ${active ? "open" : ""}`}
                          aria-hidden="true"
                        >
                          ›
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="fadeLeft" aria-hidden="true" />
                <div className="fadeRight" aria-hidden="true" />
              </div>
            )}
          </div>
        </aside>

        <section className="content">
          <div className="pageShell">
            <Outlet />
          </div>
        </section>
      </main>

      <FooterDoc />
    </div>
  );
}

const css = `
  :root{
    /* ✅ Modern Professional Palette (Blue/Cyan) */
    --txt: #0b1220;
    --muted: rgba(11,18,32,.62);

    --card: rgba(255,255,255,.90);
    --line: rgba(11,18,32,.10);
    --shadow: 0 26px 80px rgba(11,18,32,.14);

    /* Accent */
    --a1: #2563eb;              /* blue */
    --a2: #06b6d4;              /* cyan */
    --a3: #60a5fa;              /* soft blue */

    --accentBg: rgba(37,99,235,.12);
    --accentBg2: rgba(6,182,212,.10);

    /* Tab states */
    --tabBg: rgba(255,255,255,.72);
    --tabHover: rgba(37,99,235,.08);
    --tabActive: rgba(37,99,235,.12);
    --tabOutline: rgba(37,99,235,.30);

    --danger: #ef4444;
  }

  *{ box-sizing: border-box; }
  html, body{ width:100%; overflow-x:hidden; }
  body{ margin:0; color: var(--txt); }

  .dash{
    min-height: 100dvh;
    width: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
    overflow-x: hidden;
  }

  .wrap{
    animation: wrapIn .45s ease both;
  }
  @keyframes wrapIn{
    from{ opacity: 0; transform: translateY(10px); }
    to{ opacity: 1; transform: translateY(0px); }
  }

  /* ✅ New professional background (no neon pink/green) */
.bg{
  position: fixed;
  inset: 0;
  background:
    radial-gradient(900px 520px at 20% 12%, rgba(246, 137, 35, 0.25), transparent 60%),
    radial-gradient(900px 520px at 80% 20%, rgba(241, 89, 112, 0.22), transparent 58%),
    linear-gradient(180deg, #e44c22 0%, #db4e2a 55%, #ee512d 100%);
  pointer-events:none;
  z-index:0;
}



  .wrap{
    position: relative; z-index: 1;
    width: 100%;
    max-width: 1280px;
    margin: 0 auto;

    display: grid;
    grid-template-columns: 290px 1fr;
    gap: 14px;

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
    padding: 14px;
    box-shadow: var(--shadow);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    overflow: hidden;
    position: relative;
  }

  /* ✅ Same glow effect, updated colors */
  .sideCard::before,
  .pageShell::before{
    content:"";
    position:absolute;
    inset:-120px -90px auto -90px;
    height: 220px;
    background: radial-gradient(circle at 20% 20%,
      rgba(37,99,235,.14),
      rgba(6,182,212,.10),
      rgba(255,255,255,0) 60%
    );
    filter: blur(10px);
    opacity: .95;
    pointer-events:none;
    animation: floatGlow 7s ease-in-out infinite;
  }

  @keyframes floatGlow{
    0%,100%{ transform: translateY(0px) translateX(0px); }
    50%{ transform: translateY(12px) translateX(10px); }
  }

  .sideTopRow{
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap: 10px;
    margin-bottom: 10px;
    position: relative;
    z-index: 1;
  }

  .sideTitle{
    font-weight: 950;
    color: var(--txt);
    font-size: 14px;
    letter-spacing: .2px;
  }

  .miniControls{ display:flex; align-items:center; gap: 8px; }

  .miniIconBtn{
    border:none;
    cursor:pointer;
    width: 38px;
    height: 38px;
    border-radius: 14px;
    background: rgba(255,255,255,.78);
    border: 1px solid var(--line);
    box-shadow: 0 14px 40px rgba(11,18,32,.10);
    display:flex;
    align-items:center;
    justify-content:center;
    font-weight: 950;
    color: rgba(11,18,32,.86);
    transition: transform .14s ease, filter .14s ease, background .14s ease;
  }
  .miniIconBtn:hover{
    transform: translateY(-1px);
    background: rgba(37,99,235,.08);
    filter: brightness(1.02);
  }
  .miniIconBtn:active{ transform: translateY(0px) scale(.99); }

  .miniIconBtn.close{
    border: 1px solid rgba(239,68,68,.22);
    color: var(--danger);
    background: rgba(239,68,68,.06);
  }

  .miniArrow{ display:inline-block; font-size: 20px; line-height: 1; }

  .tabStrip{ position: relative; z-index: 1; }

  .tabList{
    display:flex;
    flex-direction: column;
    gap: 10px;
    overflow: hidden;
  }

  /* ✅ Tab button: professional look + click/focus */
  .tabBtn{
    width:100%;
    display:flex;
    align-items:center;
    gap: 10px;
    border:none;
    cursor:pointer;

    padding: 11px 12px;
    border-radius: 18px;
    background: var(--tabBg);

    font-weight: 900;
    color: rgba(11,18,32,.88);

    position: relative;
    flex: 0 0 auto;

    transition: transform .14s ease, filter .14s ease, box-shadow .14s ease, background .14s ease, outline-color .14s ease;
    outline: 2px solid transparent;
  }

  .tabBtn:hover{
    transform: translateY(-1px);
    background: var(--tabHover);
    box-shadow: 0 16px 34px rgba(11,18,32,.10);
  }

  .tabBtn:active{
    transform: translateY(0px) scale(.99);
  }

  .tabBtn:focus-visible{
    outline-color: var(--tabOutline);
  }

  /* ✅ Active tab */
  .tabBtn.active{
    background: linear-gradient(180deg, var(--tabActive), rgba(255,255,255,.78));
    outline-color: var(--tabOutline);
  }

  /* ✅ Active bottom bar (same style, new colors) */
  .tabBtn.active::after{
    content:"";
    position:absolute;
    left: 14px;
    right: 14px;
    bottom: 8px;
    height: 3px;
    border-radius: 999px;
    background: linear-gradient(90deg, var(--a1), var(--a2), var(--a3));
  }

  .tabDot{
    width: 10px; height: 10px;
    border-radius: 999px;
    background: rgba(11,18,32,.20);
    flex: 0 0 auto;
  }

  .tabBtn.active .tabDot{
    background: linear-gradient(90deg, var(--a1), var(--a2));
    box-shadow: 0 0 0 6px rgba(37,99,235,.12);
  }

  .tabText{
    white-space: nowrap;
    max-width: 240px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .tabArrow{
    margin-left: auto;
    display:none;
    font-size: 18px;
    line-height: 1;
    transform: rotate(0deg);
    transition: transform .18s ease;
    opacity: .9;
    flex: 0 0 auto;
  }
  .tabArrow.open{ transform: rotate(90deg); }

  .pageShell{
    height: 100%;
    width: 100%;
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 24px;
    padding: 16px;
    box-shadow: var(--shadow);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 28px;
    position: relative;
  }

  @media (max-width: 980px){
    .wrap{ grid-template-columns: 1fr; }
    .sideCard{ height: auto; }
  }

  @media (max-width: 740px){
    .wrap{ padding: 10px; gap: 10px; }
    .sideCard, .pageShell{ border-radius: 20px; }
    .tabArrow{ display:inline-block; }

    .tabList{
      flex-direction: row;
      flex-wrap: nowrap;
      overflow-x: auto;
      overflow-y: hidden;
      width: 100%;
      gap: 8px;
      padding: 6px 8px 8px;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior-x: contain;
      touch-action: pan-x;
      scroll-behavior: smooth;
      scrollbar-width: none;
    }
    .tabList::-webkit-scrollbar{ height: 0; }

    .tabBtn{
      width: auto;
      min-width: 44vw;
      max-width: 78vw;
      padding: 10px 12px;
      border-radius: 16px;
      font-size: 12px;
    }

    .tabText{
      max-width: 52vw;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
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

  @media (prefers-reduced-motion: reduce){
    .wrap{ animation: none; }
    .sideCard::before, .pageShell::before{ animation: none; }
    .tabBtn, .miniIconBtn{ transition: none; }
  }
`;
