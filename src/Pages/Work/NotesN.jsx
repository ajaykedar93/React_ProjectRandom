// NotesN.jsx (React + JavaScript)
// ✅ Bright + vibrant professional UI (NO dark theme)
// ✅ Date & Time auto-fill current (IST) always; user can change manually
// ✅ Full CRUD + image upload (any format) + view image
// ✅ Center popups (success/error/confirm) + center loading spinner
// ✅ Smooth button click effects + responsive layout
// ✅ Uses your exact auth + token + userId logic

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

const API_BASE = "https://express-projectrandom.onrender.com/api/notes-random";

export default function NotesN() {
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

  // ---------- UI States ----------
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);

  const [notes, setNotes] = useState([]);

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

  // ---------- Form ----------
  const fileRef = useRef(null);

  const getISTNow = () => {
    // returns { ddmmyyyy, time12, inputDate(yyyy-mm-dd), inputTime(HH:MM) }
    const now = new Date();
    const ist = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));

    const dd = String(ist.getDate()).padStart(2, "0");
    const mm = String(ist.getMonth() + 1).padStart(2, "0");
    const yyyy = ist.getFullYear();

    const HH = String(ist.getHours()).padStart(2, "0");
    const Min = String(ist.getMinutes()).padStart(2, "0");

    const ddmmyyyy = `${dd}/${mm}/${yyyy}`;
    const inputDate = `${yyyy}-${mm}-${dd}`;
    const inputTime = `${HH}:${Min}`;
    const time12 = to12HrFromInputTime(inputTime);

    return { ddmmyyyy, time12, inputDate, inputTime };
  };

  const [form, setForm] = useState(() => {
    const n = getISTNow();
    return {
      note_title: "",
      note_description: "",
      note_info: "",
      note_date: n.ddmmyyyy, // dd/mm/yyyy
      note_time: n.time12, // hh:mm AM/PM
      imageFile: null,
      dateTouched: false,
      timeTouched: false,
    };
  });

  // ---------- Edit Modal ----------
  const [editOpen, setEditOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [edit, setEdit] = useState({
    note_id: "",
    sr_no: "",
    note_title: "",
    note_description: "",
    note_info: "",
    note_date: "",
    note_time: "",
    has_image: false,
    remove_image: false,
    newImageFile: null,
  });
  const editFileRef = useRef(null);

  // ---------- Helpers ----------
  const openCenterModal = (payload) => {
    setCenterModal({ open: true, ...payload });
  };

  const closeCenterModal = () => {
    setCenterModal((p) => ({ ...p, open: false, onConfirm: null }));
  };

  const authHeaders = useMemo(() => {
    const h = {};
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  const safeText = (v) => (v == null || v === "" ? "—" : String(v));

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

  const getImageUrl = (noteId) => `${API_BASE}/${noteId}/image?user_id=${encodeURIComponent(userId)}`;

  // Keep current IST date/time auto-filled unless user changes manually
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
    const id = window.setInterval(tick, 30 * 1000); // update every 30s
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- API ----------
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
        message: err.message || "Something went wrong.",
        confirmText: "OK",
      });
    } finally {
      setNotesLoading(false);
    }
  };

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

      // optional fields
      if (form.note_title) fd.append("note_title", form.note_title);
      if (form.note_description) fd.append("note_description", form.note_description);
      if (form.note_info) fd.append("note_info", form.note_info);

      // always send current date/time (strict formats), user can override by selecting
      if (form.note_date) fd.append("note_date", form.note_date); // dd/mm/yyyy
      if (form.note_time) fd.append("note_time", form.note_time); // hh:mm AM/PM

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
      setForm((p) => ({
        ...p,
        note_title: "",
        note_description: "",
        note_info: "",
        note_date: n.ddmmyyyy,
        note_time: n.time12,
        imageFile: null,
        dateTouched: false,
        timeTouched: false,
      }));
      if (fileRef.current) fileRef.current.value = "";

      await fetchNotes();
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

    try {
      const res = await fetch(`${API_BASE}/${noteId}?user_id=${encodeURIComponent(userId)}`, {
        method: "DELETE",
        headers: { ...authHeaders },
      });

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
        message: err.message || "Something went wrong.",
        confirmText: "OK",
      });
    }
  };

  const openEdit = (n) => {
    setEdit({
      note_id: n.note_id,
      sr_no: n.sr_no,
      note_title: n.note_title || "",
      note_description: n.note_description || "",
      note_info: n.note_info || "",
      note_date: n.note_date || "",
      note_time: n.note_time || "",
      has_image: !!n.has_image,
      remove_image: false,
      newImageFile: null,
    });
    if (editFileRef.current) editFileRef.current.value = "";
    setEditOpen(true);
  };

  const confirmUpdate = () => {
    openCenterModal({
      type: "confirm",
      title: "Update note?",
      message: "Save the changes to this note?",
      confirmText: "Update",
      cancelText: "Cancel",
      onConfirm: () => {
        closeCenterModal();
        // programmatically submit? easiest: call updateNote() via a flag
        // We'll just trigger form submission by clicking hidden button
        document.getElementById("_notesn_update_submit")?.click();
      },
    });
  };

  const updateNote = async (e) => {
    e.preventDefault();
    if (!edit.note_id) return;

    if (!userId) {
      openCenterModal({
        type: "error",
        title: "Login required",
        message: "User id not found. Please login again.",
        confirmText: "OK",
      });
      return;
    }

    setEditSaving(true);
    try {
      const fd = new FormData();
      fd.append("user_id", userId);

      // optional - backend keeps previous if empty
      fd.append("note_title", edit.note_title ?? "");
      fd.append("note_description", edit.note_description ?? "");
      fd.append("note_info", edit.note_info ?? "");

      // if user cleared date/time in edit, keep existing; if provided, send
      if (edit.note_date) fd.append("note_date", edit.note_date);
      if (edit.note_time) fd.append("note_time", edit.note_time);

      if (edit.remove_image) fd.append("remove_image", "true");
      if (edit.newImageFile) fd.append("image", edit.newImageFile);

      const res = await fetch(`${API_BASE}/${edit.note_id}`, {
        method: "PUT",
        headers: { ...authHeaders },
        body: fd,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to update note.");

      openCenterModal({
        type: "success",
        title: "Updated",
        message: "Note updated successfully.",
        confirmText: "OK",
      });

      setEditOpen(false);
      await fetchNotes();
    } catch (err) {
      openCenterModal({
        type: "error",
        title: "Failed",
        message: err.message || "Something went wrong.",
        confirmText: "OK",
      });
    } finally {
      setEditSaving(false);
    }
  };

  // ---------- Initial load ----------
  useEffect(() => {
    const run = async () => {
      if (authLoading) return;

      setPageLoading(false);

      if (!userId) return;
      await fetchNotes();
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, userId]);

  const showGlobalLoading = pageLoading || authLoading;

  return (
    <div className="notesnPage">
      <style>{css}</style>

      {/* Global Loading */}
      {showGlobalLoading && (
        <div className="notesnOverlay">
          <div className="notesnLoaderCard">
            <div className="notesnSpinner" />
            <div className="notesnLoaderText">Loading…</div>
          </div>
        </div>
      )}

      {/* Center Modal (alerts/confirm) */}
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
                  if (centerModal.type === "confirm" && typeof centerModal.onConfirm === "function") {
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

      {/* ✅ Title only (center, bold, black) */}
      <div className="notesnTopTitle">Notes</div>

      <div className="notesnShell">
        {/* Add card */}
        <div className="card edge">
          <div className="cardHead">
            <div>
              <div className="cardTitle">Add Note</div>
              <div className="cardSub">Quick save • Image optional • Vibrant UI</div>
            </div>
            <button
              className="btn ghost"
              onClick={fetchNotes}
              disabled={!userId}
              title={!userId ? "Login required" : "Refresh notes"}
            >
              Refresh
            </button>
          </div>

          {!isAuthenticated || !userId ? (
            <div className="softInfo">
              <div className="softTitle">Login required</div>
              <div className="softText">Please login to add and view notes.</div>
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
                    Auto current (IST) • API: <span className="mono">dd/mm/yyyy</span>
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
                    Auto current (IST) • API: <span className="mono">hh:mm AM/PM</span>
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
                    Any format •{" "}
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

        {/* List header */}
        <div className="listTop">
          <div className="listTitle">Your Notes</div>
          {notesLoading && (
            <div className="miniLoad">
              <span className="miniSpin" /> Loading…
            </div>
          )}
        </div>

        {/* Empty */}
        {isAuthenticated && userId && !notesLoading && notes.length === 0 && (
          <div className="emptyCard edge">
            <div className="emptyTitle">No notes yet</div>
            <div className="emptyText">Add your first note above.</div>
          </div>
        )}

        {/* Notes list */}
        <div className="list">
          {notes.map((n) => (
            <div key={n.note_id} className="note edge">
              <div className="noteTop">
                <div className="leftMeta">
                  <div className="sr">#{n.sr_no}</div>
                  <div className="dt">
                    <span className="dtStrong">{safeText(n.note_date)}</span>
                    <span className="dot">•</span>
                    <span className="dtStrong">{safeText(n.note_time)}</span>
                  </div>
                </div>

                <div className="noteBtns">
                  <button type="button" className="btn mini" onClick={() => openEdit(n)}>
                    Update
                  </button>
                  <button type="button" className="btn mini danger" onClick={() => confirmDelete(n.note_id)}>
                    Delete
                  </button>
                </div>
              </div>

              <div className="noteBody">
                <div className="noteTitle">{n.note_title ? n.note_title : <span className="muted">Untitled</span>}</div>

                {n.note_description ? (
                  <div className="noteDesc">{n.note_description}</div>
                ) : (
                  <div className="noteDesc muted2">No description</div>
                )}

                {n.note_info ? (
                  <div className="pillInfo">
                    <span className="pillLabel">Info:</span> {n.note_info}
                  </div>
                ) : null}

                {n.has_image ? (
                  <div className="imgBox">
                    <div className="imgTop">
                      <div className="imgLbl">Image</div>
                      <a className="imgLink" href={getImageUrl(n.note_id)} target="_blank" rel="noreferrer">
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
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {editOpen && (
        <div className="notesnModalOverlay" onClick={() => setEditOpen(false)}>
          <div className="editCard" onClick={(e) => e.stopPropagation()}>
            <div className="editHead">
              <div>
                <div className="editTitle">Update Note</div>
                <div className="editSub">
                  Note <span className="mono">#{edit.sr_no}</span>
                </div>
              </div>
              <button className="btn ghost" onClick={() => setEditOpen(false)}>
                Close
              </button>
            </div>

            <form onSubmit={updateNote} className="form">
              <div className="grid2">
                <div className="field">
                  <label className="label">Title</label>
                  <input
                    className="input"
                    value={edit.note_title}
                    onChange={(e) => setEdit((p) => ({ ...p, note_title: e.target.value }))}
                    placeholder="Optional"
                  />
                </div>

                <div className="field">
                  <label className="label">Info</label>
                  <input
                    className="input"
                    value={edit.note_info}
                    onChange={(e) => setEdit((p) => ({ ...p, note_info: e.target.value }))}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="field">
                <label className="label">Description</label>
                <textarea
                  className="textarea"
                  value={edit.note_description}
                  onChange={(e) => setEdit((p) => ({ ...p, note_description: e.target.value }))}
                  placeholder="Optional"
                />
              </div>

              <div className="grid2">
                <div className="field">
                  <label className="label">Date</label>
                  <input
                    type="date"
                    className="input"
                    value={toInputDate(edit.note_date)}
                    onChange={(e) => setEdit((p) => ({ ...p, note_date: fromInputDate(e.target.value) }))}
                  />
                </div>

                <div className="field">
                  <label className="label">Time</label>
                  <input
                    type="time"
                    className="input"
                    value={toInputTime(edit.note_time)}
                    onChange={(e) => setEdit((p) => ({ ...p, note_time: to12HrFromInputTime(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="field">
                <label className="label">Image</label>
                <div className="imgRow">
                  <input
                    ref={editFileRef}
                    type="file"
                    className="file"
                    accept="*/*"
                    onChange={(e) => setEdit((p) => ({ ...p, newImageFile: e.target.files?.[0] || null }))}
                  />
                  <button
                    type="button"
                    className={`btn ghost ${!edit.has_image ? "disabled" : ""}`}
                    disabled={!edit.has_image}
                    onClick={() => setEdit((p) => ({ ...p, remove_image: !p.remove_image, newImageFile: null }))}
                  >
                    {edit.remove_image ? "Undo Remove" : "Remove Image"}
                  </button>
                </div>

                <div className="micro">
                  Current:{" "}
                  {edit.has_image ? (
                    <span className="tag ok">Has image</span>
                  ) : (
                    <span className="tag">No image</span>
                  )}
                  {edit.newImageFile ? (
                    <>
                      {" "}
                      • New: <span className="mono">{edit.newImageFile.name}</span>
                    </>
                  ) : null}
                  {edit.remove_image ? <> • <span className="tag bad">Will remove</span></> : null}
                </div>
              </div>

              <div className="actions">
                <button
                  type="button"
                  className="btn primary"
                  disabled={editSaving}
                  onClick={confirmUpdate}
                >
                  {editSaving ? "Updating…" : "Update"}
                </button>

                {/* hidden real submit */}
                <button id="_notesn_update_submit" type="submit" style={{ display: "none" }}>
                  submit
                </button>

                <button type="button" className="btn ghost" onClick={() => setEditOpen(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ height: 18 }} />
    </div>
  );
}

/* ---------- Bright Vibrant CSS (edge-to-edge mobile) ---------- */
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

  /* Title only */
  .notesnTopTitle{
    width:100%;
    text-align:center;
    font-weight:1000;
    color:#000;
    letter-spacing:.2px;
    padding: 14px 12px 6px;
    font-size: 18px;
  }

  /* shell */
  .notesnShell{
    max-width:1100px;
    margin: 0 auto;
    padding: 10px 12px 24px;
  }

  /* Mobile edge-to-edge cards */
  .edge{
    margin-left: -12px;
    margin-right: -12px;
  }

  .card, .note, .emptyCard{
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

  .listTop{
    margin-top: 14px;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap: 10px;
  }
  .listTitle{
    font-size:13px;
    font-weight: 1000;
    color: var(--text);
  }

  .miniLoad{
    display:flex; align-items:center; gap: 8px;
    font-weight: 900;
    color: var(--muted);
    font-size:12px;
  }
  .miniSpin{
    width: 14px; height: 14px; border-radius: 999px;
    border: 3px solid rgba(37,99,235,.20);
    border-top-color: rgba(37,99,235,.95);
    animation: spin 1s linear infinite;
    display:inline-block;
  }

  .emptyCard{
    margin-top: 10px;
    padding: 14px;
  }
  .emptyTitle{ font-weight:1000; color: var(--text); font-size:13px; }
  .emptyText{ margin-top:4px; font-weight:800; color: var(--muted); font-size:12px; }

  .list{
    margin-top: 10px;
    display:grid;
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .noteTop{
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap: 10px;
    flex-wrap:wrap;
  }

  .leftMeta{ display:flex; align-items:center; gap: 10px; flex-wrap:wrap; }
  .sr{
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 1000;
    color: rgba(37,99,235,1);
    background: rgba(37,99,235,.10);
    border: 1px solid rgba(37,99,235,.18);
  }
  .dt{
    display:flex; align-items:center; gap: 8px;
    font-weight: 900;
    font-size: 12px;
    color: rgba(17,24,39,.72);
  }
  .dtStrong{ color: rgba(17,24,39,.90); }
  .dot{ opacity:.5; }

  .noteBtns{ display:flex; gap: 8px; }
  .noteBody{ margin-top: 12px; display:flex; flex-direction:column; gap: 8px; }

  .noteTitle{ font-size: 15px; font-weight: 1100; color: var(--text); }
  .muted{ color: rgba(107,114,128,1); font-weight: 1000; }
  .muted2{ color: rgba(107,114,128,1); font-weight: 900; }

  .noteDesc{
    color: rgba(17,24,39,.86);
    font-weight: 800;
    line-height: 1.5;
    white-space: pre-wrap;
  }

  .pillInfo{
    padding: 10px 12px;
    border-radius: 14px;
    background: linear-gradient(135deg, rgba(34,197,94,.10), rgba(37,99,235,.06));
    border: 1px solid rgba(34,197,94,.20);
    color: rgba(17,24,39,.88);
    font-weight: 850;
  }
  .pillLabel{ color: rgba(34,197,94,.95); font-weight: 1000; }

  .imgBox{
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
  .imgLbl{ font-weight: 1000; font-size: 12px; color: rgba(17,24,39,.78); }
  .imgLink{
    font-weight: 1000;
    font-size: 12px;
    color: rgba(37,99,235,1);
    text-decoration:none;
  }
  .img{ width:100%; height:auto; display:block; }
  .noImg{ font-size: 12px; font-weight: 900; color: var(--muted); }

  /* Global overlay loading */
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

  /* Center modal */
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

  /* Edit modal card */
  .editCard{
    width: min(820px, 96vw);
    max-height: 90vh;
    overflow:auto;
    background:#fff;
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 14px;
    box-shadow: 0 22px 80px rgba(17,24,39,.18);
  }
  .editHead{
    display:flex;
    align-items:flex-start;
    justify-content:space-between;
    gap: 12px;
    padding-bottom: 10px;
    margin-bottom: 10px;
    border-bottom: 1px solid rgba(231,235,255,1);
  }
  .editTitle{ font-weight: 1100; font-size: 15px; color: var(--text); }
  .editSub{ margin-top: 2px; font-weight: 900; color: var(--muted); font-size: 12px; }

  .imgRow{ display:flex; gap: 10px; flex-wrap: wrap; align-items:center; }
  .tag{
    display:inline-flex;
    align-items:center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 999px;
    font-weight: 1000;
    font-size: 11px;
    border: 1px solid rgba(107,114,128,.18);
    background: rgba(107,114,128,.08);
    color: rgba(107,114,128,1);
  }
  .tag.ok{
    border-color: rgba(34,197,94,.20);
    background: rgba(34,197,94,.10);
    color: rgba(34,197,94,1);
  }
  .tag.bad{
    border-color: rgba(239,68,68,.20);
    background: rgba(239,68,68,.10);
    color: rgba(239,68,68,1);
  }

  /* Focus */
  .input:focus, .textarea:focus{
    border-color: rgba(236,72,153,.45);
    box-shadow: 0 0 0 4px rgba(236,72,153,.12);
  }

  /* Responsive */
  @media (min-width: 740px){
    .edge{ margin-left: 0; margin-right: 0; }
    .grid2{ grid-template-columns: 1fr 1fr; }
    .grid3{ grid-template-columns: 1fr 1fr 1fr; }
    .list{ grid-template-columns: 1fr 1fr; }
    .notesnTopTitle{ font-size: 20px; padding-top: 18px; }
  }
  @media (min-width: 1024px){
    .list{ grid-template-columns: 1fr 1fr 1fr; }
  }

  @keyframes spin{ from{ transform: rotate(0deg);} to{ transform: rotate(360deg);} }
`;

