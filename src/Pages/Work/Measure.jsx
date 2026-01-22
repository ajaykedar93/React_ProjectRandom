import React, { useMemo, useState } from "react";

export default function Measure() {
  const UNITS = useMemo(
    () => [
      { key: "m", label: "Meter (m)" },
      { key: "cm", label: "Centimeter (cm)" },
      { key: "mm", label: "Millimeter (mm)" },
      { key: "inch", label: "Inches (in)" },
      { key: "ft", label: "Feet (ft)" },
    ],
    []
  );

  const toMeters = (value, unit) => {
    switch (unit) {
      case "m":
        return value;
      case "cm":
        return value / 100;
      case "mm":
        return value / 1000;
      case "inch":
        return value / 39.3701;
      case "ft":
        return value / 3.28084;
      default:
        return value;
    }
  };

  const fromMeters = (meters, unit) => {
    switch (unit) {
      case "m":
        return meters;
      case "cm":
        return meters * 100;
      case "mm":
        return meters * 1000;
      case "inch":
        return meters * 39.3701;
      case "ft":
        return meters * 3.28084;
      default:
        return meters;
    }
  };

  const toNum = (v) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
  };

  const format = (n) => {
    if (!Number.isFinite(n)) return "";
    return n.toFixed(6).replace(/\.?0+$/, "");
  };

  const [fromUnit, setFromUnit] = useState("m");
  const [toUnit, setToUnit] = useState("ft");
  const [input, setInput] = useState("");

  const output = useMemo(() => {
    const n = toNum(input);
    if (n === null) return "";
    return format(fromMeters(toMeters(n, fromUnit), toUnit));
  }, [input, fromUnit, toUnit]);

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const quickPills = [
    { t: "1", v: "1" },
    { t: "10", v: "10" },
    { t: "100", v: "100" },
    { t: "0.5", v: "0.5" },
  ];

  const hasInput = input.trim().length > 0;

  return (
    <div className="measurePage">
      <style>{css}</style>

      <div className="card">
        {/* Header */}
        <div className="head">
          <div className="iconWrap" aria-hidden="true">
            <div className="icon">📏</div>
            <div className="iconGlow" />
          </div>

          <div className="headText">
            <div className="title">Length Converter</div>
            <div className="sub">Choose units and enter value</div>
          </div>
        </div>

        {/* Quick input pills */}
        <div className="pills">
          {quickPills.map((p) => (
            <button
              key={p.t}
              type="button"
              className="pill"
              onClick={() => setInput(p.v)}
              title={`Set input to ${p.v}`}
            >
              {p.t}
            </button>
          ))}
          <button
            type="button"
            className={`pill ghost ${hasInput ? "" : "disabled"}`}
            onClick={() => setInput("")}
            disabled={!hasInput}
            title="Clear input"
          >
            Clear
          </button>
        </div>

        {/* Selectors */}
        <div className="selectors">
          <div className="selectBox">
            <label>From</label>
            <div className="selectWrap">
              <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)}>
                {UNITS.map((u) => (
                  <option key={u.key} value={u.key}>
                    {u.label}
                  </option>
                ))}
              </select>
              <span className="chev">▾</span>
            </div>
          </div>

          <button className="swapBtn" onClick={swapUnits} type="button" title="Swap units">
            <span className="swapIcon">⇄</span>
            <span className="swapRing" />
          </button>

          <div className="selectBox">
            <label>To</label>
            <div className="selectWrap">
              <select value={toUnit} onChange={(e) => setToUnit(e.target.value)}>
                {UNITS.map((u) => (
                  <option key={u.key} value={u.key}>
                    {u.label}
                  </option>
                ))}
              </select>
              <span className="chev">▾</span>
            </div>
          </div>
        </div>

        {/* Fields */}
        <div className="grid">
          <Field
            label={`Enter value (${fromUnit})`}
            value={input}
            onChange={setInput}
            placeholder="e.g. 12.5"
          />
          <Field
            label={`Result (${toUnit})`}
            value={output}
            readOnly
            placeholder="Result will appear here"
            highlight
          />
        </div>

        <div className="hint">
          Result updates automatically as you type • Supports decimals
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange = () => {}, readOnly = false, placeholder, highlight }) {
  return (
    <div className="field">
      <label>{label}</label>
      <div className={`inputWrap ${readOnly ? "ro" : ""} ${highlight ? "hi" : ""}`}>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
          inputMode="decimal"
          placeholder={placeholder || "Enter value"}
        />
        {highlight && <span className="shine" />}
      </div>
    </div>
  );
}

