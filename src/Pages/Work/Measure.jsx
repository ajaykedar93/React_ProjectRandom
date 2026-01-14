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
      case "m": return value;
      case "cm": return value / 100;
      case "mm": return value / 1000;
      case "inch": return value / 39.3701;
      case "ft": return value / 3.28084;
      default: return value;
    }
  };

  const fromMeters = (meters, unit) => {
    switch (unit) {
      case "m": return meters;
      case "cm": return meters * 100;
      case "mm": return meters * 1000;
      case "inch": return meters * 39.3701;
      case "ft": return meters * 3.28084;
      default: return meters;
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

  return (
    <div className="measurePage">
      <style>{css}</style>

      <div className="card">
        <div className="head">
          <div className="icon">📏</div>
          <div>
            <div className="title">Length Converter</div>
            <div className="sub">Choose units and enter value</div>
          </div>
        </div>

        <div className="selectors">
          <div className="selectBox">
            <label>From</label>
            <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)}>
              {UNITS.map((u) => (
                <option key={u.key} value={u.key}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>

          <button className="swapBtn" onClick={swapUnits} type="button">
            ⇄
          </button>

          <div className="selectBox">
            <label>To</label>
            <select value={toUnit} onChange={(e) => setToUnit(e.target.value)}>
              {UNITS.map((u) => (
                <option key={u.key} value={u.key}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid">
          <Field
            label={`Enter value (${fromUnit})`}
            value={input}
            onChange={setInput}
          />
          <Field
            label={`Result (${toUnit})`}
            value={output}
            readOnly
          />
        </div>

        <div className="hint">Result updates automatically as you type</div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange = () => {}, readOnly = false }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        inputMode="decimal"
        placeholder="Enter value"
      />
    </div>
  );
}

const css = `
  *{ box-sizing:border-box; }

  :root{
    --bg:#f4f7fb;
    --card:#ffffff;
    --border:#e5eaf2;
    --text:#1f2937;
    --muted:#6b7280;
    --primary:#2563eb;
    --primarySoft:#e0e7ff;

    --titlePurple:#4b1d6d; /* dark purple */
  }

  .measurePage{
    min-height:100vh;
    width:100%;
    background:var(--bg);
    padding:0;
  }

  /* FULL WIDTH CARD (MOBILE) */
  .card{
    width:100%;
    min-height:100vh;
    background:var(--card);
    padding:16px;
  }

  .head{
    display:flex;
    gap:12px;
    align-items:center;
    margin-bottom:14px;
  }

  .icon{
    width:44px;
    height:44px;
    border-radius:14px;
    display:grid;
    place-items:center;
    background:var(--primarySoft);
    font-size:18px;
  }

  /* ✅ TITLE (APPLIES MOBILE + DESKTOP) */
  .title{
    font-family: "Georgia", "Times New Roman", Times, serif; /* Roman family */
    font-size: 18px;
    font-weight: 900;
    color: var(--titlePurple);
    letter-spacing: 0.25px;
    line-height: 1.1;
  }

  .sub{
    font-size:12px;
    font-weight:700;
    color:var(--muted);
    margin-top:2px;
  }

  .selectors{
    display:grid;
    grid-template-columns:1fr auto 1fr;
    gap:10px;
    margin-top:10px;
  }

  .selectBox label{
    font-size:12px;
    font-weight:800;
    color:var(--muted);
    margin-bottom:6px;
    display:block;
  }

  select{
    width:100%;
    padding:12px;
    border-radius:12px;
    border:1px solid var(--border);
    font-weight:700;
    background:white;
  }

  .swapBtn{
    width:44px;
    height:44px;
    border-radius:12px;
    border:1px solid var(--border);
    background:var(--primarySoft);
    font-size:16px;
    cursor:pointer;
  }

  .grid{
    display:grid;
    gap:12px;
    margin-top:14px;
  }

  .field label{
    font-size:12px;
    font-weight:800;
    color:var(--muted);
    margin-bottom:6px;
    display:block;
  }

  .field input{
    width:100%;
    padding:12px;
    border-radius:12px;
    border:1px solid var(--border);
    font-weight:800;
    color:var(--text);
  }

  .field input:focus{
    outline:none;
    border-color:var(--primary);
    box-shadow:0 0 0 3px rgba(37,99,235,.15);
  }

  .field input[readonly]{
    background:#f9fafb;
  }

  .hint{
    margin-top:14px;
    text-align:center;
    font-size:12px;
    font-weight:700;
    color:var(--muted);
  }

  /* DESKTOP */
  @media (min-width:768px){
    .measurePage{
      display:flex;
      align-items:center;
      justify-content:center;
      padding:24px;
    }
    .card{
      min-height:auto;
      max-width:720px;
      border-radius:20px;
      box-shadow:0 20px 50px rgba(0,0,0,.08);
    }
    .grid{
      grid-template-columns:1fr 1fr;
    }
  }
`;
