import React, { useState } from "react";

export default function Measure() {
  const [m, setM] = useState("");
  const [cm, setCm] = useState("");
  const [inch, setInch] = useState("");
  const [ft, setFt] = useState("");
  const [mm, setMm] = useState("");

  const toNum = (v) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
  };

  const updateFromMeter = (v) => {
    setM(v);
    const n = toNum(v);
    if (n === null) return clearExcept("m");
    setCm((n * 100).toFixed(2));
    setMm((n * 1000).toFixed(2));
    setInch((n * 39.3701).toFixed(2));
    setFt((n * 3.28084).toFixed(2));
  };

  const updateFromCm = (v) => {
    setCm(v);
    const n = toNum(v);
    if (n === null) return clearExcept("cm");
    updateFromMeter((n / 100).toString());
  };

  const updateFromMm = (v) => {
    setMm(v);
    const n = toNum(v);
    if (n === null) return clearExcept("mm");
    updateFromMeter((n / 1000).toString());
  };

  const updateFromInch = (v) => {
    setInch(v);
    const n = toNum(v);
    if (n === null) return clearExcept("inch");
    updateFromMeter((n / 39.3701).toString());
  };

  const updateFromFt = (v) => {
    setFt(v);
    const n = toNum(v);
    if (n === null) return clearExcept("ft");
    updateFromMeter((n / 3.28084).toString());
  };

  const clearExcept = (key) => {
    if (key !== "m") setM("");
    if (key !== "cm") setCm("");
    if (key !== "mm") setMm("");
    if (key !== "inch") setInch("");
    if (key !== "ft") setFt("");
  };

  const clearAll = () => {
    setM("");
    setCm("");
    setMm("");
    setInch("");
    setFt("");
  };

  return (
    <div className="measurePage">
      <style>{css}</style>

      <div className="card">
        <div className="head">
          <div className="icon">📏</div>
          <div>
            <div className="title">Length Converter</div>
            <div className="sub">Meter • CM • MM • Inch • Feet</div>
          </div>
        </div>

        <div className="grid">
          <Field label="Meter (m)" value={m} onChange={updateFromMeter} />
          <Field label="Centimeter (cm)" value={cm} onChange={updateFromCm} />
          <Field label="Millimeter (mm)" value={mm} onChange={updateFromMm} />
          <Field label="Inches (in)" value={inch} onChange={updateFromInch} />
          <Field label="Feet (ft)" value={ft} onChange={updateFromFt} />
        </div>

        <div className="actions">
          <button className="clearBtn" onClick={clearAll}>Clear All</button>
        </div>

        <div className="hint">
          Tip: Enter value in any one field, others convert automatically.
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode="decimal"
        placeholder="Enter value"
      />
    </div>
  );
}

const css = `
  *{ box-sizing: border-box; }

  .measurePage{
    width: 100%;
    animation: fade .25s ease both;
  }
  @keyframes fade{
    from{ opacity:0; transform: translateY(8px); }
    to{ opacity:1; transform: translateY(0); }
  }

  .card{
    background: rgba(255,255,255,.75);
    border: 1px solid rgba(0,0,0,.06);
    border-radius: 22px;
    padding: 16px;
    box-shadow: 0 22px 60px rgba(0,0,0,.12);
  }

  .head{
    display:flex;
    gap: 12px;
    align-items:center;
    margin-bottom: 14px;
  }

  .icon{
    width: 44px;
    height: 44px;
    border-radius: 16px;
    display:grid;
    place-items:center;
    background: linear-gradient(135deg, rgba(239,68,68,.25), rgba(251,113,133,.18));
    box-shadow: 0 14px 34px rgba(239,68,68,.25);
    font-size: 18px;
  }

  .title{
    font-size: 15px;
    font-weight: 1100;
    color: #111827;
  }
  .sub{
    font-size: 12px;
    font-weight: 800;
    color: rgba(7,17,38,.62);
    margin-top: 2px;
  }

  .grid{
    display:grid;
    grid-template-columns: 1fr;
    gap: 12px;
    margin-top: 12px;
  }

  .field label{
    display:block;
    font-size: 12px;
    font-weight: 900;
    margin-bottom: 6px;
    color: rgba(7,17,38,.75);
  }

  .field input{
    width: 100%;
    padding: 12px;
    border-radius: 16px;
    border: 1px solid rgba(0,0,0,.08);
    background: rgba(255,255,255,.9);
    font-weight: 900;
    color: #111827;
    outline: none;
  }

  .field input:focus{
    border-color: rgba(239,68,68,.35);
    box-shadow: 0 0 0 4px rgba(239,68,68,.12);
  }

  .actions{
    margin-top: 14px;
    display:flex;
    justify-content: flex-end;
  }

  .clearBtn{
    border:none;
    cursor:pointer;
    padding: 10px 16px;
    border-radius: 16px;
    font-weight: 1000;
    color: white;
    background: linear-gradient(135deg, #ef4444, #fb7185);
    box-shadow: 0 16px 40px rgba(239,68,68,.28);
  }

  .hint{
    margin-top: 12px;
    font-size: 12px;
    font-weight: 900;
    color: rgba(7,17,38,.62);
    text-align:center;
  }

  @media (min-width: 768px){
    .grid{
      grid-template-columns: 1fr 1fr;
    }
  }
`;
