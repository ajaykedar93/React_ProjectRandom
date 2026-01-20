import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

const API_BASE = "https://express-projectrandom.onrender.com/api/notes-random";

export default function AddNote() {
  const { user, loading: authLoading } = useAuth();

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("user_token") ||
    sessionStorage.getItem("token") ||
    "";

  const isAuthenticated = !!user;

  const userId = useMemo(() => {
    return (
      user?.id ||
      user?.user_id ||
      user?.userid ||
      user?.UserId ||
      localStorage.getItem("user_id") ||
      ""
    );
  }, [user]);

  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [centerModal, setCenterModal] = useState({
    open: false,
    type: "info",
    title: "",
    message: "",
    onConfirm: null,
    confirmText: "OK",
    cancelText: "Cancel",
  });

  const openCenterModal = (payload) => setCenterModal({ open: true, ...payload });
  const closeCenterModal = () => setCenterModal((p) => ({ ...p, open: false, onConfirm: null }));

  const authHeaders = useMemo(() => {
    const h = {};
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  const fileRef = useRef(null);

  function to12HrFromInputTime(hhmm) {
    if (!hhmm) return "";
    const m = String(hhmm).match(/^(\d{2}):(\d{2})$/);
    if (!m) return "";
    let hh = parseInt(m[1], 10);
    const mm = m[2];
    const ap = hh >= 12 ? "PM" : "AM";
    hh = hh % 12;
    if (hh === 0) hh = 12;
    return `${String(hh).padStart(2, "0")}:${mm} ${ap}`;
  }

  const toInputTime = (hhmmampm) => {
    if (!hhmmampm) return "";
    const m = String(hhmmampm).match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
    if (!m) return "";
    let hh = parseInt(m[1], 10);
    const mm = m[2];
    const ap = m[3].toUpperCase();
    if (ap === "AM") {
      if (hh === 12) hh = 0;
    } else {
      if (hh !== 12) hh += 12;
    }
    return `${String(hh).padStart(2, "0")}:${mm}`;
  };

  const toInputDate = (ddmmyyyy) => {
    if (!ddmmyyyy) return "";
    const m = String(ddmmyyyy).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!m) return "";
    const dd = m[1].padStart(2, "0");
    const mm = m[2].padStart(2, "0");
    const yyyy = m[3];
    return `${yyyy}-${mm}-${dd}`;
  };

  const fromInputDate = (yyyymmdd) => {
    if (!yyyymmdd) return "";
    const m = String(yyyymmdd).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return "";
    const yyyy = m[1];
    const mm = m[2];
    const dd = m[3];
    return `${dd}/${mm}/${yyyy}`;
  };

  const getISTNow = () => {
    const now = new Date();
    const ist = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));

    const dd = String(ist.getDate()).padStart(2, "0");
    const mm = String(ist.getMonth() + 1).padStart(2, "0");
    const yyyy = ist.getFullYear();

    const HH = String(ist.getHours()).padStart(2, "0");
    const Min = String(ist.getMinutes()).padStart(2, "0");

    const ddmmyyyy = `${dd}/${mm}/${yyyy}`;
    const inputTime = `${HH}:${Min}`;
    const time12 = to12HrFromInputTime(inputTime);

    return { ddmmyyyy, time12 };
  };

  const [form, setForm] = useState(() => {
    const n = getISTNow();
    return {
      note_title: "",
      note_description: "",
      note_info: "",
      note_date: n.ddmmyyyy,
      note_time: n.time12,
      imageFile: null,
      dateTouched: false,
      timeTouched: false,
    };
  });

  // auto IST unless touched
  useEffect(() => {
    const tick = () => {
      setForm((p) => {
        const n = getISTNow();
        return {
          ...p,
          note_date: p.dateTouched ? p.note_date : n.ddmmyyyy,
          note_time: p.timeTouched ? p.note_time : n.time12,
        };
      });
    };
    tick();
    const id = window.setInterval(tick, 30 * 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addNote = async (e) => {
    e.preventDefault();

    if (!userId) {
      openCenterModal({
        type: "error",
        title: "Login required",
        message: "User id not found. Please login again.",
        confirmText: "OK",
      });
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("user_id", userId);

      if (form.note_title) fd.append("note_title", form.note_title);
      if (form.note_description) fd.append("note_description", form.note_description);
      if (form.note_info) fd.append("note_info", form.note_info);

      if (form.note_date) fd.append("note_date", form.note_date);
      if (form.note_time) fd.append("note_time", form.note_time);

      if (form.imageFile) fd.append("image", form.imageFile);

      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { ...authHeaders },
        body: fd,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to add note.");

      openCenterModal({
        type: "success",
        title: "Saved",
        message: "Note added successfully.",
        confirmText: "OK",
      });

      const n = getISTNow();
      setForm({
        note_title: "",
        note_description: "",
        note_info: "",
        note_date: n.ddmmyyyy,
        note_time: n.time12,
        imageFile: null,
        dateTouched: false,
        timeTouched: false,
      });
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      openCenterModal({
        type: "error",
        title: "Failed",
        message: err.message || "Something went wrong.",
        confirmText: "OK",
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    setPageLoading(false);
  }, [authLoading]);

  const showGlobalLoading = pageLoading || authLoading;

  return (
    <div className="notesnPage">
      <style>{css}</style>

      {showGlobalLoading && (
        <div className="notesnOverlay">
          <div className="notesnLoaderCard">
            <div className="notesnSpinner" />
            <div className="notesnLoaderText">Loading…</div>
          </div>
        </div>
      )}

      {centerModal.open && (
        <div className="notesnModalOverlay" onClick={closeCenterModal}>
          <div className="notesnModalCard" onClick={(e) => e.stopPropagation()}>
            <div className="notesnModalTop">
              <div
                className={`notesnBadge ${
                  centerModal.type === "success"
                    ? "ok"
                    : centerModal.type === "error"
                    ? "bad"
                    : centerModal.type === "confirm"
                    ? "warn"
                    : "info"
                }`}
              >
                {centerModal.type === "success"
                  ? "Success"
                  : centerModal.type === "error"
                  ? "Error"
                  : centerModal.type === "confirm"
                  ? "Confirm"
                  : "Info"}
              </div>
              <div className="notesnModalTitle">{centerModal.title}</div>
              <div className="notesnModalMsg">{centerModal.message}</div>
            </div>

            <div className="notesnModalActions">
              <button className="btn primary" onClick={closeCenterModal}>
                {centerModal.confirmText || "OK"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="notesnTopTitle">Add Note</div>

      <div className="notesnShell">
        <div className="card edge">
          <div className="cardHead">
            <div>
              <div className="cardTitle">Create a note</div>
              <div className="cardSub">Image optional • Date/Time IST auto</div>
            </div>
          </div>

          {!isAuthenticated || !userId ? (
            <div className="softInfo">
              <div className="softTitle">Login required</div>
              <div className="softText">Please login to add notes.</div>
            </div>
          ) : (
            <form onSubmit={addNote} className="form">
              <div className="grid2">
                <div className="field">
                  <label className="label">Title (optional)</label>
                  <input
                    className="input"
                    value={form.note_title}
                    onChange={(e) => setForm((p) => ({ ...p, note_title: e.target.value }))}
                    placeholder="Eg. Meeting points"
                  />
                </div>

                <div className="field">
                  <label className="label">Info (optional)</label>
                  <input
                    className="input"
                    value={form.note_info}
                    onChange={(e) => setForm((p) => ({ ...p, note_info: e.target.value }))}
                    placeholder="Eg. Name / number / details"
                  />
                </div>
              </div>

              <div className="field">
                <label className="label">Description (optional)</label>
                <textarea
                  className="textarea"
                  value={form.note_description}
                  onChange={(e) => setForm((p) => ({ ...p, note_description: e.target.value }))}
                  placeholder="Write your note…"
                />
              </div>

              <div className="grid3">
                <div className="field">
                  <label className="label">Date</label>
                  <input
                    type="date"
                    className="input"
                    value={toInputDate(form.note_date)}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        note_date: fromInputDate(e.target.value),
                        dateTouched: true,
                      }))
                    }
                  />
                  <div className="micro">
                    API: <span className="mono">dd/mm/yyyy</span>
                  </div>
                </div>

                <div className="field">
                  <label className="label">Time</label>
                  <input
                    type="time"
                    className="input"
                    value={toInputTime(form.note_time)}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        note_time: to12HrFromInputTime(e.target.value),
                        timeTouched: true,
                      }))
                    }
                  />
                  <div className="micro">
                    API: <span className="mono">hh:mm AM/PM</span>
                  </div>
                </div>

                <div className="field">
                  <label className="label">Image (optional)</label>
                  <input
                    ref={fileRef}
                    type="file"
                    className="file"
                    accept="*/*"
                    onChange={(e) => setForm((p) => ({ ...p, imageFile: e.target.files?.[0] || null }))}
                  />
                  <div className="micro">
                    <span className="mono">{form.imageFile ? form.imageFile.name : "No file selected"}</span>
                  </div>
                </div>
              </div>

              <div className="actions">
                <button className="btn primary" disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </button>

                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => {
                    const n = getISTNow();
                    setForm({
                      note_title: "",
                      note_description: "",
                      note_info: "",
                      note_date: n.ddmmyyyy,
                      note_time: n.time12,
                      imageFile: null,
                      dateTouched: false,
                      timeTouched: false,
                    });
                    if (fileRef.current) fileRef.current.value = "";
                    openCenterModal({
                      type: "info",
                      title: "Cleared",
                      message: "Form cleared.",
                      confirmText: "OK",
                    });
                  }}
                >
                  Clear
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div style={{ height: 18 }} />
    </div>
  );
}

