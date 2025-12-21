import React, { useEffect, useMemo, useState } from "react";

export default function DocumentUpload() {
  const API_BASE = "http://localhost:5000";

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState(null);

  const [indiaTime, setIndiaTime] = useState("");
  const [loading, setLoading] = useState(false);

  const [modal, setModal] = useState({ open: false, type: "info", title: "", message: "" });
  const openModal = (type, title, message) => setModal({ open: true, type, title, message });
  const closeModal = () => setModal((p) => ({ ...p, open: false }));

  const prettySize = useMemo(
    () => (bytes) => {
      if (!bytes && bytes !== 0) return "-";
      const units = ["B", "KB", "MB", "GB"];
      let i = 0;
      let n = Number(bytes);
      while (n >= 1024 && i < units.length - 1) {
        n /= 1024;
        i += 1;
      }
      return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
    },
    []
  );

  useEffect(() => {
    const tick = () => {
      try {
        // TIME ONLY (no date) for India
        setIndiaTime(
          new Date().toLocaleTimeString("en-IN", {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        );
      } catch {
        setIndiaTime(new Date().toLocaleTimeString());
      }
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const onPickFile = (e) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
  };

  const validate = () => {
    if (!title.trim()) {
      openModal("error", "Missing Title", "Please enter document title.");
      return false;
    }
    if (!file) {
      openModal("error", "No File", "Please choose a file to upload.");
      return false;
    }
    return true;
  };

  const uploadDoc = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("document_title", title.trim());
      if (desc.trim()) fd.append("short_desc", desc.trim());
      fd.append("file", file);

      const res = await fetch(`${API_BASE}/api/documents`, {
        method: "POST",
        body: fd,
      });

      const text = await res.text();
      let data = null;
      try {
        data = JSON.parse(text);
      } catch {}

      if (!res.ok) {
        throw new Error(data?.message || text || `Upload failed (HTTP ${res.status})`);
      }

      openModal("success", "Uploaded", data?.message || "Document uploaded successfully ✅");

      setTitle("");
      setDesc("");
      setFile(null);

      const input = document.getElementById("docFileInput");
      if (input) input.value = "";
    } catch (e) {
      openModal("error", "Upload Failed", e.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dp">
      <style>{css}</style>

      {/* Full page background (still full screen, no gaps) */}
      <div className="bg" />

      {/* Center Modal */}
      {modal.open ? (
        <div className="mb" onClick={closeModal}>
          <div className="mc" onClick={(e) => e.stopPropagation()}>
            <div className={`pill ${modal.type}`}>{modal.type.toUpperCase()}</div>
            <h3 className="mt">{modal.title}</h3>
            <p className="mm">{modal.message}</p>
            <button className="mBtn" type="button" onClick={closeModal}>
              OK
            </button>
          </div>
        </div>
      ) : null}

      {/* FULL WIDTH + FULL HEIGHT CARD (NO OUTSIDE SPACE) */}
      <div className="card">
        <div className="head">
          <div>
            <h2 className="title">Upload Document</h2>
            <p className="sub">Upload any file format to local storage</p>
          </div>

          {/* TIME ONLY */}
          <div className="timeBox">
            <div className="timeLabel">India Time</div>
            <div className="timeValue">{indiaTime}</div>
          </div>
        </div>

        <div className="grid">
          <div className="field full">
            <label className="label">
              Document Title <span className="req">*</span>
            </label>
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter document title"
              autoComplete="off"
            />
          </div>

          <div className="field full">
            <label className="label">Description (Optional)</label>
            <textarea
              className="textarea"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Short description (optional)"
            />
          </div>

          <div className="field full">
            <label className="label">
              Choose File <span className="req">*</span>
            </label>

            <div className="drop">
              <input id="docFileInput" className="file" type="file" onChange={onPickFile} />
              <div className="dropInfo">
                <div className="dropTop">
                  <div className="badge">ANY FORMAT</div>
                  <div className="hint">pdf • docx • xlsx • csv • txt • js • jpg • png • webp • etc</div>
                </div>

                <div className="picked">
                  {file ? (
                    <>
                      <div className="pickedName">{file.name}</div>
                      <div className="pickedMeta">
                        {prettySize(file.size)} • {file.type || "unknown"}
                      </div>
                    </>
                  ) : (
                    <div className="pickedEmpty">No file selected</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <button className="submit" type="button" onClick={uploadDoc} disabled={loading}>
            {loading ? "Uploading..." : "Upload Document"}
          </button>

          <div className="links">
            <span className="link" onClick={() => (window.location.href = "/documents")}>
              View Uploaded Documents
            </span>
            <span className="dot">•</span>
            <span className="link" onClick={() => (window.location.href = "/dashboard")}>
              Back to Dashboard
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const css = `
  :root{
    --txt:#0b1220;
    --muted:rgba(11,18,32,.65);
    --card:rgba(255,255,255,.90);
    --shadow: 0 26px 80px rgba(0,0,0,.18);
  }

  /* REMOVE ALL OUTSIDE SPACE (IMPORTANT) */
  html, body, #root{
    height:100%;
    width:100%;
    margin:0;
    padding:0;
  }
  *{ box-sizing:border-box; }
  .dp, .dp *{
    -webkit-tap-highlight-color: transparent;
  }

  .dp{
    min-height:100vh;
    width:100%;
    position:relative;
    overflow:hidden;
    padding:0;              /* removed */
    margin:0;               /* removed */
    display:block;          /* no centering gap */
  }

  .bg{
    position:fixed; inset:0;
    background:
      radial-gradient(900px 520px at 12% 12%, rgba(255, 0, 150, .22), transparent 60%),
      radial-gradient(900px 520px at 88% 16%, rgba(0, 200, 255, .18), transparent 58%),
      radial-gradient(1000px 650px at 50% 92%, rgba(0, 255, 150, .15), transparent 60%),
      linear-gradient(135deg, #fffbeb 0%, #eff6ff 34%, #ecfeff 67%, #f0fdf4 100%);
    z-index:0; pointer-events:none;
  }

  /* FULL PAGE CARD */
  .card{
    position:relative;
    z-index:1;
    width:100%;
    min-height:100vh;       /* fill full screen */
    background:var(--card);
    border:0;               /* no outer border gap look */
    border-radius:0;        /* no rounded edges = full page */
    padding:3px;           /* inside padding only */
    box-shadow:none;        /* remove shadow so edges look flush */
    backdrop-filter: blur(14px);
  }

  .head{
    display:flex;
    justify-content:space-between;
    gap:12px;
    flex-wrap:wrap;
    align-items:flex-start;
    margin-bottom: 14px;
  }

  .title{
    margin:0;
    font-weight:1000;
    color:var(--txt);
    font-size: clamp(22px, 3.2vw, 30px);
  }
  .sub{
    margin:8px 0 0;
    color:var(--muted);
    font-weight:800;
    font-size: clamp(12px, 1.8vw, 14px);
  }

  .timeBox{
    padding:10px 12px;
    border-radius:16px;
    background: rgba(17,24,39,.06);
    border: 1px solid rgba(17,24,39,.08);
    text-align:right;
  }
  .timeLabel{
    font-size:11px;
    font-weight:950;
    color: rgba(11,18,32,.60);
  }
  .timeValue{
    margin-top:4px;
    font-size:13px;
    font-weight:1000;
    color: rgba(11,18,32,.88);
    white-space: nowrap;
  }

  .grid{
    display:grid;
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .field{ display:flex; flex-direction:column; }
  .label{
    font-size:12px;
    font-weight:950;
    color: rgba(11,18,32,.85);
    margin-bottom:6px;
  }
  .req{ color:#ff2d55; }

  .input{
    width:100%;
    padding:14px;                 /* more touch friendly */
    border-radius:14px;
    border:1px solid rgba(11,18,32,.10);
    background: rgba(255,255,255,.92);
    outline:none;
    font-size: clamp(13px, 1.9vw, 14px);
    font-weight:800;
  }
  .input:focus{
    border-color: rgba(124,58,237,.35);
    box-shadow: 0 0 0 5px rgba(124,58,237,.12);
  }

  .textarea{
    width:100%;
    min-height: 110px;           /* better on mobile */
    padding:14px;
    border-radius:14px;
    border:1px solid rgba(11,18,32,.10);
    background: rgba(255,255,255,.92);
    outline:none;
    font-size: clamp(13px, 1.9vw, 14px);
    font-weight:800;
    resize: vertical;
  }
  .textarea:focus{
    border-color: rgba(124,58,237,.35);
    box-shadow: 0 0 0 5px rgba(124,58,237,.12);
  }

  .drop{
    display:grid;
    grid-template-columns: 240px 1fr;
    gap:12px;
    padding:12px;
    border-radius:18px;
    border:1px dashed rgba(124,58,237,.35);
    background:
      radial-gradient(600px 180px at 10% 10%, rgba(124,58,237,.10), transparent 60%),
      radial-gradient(600px 180px at 90% 30%, rgba(6,182,212,.10), transparent 60%),
      rgba(255,255,255,.55);
  }

  .file{
    width:100%;
    padding:12px;               /* touch */
    border-radius:16px;
    border:1px solid rgba(17,24,39,.10);
    background: rgba(255,255,255,.75);
  }

  .dropInfo{ min-width:0; }
  .dropTop{ display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
  .badge{
    display:inline-block;
    padding:6px 10px;
    border-radius:999px;
    font-weight:1000;
    font-size:12px;
    background: rgba(124,58,237,.12);
    border:1px solid rgba(124,58,237,.18);
    color:#4c1d95;
  }
  .hint{
    color: rgba(11,18,32,.65);
    font-weight:900;
    font-size: 12px;
  }

  .picked{ margin-top:10px; }
  .pickedName{
    font-weight:1000;
    color: rgba(11,18,32,.90);
    word-break: break-word;
  }
  .pickedMeta{
    margin-top:4px;
    color: rgba(11,18,32,.60);
    font-weight:900;
    font-size: 12px;
  }
  .pickedEmpty{
    color: rgba(11,18,32,.55);
    font-weight:900;
    font-size: 12px;
  }

  .submit{
    width:100%;
    border:none;
    padding:10px;               /* touch */
    border-radius:16px;
    cursor:pointer;
    font-weight:1000;
    color:#081018;
    font-size: clamp(14px, 2.2vw, 16px);
    background: linear-gradient(90deg, #fde047 0%, #fb7185 40%, #60a5fa 70%, #34d399 100%);
    box-shadow: 0 18px 40px rgba(0,0,0,.14);
  }
  .submit:disabled{ opacity:.75; cursor:not-allowed; }

  .links{
    display:flex;
    justify-content:center;
    gap:10px;
    flex-wrap:wrap;
    color: var(--muted);
    font-weight:900;
    font-size: 13px;
    padding-bottom: 8px;
  }
  .link{
    color:#7c3aed;
    cursor:pointer;
    text-decoration: underline;
    font-weight:1000;
    padding: 8px 6px;          /* larger tap */
  }
  .dot{ opacity:.6; }

  /* Modal */
  .mb{
    position:fixed; inset:0;
    display:flex; align-items:center; justify-content:center;
    background: rgba(0,0,0,.42);
    z-index: 9999;
    padding: 16px;
  }
  .mc{
    width:100%;
    max-width: 460px;
    background: rgba(255,255,255,.92);
    border: 1px solid rgba(255,255,255,.60);
    border-radius: 24px;
    padding: 18px;
    text-align:center;
    box-shadow: 0 35px 95px rgba(0,0,0,.28);
    backdrop-filter: blur(14px);
  }
  .pill{
    display:inline-block;
    padding:6px 12px;
    border-radius:999px;
    font-weight:1000;
    font-size:12px;
    border: 1px solid rgba(0,0,0,.08);
    margin-bottom:10px;
    background: rgba(124,58,237,.12);
    color:#4c1d95;
  }
  .pill.success{ background: rgba(34,197,94,.14); color:#0f5132; }
  .pill.error{ background: rgba(255,45,85,.12); color:#9f1239; }
  .pill.info{ background: rgba(124,58,237,.12); color:#4c1d95; }
  .mt{ margin:4px 0 6px; font-weight:1100; color:var(--txt); font-size:18px; }
  .mm{ margin:0 0 14px; color: rgba(11,18,32,.78); font-weight:900; line-height:1.4; }
  .mBtn{
    width:100%;
    border:none;
    padding:12px 14px;
    border-radius:16px;
    background: linear-gradient(90deg, #111827 0%, #334155 100%);
    color:#fff;
    font-weight:1100;
    cursor:pointer;
  }

  @media (max-width: 740px){
    .card{ padding:14px; }
    .drop{ grid-template-columns: 1fr; }
    .timeBox{ width:100%; text-align:left; }
  }
`;
