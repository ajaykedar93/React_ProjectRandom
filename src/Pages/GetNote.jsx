import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

const API_BASE = "https://express-projectrandom.onrender.com/api/notes-random";

export default function Getnote() {
  const { user, loading: authLoading } = useAuth();

  // ✅ Token logic (exactly as requested)
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

  const authHeaders = useMemo(() => {
    const h = {};
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [q, setQ] = useState("");

  // Center modal (alerts/confirm)
  const [centerModal, setCenterModal] = useState({
    open: false,
    type: "info", // info | success | error | confirm
    title: "",
    message: "",
    onConfirm: null,
    confirmText: "OK",
    cancelText: "Cancel",
  });

  const openCenterModal = (payload) => {
    setCenterModal({ open: true, ...payload });
  };

  const closeCenterModal = () => {
    setCenterModal((p) => ({ ...p, open: false, onConfirm: null }));
  };

  const safeText = (v) => (v == null || v === "" ? "—" : String(v));

  const getImageUrl = (noteId) =>
    `${API_BASE}/${noteId}/image?user_id=${encodeURIComponent(userId)}`;

  const fetchNotes = async () => {
    if (!userId) return;

    setNotesLoading(true);
    try {
      const res = await fetch(`${API_BASE}?user_id=${encodeURIComponent(userId)}`, {
        method: "GET",
        headers: { ...authHeaders },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to load notes.");

      setNotes(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      openCenterModal({
        type: "error",
        title: "Failed",
        message: err?.message || "Something went wrong.",
        confirmText: "OK",
      });
    } finally {
      setNotesLoading(false);
    }
  };

  const confirmDelete = (noteId) => {
    openCenterModal({
      type: "confirm",
      title: "Delete note?",
      message: "This note will be deleted permanently.",
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: () => deleteNote(noteId),
    });
  };

  const deleteNote = async (noteId) => {
    closeCenterModal();
    if (!userId) return;

    try {
      setNotesLoading(true);
      const res = await fetch(
        `${API_BASE}/${noteId}?user_id=${encodeURIComponent(userId)}`,
        {
          method: "DELETE",
          headers: { ...authHeaders },
        }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to delete note.");

      openCenterModal({
        type: "success",
        title: "Deleted",
        message: "Note removed successfully.",
        confirmText: "OK",
      });

      await fetchNotes();
    } catch (err) {
      openCenterModal({
        type: "error",
        title: "Failed",
        message: err?.message || "Something went wrong.",
        confirmText: "OK",
      });
      setNotesLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!userId) return;
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, userId]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return notes;
    return notes.filter((n) => {
      const t = (n.note_title || "").toLowerCase();
      const d = (n.note_description || "").toLowerCase();
      const i = (n.note_info || "").toLowerCase();
      const dt = `${n.note_date || ""} ${n.note_time || ""}`.toLowerCase();
      return t.includes(s) || d.includes(s) || i.includes(s) || dt.includes(s);
    });
  }, [notes, q]);

  const showGlobalLoading = authLoading;

  return (
    <div className="getnotePage">
      <style>{css}</style>

      {/* Global Loading */}
      {showGlobalLoading && (
        <div className="overlay">
          <div className="loaderCard">
            <div className="spinner" />
            <div className="loaderText">Loading…</div>
          </div>
        </div>
      )}

      {/* Center Modal (alerts/confirm) */}
      {centerModal.open && (
        <div className="modalOverlay" onClick={closeCenterModal}>
          <div className="modalCard" onClick={(e) => e.stopPropagation()}>
            <div className="modalTop">
              <div
                className={`badge ${
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
              <div className="modalTitle">{centerModal.title}</div>
              <div className="modalMsg">{centerModal.message}</div>
            </div>

            <div className="modalActions">
              {centerModal.type === "confirm" && (
                <button className="btn ghost" onClick={closeCenterModal}>
                  {centerModal.cancelText || "Cancel"}
                </button>
              )}
              <button
                className={`btn ${
                  centerModal.type === "error"
                    ? "danger"
                    : centerModal.type === "confirm"
                    ? "primary"
                    : "primary"
                }`}
                onClick={() => {
                  if (
                    centerModal.type === "confirm" &&
                    typeof centerModal.onConfirm === "function"
                  ) {
                    centerModal.onConfirm();
                  } else {
                    closeCenterModal();
                  }
                }}
              >
                {centerModal.confirmText || "OK"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="top">
        <div className="topLeft">
          <div className="icon" aria-hidden="true">
            📚
          </div>
          <div className="tStack">
            <div className="h1">Get Notes</div>
            <div className="h2">View all your saved notes (with image)</div>
          </div>
        </div>

        <div className="topRight">
          <div className="countPill">
            Total: <b>{notes.length}</b>
          </div>
          <button
            className="btn ghost"
            onClick={fetchNotes}
            disabled={!userId || notesLoading}
            title={!userId ? "Login required" : "Refresh"}
          >
            {notesLoading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {/* Auth guard */}
      {!isAuthenticated || !userId ? (
        <div className="card warnCard">
          <div className="cardTitle">Login required</div>
          <div className="cardSub">
            Please login again. User id not found.
          </div>
        </div>
      ) : (
        <>
          {/* Search */}
          <div className="bar">
            <div className="searchBox">
              <span className="sIcon" aria-hidden="true">
                🔎
              </span>
              <input
                className="sInp"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by title, description, info, date/time..."
              />
            </div>

            {notesLoading ? (
              <div className="miniLoad">
                <span className="miniSpin" /> Loading…
              </div>
            ) : (
              <div className="miniLoad okTxt">
                Showing: <b>{filtered.length}</b>
              </div>
            )}
          </div>

          {/* Empty */}
          {!notesLoading && filtered.length === 0 && (
            <div className="card empty">
              <div className="emptyIcon" aria-hidden="true">
                📭
              </div>
              <div className="cardTitle">No notes found</div>
              <div className="cardSub">
                {notes.length === 0
                  ? "You have not added any notes yet."
                  : "Try changing your search."}
              </div>
              <button className="btn primary" onClick={() => setQ("")}>
                Clear Search
              </button>
            </div>
          )}

          {/* List */}
          <div className="grid">
            {filtered.map((n) => (
              <div key={n.note_id} className="noteCard">
                <div className="noteTop">
                  <div className="meta">
                    <span className="sr">#{safeText(n.sr_no)}</span>
                    <span className="dt">
                      <b>{safeText(n.note_date)}</b> <span className="dot">•</span>{" "}
                      <b>{safeText(n.note_time)}</b>
                    </span>
                  </div>

                  <div className="actions">
                    <button
                      type="button"
                      className="btn mini danger"
                      onClick={() => confirmDelete(n.note_id)}
                      disabled={notesLoading}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="titleRow">
                  <div className="noteTitle">
                    {n.note_title ? n.note_title : <span className="muted">Untitled</span>}
                  </div>
                </div>

                <div className="desc">
                  {n.note_description ? n.note_description : <span className="muted2">No description</span>}
                </div>

                {n.note_info ? (
                  <div className="infoPill">
                    <span className="infoLbl">Info:</span> {n.note_info}
                  </div>
                ) : null}

                {n.has_image ? (
                  <div className="imgBox">
                    <div className="imgTop">
                      <div className="imgLbl">Image</div>
                      <a
                        className="imgLink"
                        href={getImageUrl(n.note_id)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open
                      </a>
                    </div>
                    <img
                      className="img"
                      src={getImageUrl(n.note_id)}
                      alt="note"
                      loading="lazy"
                      onError={() =>
                        openCenterModal({
                          type: "error",
                          title: "Image error",
                          message: "Could not load image for this note.",
                          confirmText: "OK",
                        })
                      }
                    />
                  </div>
                ) : (
                  <div className="noImg">No image</div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{ height: 14 }} />
    </div>
  );
}

/* ✅ Bright + vibrant professional CSS (NO dark theme) */
const css = `
  *{ box-sizing:border-box; }
  :root{
    --text:#111827;
    --muted:#6b7280;
    --border:#e7ebff;

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

  .getnotePage{
    min-height: 100vh;
    width: 100%;
    background:
      radial-gradient(900px 520px at 15% 5%, var(--soft1), transparent 60%),
      radial-gradient(820px 520px at 90% 15%, var(--soft2), transparent 60%),
      radial-gradient(760px 520px at 55% 95%, var(--soft3), transparent 60%),
      linear-gradient(180deg, #ffffff, #f3f6ff);
    padding: 12px;
  }

  /* Header */
  .top{
    width:100%;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap: 12px;
    padding: 12px;
    background: rgba(255,255,255,.85);
    border: 1px solid var(--border);
    border-radius: 18px;
    box-shadow: 0 14px 34px rgba(17,24,39,.08);
    backdrop-filter: blur(10px);
  }

  .topLeft{ display:flex; align-items:center; gap: 12px; min-width:0; }
  .icon{
    width:44px; height:44px;
    border-radius: 14px;
    display:grid; place-items:center;
    background: linear-gradient(135deg, rgba(37,99,235,.20), rgba(236,72,153,.14));
    border: 1px solid rgba(37,99,235,.22);
    box-shadow: 0 12px 28px rgba(37,99,235,.16);
    flex:0 0 auto;
  }
  .tStack{ min-width:0; }
  .h1{ font-size: 16px; font-weight: 1100; color: var(--text); }
  .h2{ margin-top: 2px; font-size: 12px; font-weight: 850; color: var(--muted); }

  .topRight{
    display:flex;
    align-items:center;
    gap: 10px;
    flex-wrap: wrap;
    justify-content:flex-end;
  }
  .countPill{
    padding: 8px 10px;
    border-radius: 999px;
    background: rgba(37,99,235,.08);
    border: 1px solid rgba(37,99,235,.16);
    font-weight: 1000;
    font-size: 12px;
    color: rgba(17,24,39,.85);
    white-space: nowrap;
  }

  /* Search bar */
  .bar{
    margin-top: 12px;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap: 10px;
    flex-wrap: wrap;
  }

  .searchBox{
    flex: 1;
    min-width: 240px;
    display:flex;
    align-items:center;
    gap: 8px;
    padding: 10px 12px;
    border-radius: 16px;
    background: rgba(255,255,255,.88);
    border: 1px solid var(--border);
    box-shadow: 0 12px 26px rgba(17,24,39,.08);
  }
  .sIcon{ font-size: 14px; }
  .sInp{
    width:100%;
    border:none;
    outline:none;
    background: transparent;
    font-weight: 950;
    font-size: 12px;
    color: rgba(17,24,39,.90);
  }

  .miniLoad{
    display:flex;
    align-items:center;
    gap: 8px;
    font-weight: 950;
    font-size: 12px;
    color: rgba(17,24,39,.70);
    white-space: nowrap;
  }
  .okTxt{ color: rgba(17,24,39,.82); }
  .miniSpin{
    width: 14px; height: 14px;
    border-radius: 999px;
    border: 3px solid rgba(37,99,235,.20);
    border-top-color: rgba(37,99,235,.95);
    animation: spin 1s linear infinite;
    display:inline-block;
  }

  /* Cards */
  .card{
    background: rgba(255,255,255,.92);
    border: 1px solid var(--border);
    border-radius: 18px;
    box-shadow: 0 14px 34px rgba(17,24,39,.08);
    padding: 14px;
    margin-top: 12px;
  }
  .cardTitle{ font-weight: 1100; font-size: 14px; color: var(--text); }
  .cardSub{ margin-top: 4px; font-weight: 850; font-size: 12px; color: var(--muted); line-height: 1.45; }

  .warnCard{
    border-style: dashed;
    background: rgba(245,158,11,.08);
    border-color: rgba(245,158,11,.25);
  }

  .empty{
    display:flex;
    flex-direction: column;
    align-items:center;
    text-align:center;
    gap: 8px;
  }
  .emptyIcon{ font-size: 34px; }

  /* Notes grid */
  .grid{
    margin-top: 12px;
    display:grid;
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .noteCard{
    background: rgba(255,255,255,.92);
    border: 1px solid var(--border);
    border-radius: 18px;
    box-shadow: 0 14px 34px rgba(17,24,39,.08);
    padding: 14px;
    position: relative;
    overflow: hidden;
  }

  .noteCard::before{
    content:"";
    position:absolute;
    inset:-90px -50px auto -50px;
    height: 140px;
    background: radial-gradient(circle at 20% 20%,
      rgba(37,99,235,.14),
      rgba(124,58,237,.10),
      rgba(255,255,255,0) 60%
    );
    filter: blur(12px);
    opacity: .95;
    pointer-events:none;
  }

  .noteTop{
    position: relative;
    z-index: 1;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 10px;
  }

  .meta{
    display:flex;
    align-items:center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .sr{
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 1100;
    color: rgba(37,99,235,1);
    background: rgba(37,99,235,.10);
    border: 1px solid rgba(37,99,235,.18);
  }

  .dt{
    font-size: 12px;
    font-weight: 950;
    color: rgba(17,24,39,.72);
  }
  .dot{ opacity:.5; }

  .actions{ display:flex; gap: 8px; }

  .titleRow{ position: relative; z-index: 1; }
  .noteTitle{
    font-size: 15px;
    font-weight: 1200;
    color: rgba(17,24,39,.92);
    word-break: break-word;
  }
  .muted{ color: rgba(107,114,128,1); font-weight: 1100; }
  .muted2{ color: rgba(107,114,128,1); font-weight: 900; }

  .desc{
    position: relative;
    z-index: 1;
    margin-top: 8px;
    font-size: 12px;
    font-weight: 850;
    color: rgba(17,24,39,.84);
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
    min-height: 20px;
  }

  .infoPill{
    position: relative;
    z-index: 1;
    margin-top: 10px;
    padding: 10px 12px;
    border-radius: 14px;
    background: linear-gradient(135deg, rgba(34,197,94,.10), rgba(37,99,235,.06));
    border: 1px solid rgba(34,197,94,.20);
    color: rgba(17,24,39,.88);
    font-weight: 900;
    font-size: 12px;
  }
  .infoLbl{ color: rgba(34,197,94,.95); font-weight: 1100; }

  .imgBox{
    position: relative;
    z-index: 1;
    margin-top: 10px;
    border-radius: 16px;
    overflow:hidden;
    border: 1px solid rgba(124,58,237,.16);
    background: rgba(124,58,237,.04);
  }
  .imgTop{
    display:flex;
    align-items:center;
    justify-content:space-between;
    padding: 10px 12px;
    border-bottom: 1px solid rgba(124,58,237,.12);
  }
  .imgLbl{ font-weight: 1100; font-size: 12px; color: rgba(17,24,39,.78); }
  .imgLink{
    font-weight: 1100;
    font-size: 12px;
    color: rgba(37,99,235,1);
    text-decoration:none;
  }
  .img{ width:100%; height:auto; display:block; }
  .noImg{
    position: relative;
    z-index: 1;
    margin-top: 10px;
    font-size: 12px;
    font-weight: 900;
    color: var(--muted);
  }

  /* Buttons */
  .btn{
    border:none;
    cursor:pointer;
    border-radius: 14px;
    padding: 11px 14px;
    font-weight: 1100;
    letter-spacing:.2px;
    transition: transform .12s ease, filter .12s ease, box-shadow .12s ease;
  }
  .btn:active{ transform: scale(.98); }
  .btn:hover{ filter: brightness(1.02); }
  .btn:disabled{ opacity:.6; cursor:not-allowed; }

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

  /* Global overlay loading */
  .overlay{
    position:fixed;
    inset:0;
    z-index: 999;
    display:grid;
    place-items:center;
    background: rgba(255,255,255,.75);
    backdrop-filter: blur(10px);
  }
  .loaderCard{
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
  .spinner{
    width: 42px; height: 42px;
    border-radius: 999px;
    border: 4px solid rgba(37,99,235,.18);
    border-top-color: rgba(236,72,153,.95);
    animation: spin 1s linear infinite;
  }
  .loaderText{
    font-size: 13px;
    font-weight: 1100;
    color: rgba(17,24,39,.80);
  }

  /* Center modal */
  .modalOverlay{
    position:fixed;
    inset:0;
    z-index: 1200;
    display:grid;
    place-items:center;
    padding: 12px;
    background: rgba(37,99,235,.10);
    backdrop-filter: blur(10px);
  }
  .modalCard{
    width: min(420px, 92vw);
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 16px;
    box-shadow: 0 20px 70px rgba(17,24,39,.16);
  }
  .modalTop{ display:flex; flex-direction:column; gap: 8px; }
  .badge{
    align-self:flex-start;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 1100;
    border: 1px solid rgba(37,99,235,.20);
    background: rgba(37,99,235,.10);
    color: rgba(37,99,235,1);
  }
  .badge.ok{
    border-color: rgba(34,197,94,.22);
    background: rgba(34,197,94,.10);
    color: rgba(34,197,94,1);
  }
  .badge.bad{
    border-color: rgba(239,68,68,.22);
    background: rgba(239,68,68,.10);
    color: rgba(239,68,68,1);
  }
  .badge.warn{
    border-color: rgba(245,158,11,.25);
    background: rgba(245,158,11,.12);
    color: rgba(245,158,11,1);
  }

  .modalTitle{
    font-size: 15px;
    font-weight: 1200;
    color: var(--text);
  }
  .modalMsg{
    font-size: 12px;
    font-weight: 900;
    color: rgba(17,24,39,.72);
    line-height: 1.45;
  }

  .modalActions{
    display:flex;
    justify-content:flex-end;
    gap: 10px;
    margin-top: 12px;
    flex-wrap: wrap;
  }

  /* Responsive */
  @media (min-width: 860px){
    .getnotePage{ padding: 14px; }
    .grid{ grid-template-columns: 1fr 1fr; }
  }
  @media (min-width: 1120px){
    .grid{ grid-template-columns: 1fr 1fr 1fr; }
  }

  @keyframes spin{ from{ transform: rotate(0deg);} to{ transform: rotate(360deg);} }
`;