/* ✅ SAME vibrant CSS (shared) */
const css = `
  *{ box-sizing:border-box; }
  :root{
    --bg:#f7f9ff;
    --card:#ffffff;
    --border:#e7ebff;
    --text:#111827;
    --muted:#6b7280;

    --blue:#2563eb;
    --purple:#7c3aed;
    --pink:#ec4899;
    --green:#22c55e;
    --red:#ef4444;
    --amber:#f59e0b;

    --soft1: rgba(37,99,235,.10);
    --soft2: rgba(124,58,237,.10);
    --soft3: rgba(236,72,153,.10);
  }

  .notesnPage{
    min-height:100vh;
    width:100%;
    background:
      radial-gradient(900px 520px at 15% 5%, var(--soft1), transparent 60%),
      radial-gradient(820px 520px at 90% 15%, var(--soft2), transparent 60%),
      radial-gradient(760px 520px at 55% 95%, var(--soft3), transparent 60%),
      linear-gradient(180deg, #ffffff, #f3f6ff);
  }

  .notesnTopTitle{
    width:100%;
    text-align:center;
    font-weight:1000;
    color:#000;
    letter-spacing:.2px;
    padding: 14px 12px 6px;
    font-size: 18px;
  }

  .notesnShell{
    max-width:1100px;
    margin: 0 auto;
    padding: 10px 12px 24px;
  }

  .edge{
    margin-left: -12px;
    margin-right: -12px;
  }

  .card{
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 18px;
    box-shadow: 0 14px 34px rgba(17,24,39,.08);
    padding: 14px;
  }

  .cardHead{
    display:flex;
    align-items:flex-start;
    justify-content:space-between;
    gap: 12px;
    margin-bottom: 12px;
  }

  .cardTitle{
    font-size:15px;
    font-weight:1000;
    color: var(--text);
  }
  .cardSub{
    margin-top:3px;
    font-size:12px;
    font-weight:800;
    color: var(--muted);
  }

  .softInfo{
    border: 1px dashed rgba(37,99,235,.35);
    background: rgba(37,99,235,.08);
    border-radius: 16px;
    padding: 12px;
  }
  .softTitle{ font-weight:1000; color: var(--text); font-size:13px; }
  .softText{ margin-top:4px; font-weight:800; color: var(--muted); font-size:12px; line-height:1.45; }

  .form{ display:flex; flex-direction:column; gap: 10px; }

  .grid2{ display:grid; grid-template-columns: 1fr; gap: 10px; }
  .grid3{ display:grid; grid-template-columns: 1fr; gap: 10px; }

  .field{ display:flex; flex-direction:column; gap: 6px; }

  .label{
    font-size:12px;
    font-weight:1000;
    color: rgba(17,24,39,.85);
  }

  .input, .textarea, .file{
    width:100%;
    border-radius: 14px;
    border: 1px solid rgba(99,102,241,.18);
    background: rgba(255,255,255,.92);
    padding: 12px 12px;
    outline:none;
    color: var(--text);
    font-weight:800;
  }

  .textarea{ min-height: 92px; resize: vertical; }
  .file{
    padding: 10px 10px;
    border-style: dashed;
    background: rgba(99,102,241,.05);
  }

  .micro{ font-size:11px; font-weight:800; color: var(--muted); }
  .mono{ font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }

  .actions{ display:flex; gap: 10px; flex-wrap:wrap; margin-top: 2px; }

  .btn{
    border: none;
    cursor:pointer;
    border-radius: 14px;
    padding: 12px 14px;
    font-weight: 1000;
    letter-spacing:.2px;
    transition: transform .12s ease, filter .12s ease, box-shadow .12s ease;
  }
  .btn:active{ transform: scale(.98); }
  .btn:hover{ filter: brightness(1.02); }

  .btn.primary{
    color:#fff;
    background: linear-gradient(135deg, var(--blue), var(--pink));
    box-shadow: 0 12px 24px rgba(37,99,235,.18);
  }
  .btn.ghost{
    color: rgba(17,24,39,.85);
    background: linear-gradient(135deg, rgba(37,99,235,.08), rgba(124,58,237,.06));
    border: 1px solid rgba(37,99,235,.18);
  }
  .btn.danger{
    color:#fff;
    background: linear-gradient(135deg, var(--red), #fb7185);
    box-shadow: 0 12px 24px rgba(239,68,68,.18);
  }
  .btn.mini{
    padding: 10px 12px;
    border-radius: 12px;
    font-size: 12px;
  }
  .btn.disabled{ opacity:.6; cursor:not-allowed; }

  .input:focus, .textarea:focus{
    border-color: rgba(236,72,153,.45);
    box-shadow: 0 0 0 4px rgba(236,72,153,.12);
  }

  .notesnOverlay{
    position:fixed;
    inset:0;
    z-index: 999;
    display:grid;
    place-items:center;
    background: rgba(255,255,255,.75);
    backdrop-filter: blur(10px);
  }
  .notesnLoaderCard{
    width: min(320px, 92vw);
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 16px;
    box-shadow: 0 16px 44px rgba(17,24,39,.12);
    display:flex;
    flex-direction:column;
    align-items:center;
    gap: 10px;
  }
  .notesnSpinner{
    width: 42px; height: 42px;
    border-radius: 999px;
    border: 4px solid rgba(37,99,235,.18);
    border-top-color: rgba(236,72,153,.95);
    animation: spin 1s linear infinite;
  }
  .notesnLoaderText{
    font-size: 13px;
    font-weight: 1000;
    color: rgba(17,24,39,.80);
  }

  .notesnModalOverlay{
    position:fixed;
    inset:0;
    z-index: 1200;
    display:grid;
    place-items:center;
    padding: 12px;
    background: rgba(37,99,235,.10);
    backdrop-filter: blur(10px);
  }
  .notesnModalCard{
    width: min(420px, 92vw);
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 16px;
    box-shadow: 0 20px 70px rgba(17,24,39,.16);
  }
  .notesnModalTop{ display:flex; flex-direction:column; gap: 8px; }
  .notesnBadge{
    align-self:flex-start;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 1000;
    border: 1px solid rgba(37,99,235,.20);
    background: rgba(37,99,235,.10);
    color: rgba(37,99,235,1);
  }
  .notesnBadge.ok{
    border-color: rgba(34,197,94,.22);
    background: rgba(34,197,94,.10);
    color: rgba(34,197,94,1);
  }
  .notesnBadge.bad{
    border-color: rgba(239,68,68,.22);
    background: rgba(239,68,68,.10);
    color: rgba(239,68,68,1);
  }
  .notesnBadge.warn{
    border-color: rgba(245,158,11,.25);
    background: rgba(245,158,11,.12);
    color: rgba(245,158,11,1);
  }

  .notesnModalTitle{
    font-size: 15px;
    font-weight: 1100;
    color: var(--text);
  }
  .notesnModalMsg{
    font-size: 12px;
    font-weight: 850;
    color: rgba(17,24,39,.72);
    line-height: 1.45;
  }
  .notesnModalActions{
    display:flex;
    justify-content:flex-end;
    gap: 10px;
    margin-top: 12px;
    flex-wrap: wrap;
  }

  @media (min-width: 740px){
    .edge{ margin-left: 0; margin-right: 0; }
    .grid2{ grid-template-columns: 1fr 1fr; }
    .grid3{ grid-template-columns: 1fr 1fr 1fr; }
    .notesnTopTitle{ font-size: 20px; padding-top: 18px; }
  }

  @keyframes spin{ from{ transform: rotate(0deg);} to{ transform: rotate(360deg);} }
`;
