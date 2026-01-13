import React, { useMemo, useState } from "react";
import Measure from "./Measure"; // Pages/Work/Measure.jsx

/**
 * Pages/Work/Importantwork.jsx
 * ✅ Single page (NO App.jsx extra routes needed)
 * ✅ Tabs switch inside same component
 * ✅ Full width / edge-to-edge inside panel
 * ✅ No overflow / no outside cut
 * ✅ Consistent padding + cards container
 */
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

      {/* Header */}
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

      {/* Tabs */}
      <div className="stripWrap">
        <div className="fadeL" aria-hidden="true" />
        <div className="fadeR" aria-hidden="true" />

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
                <span className="shine" aria-hidden="true" />
                <span className="underline" aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="panel">
        <div className="panelIn">
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

          {/* ✅ FULL WIDTH CONTENT AREA (edge-to-edge inside panel) */}
          <div className="contentShell">
            {active === "measure" && <Measure />}

            {active === "calculator" && (
              <div className="toolCard">
                <div className="toolCardTitle">Calculator Tool</div>
                <div className="toolCardText">
                  Add Calculator.jsx and import it like Measure to show full UI here.
                </div>
              </div>
            )}

            {active === "notes" && (
              <div className="toolCard">
                <div className="toolCardTitle">Notes Tool</div>
                <div className="toolCardText">
                  Add Notes.jsx and import it like Measure to show full UI here.
                </div>
              </div>
            )}

            {active === "checklist" && (
              <div className="toolCard">
                <div className="toolCardTitle">Checklist Tool</div>
                <div className="toolCardText">
                  Add Checklist.jsx and import it like Measure to show full UI here.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const css = `
  *{ box-sizing: border-box; }

  /* ✅ stop any side overflow */
  .impTabsPage{
    width: 100%;
    max-width: 100%;
    min-height: 100%;
    overflow-x: hidden;
    animation: in .32s ease both;
  }

  /* ✅ any child won't push outside */
  .impTabsPage *{
    max-width: 100%;
  }

  @keyframes in{
    from{ opacity: 0; transform: translateY(10px); }
    to{ opacity: 1; transform: translateY(0); }
  }

  /* Header */
  .head{
    width: 100%;
    display:flex;
    align-items:center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px;
    border-radius: 22px;

    background: rgba(255,255,255,.62);
    border: 1px solid rgba(0,0,0,.06);
    box-shadow: 0 18px 50px rgba(0,0,0,.09);
    position: relative;
    overflow: hidden;
  }

  .head::before{
    content:"";
    position:absolute;
    inset:-120px -90px auto -90px;
    height: 220px;
    background: radial-gradient(circle at 20% 20%,
      rgba(239,68,68,.16),
      rgba(168,85,247,.10),
      rgba(255,255,255,0) 62%
    );
    filter: blur(10px);
    opacity: .9;
    animation: floatGlow 7s ease-in-out infinite;
    pointer-events:none;
  }

  @keyframes floatGlow{
    0%,100%{ transform: translateY(0px) translateX(0px); }
    50%{ transform: translateY(14px) translateX(10px); }
  }

  .headLeft{
    display:flex;
    align-items:center;
    gap: 12px;
    position: relative;
    z-index: 1;
    min-width: 0;
  }

  .bolt{
    width: 46px;
    height: 46px;
    border-radius: 18px;
    display:grid;
    place-items:center;
    font-size: 18px;
    background: linear-gradient(135deg, rgba(239,68,68,.22), rgba(251,113,133,.16));
    border: 1px solid rgba(239,68,68,.18);
    box-shadow: 0 18px 40px rgba(239,68,68,.14);
    flex: 0 0 auto;
  }

  .title{
    font-size: 16px;
    font-weight: 1100;
    color: #111827;
    letter-spacing: .2px;
    line-height: 1.1;
  }
  .sub{
    margin-top: 4px;
    font-size: 12px;
    font-weight: 850;
    color: rgba(7,17,38,.62);
    line-height: 1.25;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 58vw;
  }

  .pill{
    position: relative;
    z-index: 1;
    font-size: 11px;
    font-weight: 1100;
    padding: 8px 12px;
    border-radius: 999px;
    background: rgba(255,255,255,.72);
    border: 1px solid rgba(0,0,0,.06);
    color: rgba(7,17,38,.75);
    white-space: nowrap;
    flex: 0 0 auto;
  }

  /* Tabs */
  .stripWrap{
    margin-top: 12px;
    position: relative;
    width: 100%;
  }

  .strip{
    width: 100%;
    display:flex;
    gap: 10px;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 6px 6px 10px;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-x: contain;
  }
  .strip::-webkit-scrollbar{ height: 0; }

  .chip{
    position: relative;
    border: none;
    cursor: pointer;
    flex: 0 0 auto;

    display:flex;
    align-items:center;
    gap: 7px;

    padding: 9px 10px;
    border-radius: 16px;

    background: rgba(255,255,255,.62);
    border: 1px solid rgba(0,0,0,.06);
    box-shadow: 0 14px 36px rgba(0,0,0,.08);

    font-weight: 1050;
    color: rgba(7,17,38,.86);

    transition: transform .14s ease, filter .14s ease, box-shadow .14s ease;
    overflow: hidden;

    min-width: 34vw;
    max-width: 54vw;
    white-space: nowrap;
  }

  .chip:hover{ transform: translateY(-1px); filter: brightness(1.02); }
  .chip:active{ transform: translateY(0px) scale(.99); }

  .emoji{ font-size: 15px; flex: 0 0 auto; }
  .lbl{
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 32vw;
  }

  .chip.active{
    background: linear-gradient(180deg, rgba(239,68,68,.14), rgba(255,255,255,.72));
    outline: 2px solid rgba(239,68,68,.24);
    box-shadow: 0 18px 48px rgba(239,68,68,.12);
  }

  .underline{
    position:absolute;
    left: 12px;
    right: 12px;
    bottom: 7px;
    height: 3px;
    border-radius: 999px;
    background: linear-gradient(90deg, rgba(239,68,68,1), rgba(251,113,133,1), rgba(168,85,247,.85));
    transform: scaleX(0);
    transform-origin: left;
    transition: transform .18s ease;
    opacity: .95;
  }
  .chip.active .underline{ transform: scaleX(1); }

  .shine{
    position:absolute;
    top:-50%;
    left:-65%;
    width: 60%;
    height: 220%;
    transform: rotate(18deg);
    background: linear-gradient(90deg,
      rgba(255,255,255,0),
      rgba(255,255,255,.20),
      rgba(255,255,255,0)
    );
    transition: left .55s ease;
    pointer-events:none;
  }
  .chip:hover .shine{ left: 120%; }

  .fadeL,
  .fadeR{
    position:absolute;
    top: 0;
    bottom: 0;
    width: 18px;
    pointer-events:none;
    z-index: 2;
  }
  .fadeL{ left: 0; background: linear-gradient(90deg, rgba(255,255,255,.90), rgba(255,255,255,0)); }
  .fadeR{ right: 0; background: linear-gradient(270deg, rgba(255,255,255,.90), rgba(255,255,255,0)); }

  /* Panel */
  .panel{
    margin-top: 12px;
    width: 100%;
    max-width: 100%;
    background: rgba(255,255,255,.58);
    border: 1px solid rgba(0,0,0,.06);
    border-radius: 22px;

    /* ✅ panel padding */
    padding: 14px;

    box-shadow: 0 22px 60px rgba(0,0,0,.10);
    position: relative;
    overflow: hidden;
  }

  .panel::before{
    content:"";
    position:absolute;
    inset:-140px -120px auto -120px;
    height: 260px;
    background: radial-gradient(circle at 20% 20%,
      rgba(59,130,246,.14),
      rgba(168,85,247,.10),
      rgba(255,255,255,0) 62%
    );
    filter: blur(10px);
    opacity: .85;
    pointer-events:none;
  }

  .panelIn{
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 100%;
    animation: panelIn .25s ease both;
  }

  @keyframes panelIn{
    from{ opacity: 0; transform: translateY(8px); }
    to{ opacity: 1; transform: translateY(0); }
  }

  .panelTop{ margin-bottom: 12px; }
  .panelTitle{
    font-size: 15px;
    font-weight: 1100;
    color: #111827;
    margin-bottom: 4px;
  }
  .panelDesc{
    font-size: 12px;
    font-weight: 850;
    color: rgba(7,17,38,.62);
    line-height: 1.35;
  }

  /* ✅ This makes inside content full width (edge-to-edge INSIDE panel) */
  .contentShell{
    width: 100%;
    max-width: 100%;
    overflow: hidden;
  }

  /* Placeholder cards */
  .toolCard{
    width: 100%;
    background: rgba(255,255,255,.72);
    border: 1px solid rgba(0,0,0,.06);
    border-radius: 20px;
    padding: 14px;
    box-shadow: 0 18px 46px rgba(0,0,0,.08);
  }
  .toolCardTitle{
    font-size: 13px;
    font-weight: 1100;
    color: #111827;
    margin-bottom: 6px;
  }
  .toolCardText{
    font-size: 12px;
    font-weight: 850;
    color: rgba(7,17,38,.62);
    line-height: 1.45;
  }

  @media (min-width: 980px){
    .fadeL, .fadeR{ display:none; }
    .chip{ min-width: 170px; max-width: 200px; padding: 10px 12px; border-radius: 18px; }
    .lbl{ max-width: 140px; }
  }

  @media (max-width: 380px){
    .chip{ min-width: 44vw; max-width: 70vw; }
    .lbl{ max-width: 42vw; }
    .sub{ max-width: 54vw; }
  }

  @media (prefers-reduced-motion: reduce){
    .impTabsPage{ animation: none; }
    .head::before{ animation: none; }
    .shine{ transition: none; }
    .chip{ transition: none; }
    .underline{ transition: none; }
    .panelIn{ animation: none; }
  }
`;