const css = `
  *{ box-sizing:border-box; }
  html, body { height:100%; margin:0; }

  :root{
    /* light colors only */
    --bgA:#f7f7ff;
    --bgB:#f3fbff;
    --bgC:#f6fff8;

    --card:#ffffffcc;
    --cardSolid:#ffffff;
    --border: rgba(12, 18, 28, .10);

    --text:#1f2937;
    --muted:#6b7280;

    --primary:#2563eb;
    --primarySoft:#e0e7ff;

    --mint:#10b981;
    --mintSoft:#d1fae5;

    --pink:#fb7185;
    --pinkSoft:#ffe4e6;

    --titlePurple:#4b1d6d;

    --shadow: 0 18px 60px rgba(15,23,42,.10);
    --shadow2: 0 14px 34px rgba(15,23,42,.12);
  }

  /* Page */
  .measurePage{
    min-height:100vh;
    width:100%;
    padding: 0;
    background:
      radial-gradient(900px 560px at 10% 10%, rgba(96,165,250,.18), transparent 60%),
      radial-gradient(900px 560px at 90% 12%, rgba(251,113,133,.14), transparent 62%),
      radial-gradient(900px 620px at 50% 96%, rgba(16,185,129,.12), transparent 62%),
      linear-gradient(135deg, var(--bgA), var(--bgB) 45%, var(--bgC));
    display:flex;
    align-items:stretch;
    justify-content:center;
  }

  /* Edge-to-edge card on mobile */
  .card{
    width:100%;
    min-height:100vh;
    padding: 18px 16px;
    background: linear-gradient(180deg, rgba(255,255,255,.86), rgba(255,255,255,.70));
    border: 1px solid rgba(255,255,255,.55);
    box-shadow: var(--shadow);
    backdrop-filter: blur(14px);
    display:flex;
    flex-direction:column;
    gap: 12px;
  }

  /* Header */
  .head{
    display:flex;
    gap: 12px;
    align-items:center;
    margin-top: 2px;
  }

  .iconWrap{
    position:relative;
    width: 52px;
    height: 52px;
    border-radius: 18px;
    background: linear-gradient(135deg, var(--primarySoft), #fff);
    border: 1px solid rgba(37,99,235,.16);
    display:grid;
    place-items:center;
    box-shadow: var(--shadow2);
    overflow:hidden;
  }
  .icon{
    font-size: 20px;
    z-index: 2;
  }
  .iconGlow{
    position:absolute;
    inset:-30%;
    background: radial-gradient(circle at 30% 30%, rgba(37,99,235,.18), transparent 55%);
    z-index: 1;
  }

  .headText{ display:flex; flex-direction:column; }
  .title{
    font-family: "Georgia","Times New Roman",Times,serif;
    font-size: 18px;
    font-weight: 900;
    color: var(--titlePurple);
    letter-spacing: .25px;
    line-height: 1.1;
  }
  .sub{
    font-size: 12px;
    font-weight: 750;
    color: var(--muted);
    margin-top: 2px;
  }

  /* Pills */
  .pills{
    display:flex;
    flex-wrap:wrap;
    gap: 10px;
    padding-top: 4px;
  }
  .pill{
    border: 1px solid rgba(37,99,235,.18);
    background: linear-gradient(180deg, #ffffff, #f6f8ff);
    color: rgba(31,41,55,.92);
    font-weight: 900;
    padding: 9px 12px;
    border-radius: 999px;
    cursor:pointer;
    box-shadow: 0 10px 22px rgba(15,23,42,.08);
    transition: transform .12s ease, box-shadow .12s ease, filter .12s ease;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
  .pill:hover{ filter: brightness(1.02); }
  .pill:active{ transform: scale(.98); box-shadow: 0 6px 14px rgba(15,23,42,.10); }
  .pill.ghost{
    border: 1px solid rgba(251,113,133,.24);
    background: linear-gradient(180deg, #fff, #fff7f9);
  }
  .pill.disabled{
    opacity:.5;
    cursor:not-allowed;
    box-shadow:none;
  }

  /* Selectors */
  .selectors{
    display:grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 10px;
    align-items:end;
    margin-top: 2px;
  }

  .selectBox label{
    font-size: 12px;
    font-weight: 900;
    color: var(--muted);
    margin-bottom: 6px;
    display:block;
  }

  .selectWrap{
    position:relative;
  }

  select{
    appearance:none;
    -webkit-appearance:none;
    width:100%;
    padding: 12px 38px 12px 12px;
    border-radius: 14px;
    border: 1px solid var(--border);
    background: rgba(255,255,255,.95);
    font-weight: 850;
    color: var(--text);
    box-shadow: 0 12px 26px rgba(15,23,42,.08);
    outline:none;
    transition: box-shadow .15s ease, border-color .15s ease, transform .12s ease;
  }
  select:focus{
    border-color: rgba(37,99,235,.45);
    box-shadow: 0 0 0 4px rgba(37,99,235,.14), 0 12px 26px rgba(15,23,42,.08);
    transform: translateY(-1px);
  }

  .chev{
    position:absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(31,41,55,.55);
    font-weight: 1000;
    pointer-events:none;
  }

  /* Swap button */
  .swapBtn{
    width: 52px;
    height: 52px;
    border-radius: 16px;
    border: 1px solid rgba(16,185,129,.22);
    background: linear-gradient(135deg, var(--mintSoft), #ffffff);
    box-shadow: 0 14px 30px rgba(15,23,42,.10);
    cursor:pointer;
    position:relative;
    overflow:hidden;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
    transition: transform .12s ease, filter .12s ease;
  }
  .swapBtn:hover{ filter: brightness(1.02); }
  .swapBtn:active{ transform: scale(.98); }
  .swapIcon{
    position:relative;
    z-index: 2;
    font-size: 18px;
    font-weight: 1000;
    color: #0f766e;
  }
  .swapRing{
    position:absolute;
    inset:-40%;
    background: radial-gradient(circle at center, rgba(16,185,129,.22), transparent 55%);
    opacity:0;
    transform: scale(.9);
    transition: opacity .18s ease, transform .18s ease;
  }
  .swapBtn:active .swapRing{
    opacity:1;
    transform: scale(1);
  }

  /* Fields */
  .grid{
    display:grid;
    gap: 12px;
    margin-top: 4px;
  }

  .field label{
    font-size: 12px;
    font-weight: 900;
    color: var(--muted);
    margin-bottom: 6px;
    display:block;
  }

  .inputWrap{
    position:relative;
    border-radius: 14px;
    border: 1px solid var(--border);
    background: rgba(255,255,255,.96);
    box-shadow: 0 12px 26px rgba(15,23,42,.08);
    overflow:hidden;
    transition: box-shadow .15s ease, border-color .15s ease, transform .12s ease;
  }
  .inputWrap:focus-within{
    border-color: rgba(37,99,235,.45);
    box-shadow: 0 0 0 4px rgba(37,99,235,.12), 0 12px 26px rgba(15,23,42,.08);
    transform: translateY(-1px);
  }

  .inputWrap.ro{
    background: linear-gradient(180deg, #ffffff, #f7fbff);
  }

  .inputWrap.hi{
    border-color: rgba(16,185,129,.28);
  }

  input{
    width:100%;
    padding: 13px 12px;
    border:none;
    outline:none;
    background: transparent;
    font-weight: 950;
    color: var(--text);
    font-size: 15px;
  }
  input::placeholder{
    color: rgba(107,114,128,.75);
    font-weight: 800;
  }

  /* Result shine */
  .shine{
    position:absolute;
    inset:0;
    background: linear-gradient(120deg, transparent 0%, rgba(16,185,129,.14) 35%, transparent 70%);
    transform: translateX(-100%);
    animation: shine 2.8s ease-in-out infinite;
    pointer-events:none;
  }
  @keyframes shine{
    0%{ transform: translateX(-100%); opacity:.0; }
    30%{ opacity:.65; }
    60%{ opacity:.0; }
    100%{ transform: translateX(100%); opacity:.0; }
  }

  .hint{
    margin-top: 4px;
    text-align:center;
    font-size: 12px;
    font-weight: 800;
    color: rgba(107,114,128,.9);
    padding-bottom: calc(8px + env(safe-area-inset-bottom));
  }

  /* Desktop */
  @media (min-width: 768px){
    .measurePage{
      padding: 26px;
      align-items:center;
    }
    .card{
      min-height:auto;
      max-width: 780px;
      border-radius: 22px;
      padding: 22px;
      background: rgba(255,255,255,.78);
    }
    .grid{
      grid-template-columns: 1fr 1fr;
    }
    .title{ font-size: 20px; }
  }
`;
