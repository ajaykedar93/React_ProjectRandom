import React, { useMemo, useState } from "react";

export default function Calculator() {
  const [expr, setExpr] = useState("");
  const [liveResult, setLiveResult] = useState("0");

  // History items: { expr, result }
  const [history, setHistory] = useState([]);
  const [hIndex, setHIndex] = useState(-1);

  // Press feel
  const [pressedKey, setPressedKey] = useState(null);

  const isOp = (c) => ["+", "-", "×", "÷"].includes(c);

  // Convert UI expression to JS expression (handles % properly)
  const sanitizeExprForEval = (s) => {
    let x = s.replaceAll("×", "*").replaceAll("÷", "/");

    // A (+|-) B% => A +/- (A*B/100)
    x = x.replace(/([0-9.)]+)\s*([+-])\s*(\d+(\.\d+)?)%/g, (m, a, op, b) => {
      return `(${a})${op}((${a})*(${b})/100)`;
    });

    // A (*|/) B% => A *or/ (B/100)
    x = x.replace(/([0-9.)]+)\s*([*/])\s*(\d+(\.\d+)?)%/g, (m, a, op, b) => {
      return `(${a})${op}((${b})/100)`;
    });

    // standalone B% => (B/100)
    x = x.replace(/(\d+(\.\d+)?)%/g, (m, b) => `(${b}/100)`);

    return x;
  };

  const safeEval = (s) => {
    const allowed = /^[0-9+\-*/().\s]+$/;
    if (!allowed.test(s)) throw new Error("Invalid");
    // eslint-disable-next-line no-new-func
    const fn = new Function(`return (${s});`);
    const res = fn();
    if (!Number.isFinite(res)) throw new Error("Invalid");
    return res;
  };

  const formatNumber = (n) => {
    const abs = Math.abs(n);
    if (abs !== 0 && (abs >= 1e12 || abs < 1e-9)) return String(n);
    const s = n.toFixed(10).replace(/\.?0+$/, "");
    return s === "-0" ? "0" : s;
  };

  const computeLive = (nextExpr) => {
    const t = nextExpr.trim();
    if (!t) return "0";

    const last = t.slice(-1);
    if (isOp(last) || last === "." || last === "%") {
      const trimmed = t.replace(/[+\-×÷.%]+$/, "");
      if (!trimmed) return "0";
      try {
        return formatNumber(safeEval(sanitizeExprForEval(trimmed)));
      } catch {
        return "0";
      }
    }

    try {
      return formatNumber(safeEval(sanitizeExprForEval(t)));
    } catch {
      return "0";
    }
  };

  const setAll = (nextExpr) => {
    if (hIndex !== -1) setHIndex(-1);
    setExpr(nextExpr);
    setLiveResult(computeLive(nextExpr));
  };

  const pressDigit = (d) => {
    let next = expr;

    if (next === "" && d === ".") next = "0";

    // prevent multiple dots in current number
    if (d === ".") {
      const lastToken = next.split(/[\+\-\×\÷\s]/).pop() || "";
      if (lastToken.includes(".")) return;
      if (lastToken === "") return setAll(next + "0.");
    }

    if (next === "0" && d !== ".") next = "";
    setAll(next + d);
  };

  const pressOp = (op) => {
    const t = expr.trim();

    if (!t) {
      if (op === "-") setAll("-");
      return;
    }

    const last = t.slice(-1);
    if (isOp(last)) return setAll(t.slice(0, -1) + op);
    if (last === ".") return;

    setAll(t + op);
  };

  const pressPercent = () => {
    const t = expr.trim();
    if (!t) return;
    const last = t.slice(-1);
    if (isOp(last) || last === "." || last === "%") return;
    setAll(t + "%");
  };

  const clearAll = () => {
    setExpr("");
    setLiveResult("0");
    setHIndex(-1);
  };

  const clearOne = () => {
    if (hIndex !== -1) {
      setHIndex(-1);
      return;
    }
    if (!expr) return;
    const next = expr.slice(0, -1);
    setExpr(next);
    setLiveResult(computeLive(next));
  };

  const pressEquals = () => {
    const t = expr.trim();
    if (!t) return;

    const last = t.slice(-1);
    if (isOp(last) || last === "." || last === "%") return;

    try {
      const result = safeEval(sanitizeExprForEval(t));
      const out = formatNumber(result);

      const item = { expr: t, result: out };

      setHistory((prev) => {
        const next = [...prev, item];
        return next.length > 5 ? next.slice(next.length - 5) : next;
      });

      setExpr(out);
      setLiveResult(out);
      setHIndex(-1);
    } catch {
      setExpr("");
      setLiveResult("Error");
      setTimeout(() => {
        setExpr("");
        setLiveResult("0");
      }, 700);
    }
  };

  // History Prev/Next
  const canPrev =
    history.length > 0 &&
    (hIndex === -1 ? history.length - 1 >= 0 : hIndex - 1 >= 0);
  const canNext = history.length > 0 && hIndex !== -1 && hIndex + 1 < history.length;

  const goPrev = () => {
    if (!history.length) return;
    if (hIndex === -1) {
      const idx = history.length - 1;
      setHIndex(idx);
      setExpr(history[idx].expr);
      setLiveResult(history[idx].result);
      return;
    }
    if (hIndex - 1 >= 0) {
      const idx = hIndex - 1;
      setHIndex(idx);
      setExpr(history[idx].expr);
      setLiveResult(history[idx].result);
    }
  };

  const goNext = () => {
    if (hIndex === -1) return;
    if (hIndex + 1 < history.length) {
      const idx = hIndex + 1;
      setHIndex(idx);
      setExpr(history[idx].expr);
      setLiveResult(history[idx].result);
    }
  };

  const jumpToHistory = (idx) => {
    setHIndex(idx);
    setExpr(history[idx].expr);
    setLiveResult(history[idx].result);
  };

  const clearHistory = () => {
    setHistory([]);
    setHIndex(-1);
  };

  // Press feel
  const runKey = (k) => {
    setPressedKey(k.t);
    k.on?.();
    window.clearTimeout(runKey.__t);
    runKey.__t = window.setTimeout(() => setPressedKey(null), 130);
  };

  const keys = useMemo(
    () => [
      { t: "C", type: "func", on: clearAll },
      { t: "⌫", type: "func", on: clearOne },
      { t: "%", type: "op blue", on: pressPercent },
      { t: "÷", type: "op orange", on: () => pressOp("÷") },

      { t: "7", type: "num", on: () => pressDigit("7") },
      { t: "8", type: "num", on: () => pressDigit("8") },
      { t: "9", type: "num", on: () => pressDigit("9") },
      { t: "×", type: "op orange", on: () => pressOp("×") },

      { t: "4", type: "num", on: () => pressDigit("4") },
      { t: "5", type: "num", on: () => pressDigit("5") },
      { t: "6", type: "num", on: () => pressDigit("6") },
      { t: "-", type: "op red", on: () => pressOp("-") },

      { t: "1", type: "num", on: () => pressDigit("1") },
      { t: "2", type: "num", on: () => pressDigit("2") },
      { t: "3", type: "num", on: () => pressDigit("3") },
      { t: "+", type: "op red", on: () => pressOp("+") },

      { t: "0", type: "num wide", on: () => pressDigit("0") },
      { t: ".", type: "num", on: () => pressDigit(".") },
      { t: "=", type: "eq green", on: pressEquals },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [expr, hIndex, history]
  );

  return (
    <div className="calcPage">
      <style>{css}</style>

      <div className="calcWrap">
        {/* Header */}
        <div className="hdr">
          <button
            className={`navBtn ${canPrev ? "" : "disabled"}`}
            onClick={goPrev}
            type="button"
            disabled={!canPrev}
            title="Previous"
          >
            ◀
          </button>

          <div className="hdrMid">
            <div className="hdrTitle">Calculator</div>
            <div className="hdrSub">Clean • Bright • Mobile first</div>
          </div>

          <button
            className={`navBtn ${canNext ? "" : "disabled"}`}
            onClick={goNext}
            type="button"
            disabled={!canNext}
            title="Next"
          >
            ▶
          </button>
        </div>

        {/* Screen */}
        <div className="screen">
          <div className="exprLine">{expr || "0"}</div>
          <div className={`resLine ${liveResult === "Error" ? "err" : ""}`}>
            {liveResult}
          </div>
        </div>

        {/* History */}
        <div className="history">
          <div className="hTop">
            <div className="hTitle">History (Last 5)</div>
            <button
              type="button"
              className={`hClear ${history.length ? "" : "disabled"}`}
              onClick={clearHistory}
              disabled={!history.length}
              title="Clear history"
              aria-label="Clear history"
            >
              ✕
            </button>
          </div>

          {history.length === 0 ? (
            <div className="hEmpty">No calculations yet.</div>
          ) : (
            <div className="hList">
              {history
                .slice()
                .reverse()
                .map((h, i) => {
                  const realIdx = history.length - 1 - i;
                  const activeRow = hIndex === realIdx;
                  return (
                    <button
                      key={`${h.expr}-${realIdx}`}
                      type="button"
                      className={`hRow ${activeRow ? "active" : ""}`}
                      onClick={() => jumpToHistory(realIdx)}
                      title="Open this calculation"
                    >
                      <span className="hExpr">{h.expr}</span>
                      <span className="hEq">=</span>
                      <span className="hRes">{h.result}</span>
                    </button>
                  );
                })}
            </div>
          )}
        </div>

        {/* Keypad */}
        <div className="pad">
          {keys.map((k, idx) => {
            const isPressed = pressedKey === k.t;
            return (
              <button
                key={`${k.t}-${idx}`}
                className={`btn ${k.type} ${isPressed ? "pressed" : ""}`}
                onClick={() => runKey(k)}
                onPointerDown={() => setPressedKey(k.t)}
                onPointerUp={() => setPressedKey(null)}
                onPointerCancel={() => setPressedKey(null)}
                onPointerLeave={() => setPressedKey(null)}
                type="button"
              >
                <span className="btnText">{k.t}</span>
                <span className="ripple" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const css = `
  *{ box-sizing:border-box; }
  html, body{ height:100%; margin:0; padding:0; }
  
  :root{
    --bg:#f4f7fb;
    --card:#ffffff;
    --border:#e5eaf2;
    --text:#0f172a;
    --muted:#64748b;

    --shadow: 0 16px 44px rgba(17,24,39,.10);
    --shadow2: 0 12px 28px rgba(17,24,39,.10);

    /* operator colors */
    --red1:#ef4444;  --red2:#fb7185;
    --orange1:#f59e0b; --orange2:#fb923c;
    --blue1:#2563eb; --blue2:#60a5fa;
    --green1:#16a34a; --green2:#22c55e;
  }

  /* ✅ IMPORTANT: NOT 100vh (so tabs won't break) */
  .calcPage{
    width:100%;
    min-height:100%;
    background: var(--bg);
    padding: 0;
  }

  /* Edge-to-edge on mobile */
  .calcWrap{
    width:100%;
    min-height:100%;
    padding: 14px 14px calc(14px + env(safe-area-inset-bottom));
    display:flex;
    flex-direction:column;
    gap: 12px;
  }

  /* Header */
  .hdr{
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:12px;
    padding: 10px 10px;
    border-radius: 18px;
    background: rgba(255,255,255,.92);
    border: 1px solid var(--border);
    box-shadow: var(--shadow2);
  }

  .navBtn{
    width: 48px;
    height: 48px;
    border-radius: 16px;
    border: 1px solid var(--border);
    background: #fff;
    color: var(--text);
    font-weight: 950;
    cursor:pointer;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
    transition: transform .12s ease, filter .12s ease;
    box-shadow: 0 10px 18px rgba(17,24,39,.08);
  }
  .navBtn:active{ transform: scale(.98); }
  .navBtn.disabled{ opacity:.45; cursor:not-allowed; box-shadow:none; }

  .hdrMid{ text-align:center; flex: 1; }
  .hdrTitle{
    font-size: 16px;
    font-weight: 1100;
    letter-spacing: .2px;
    color: #4b1d6d;
    font-family: "Georgia","Times New Roman",Times,serif;
  }
  .hdrSub{
    margin-top: 2px;
    font-size: 11px;
    font-weight: 800;
    color: var(--muted);
  }

  /* Screen */
  .screen{
    border-radius: 22px;
    padding: 16px 14px;
    background: linear-gradient(180deg, #ffffff, #f7fbff);
    border: 1px solid var(--border);
    box-shadow: var(--shadow);
    min-height: 120px;
    display:flex;
    flex-direction:column;
    justify-content:center;
    gap: 8px;
  }
  .exprLine{
    font-size: 16px;
    font-weight: 950;
    color: rgba(15,23,42,.75);
    text-align:right;
    word-break: break-word;
  }
  .resLine{
    font-size: 40px;
    font-weight: 1100;
    color: rgba(15,23,42,.95);
    text-align:right;
    word-break: break-word;
    line-height: 1.06;
    letter-spacing: .2px;
  }
  .resLine.err{ color: #ef4444; }

  /* History */
  .history{
    border-radius: 20px;
    padding: 10px;
    background: rgba(255,255,255,.92);
    border: 1px solid var(--border);
    box-shadow: var(--shadow2);
  }
  .hTop{
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:10px;
    margin-bottom: 8px;
  }
  .hTitle{
    font-size: 12px;
    font-weight: 1000;
    color: rgba(15,23,42,.85);
  }
  .hClear{
    width:28px;
    height:28px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: #fff;
    color: rgba(15,23,42,.9);
    font-weight: 1100;
    cursor:pointer;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
    transition: transform .12s ease, opacity .12s ease;
    box-shadow: 0 8px 14px rgba(17,24,39,.08);
  }
  .hClear:active{ transform: scale(.98); }
  .hClear.disabled{ opacity:.45; cursor:not-allowed; box-shadow:none; }

  .hEmpty{
    font-size: 12px;
    font-weight: 800;
    color: rgba(15,23,42,.62);
    padding: 6px 4px;
  }

  .hList{
    display:flex;
    flex-direction:column;
    gap: 8px;
    max-height: 150px;
    overflow:auto;
    padding-right: 2px;
  }

  .hRow{
    width:100%;
    border-radius: 16px;
    border: 1px solid rgba(0,0,0,.06);
    background: #f8fafc;
    padding: 10px 10px;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap: 8px;
    text-align:left;
    cursor:pointer;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
    transition: transform .12s ease, background .12s ease, outline .12s ease;
  }
  .hRow:active{ transform: scale(.99); }
  .hRow.active{
    outline: 2px solid rgba(37,99,235,.18);
    background: #eef2ff;
  }

  .hExpr{
    font-size: 12px;
    font-weight: 1000;
    color: rgba(15,23,42,.92);
    max-width: 55%;
    overflow:hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .hEq{ font-size: 12px; font-weight: 900; color: rgba(15,23,42,.55); }
  .hRes{
    font-size: 12px;
    font-weight: 1000;
    color: rgba(15,23,42,.92);
    max-width: 35%;
    overflow:hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align:right;
  }

  /* Keypad: big + sticky bottom */
  .pad{
    margin-top: auto;
    position: sticky;
    bottom: 0;
    padding: 12px 0 0;
    display:grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .btn{
    position:relative;
    height: 78px;
    border-radius: 22px;
    border: 1px solid var(--border);
    background: #fff;
    color: rgba(15,23,42,.95);
    font-weight: 1100;
    font-size: 26px;
    cursor:pointer;
    box-shadow: var(--shadow2);
    overflow:hidden;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
    user-select:none;
    transition: transform .10s ease, filter .12s ease;
  }

  .btn:hover{ filter: brightness(1.02); }
  .btn:active{ transform: translateY(1px) scale(.985); }
  .btn.pressed{ transform: translateY(1px) scale(.985); }

  .btnText{ position:relative; z-index:2; }

  /* Ripple */
  .btn .ripple{
    position:absolute;
    inset:0;
    background: radial-gradient(circle at center, rgba(37,99,235,.14), transparent 55%);
    opacity:0;
    transform: scale(.85);
    transition: opacity .18s ease, transform .18s ease;
    z-index:1;
    pointer-events:none;
  }
  .btn:active .ripple,
  .btn.pressed .ripple{
    opacity:1;
    transform: scale(1);
  }

  .btn.func{
    background: #f8fafc;
  }

  .btn.op.red{
    background: linear-gradient(135deg, rgba(239,68,68,.20), rgba(251,113,133,.16));
    border: 1px solid rgba(239,68,68,.22);
    color: rgba(15,23,42,.95);
  }

  .btn.op.orange{
    background: linear-gradient(135deg, rgba(245,158,11,.22), rgba(251,146,60,.16));
    border: 1px solid rgba(245,158,11,.24);
    color: rgba(15,23,42,.95);
  }

  .btn.op.blue{
    background: linear-gradient(135deg, rgba(37,99,235,.20), rgba(96,165,250,.16));
    border: 1px solid rgba(37,99,235,.22);
    color: rgba(15,23,42,.95);
  }

  .btn.eq.green{
    background: linear-gradient(135deg, rgba(34,197,94,.22), rgba(22,163,74,.16));
    border: 1px solid rgba(34,197,94,.22);
    color: rgba(15,23,42,.95);
  }

  .btn.wide{ grid-column: span 2; }

  /* Desktop */
  @media (min-width: 900px){
    .calcWrap{
      max-width: 560px;
      margin: 22px auto;
      background: rgba(255,255,255,.70);
      border: 1px solid var(--border);
      border-radius: 26px;
      box-shadow: 0 26px 80px rgba(17,24,39,.12);
    }
    .btn{ height: 82px; font-size: 28px; }
    .resLine{ font-size: 44px; }
  }
`;
