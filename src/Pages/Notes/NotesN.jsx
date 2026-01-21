import React, { useMemo, useState, useEffect } from "react";
import AddNote from "../Notes/AddNote";
import GetNote from "../Notes/GetNote";

export default function NotesN() {
  const [activeTab, setActiveTab] = useState("add");
  const [animKey, setAnimKey] = useState(0);

  const isAdd = activeTab === "add";
  const isGet = activeTab === "get";

  const subtitle = useMemo(() => {
    return isAdd
      ? "Add a new note with optional image. Date/Time auto (IST)."
      : "View your notes list. Update or delete anytime.";
  }, [isAdd]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setAnimKey((k) => k + 1);
  };

  // ✅ Only content scroll (tabs/header stay fixed on top)
  useEffect(() => {
    // when tab changes, scroll content to top
    const el = document.getElementById("notesn-scroll");
    if (el) el.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);

  return (
    <>
      <div className="notesn-page">
        <div className="notesn-card">
          {/* ✅ STICKY HEADER + TABS (no scroll) */}
          <div className="notesn-sticky">
            {/* HEADER */}
            <div className="notesn-header">
              <div className="notesn-badgeRow">
                <div className="notesn-badge">NOTES DASHBOARD</div>
                <div className="notesn-badgeMini">
                  Bright • Clean • Professional
                </div>
              </div>

              <h1 className="notesn-title">Notes Dashboard</h1>
              <p className="notesn-subtitle">{subtitle}</p>
            </div>

            {/* TABS */}
            <div className="notesn-tabsWrap">
              <div className="notesn-tabs" role="tablist" aria-label="Notes Tabs">
                <button
                  type="button"
                  role="tab"
                  aria-selected={isAdd}
                  className={`notesn-tab ${isAdd ? "active add" : ""}`}
                  onClick={() => handleTabClick("add")}
                >
                  <span className="notesn-tabIcon">✍️</span>
                  <span className="notesn-tabText">Add</span>
                  <span className="notesn-tabGlow" />
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={isGet}
                  className={`notesn-tab ${isGet ? "active get" : ""}`}
                  onClick={() => handleTabClick("get")}
                >
                  <span className="notesn-tabIcon">📚</span>
                  <span className="notesn-tabText">Get</span>
                  <span className="notesn-tabGlow" />
                </button>
              </div>

              <div className="notesn-hint">
                Tip: Use <b>Update</b> to edit and <b>Delete</b> to remove.
              </div>
            </div>
          </div>

          {/* ✅ ONLY THIS AREA SCROLLS */}
          <div id="notesn-scroll" className="notesn-scroll" role="tabpanel">
            <div
              key={animKey}
              className={`notesn-pane ${isAdd ? "inLeft" : "inRight"}`}
            >
              {/* ✅ children keep their own popups centered (not full page) */}
              {isAdd ? <AddNote /> : <GetNote />}
            </div>
          </div>
        </div>
      </div>

      <style>{css}</style>
    </>
  );
}

const css = `
  *{ box-sizing:border-box; }
  html,body{ height:100%; margin:0; }
  body{
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji";
    color:#0f172a;
    background:
      radial-gradient(1000px 700px at 10% 0%, rgba(37,99,235,.18), transparent 55%),
      radial-gradient(900px 650px at 90% 12%, rgba(236,72,153,.16), transparent 55%),
      radial-gradient(900px 650px at 50% 100%, rgba(6,182,212,.14), transparent 55%),
      linear-gradient(180deg, #ffffff, #f3f7ff);
  }

  :root{
    --text:#0f172a;
    --muted: rgba(15,23,42,.70);
    --line: rgba(15,23,42,.10);
    --shadow: 0 18px 55px rgba(15,23,42,.14);
    --radius: 22px;

    --addA:#2563eb;
    --addB:#ec4899;

    --getA:#10b981;
    --getB:#06b6d4;

    --pad: clamp(12px, 3.2vw, 18px);
  }

  /* ✅ full width on mobile */
  .notesn-page{
    min-height:100vh;
    width:100%;
    display:flex;
    align-items:stretch;
    justify-content:center;
    padding: 0;
  }

  .notesn-card{
    width:100%;
    min-height:100vh;
    border: 0;
    border-radius: 0;
    box-shadow: none;
    overflow:hidden;
    background:
      linear-gradient(180deg, rgba(255,255,255,.70), rgba(255,255,255,.95)),
      radial-gradient(1200px 700px at 10% 10%, rgba(37,99,235,.10), transparent 60%),
      radial-gradient(900px 650px at 90% 15%, rgba(236,72,153,.10), transparent 55%),
      radial-gradient(900px 650px at 30% 100%, rgba(6,182,212,.10), transparent 60%);
    display:flex;
    flex-direction:column;
  }

  /* ✅ premium only on desktop */
  @media (min-width: 720px){
    .notesn-page{ padding: 26px; }
    .notesn-card{
      min-height: calc(100vh - 52px);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      max-width: 1020px;
    }
  }

  /* ✅ sticky area (header + tabs do NOT scroll) */
  .notesn-sticky{
    position: sticky;
    top: 0;
    z-index: 50;
    background: rgba(255,255,255,.82);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--line);
  }

  /* Header */
  .notesn-header{
    padding: 14px var(--pad) 10px;
  }

  .notesn-badgeRow{
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap: 10px;
    flex-wrap:wrap;
  }

  .notesn-badge{
    display:inline-flex;
    align-items:center;
    padding: 6px 10px;
    font-size: 11px;
    letter-spacing: .12em;
    font-weight: 1000;
    border-radius: 999px;
    color: rgba(37,99,235,1);
    background: rgba(37,99,235,.10);
    border: 1px solid rgba(37,99,235,.18);
  }

  .notesn-badgeMini{
    font-size: 11px;
    font-weight: 900;
    color: rgba(15,23,42,.75);
    background: rgba(255,255,255,.78);
    border: 1px solid rgba(15,23,42,.10);
    border-radius: 999px;
    padding: 6px 10px;
  }

  .notesn-title{
    margin: 10px 0 6px;
    font-size: 18px;      /* ✅ small on mobile */
    line-height: 1.15;
    font-weight: 1200;
    letter-spacing: -0.02em;
    color: rgba(15,23,42,.95);
  }

  .notesn-subtitle{
    margin: 0;
    font-size: 12.5px;
    line-height: 1.45;
    font-weight: 900;
    color: var(--muted);
  }

  /* Tabs wrapper */
  .notesn-tabsWrap{
    padding: 10px var(--pad) 12px;
  }

  .notesn-tabs{
    display:grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    background: rgba(255,255,255,.78);
    border: 1px solid rgba(15,23,42,.10);
    border-radius: 14px;
    padding: 8px;
  }

  /* ✅ tabs compact on mobile */
  .notesn-tab{
    position:relative;
    border: 1px solid rgba(15,23,42,.10);
    background: rgba(255,255,255,.92);
    color: rgba(15,23,42,.92);
    padding: 10px 10px;         /* ✅ smaller */
    border-radius: 12px;
    cursor:pointer;
    outline:none;
    display:flex;
    align-items:center;
    justify-content:center;
    gap: 8px;
    font-weight: 1200;
    transition: transform .16s ease, box-shadow .16s ease, border-color .16s ease, filter .16s ease;
    overflow:hidden;
    user-select:none;
    -webkit-tap-highlight-color: transparent;
    min-height: 42px;           /* ✅ not too big */
  }

  .notesn-tabIcon{ font-size: 15px; }
  .notesn-tabText{ font-size: 13px; }

  .notesn-tab:hover{
    border-color: rgba(37,99,235,.18);
    box-shadow: 0 14px 32px rgba(15,23,42,.10);
    transform: translateY(-1px);
    filter: brightness(1.01);
  }

  .notesn-tab:active{ transform: scale(.985); }

  .notesn-tabGlow{
    position:absolute;
    inset:-2px;
    border-radius: 14px;
    opacity: 0;
    transition: opacity .22s ease;
    filter: blur(14px);
    z-index:0;
  }
  .notesn-tab > *{ position:relative; z-index:1; }

  .notesn-tab.active.add{
    background: linear-gradient(135deg, rgba(37,99,235,.94), rgba(236,72,153,.90));
    border-color: rgba(37,99,235,.28);
    box-shadow: 0 14px 34px rgba(37,99,235,.16);
    color:#fff;
  }
  .notesn-tab.active.add .notesn-tabGlow{
    opacity: 1;
    background: radial-gradient(circle at 30% 20%, rgba(37,99,235,.55), transparent 55%),
                radial-gradient(circle at 70% 80%, rgba(236,72,153,.45), transparent 55%);
  }

  .notesn-tab.active.get{
    background: linear-gradient(135deg, rgba(16,185,129,.94), rgba(6,182,212,.90));
    border-color: rgba(16,185,129,.28);
    box-shadow: 0 14px 34px rgba(16,185,129,.14);
    color:#fff;
  }
  .notesn-tab.active.get .notesn-tabGlow{
    opacity: 1;
    background: radial-gradient(circle at 30% 20%, rgba(16,185,129,.55), transparent 55%),
                radial-gradient(circle at 70% 80%, rgba(6,182,212,.45), transparent 55%);
  }

  .notesn-hint{
    margin-top: 10px;
    font-size: 12px;
    font-weight: 950;
    color: rgba(15,23,42,.78);
    background: rgba(6,182,212,.08);
    border: 1px solid rgba(6,182,212,.14);
    padding: 9px 10px;
    border-radius: 14px;
  }

  /* ✅ ONLY CONTENT SCROLLS */
  .notesn-scroll{
    flex: 1 1 auto;
    min-height: 0;                 /* ✅ important for flex scroll */
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    padding: 0;                    /* ✅ keep edge-to-edge */
  }

  .notesn-pane{
    width:100%;
    margin:0;
    padding:0;
    animation: .32s ease both;
  }

  .notesn-pane.inLeft{ animation-name: paneInLeft; }
  .notesn-pane.inRight{ animation-name: paneInRight; }

  @keyframes paneInLeft{
    0%{ opacity: 0; transform: translateX(-8px) translateY(2px); }
    100%{ opacity: 1; transform: translateX(0) translateY(0); }
  }
  @keyframes paneInRight{
    0%{ opacity: 0; transform: translateX(8px) translateY(2px); }
    100%{ opacity: 1; transform: translateX(0) translateY(0); }
  }

  /* ✅ desktop: slightly bigger (but not too much) */
  @media (min-width: 720px){
    .notesn-title{ font-size: 22px; }
    .notesn-subtitle{ font-size: 13px; }
    .notesn-tab{ padding: 12px 12px; min-height: 46px; }
    .notesn-tabIcon{ font-size: 16px; }
    .notesn-tabText{ font-size: 14px; }
  }
`;
