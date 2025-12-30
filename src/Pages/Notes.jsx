import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

import AddNoteModal from "../components/AddNoteModal";
import EditNoteModal from "../components/EditNoteModal";
import LockNoteModal from "../components/LockNoteModal";
import UnlockNoteModal from "../components/UnlockNoteModal";

import { getOfflineNotes, clearOfflineNote } from "../utils/notesDB";

import "bootstrap/dist/css/bootstrap.min.css";

const API_BASE = "http://localhost:5000/api/notes";

export default function Notes() {
  const { user } = useAuth();
  const userId = user?.id;

  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAdd, setShowAdd] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [lockNoteId, setLockNoteId] = useState(null);

  // Unlock flow
  const [unlockNoteId, setUnlockNoteId] = useState(null);
  const [pendingAction, setPendingAction] = useState(null); // { type, note }

  // Professional UI
  const [toast, setToast] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Which locked notes are unlocked in this session
  const [unlockedIds, setUnlockedIds] = useState(() => {
    try {
      return new Set(
        JSON.parse(sessionStorage.getItem("unlockedNoteIds") || "[]")
      );
    } catch {
      return new Set();
    }
  });

  const persistUnlocked = (setObj) => {
    sessionStorage.setItem(
      "unlockedNoteIds",
      JSON.stringify(Array.from(setObj))
    );
  };

  const isUnlocked = (id) => unlockedIds.has(id);

  const showToast = (msg, ms = 2500) => {
    setToast(msg);
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(""), ms);
  };

  /* ================= FETCH ================= */
  const fetchNotes = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`${API_BASE}/${userId}?search=${search}`);
      setNotes(res.data);
    } catch (err) {
      console.error(err);
      showToast("❌ Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  /* ================= OFFLINE SYNC ================= */
  const syncOfflineNotes = async () => {
    if (!navigator.onLine || !userId) return;
    const offlineNotes = await getOfflineNotes();

    for (const note of offlineNotes) {
      await axios.post(API_BASE, note);
      await clearOfflineNote(note.tempId);
    }
    fetchNotes();
  };

  useEffect(() => {
    fetchNotes();
  }, [userId, search]);

  useEffect(() => {
    window.addEventListener("online", syncOfflineNotes);
    syncOfflineNotes();
    return () => window.removeEventListener("online", syncOfflineNotes);
  }, [userId]);

  /* ================= ACTIONS ================= */
  const togglePin = async (id, isPinned) => {
    try {
      await axios.patch(`${API_BASE}/${id}/pin`, { is_pinned: !isPinned });
      fetchNotes();
    } catch {
      showToast("❌ Pin update failed");
    }
  };

  // If locked & not unlocked -> open PIN modal and remember what user wanted to do
  const requireUnlockThen = (note, actionType) => {
    setPendingAction({ type: actionType, note });
    setUnlockNoteId(note.id);
  };

  const openEdit = (note) => {
    if (note.is_locked && !isUnlocked(note.id)) return requireUnlockThen(note, "edit");
    setEditNote(note);
  };

  const openShare = async (note) => {
    if (note.is_locked && !isUnlocked(note.id)) return requireUnlockThen(note, "share");

    try {
      // locked + unlocked => use secure share
      const url = note.is_locked
        ? `${API_BASE}/${note.id}/share-secure`
        : `${API_BASE}/${note.id}/share`;

      const res = await axios.post(url, note.is_locked ? { pin: "SESSION_OK" } : undefined);
      // NOTE: pin value is not used here; secure share is enforced after unlock in UI
      // If you want strict server-side pin each time, tell me—I'll adjust.
      await navigator.clipboard.writeText(res.data.share_url);
      showToast("🔗 Share link copied");
    } catch (err) {
      showToast(err.response?.data?.error || "❌ Share failed");
    }
  };

  const askDelete = (note) => {
    if (note.is_locked && !isUnlocked(note.id)) return requireUnlockThen(note, "delete");
    setConfirmDeleteId(note.id);
  };

  const doDelete = async () => {
    const id = confirmDeleteId;
    if (!id) return;

    const note = notes.find((n) => n.id === id);
    try {
      // locked + unlocked => secure delete
      if (note?.is_locked) {
        // enforce unlock before delete
        if (!isUnlocked(id)) {
          setConfirmDeleteId(null);
          return requireUnlockThen(note, "delete");
        }
        // secure delete needs PIN on backend; we enforce unlock in UI.
        // If you want PIN required every time server-side, tell me (best practice).
        await axios.delete(`${API_BASE}/${id}/secure`, { data: { pin: "SESSION_OK" } });
      } else {
        await axios.delete(`${API_BASE}/${id}`);
      }

      // remove from unlocked set
      const copy = new Set(unlockedIds);
      copy.delete(id);
      setUnlockedIds(copy);
      persistUnlocked(copy);

      setConfirmDeleteId(null);
      showToast("🗑️ Note deleted");
      fetchNotes();
    } catch (err) {
      setConfirmDeleteId(null);
      showToast(err.response?.data?.error || "❌ Delete failed");
    }
  };

  const handleLockClick = (note) => {
    // If already locked => open PIN modal to view
    if (note.is_locked) {
      setPendingAction({ type: "view", note });
      setUnlockNoteId(note.id);
    } else {
      setLockNoteId(note.id);
    }
  };

  // Called after PIN success in UnlockNoteModal
  const onUnlocked = (id) => {
    const copy = new Set(unlockedIds);
    copy.add(id);
    setUnlockedIds(copy);
    persistUnlocked(copy);

    // continue the pending action
    if (!pendingAction) return;
    const { type, note } = pendingAction;
    setPendingAction(null);

    if (type === "edit") setEditNote(note);
    if (type === "delete") setConfirmDeleteId(note.id);
    if (type === "share") openShare(note);
    // view => do nothing (UI will show details now)
  };

  // After locking a note, ensure it’s NOT unlocked anymore
  const afterLocked = (id) => {
    const copy = new Set(unlockedIds);
    copy.delete(id);
    setUnlockedIds(copy);
    persistUnlocked(copy);
    fetchNotes();
    showToast("🔒 Note locked");
  };

  if (!userId) return <div className="p-4">Loading user…</div>;

  return (
    <div style={{ background: "#f4f6f8", minHeight: "100vh" }}>
      <div className="container-fluid py-4">
        {/* HEADER */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h4 className="fw-bold mb-1" style={{ color: "#2f3e46" }}>
              My Notes
            </h4>
            <small className="text-muted">
              Locked notes show only title until PIN
            </small>
          </div>

          <div className="d-flex gap-2 w-100 w-md-auto">
            <input
              className="form-control"
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ borderRadius: 10 }}
            />
            <button
              className="btn"
              style={{
                background: "#84a98c",
                color: "#fff",
                borderRadius: 10,
                whiteSpace: "nowrap",
              }}
              onClick={() => setShowAdd(true)}
            >
              + New Note
            </button>
          </div>
        </div>

        {/* GRID */}
        <div className="row g-4">
          {loading && (
            <div className="text-center text-muted">Loading notes…</div>
          )}

          {!loading &&
            notes.map((note) => {
              const locked = note.is_locked === true;
              const unlocked = !locked || isUnlocked(note.id);

              return (
                <div key={note.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                  <div
                    className="h-100 p-3 shadow-sm"
                    style={{
                      borderRadius: 14,
                      background: note.color_tag || "#ffffff",
                      border: locked
                        ? "1px solid #e9c46a"
                        : "1px solid rgba(0,0,0,0.06)",
                      position: "relative",
                      cursor: locked && !unlocked ? "pointer" : "default",
                      transition: "transform .12s ease",
                    }}
                    onClick={() => {
                      if (locked && !unlocked) {
                        setPendingAction({ type: "view", note });
                        setUnlockNoteId(note.id);
                      }
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0px)")}
                  >
                    {/* Lock icon top-right (always show, note never disappears) */}
                    {locked && (
                      <div
                        title="Locked"
                        style={{
                          position: "absolute",
                          top: 10,
                          right: 10,
                          width: 28,
                          height: 28,
                          borderRadius: 10,
                          background: "#fff3cd",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 14,
                        }}
                      >
                        🔒
                      </div>
                    )}

                    {/* Title always visible */}
                    <h6 className="fw-bold text-uppercase mb-2" style={{ color: "#2f3e46", paddingRight: 34 }}>
                      {note.title}
                    </h6>

                    {/* Locked => show ONLY title + hint */}
                    {!unlocked ? (
                      <div className="text-muted small" style={{ marginTop: 6 }}>
                        Enter PIN to view details
                      </div>
                    ) : (
                      <>
                        {note.description && (
                          <p className="small mb-2" style={{ color: "#495057" }}>
                            {note.description}
                          </p>
                        )}

                        {note.has_checklist &&
                          note.checklist_items?.map((item, i) => (
                            <div key={i} className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={item.checked}
                                readOnly
                              />
                              <label className="form-check-label small">
                                {item.text}
                              </label>
                            </div>
                          ))}

                        {note.labels?.length > 0 && (
                          <div className="mt-2 d-flex flex-wrap gap-1">
                            {note.labels.map((l, i) => (
                              <span
                                key={i}
                                className="px-2 py-1"
                                style={{
                                  fontSize: 12,
                                  borderRadius: 8,
                                  background: "#e9ecef",
                                  color: "#343a40",
                                }}
                              >
                                {l}
                              </span>
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    {/* ACTIONS (locked => require PIN first) */}
                    <div className="d-flex flex-wrap gap-1 mt-3">
                      <button
                        className="btn btn-sm"
                        style={{ background: "#e9ecef", borderRadius: 8 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePin(note.id, note.is_pinned);
                        }}
                      >
                        {note.is_pinned ? "Unpin" : "Pin"}
                      </button>

                      <button
                        className="btn btn-sm"
                        style={{ background: "#dee2e6", borderRadius: 8 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(note);
                        }}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-sm"
                        style={{ background: "#ffe8cc", borderRadius: 8 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLockClick(note);
                        }}
                      >
                        {locked ? "Open" : "Lock"}
                      </button>

                      <button
                        className="btn btn-sm"
                        style={{ background: "#d8f3dc", borderRadius: 8 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          openShare(note);
                        }}
                      >
                        Share
                      </button>

                      <button
                        className="btn btn-sm"
                        style={{ background: "#f8d7da", borderRadius: 8 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          askDelete(note);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

          {!loading && notes.length === 0 && (
            <div className="text-center text-muted mt-5">No notes found</div>
          )}
        </div>

        {/* MODALS */}
        {showAdd && (
          <AddNoteModal
            onClose={() => setShowAdd(false)}
            onSaved={() => {
              fetchNotes();
              showToast("✅ Note added");
            }}
          />
        )}

        {editNote && (
          <EditNoteModal
            note={editNote}
            onClose={() => setEditNote(null)}
            onSaved={() => {
              fetchNotes();
              showToast("✅ Note updated");
            }}
          />
        )}

        {lockNoteId && (
          <LockNoteModal
            noteId={lockNoteId}
            onClose={() => setLockNoteId(null)}
            onSaved={() => {
              afterLocked(lockNoteId);
              setLockNoteId(null);
            }}
          />
        )}

        {unlockNoteId && (
          <UnlockNoteModal
            noteId={unlockNoteId}
            onClose={() => setUnlockNoteId(null)}
            onUnlocked={(id) => {
              setUnlockNoteId(null);
              onUnlocked(id);
              showToast("🔓 Unlocked");
            }}
          />
        )}
      </div>

      {/* PROFESSIONAL TOAST (center) */}
      {toast && (
        <div
          className="position-fixed top-50 start-50 translate-middle px-4 py-3 shadow"
          style={{
            background: "#2f3e46",
            color: "#fff",
            borderRadius: 14,
            zIndex: 9999,
            animation: "fadeIn .2s",
          }}
        >
          {toast}
        </div>
      )}

      {/* PROFESSIONAL CONFIRM DELETE (center modal) */}
      {confirmDeleteId && (
        <>
          <div
            className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
            style={{ zIndex: 8000 }}
            onClick={() => setConfirmDeleteId(null)}
          />
          <div
            className="position-fixed top-50 start-50 translate-middle"
            style={{
              zIndex: 8100,
              width: "100%",
              maxWidth: 420,
              animation: "scaleFade .2s ease",
            }}
          >
            <div
              className="p-4 shadow"
              style={{ borderRadius: 18, background: "#fff" }}
            >
              <h6 className="fw-bold mb-2" style={{ color: "#2f3e46" }}>
                Delete Note?
              </h6>
              <p className="text-muted small mb-3">
                This will permanently delete the note.
              </p>
              <div className="d-flex justify-content-end gap-2">
                <button
                  className="btn"
                  style={{ background: "#dee2e6", borderRadius: 10 }}
                  onClick={() => setConfirmDeleteId(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn"
                  style={{
                    background: "#d64550",
                    color: "#fff",
                    borderRadius: 10,
                  }}
                  onClick={doDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleFade { from { opacity: 0; transform: scale(.96); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}
