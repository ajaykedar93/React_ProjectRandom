import React, { useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

import NavbarDoc from "../components/NavbarDoc.jsx";
import FooterDoc from "../components/FooterDoc.jsx";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout: ctxLogout } = useAuth();

  const tabs = useMemo(
    () => [
      { label: "Home", path: "/dashboard" },
      { label: "Imp", path: "/dashboard/importantwork" },
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
    <div className="outletScroll noPad">
      <Outlet />
    </div>
  </div>
</section>

      </main>

      {/* ✅ Sticky footer wrapper: always bottom for all pages */}
      <div className="footerWrap">
        <FooterDoc />
      </div>
    </div>
  );
}

const css = `
  :root{
    --txt:#0b1220;
    --muted: rgba(11,18,32,.62);

    --card: rgba(255,255,255,.90);
    --line: rgba(11,18,32,.10);
    --shadow: 0 26px 80px rgba(11,18,32,.14);

    --a1:#2563eb;
    --a2:#06b6d4;
    --a3:#60a5fa;

    /* ✅ Tabs stay same base color on every page */
    --tabBase: rgba(255,255,255,.78);
    --tabBorder: rgba(11,18,32,.10);
    --tabHover: rgba(11,18,32,.04);
    --tabRing: rgba(37,99,235,.22);

    --danger:#ef4444;

    --pad:14px;
    --padM:10px;
  }

  *{ box-sizing:border-box; }
  html, body{ width:100%; height:100%; margin:0; padding:0; overflow-x:hidden; }
  body{ color: var(--txt); background: transparent; }

  .dash{
    min-height:100dvh;
    width:100%;
    position:relative;
    display:flex;
    flex-direction:column;
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
    overflow-x:hidden;
  }

  /* Background */
  .bg{
    position:fixed;
    inset:0;
    z-index:0;
    pointer-events:none;
    background:
      radial-gradient(900px 520px at 20% 12%, rgba(246,137,35,.25), transparent 60%),
      radial-gradient(900px 520px at 80% 20%, rgba(241,89,112,.22), transparent 58%),
      linear-gradient(180deg, #e44c22 0%, #db4e2a 55%, #ee512d 100%);
  }

  /* Main layout */
  .wrap{
    position:relative;
    z-index:1;
    width:100%;
    max-width:1280px;
    margin:0 auto;

    display:grid;
    grid-template-columns:290px 1fr;
    gap:14px;

    padding: var(--pad);

    flex:1 1 auto;
    min-height:0;

    animation: wrapIn .45s ease both;
  }

  @keyframes wrapIn{
    from{ opacity:0; transform: translateY(10px); }
    to{ opacity:1; transform: translateY(0px); }
  }

  .side, .content{ min-height:0; min-width:0; }

  /* Side + content cards */
  .sideCard{
    height:100%;
    background: var(--card);
    border:1px solid var(--line);
    border-radius:24px;
    padding:14px;
    box-shadow: var(--shadow);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    overflow:hidden;
    position:relative;
  }

  .pageShell{
    height:100%;
    width:100%;
    background: var(--card);
    border:1px solid var(--line);
    border-radius:24px;
    padding:0;              /* ✅ edge-to-edge content (no random padding) */
    box-shadow: var(--shadow);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    overflow:hidden;        /* ✅ prevent inner pages from cutting modals etc */
    position:relative;
    min-height:0;
    display:flex;
    flex-direction:column;
  }

  /* ✅ Scroll only inside outlet area (so pages can be full width) */
  .pageShell > *{
    min-height:0;
  }

  /* Soft glow */
  .sideCard::before,
  .pageShell::before{
    content:"";
    position:absolute;
    inset:-120px -90px auto -90px;
    height:220px;
    background: radial-gradient(circle at 20% 20%,
      rgba(37,99,235,.14),
      rgba(6,182,212,.10),
      rgba(255,255,255,0) 60%
    );
    filter: blur(10px);
    opacity:.95;
    pointer-events:none;
    animation: floatGlow 7s ease-in-out infinite;
  }

  @keyframes floatGlow{
    0%,100%{ transform: translateY(0px) translateX(0px); }
    50%{ transform: translateY(12px) translateX(10px); }
  }

  /* Side header */
  .sideTopRow{
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:10px;
    margin-bottom:10px;
    position:relative;
    z-index:1;
  }

  .sideTitle{
    font-weight:950;
    color: var(--txt);
    font-size:14px;
    letter-spacing:.2px;
  }

  .miniControls{ display:flex; align-items:center; gap:8px; }

  .miniIconBtn{
    border:none;
    cursor:pointer;
    width:38px;
    height:38px;
    border-radius:14px;
    background: rgba(255,255,255,.82);
    border:1px solid var(--line);
    box-shadow: 0 14px 40px rgba(11,18,32,.10);
    display:flex;
    align-items:center;
    justify-content:center;
    font-weight:950;
    color: rgba(11,18,32,.86);
    transition: transform .14s ease, background .14s ease, filter .14s ease;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
  .miniIconBtn:hover{
    transform: translateY(-1px);
    background: rgba(255,255,255,.92);
    filter: brightness(1.01);
  }
  .miniIconBtn:active{ transform: translateY(0px) scale(.99); }

  .miniIconBtn.close{
    border:1px solid rgba(239,68,68,.22);
    color: var(--danger);
    background: rgba(239,68,68,.06);
  }

  .miniArrow{ display:inline-block; font-size:20px; line-height:1; }

  /* Tabs container */
  .tabStrip{ position:relative; z-index:1; }

  .tabList{
    display:flex;
    flex-direction:column;
    gap:10px;
    overflow:hidden;
  }

  /* ✅ Tabs: same base color always (only small ring/glow when active) */
  .tabBtn{
    width:100%;
    display:flex;
    align-items:center;
    gap:10px;

    border:none;
    cursor:pointer;

    padding:11px 12px;
    border-radius:18px;

    background: var(--tabBase);
    border: 1px solid var(--tabBorder);

    font-weight:900;
    color: rgba(11,18,32,.88);

    position:relative;
    flex:0 0 auto;

    transition: transform .14s ease, box-shadow .14s ease, outline-color .14s ease;
    outline: 2px solid transparent;

    overflow:hidden;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  .tabBtn:hover{
    transform: translateY(-1px);
    box-shadow: 0 16px 34px rgba(11,18,32,.10);
    background: var(--tabBase); /* ✅ keep same */
  }
  .tabBtn:active{ transform: translateY(0px) scale(.99); }
  .tabBtn:focus-visible{ outline-color: var(--tabRing); }

  /* ✅ Active: SAME base color, only ring + tiny glow line */
  .tabBtn.active{
    background: var(--tabBase); /* ✅ unchanged */
    outline-color: var(--tabRing);
    box-shadow:
      0 16px 38px rgba(37,99,235,.16),
      0 0 0 2px rgba(37,99,235,.14);
  }

  .tabBtn.active::after{
    content:"";
    position:absolute;
    left:14px;
    right:14px;
    bottom:7px;
    height:3px;
    border-radius:999px;
    background: linear-gradient(90deg, var(--a1), var(--a2), var(--a3));
    opacity:.95;
  }

  .tabDot{
    width:10px; height:10px;
    border-radius:999px;
    background: rgba(11,18,32,.20);
    flex:0 0 auto;
  }

  .tabBtn.active .tabDot{
    background: linear-gradient(90deg, var(--a1), var(--a2));
    box-shadow: 0 0 0 7px rgba(37,99,235,.12);
  }

  .tabText{
    white-space: nowrap;
    max-width: 240px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .tabArrow{ display:none; } /* ✅ keep clean */

  /* Edge fade (mobile horizontal only) */
  .fadeLeft, .fadeRight{ display:none; }

  /* ✅ Content section: make Outlet take full size, scroll inside */
  .content{
    min-height:0;
    min-width:0;
    display:flex;
  }

  .pageShell .outletScroll{
    flex:1 1 auto;
    min-height:0;
    overflow:auto;                 /* ✅ scroll content, not whole card */
    -webkit-overflow-scrolling: touch;
    padding: 16px;                 /* ✅ default inside padding */
  }

  /* ✅ If your inner pages are already full-bleed (edge-to-edge),
     you can remove padding by wrapping Outlet like:
     <div className="outletScroll noPad"><Outlet/></div>
  */
  .pageShell .outletScroll.noPad{ padding:0; }

  /* Footer */
  .footerWrap{
    margin-top:auto;
    position:relative;
    z-index:1;
  }

  /* ✅ Responsive */
  @media (max-width: 980px){
    .wrap{ grid-template-columns: 1fr; }
    .sideCard{ height:auto; }
  }

  /* ✅ MOBILE: tabs full edge-to-edge (no random left/right padding),
     small chips, always fully visible */
  @media (max-width: 740px){
    .wrap{ padding: var(--padM); gap: 10px; }
    .sideCard, .pageShell{ border-radius: 20px; }

    /* mobile tab strip becomes horizontal */
    .tabList{
      flex-direction: row;
      flex-wrap: nowrap;
      overflow-x: auto;
      overflow-y: hidden;
      width: calc(100% + 28px);     /* ✅ bleed to edges */
      margin-left: -14px;           /* ✅ remove card padding feel */
      margin-right: -14px;
      gap: 8px;
      padding: 8px 14px 10px;       /* ✅ edge-to-edge inside card */

      -webkit-overflow-scrolling: touch;
      overscroll-behavior-x: contain;
      touch-action: pan-x;
      scroll-behavior: smooth;
      scrollbar-width: none;

      scroll-snap-type: x mandatory;
    }
    .tabList::-webkit-scrollbar{ height:0; }

    /* chips */
    .tabBtn{
      width:auto;
      min-width: max-content;
      padding: 9px 12px;
      border-radius: 999px;
      font-size: 12px;
      box-shadow: 0 10px 24px rgba(11,18,32,.08);
      scroll-snap-align: start;
      background: var(--tabBase);        /* ✅ same */
      border: 1px solid var(--tabBorder);
    }

    .tabDot{ width:8px; height:8px; }

    .tabText{
      max-width: none;                  /* ✅ no cut on mobile */
      white-space: nowrap;
    }

    /* active still same base, only ring */
    .tabBtn.active{
      background: var(--tabBase);       /* ✅ same */
      box-shadow:
        0 14px 30px rgba(37,99,235,.18),
        0 0 0 2px rgba(37,99,235,.18);
    }

    .tabBtn.active::after{
      left: 12px;
      right: 12px;
      bottom: 6px;
      height: 2px;
    }

    /* show fades on mobile */
    .fadeLeft,
    .fadeRight{
      position:absolute;
      top: 46px;
      height: 52px;
      width: 18px;
      pointer-events:none;
      display:block;
      z-index: 2;
    }
    .fadeLeft{ left: 0; background: linear-gradient(90deg, rgba(255,255,255,.96), rgba(255,255,255,0)); }
    .fadeRight{ right: 0; background: linear-gradient(270deg, rgba(255,255,255,.96), rgba(255,255,255,0)); }
  }

  @media (prefers-reduced-motion: reduce){
    .wrap{ animation:none; }
    .sideCard::before, .pageShell::before{ animation:none; }
    .tabBtn, .miniIconBtn{ transition:none; }
  }
`;
