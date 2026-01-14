import React, { useMemo, useState } from "react";

export default function Calculator() {
  const [expr, setExpr] = useState("");
  const [liveResult, setLiveResult] = useState("0");

  // History items: { expr, result }
  const [history, setHistory] = useState([]);
  const [hIndex, setHIndex] = useState(-1); // -1 = current, else browsing history index

  const isOp = (c) => ["+", "-", "×", "÷"].includes(c);

  // ✅ Convert UI expression to JS expression (handles % properly)
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
    // if browsing history and user starts editing => return to current mode
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
      setHistory((prev) => [...prev, item]);

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

  // ✅ History Prev/Next + show list below
  const canPrev = history.length > 0 && (hIndex === -1 ? history.length - 1 >= 0 : hIndex - 1 >= 0);
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

  // ✅ Color mapping for operator buttons (as you asked)
  // + / - : red
  // × / ÷ : orange
  // % : blue
  // = : green
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
    [expr, hIndex, history]
  );

  return (
    <div className="calcPage">
      <style>{css}</style>

      <div className="calcCard">
        {/* Top Bar */}
        <div className="topBar">
          <button
            className={`navBtn ${canPrev ? "" : "disabled"}`}
            onClick={goPrev}
            type="button"
            disabled={!canPrev}
            title="Previous"
          >
            ◀
          </button>

          <div className="topTitle">Calculator</div>

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
          <div className="resLine">{liveResult}</div>
        </div>

        {/* History row (below screen) */}
        <div className="historyWrap">
          <div className="historyTitle">History</div>

          {history.length === 0 ? (
            <div className="historyEmpty">No calculations yet.</div>
          ) : (
            <div className="historyList">
              {history.slice().reverse().map((h, i) => {
                const realIdx = history.length - 1 - i;
                const activeRow = hIndex === realIdx;
                return (
                  <button
                    key={`${h.expr}-${realIdx}`}
                    type="button"
                    className={`historyRow ${activeRow ? "active" : ""}`}
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

        {/* Buttons */}
        <div className="pad">
          {keys.map((k, idx) => (
            <button
              key={`${k.t}-${idx}`}
              className={`btn ${k.type}`}
              onClick={k.on}
              type="button"
            >
              {k.t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const css = `
  *{ box-sizing:border-box; }

  :root{
    --bg:#f4f7fb;
    --card:#ffffff;
    --border:#e5eaf2;
    --text:#111827;
    --muted:#6b7280;

    /* operator colors */
    --red1:#ef4444;
    --red2:#fb7185;

    --orange1:#f59e0b;
    --orange2:#fb923c;

    --blue1:#2563eb;
    --blue2:#60a5fa;

    --green1:#16a34a;
    --green2:#22c55e;

    --shadow: 0 14px 32px rgba(17,24,39,.08);
  }

  .calcPage{
    min-height:100vh;
    width:100%;
    background:var(--bg);
    padding:0;
  }

  .calcCard{
    width:100%;
    min-height:100vh;
    background:var(--card);
    padding:16px;
    display:flex;
    flex-direction:column;
    gap: 12px;
  }

  /* Top bar */
  .topBar{
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:12px;
  }

  .topTitle{
    font-family:"Georgia","Times New Roman",Times,serif;
    font-size:18px;
    font-weight:900;
    color:#4b1d6d;
    letter-spacing:.2px;
  }

  .navBtn{
    width:44px;
    height:44px;
    border-radius:14px;
    border:1px solid var(--border);
    background:#fff;
    box-shadow: var(--shadow);
    cursor:pointer;
    font-weight:900;
    font-size:16px;
    color:var(--text);
  }

  .navBtn.disabled{
    opacity:.45;
    cursor:not-allowed;
    box-shadow:none;
  }

  /* Screen */
  .screen{
    border:1px solid var(--border);
    border-radius:20px;
    background: linear-gradient(180deg, #ffffff, #f9fbff);
    box-shadow: var(--shadow);
    padding:14px 12px;
    min-height: 96px;
    display:flex;
    flex-direction:column;
    justify-content:center;
    gap:6px;
    overflow:hidden;
  }

  .exprLine{
    font-size:16px;
    font-weight:900;
    color: var(--muted);
    text-align:right;
    word-break: break-word;
  }

  .resLine{
    font-size:30px;
    font-weight:900;
    color: var(--text);
    text-align:right;
    word-break: break-word;
    line-height:1.1;
  }

  /* History below screen */
  .historyWrap{
    border: 1px solid var(--border);
    border-radius: 18px;
    background: #fff;
    box-shadow: var(--shadow);
    padding: 10px;
  }

  .historyTitle{
    font-size: 12px;
    font-weight: 900;
    color: #374151;
    margin-bottom: 8px;
  }

  .historyEmpty{
    font-size: 12px;
    font-weight: 800;
    color: var(--muted);
    padding: 6px 4px;
  }

  .historyList{
    display:flex;
    flex-direction:column;
    gap: 8px;
    max-height: 160px;
    overflow:auto;
    padding-right: 2px;
  }

  .historyRow{
    width: 100%;
    border: 1px solid rgba(0,0,0,.06);
    border-radius: 14px;
    background: #f8fafc;
    padding: 10px 10px;
    cursor: pointer;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap: 8px;
    text-align:left;
  }

  .historyRow.active{
    outline: 2px solid rgba(37,99,235,.18);
    background: #eef2ff;
  }

  .hExpr{
    font-size: 12px;
    font-weight: 900;
    color: #111827;
    max-width: 55%;
    overflow:hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .hEq{
    font-size: 12px;
    font-weight: 900;
    color: var(--muted);
  }

  .hRes{
    font-size: 12px;
    font-weight: 900;
    color: #0f172a;
    max-width: 35%;
    overflow:hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align:right;
  }

  /* Keypad */
  .pad{
    display:grid;
    grid-template-columns: repeat(4, 1fr);
    gap:12px;
    flex: 1;
    align-content:start;
  }

  .btn{
    height:58px;
    border-radius:16px;
    border:1px solid var(--border);
    background:#fff;  /* numbers white */
    color: var(--text);
    font-weight:900;
    font-size:18px;
    cursor:pointer;
    box-shadow: var(--shadow);
    transition: transform .08s ease;
  }
  .btn:active{ transform: translateY(1px); }

  .btn.func{ background:#f8fafc; }

  /* operator colors */
  .btn.op.red{
    border: 1px solid rgba(239,68,68,.22);
    background: linear-gradient(135deg, var(--red1), var(--red2));
    color:#fff;
  }

  .btn.op.orange{
    border: 1px solid rgba(245,158,11,.25);
    background: linear-gradient(135deg, var(--orange1), var(--orange2));
    color:#fff;
  }

  .btn.op.blue{
    border: 1px solid rgba(37,99,235,.22);
    background: linear-gradient(135deg, var(--blue1), var(--blue2));
    color:#fff;
  }

  .btn.eq.green{
    border: 1px solid rgba(22,163,74,.22);
    background: linear-gradient(135deg, var(--green2), var(--green1));
    color:#fff;
  }

  .btn.wide{ grid-column: span 2; }

  @media (min-width:768px){
    .calcPage{
      display:flex;
      align-items:center;
      justify-content:center;
      padding:24px;
    }
    .calcCard{
      min-height:auto;
      max-width: 540px;
      border-radius: 22px;
      box-shadow: 0 24px 70px rgba(17,24,39,.12);
    }
  }
`;
