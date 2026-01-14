import React, { useMemo, useState } from "react";
import Measure from "./Measure";
import Calculator from "./Calculator";

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

      {/* ✅ Full screen panel with ZERO padding (so Measure/Calculator can be full screen) */}
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

          {active === "notes" && (
            <div className="placeholder">
              <div className="phTitle">Notes Tool</div>
              <div className="phText">Add Notes.jsx and import it here.</div>
            </div>
          )}

          {active === "checklist" && (
            <div className="placeholder">
              <div className="phTitle">Checklist Tool</div>
              <div className="phText">Add Checklist.jsx and import it here.</div>
            </div>
          )}
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

    --accent1:#2563eb;  /* blue */
    --accent2:#7c3aed;  /* purple */
    --soft:#eef2ff;
  }

  /* ✅ Full page (no outside padding at all) */
  .impTabsPage{
    width:100%;
    min-height:100vh;
    background: var(--bg);
    overflow-x:hidden;
  }

  /* ✅ Header: full width bar */
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

  /* ✅ Tabs: full width, sticky-looking strip */
  .stripWrap{
    width:100%;
    border-bottom: 1px solid var(--border);
    background: #fff;
  }

  .strip{
    width:100%;
    display:flex;
    gap:10px;
    overflow-x:auto;
    padding: 10px 12px;
    scrollbar-width:none;
    -webkit-overflow-scrolling: touch;
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
    background: linear-gradient(135deg, rgba(37,99,235,.12), rgba(124,58,237,.10));
    border-color: rgba(37,99,235,.25);
    outline: 2px solid rgba(37,99,235,.12);
  }

  /* ✅ Panel: FULL screen content, no padding */
  .panel{
    width:100%;
    min-height: calc(100vh - 120px);
    background: transparent;
    padding: 0;
    margin: 0;
  }

  /* Panel top info with light padding only */
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

  /* ✅ Here we remove ALL padding so inner pages (Measure/Calculator) are edge-to-edge */
  .contentShell{
    width:100%;
    max-width:100%;
    padding: 0;
    margin: 0;
  }

  /* Placeholders (if needed) */
  .placeholder{
    width:100%;
    background:#fff;
    border-top: 1px solid var(--border);
    padding: 16px;
  }
  .phTitle{
    font-size:13px;
    font-weight:1000;
    color: var(--text);
    margin-bottom:6px;
  }
  .phText{
    font-size:12px;
    font-weight:800;
    color: var(--muted);
    line-height:1.45;
  }

  /* Desktop spacing */
  @media (min-width: 900px){
    .sub{ max-width: 520px; }
    .chip{ min-width: 160px; }
    .panel{ min-height: calc(100vh - 124px); }
  }
`;
