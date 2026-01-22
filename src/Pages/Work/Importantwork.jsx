import React, { useMemo, useState } from "react";
import Measure from "./Measure";
import Calculator from "./Calculator";
import NotesN from "../Notes/NotesN";
import Checklist from "../Checklist/Checklist";

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

  // ✅ Ripple effect (pure CSS + JS)
  const makeRipple = (e) => {
    const btn = e.currentTarget;
    const old = btn.querySelector(".rip");
    if (old) old.remove();

    const circle = document.createElement("span");
    circle.className = "rip";

    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    circle.style.width = circle.style.height = `${size}px`;
    circle.style.left = `${e.clientX - rect.left - size / 2}px`;
    circle.style.top = `${e.clientY - rect.top - size / 2}px`;

    btn.appendChild(circle);
    circle.addEventListener("animationend", () => circle.remove());
  };

  const onTabClick = (key) => (e) => {
    makeRipple(e);
    setActive(key);
  };

  return (
    <div className="impTabsPage">
      <style>{css}</style>

      {/* ✅ Premium header */}
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

      {/* ✅ Tabs */}
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
                onClick={onTabClick(t.key)}
              >
                <span className="emoji" aria-hidden="true">
                  {t.icon}
                </span>
                <span className="lbl">{t.label}</span>
                {/* ✅ subtle shine layer */}
                <span className="shine" aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel */}
      <div className="panel">
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

        <div className="contentShell">
          {active === "measure" && <Measure />}
          {active === "calculator" && <Calculator />}
          {active === "notes" && <NotesN />}
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
    --shadow: 0 14px 36px rgba(17,24,39,.08);
    --shadow2: 0 18px 46px rgba(37,99,235,.16);

    --pad: clamp(12px, 2.8vw, 18px);
  }

  .impTabsPage{
    width:100%;
    min-height:100vh;
    background:
      radial-gradient(900px 520px at 15% 0%, rgba(37,99,235,.10), transparent 60%),
      radial-gradient(900px 520px at 90% 10%, rgba(124,58,237,.10), transparent 60%),
      radial-gradient(900px 520px at 50% 95%, rgba(6,182,212,.10), transparent 60%),
      linear-gradient(180deg, #ffffff, var(--bg));
    overflow-x:hidden;
  }

  /* HEADER */
  .head{
    width:100%;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:12px;
    padding: 14px var(--pad);
    background: rgba(255,255,255,.72);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
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
    border-radius:16px;
    display:grid;
    place-items:center;
    font-size:18px;
    background: linear-gradient(135deg, rgba(37,99,235,.18), rgba(124,58,237,.14));
    border: 1px solid rgba(37,99,235,.18);
    box-shadow: var(--shadow);
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
    box-shadow: 0 10px 22px rgba(17,24,39,.06);
    flex:0 0 auto;
  }

  /* TABS STRIP */
  .stripWrap{
    width:100%;
    border-bottom: 1px solid var(--border);
    background: rgba(255,255,255,.78);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  .strip{
    width:100%;
    display:flex;
    gap:10px;
    overflow-x:auto;
    padding: 10px var(--pad) 12px;
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
    padding:10px 13px;
    border-radius:999px;
    background: rgba(255,255,255,.88);
    border: 1px solid rgba(17,24,39,.08);
    box-shadow: 0 12px 26px rgba(17,24,39,.06);
    font-weight:950;
    color: rgba(17,24,39,.86);
    transition: transform .14s ease, box-shadow .14s ease, background .14s ease, border-color .14s ease;
    outline: 2px solid transparent;
    position: relative;
    overflow:hidden;
    user-select:none;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  /* subtle shine */
  .chip .shine{
    position:absolute;
    inset:0;
    background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,.35) 45%, transparent 90%);
    transform: translateX(-120%);
    transition: transform .6s ease;
    pointer-events:none;
  }
  @media (hover:hover){
    .chip:hover .shine{ transform: translateX(120%); }
  }

  .chip:active{ transform: scale(.985); }

  .chip:focus-visible{
    outline-color: rgba(37,99,235,.30);
  }

  .chip .emoji{ font-size:16px; }
  .chip .lbl{
    font-size:12px;
    white-space:nowrap;
  }

  /* ✅ Active tab: glow + underline + premium gradient */
  .chip.active{
    background: linear-gradient(135deg,
      rgba(37,99,235,.18),
      rgba(124,58,237,.16),
      rgba(6,182,212,.12)
    );
    border-color: rgba(37,99,235,.30);
    box-shadow:
      0 16px 36px rgba(37,99,235,.22),
      0 0 0 2px rgba(37,99,235,.14);
  }

  .chip.active::after{
    content:"";
    position:absolute;
    left: 14px;
    right: 14px;
    bottom: 7px;
    height: 2px;
    border-radius: 999px;
    background: linear-gradient(90deg, var(--a1), var(--a2), var(--a3));
    opacity: .95;
  }

  /* ✅ Ripple */
  .rip{
    position:absolute;
    border-radius:999px;
    background: rgba(37,99,235,.22);
    transform: scale(0);
    animation: ripple .55s ease-out;
    pointer-events:none;
  }
  @keyframes ripple{
    to{ transform: scale(2.6); opacity:0; }
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
    padding: 12px var(--pad);
  }

  .panelTitle{
    font-size:14px;
    font-weight: 1000;
    color: rgba(17,24,39,.92);
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

  /* Mobile */
  @media (max-width: 640px){
    .title{ font-size: 17px; }
    .sub{ max-width: 70vw; }
    .chip{ padding: 9px 12px; }
    .chip .emoji{ font-size: 15px; }
  }

  /* Desktop: make tabs look centered like professional navbar */
  @media (min-width: 900px){
    .sub{ max-width: 520px; }
    .strip{
      justify-content:center;
      gap: 12px;
      padding: 12px 18px 14px;
    }
    .chip{ padding: 11px 16px; }
    .panel{ min-height: calc(100vh - 124px); }
  }
`;
