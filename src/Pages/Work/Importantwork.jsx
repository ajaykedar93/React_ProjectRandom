import React, { useMemo, useState } from "react";
import Measure from "./Measure";
import Calculator from "./Calculator";
import NotesN from "./NotesN"; // ✅ ADD THIS (same folder)
import Checklist from "./Checklist"; // ✅ already

export default function Importantwork() {
  const tabs = useMemo(
    () => [
      { key: "measure", label: "Measure", icon: "📏" },
      { key: "calculator", label: "Calculator", icon: "🧮" },
      { key: "notes", label: "Notes", icon: "📝" },
      { key: "checklist", label: "Checklist", icon: "✅" },
    ],
    []
  );

  const [active, setActive] = useState("measure");

  return (
    <div className="impTabsPage">
      <style>{css}</style>

      {/* ✅ Full width header (no outside padding) */}
      <div className="head">
        <div className="headLeft">
          <div className="bolt" aria-hidden="true">
            ⚡
          </div>
          <div className="headTxt">
            <div className="title">Important Work</div>
            <div className="sub">Measure • Calculator • Notes • Checklist</div>
          </div>
        </div>

        <div className="pill" aria-hidden="true">
          Tools
        </div>
      </div>

      {/* ✅ Full width tabs (edge-to-edge) */}
      <div className="stripWrap">
        <div className="strip" role="tablist" aria-label="Important Work Tabs">
          {tabs.map((t) => {
            const isActive = active === t.key;
            return (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`chip ${isActive ? "active" : ""}`}
                onClick={() => setActive(t.key)}
              >
                <span className="emoji" aria-hidden="true">
                  {t.icon}
                </span>
                <span className="lbl">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ✅ Full screen panel with ZERO padding (so inner pages can be full screen) */}
      <div className="panel">
        {/* Panel top info (small) */}
        <div className="panelTop">
          <div className="panelTitle">
            {active === "measure" && "Measure"}
            {active === "calculator" && "Calculator"}
            {active === "notes" && "Notes"}
            {active === "checklist" && "Checklist"}
          </div>
          <div className="panelDesc">
            {active === "measure" && "Convert meter to cm, mm, inch and ft."}
            {active === "calculator" && "Fast calculations without leaving dashboard."}
            {active === "notes" && "Save your quick important notes."}
            {active === "checklist" && "Track tasks and mark them done."}
          </div>
        </div>

        {/* ✅ content: edge-to-edge */}
        <div className="contentShell">
          {active === "measure" && <Measure />}
          {active === "calculator" && <Calculator />}

          {/* ✅ SHOW Notes page here */}
          {active === "notes" && <NotesN />}

          {/* ✅ SHOW Checklist page here */}
          {active === "checklist" && <Checklist />}
        </div>
      </div>
    </div>
  );
}

const css = `
  *{ box-sizing:border-box; }

  :root{
    --bg:#f3f6fb;
    --card:#ffffff;
    --border:#e6eaf2;
    --text:#111827;
    --muted:#6b7280;

    --a1:#2563eb;  /* blue */
    --a2:#7c3aed;  /* purple */
    --a3:#06b6d4;  /* cyan */

    --soft:#eef2ff;
  }

  .impTabsPage{
    width:100%;
    min-height:100vh;
    background: var(--bg);
    overflow-x:hidden;
  }

  /* HEADER */
  .head{
    width:100%;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:12px;
    padding: 14px 14px;
    background: linear-gradient(135deg, rgba(37,99,235,.10), rgba(124,58,237,.10));
    border-bottom: 1px solid var(--border);
  }

  .headLeft{
    display:flex;
    align-items:center;
    gap:12px;
    min-width:0;
  }

  .bolt{
    width:44px;
    height:44px;
    border-radius:14px;
    display:grid;
    place-items:center;
    font-size:18px;
    background: linear-gradient(135deg, rgba(37,99,235,.18), rgba(124,58,237,.14));
    border: 1px solid rgba(37,99,235,.18);
    flex:0 0 auto;
  }

  .title{
    font-family: "Georgia","Times New Roman",Times,serif;
    font-size: 18px;
    font-weight: 900;
    color: #4b1d6d;
    letter-spacing:.2px;
    line-height:1.1;
  }

  .sub{
    margin-top:3px;
    font-size:12px;
    font-weight:800;
    color: var(--muted);
    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis;
    max-width: 62vw;
  }

  .pill{
    font-size:11px;
    font-weight:900;
    padding:8px 12px;
    border-radius:999px;
    background:#fff;
    border:1px solid var(--border);
    color: rgba(17,24,39,.75);
    flex:0 0 auto;
  }

  /* TABS STRIP */
  .stripWrap{
    width:100%;
    border-bottom: 1px solid var(--border);
    background: rgba(255,255,255,.90);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  .strip{
    width:100%;
    display:flex;
    gap:10px;
    overflow-x:auto;
    padding: 10px 12px;
    scrollbar-width:none;
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
  }
  .strip::-webkit-scrollbar{ height:0; }

  .chip{
    border:none;
    cursor:pointer;
    flex:0 0 auto;
    display:flex;
    align-items:center;
    gap:8px;
    padding:10px 12px;
    border-radius:14px;
    background: #fff;
    border: 1px solid var(--border);
    box-shadow: 0 10px 24px rgba(17,24,39,.06);
    font-weight:900;
    color: rgba(17,24,39,.85);
    min-width: 140px;
    transition: transform .14s ease, box-shadow .14s ease, background .14s ease, border-color .14s ease, outline-color .14s ease;
    outline: 2px solid transparent;
    position: relative;
  }

  .chip:hover{
    transform: translateY(-1px);
    box-shadow: 0 16px 36px rgba(17,24,39,.10);
  }

  .chip:active{ transform: translateY(0px) scale(.99); }

  .chip:focus-visible{
    outline-color: rgba(37,99,235,.35);
  }

  .chip .emoji{ font-size:16px; }

  .chip .lbl{
    font-size:12px;
    max-width: 110px;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
  }

  .chip.active{
    background: linear-gradient(135deg, rgba(37,99,235,.14), rgba(124,58,237,.12), rgba(6,182,212,.08));
    border-color: rgba(37,99,235,.28);
    outline: 2px solid rgba(37,99,235,.14);
    box-shadow: 0 18px 42px rgba(37,99,235,.18);
  }

  .chip.active::after{
    content:"";
    position:absolute;
    left: 12px;
    right: 12px;
    bottom: 7px;
    height: 2px;
    border-radius: 999px;
    background: linear-gradient(90deg, var(--a1), var(--a2), var(--a3));
    opacity: .95;
  }

  /* PANEL */
  .panel{
    width:100%;
    min-height: calc(100vh - 120px);
    background: transparent;
    padding: 0;
    margin: 0;
  }

  .panelTop{
    padding: 12px 14px;
  }

  .panelTitle{
    font-size:14px;
    font-weight: 1000;
    color: var(--text);
    margin-bottom: 3px;
  }

  .panelDesc{
    font-size:12px;
    font-weight:800;
    color: var(--muted);
  }

  .contentShell{
    width:100%;
    max-width:100%;
    padding: 0;
    margin: 0;
  }

  /* ✅ MOBILE: PROFESSIONAL TABS (small + modern + glow) */
  @media (max-width: 640px){
    .strip{
      gap: 8px;
      padding: 10px 10px 12px;
      scroll-snap-type: x mandatory;
    }

    .chip{
      min-width: max-content;
      border-radius: 999px;          /* chip style */
      padding: 9px 12px;             /* small */
      box-shadow: 0 10px 22px rgba(17,24,39,.08);
      background: rgba(255,255,255,.82);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      scroll-snap-align: start;
    }

    .chip .emoji{ font-size: 15px; }

    /* ✅ allow label to show more (no cut) */
    .chip .lbl{
      max-width: none;
      white-space: nowrap;
      overflow: visible;
      text-overflow: unset;
    }

    /* ✅ active = modern ring + glow */
    .chip.active{
      background: linear-gradient(135deg,
        rgba(37,99,235,.22),
        rgba(124,58,237,.18),
        rgba(6,182,212,.14)
      );
      box-shadow:
        0 16px 34px rgba(37,99,235,.26),
        0 0 0 2px rgba(37,99,235,.22);
      border-color: rgba(37,99,235,.35);
    }

    .chip.active::after{
      left: 14px;
      right: 14px;
      bottom: 6px;
      height: 2px;
    }

    /* header text small */
    .title{ font-size: 17px; }
    .sub{ max-width: 70vw; }
  }

  /* Desktop spacing */
  @media (min-width: 900px){
    .sub{ max-width: 520px; }
    .chip{ min-width: 160px; }
    .panel{ min-height: calc(100vh - 124px); }
  }
`;
