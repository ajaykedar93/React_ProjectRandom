import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const API_BASE = "http://localhost:5000/api/notes";

/* ---------- small tap ripple button ---------- */
function TapButton({ className = "", style = {}, disabled, onClick, children, title }) {
  const ref = useRef(null);

  const onDown = (e) => {
    if (disabled) return;
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = (e.clientX ?? rect.left + rect.width / 2) - rect.left;
    const y = (e.clientY ?? rect.top + rect.height / 2) - rect.top;

    const r = document.createElement("span");
    r.className = "ripple";
    r.style.left = `${x}px`;
    r.style.top = `${y}px`;
    el.appendChild(r);
    setTimeout(() => r.remove(), 520);
  };

  return (
    <button
      ref={ref}
      type="button"
      title={title}
      className={`tap ${className}`}
      style={style}
      disabled={disabled}
      onPointerDown={onDown}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </button>
  );
}

function CenterLoading({ show, text }) {
  if (!show) return null;
  return (
    <div className="overlay">
      <div className="overlayCard">
        <div className="spin" />
        <div className="overlayText">{text || "Please wait..."}</div>
      </div>
    </div>
  );
}

function CenterToast({ text, onClose }) {
  useEffect(() => {
    if (!text) return;
    const t = setTimeout(() => onClose?.(), 2200);
    return () => clearTimeout(t);
  }, [text, onClose]);

  if (!text) return null;
  return (
    <div className="toastCenter" onClick={onClose} role="alert">
      {text}
    </div>
  );
}

function Modal({ open, title, subtitle, children, onClose, wide }) {
  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    if (open) window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="backdrop" onClick={onClose} />
      <div className="modalWrap" onClick={(e) => e.stopPropagation()}>
        <div className={`modalCard ${wide ? "modalWide" : ""}`}>
          <div className="modalHead">
            <div>
              <div className="modalTitle">{title}</div>
              {subtitle ? <div className="modalSub">{subtitle}</div> : null}
            </div>
            <TapButton className="xBtn" onClick={onClose}>
              Close
            </TapButton>
          </div>
          <div className="modalBody">{children}</div>
        </div>
      </div>
    </>
  );
}

/* -------- Full Details Modal (Professional) -------- */
function NoteDetailsModal({ open, note, onClose }) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !note) return null;

  const fmt = (d) => {
    if (!d) return "-";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return String(d);
    return dt.toLocaleString();
  };

  return (
    <>
      <div className="detailsBackdrop" onClick={onClose} />
      <div className="detailsWrap" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="detailsCard">
          <button className="closeIcon" type="button" onClick={onClose} aria-label="Close">
            ✕
          </button>

          <div className="detailsTop">
            <div className="detailsTitle">{note.title}</div>
            <div className="detailsMetaRow">
              {note.is_pinned ? <span className="tag tagBlue">Pinned</span> : null}
              {note.is_locked ? <span className="tag tagRed">Locked</span> : <span className="tag tagGreen">Unlocked</span>}
              {note.has_checklist ? <span className="tag tagPurple">Checklist</span> : null}
            </div>
          </div>

          {note.description ? <div className="detailsDesc">{note.description}</div> : <div className="detailsEmpty">No description</div>}

          {note.has_checklist && Array.isArray(note.checklist_items) && note.checklist_items.length > 0 ? (
            <div className="detailsBlock">
              <div className="detailsBlockTitle">Checklist</div>
              <div className="detailsChecklist">
                {note.checklist_items.map((it, i) => (
                  <div className="detailsCheck" key={i}>
                    <input type="checkbox" checked={!!it.checked} readOnly />
                    <div className="detailsCheckText">{it.text}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {Array.isArray(note.labels) && note.labels.length > 0 ? (
            <div className="detailsBlock">
              <div className="detailsBlockTitle">Labels</div>
              <div className="detailsLabels">
                {note.labels.map((l, i) => (
                  <span key={i} className="lab">
                    {l}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="detailsInfoGrid">
            <div className="infoItem">
              <div className="infoLabel">Created</div>
              <div className="infoValue">{fmt(note.created_at)}</div>
            </div>
            <div className="infoItem">
              <div className="infoLabel">Updated</div>
              <div className="infoValue">{fmt(note.updated_at)}</div>
            </div>
            <div className="infoItem">
              <div className="infoLabel">Color</div>
              <div className="infoValue">
                <span className="colorDot" style={{ background: note.color_tag || "#fff" }} />
                {note.color_tag || "Default"}
              </div>
            </div>
            <div className="infoItem">
              <div className="infoLabel">ID</div>
              <div className="infoValue">{note.id}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* -------- Lock Modal -------- */
function LockModal({ open, note, onClose, onLocked, setLoading, toast }) {
  const [pin, setPin] = useState("");

  useEffect(() => {
    if (!open) setPin("");
  }, [open]);

  const lockNow = async () => {
    if (!/^\d{4}$/.test(pin)) return toast("Enter exactly 4 digits PIN");
    try {
      setLoading({ show: true, text: "Locking..." });
      await axios.patch(`${API_BASE}/${note.id}/lock-pin`, { pin });
      toast("Locked");
      onLocked?.();
      onClose?.();
    } catch (e) {
      toast(e.response?.data?.error || "Lock failed");
    } finally {
      setLoading({ show: false, text: "" });
    }
  };

  return (
    <Modal open={open} title="Lock Note" subtitle={`Set PIN for: ${note?.title || ""}`} onClose={onClose}>
      <div className="label">4 Digit PIN</div>
      <input
        className="pin"
        type="password"
        inputMode="numeric"
        maxLength={4}
        value={pin}
        autoFocus
        placeholder="••••"
        onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
      />
      <div className="help">
        Locked note list will show only <b>Title</b>. To view/edit/delete/share, PIN required.
      </div>

      <div className="rowBtns">
        <TapButton className="btnSoft" onClick={onClose}>
          Cancel
        </TapButton>
        <TapButton className="btnPrimary" onClick={lockNow} disabled={!/^\d{4}$/.test(pin)}>
          Lock
        </TapButton>
      </div>
    </Modal>
  );
}

/* -------- Unlock Modal (verify pin) -------- */
function UnlockModal({ open, note, onClose, onVerified, setLoading, toast, actionText }) {
  const [pin, setPin] = useState("");

  useEffect(() => {
    if (!open) setPin("");
  }, [open]);

  const verify = async () => {
    if (!/^\d{4}$/.test(pin)) return toast("Enter exactly 4 digits PIN");
    try {
      setLoading({ show: true, text: "Verifying PIN..." });
      await axios.post(`${API_BASE}/${note.id}/unlock`, { pin });
      onVerified?.(pin);
      onClose?.();
    } catch (e) {
      toast(e.response?.data?.error || "Wrong PIN");
    } finally {
      setLoading({ show: false, text: "" });
    }
  };

  return (
    <Modal open={open} title="Unlock Note" subtitle={`Enter PIN: ${note?.title || ""}`} onClose={onClose}>
      <div className="label">4 Digit PIN</div>
      <input
        className="pin"
        type="password"
        inputMode="numeric"
        maxLength={4}
        value={pin}
        autoFocus
        placeholder="••••"
        onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
        onKeyDown={(e) => e.key === "Enter" && verify()}
      />

      <div className="rowBtns">
        <TapButton className="btnSoft" onClick={onClose}>
          Cancel
        </TapButton>
        <TapButton className="btnGreen" onClick={verify} disabled={!/^\d{4}$/.test(pin)}>
          {actionText || "Unlock"}
        </TapButton>
      </div>
    </Modal>
  );
}

/* -------- Confirm Delete -------- */
function ConfirmDelete({ open, title, onClose, onConfirm }) {
  return (
    <Modal open={open} title="Delete Note" subtitle={title ? `Delete: ${title}` : "Are you sure?"} onClose={onClose}>
      <div className="help" style={{ background: "rgba(239,68,68,0.10)", borderColor: "rgba(239,68,68,0.18)" }}>
        This will permanently delete the note.
      </div>

      <div className="rowBtns">
        <TapButton className="btnSoft" onClick={onClose}>
          Cancel
        </TapButton>
        <TapButton className="btnDanger" onClick={onConfirm}>
          Delete
        </TapButton>
      </div>
    </Modal>
  );
}

/* -------- Edit Note Modal -------- */
function EditModal({ open, note, onClose, onSaved, setLoading, toast, isLocked, hasPin, getPin, requestPinThen }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [colorTag, setColorTag] = useState("#ffffff");
  const [labels, setLabels] = useState("");

  useEffect(() => {
    if (!open || !note) return;
    setTitle(note.title || "");
    setDescription(note.description || "");
    setColorTag(note.color_tag || "#ffffff");
    setLabels(Array.isArray(note.labels) ? note.labels.join(", ") : "");
  }, [open, note]);

  const save = async () => {
    if (!note) return;

    if (isLocked(note) && !hasPin(note.id)) {
      onClose?.();
      requestPinThen(note, "edit");
      return;
    }

    const payload = {
      title,
      description,
      color_tag: colorTag,
      labels: labels ? labels.split(",").map((x) => x.trim()).filter(Boolean) : [],
    };

    try {
      setLoading({ show: true, text: "Saving..." });

      if (isLocked(note)) {
        await axios.put(`${API_BASE}/${note.id}/secure`, { ...payload, pin: getPin(note.id) });
      } else {
        await axios.put(`${API_BASE}/${note.id}`, payload);
      }

      toast("Updated");
      onSaved?.();
      onClose?.();
    } catch (e) {
      toast(e.response?.data?.error || "Update failed");
    } finally {
      setLoading({ show: false, text: "" });
    }
  };

  return (
    <Modal open={open} title="Edit Note" subtitle={note?.title ? `Editing: ${note.title}` : ""} onClose={onClose}>
      <div className="grid2">
        <div>
          <div className="label">Title</div>
          <input className="textInput" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div>
          <div className="label">Color</div>
          <input className="colorInput" type="color" value={colorTag} onChange={(e) => setColorTag(e.target.value)} />
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        <div className="label">Description</div>
        <textarea className="textArea" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div style={{ marginTop: 10 }}>
        <div className="label">Labels (comma separated)</div>
        <input className="textInput" value={labels} onChange={(e) => setLabels(e.target.value)} />
      </div>

      <div className="rowBtns" style={{ marginTop: 14 }}>
        <TapButton className="btnSoft" onClick={onClose}>
          Cancel
        </TapButton>
        <TapButton className="btnPrimary" onClick={save}>
          Save
        </TapButton>
      </div>
    </Modal>
  );
}

/* ============================= PAGE ============================= */
export default function Notes() {
  const { user } = useAuth();
  const userId = user?.id || 1;

  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");

  const [toastText, setToastText] = useState("");
  const toast = (t) => setToastText(t);

  const [loading, setLoading] = useState({ show: false, text: "" });

  // store PINs in sessionStorage (per session)
  const [pinMap, setPinMap] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("notePins") || "{}");
    } catch {
      return {};
    }
  });
  const savePins = (obj) => sessionStorage.setItem("notePins", JSON.stringify(obj));
  const hasPin = (id) => !!pinMap[String(id)];
  const getPin = (id) => pinMap[String(id)];

  // Modals
  const [lockNote, setLockNote] = useState(null);
  const [unlockInfo, setUnlockInfo] = useState({ open: false, note: null, next: null });
  const [deleteInfo, setDeleteInfo] = useState({ open: false, note: null });
  const [editInfo, setEditInfo] = useState({ open: false, note: null });
  const [viewInfo, setViewInfo] = useState({ open: false, note: null });

  const pinned = useMemo(() => notes.filter((n) => n.is_pinned), [notes]);
  const others = useMemo(() => notes.filter((n) => !n.is_pinned), [notes]);

  const isLocked = (note) => !!note?.is_locked;

  const fetchNotes = async () => {
    try {
      setLoading({ show: true, text: "Loading..." });
      const res = await axios.get(`${API_BASE}/${userId}`, { params: { search } });
      setNotes(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      toast(e.response?.data?.error || "Failed to load notes");
    } finally {
      setLoading({ show: false, text: "" });
    }
  };

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    const t = setTimeout(() => fetchNotes(), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const setPinnedLocal = (id, is_pinned) => {
    setNotes((prev) =>
      prev
        .map((n) => (n.id === id ? { ...n, is_pinned } : n))
        .sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned) || new Date(b.updated_at) - new Date(a.updated_at))
    );
  };

  const togglePin = async (note) => {
    const next = !note.is_pinned;
    setPinnedLocal(note.id, next);
    try {
      setLoading({ show: true, text: next ? "Pinning..." : "Unpinning..." });
      await axios.patch(`${API_BASE}/${note.id}/pin`, { is_pinned: next });
      toast(next ? "Pinned" : "Unpinned");
    } catch (e) {
      setPinnedLocal(note.id, note.is_pinned);
      toast(e.response?.data?.error || "Pin failed");
    } finally {
      setLoading({ show: false, text: "" });
    }
  };

  const requestPinThen = (note, nextAction) => {
    setUnlockInfo({ open: true, note, next: nextAction });
  };

  // open view with latest note data (from list)
  const openDetails = (note) => {
    if (!note) return;
    setViewInfo({ open: true, note });
  };

  // after unlock, refresh + open details (or next action)
  const onUnlockVerified = async (pin) => {
    const note = unlockInfo.note;
    if (!note) return;

    const nextPins = { ...pinMap, [String(note.id)]: String(pin) };
    setPinMap(nextPins);
    savePins(nextPins);

    toast("Unlocked");

    // refresh list immediately (auto refresh)
    await fetchNotes();

    // find updated note from list (so latest details show)
    const updated = (notes || []).find((n) => n.id === note.id) || note;

    const next = unlockInfo.next;
    if (next === "edit") setEditInfo({ open: true, note: updated });
    if (next === "delete") setDeleteInfo({ open: true, note: updated });
    if (next === "share") doShare(updated, String(pin));
    if (next === "view") openDetails(updated); // ✅ after unlock -> open details screen
  };

  const doShare = async (note, pinOverride) => {
    try {
      setLoading({ show: true, text: "Creating link..." });
      const res = isLocked(note)
        ? await axios.post(`${API_BASE}/${note.id}/share-secure`, { pin: pinOverride || getPin(note.id) })
        : await axios.post(`${API_BASE}/${note.id}/share`);

      const url = res.data?.share_url;
      if (!url) return toast("No share link received");
      await navigator.clipboard.writeText(url);
      toast("Link copied");
    } catch (e) {
      toast(e.response?.data?.error || "Share failed");
    } finally {
      setLoading({ show: false, text: "" });
    }
  };

  const doDelete = async (note) => {
    try {
      setLoading({ show: true, text: "Deleting..." });
      if (isLocked(note)) {
        await axios.delete(`${API_BASE}/${note.id}/secure`, { data: { pin: getPin(note.id) } });
      } else {
        await axios.delete(`${API_BASE}/${note.id}`);
      }

      const nextPins = { ...pinMap };
      delete nextPins[String(note.id)];
      setPinMap(nextPins);
      savePins(nextPins);

      toast("Deleted");
      await fetchNotes();
    } catch (e) {
      toast(e.response?.data?.error || "Delete failed");
    } finally {
      setLoading({ show: false, text: "" });
    }
  };

  const gradients = [
    "linear-gradient(135deg, #fff7ed 0%, #ffe4e6 100%)",
    "linear-gradient(135deg, #ecfeff 0%, #e0f2fe 100%)",
    "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
    "linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)",
    "linear-gradient(135deg, #fefce8 0%, #ffedd5 100%)",
  ];

  const NoteCard = ({ note }) => {
    const locked = isLocked(note);
    const unlocked = !locked || hasPin(note.id);
    const bg = note.color_tag || gradients[(note.id || 1) % gradients.length];

    const onCardClick = () => {
      // locked and not unlocked => ask PIN
      if (locked && !unlocked) return requestPinThen(note, "view");
      // unlocked => open detail screen
      openDetails(note);
    };

    return (
      <div className={`card ${locked && !unlocked ? "cardLocked" : ""}`} style={{ background: bg }} onClick={onCardClick}>
        <div className="cardTitle">{note.title}</div>

        <div className="metaRow">
          {note.is_pinned ? <span className="tag tagBlue">Pinned</span> : null}
          {locked ? <span className="tag tagRed">Locked</span> : <span className="tag tagGreen">Unlocked</span>}
        </div>

        {/* ✅ locked & not unlocked => show only title + message */}
        {locked && !unlocked ? (
          <div className="lockedInfo">This note is locked. Tap to unlock and view full details.</div>
        ) : (
          <>
            {note.description ? <div className="desc">{note.description}</div> : null}

            {note.has_checklist && Array.isArray(note.checklist_items) && note.checklist_items.length > 0 ? (
              <div className="block">
                <div className="blockTitle">Checklist</div>
                {note.checklist_items.slice(0, 3).map((it, i) => (
                  <div className="check" key={i}>
                    <input type="checkbox" checked={!!it.checked} readOnly />
                    <div className="checkText">{it.text}</div>
                  </div>
                ))}
                {note.checklist_items.length > 3 ? <div className="moreHint">+ {note.checklist_items.length - 3} more</div> : null}
              </div>
            ) : null}

            {Array.isArray(note.labels) && note.labels.length > 0 ? (
              <div className="labels">
                {note.labels.slice(0, 5).map((l, i) => (
                  <span key={i} className="lab">
                    {l}
                  </span>
                ))}
                {note.labels.length > 5 ? <span className="lab">+{note.labels.length - 5}</span> : null}
              </div>
            ) : null}
          </>
        )}

        {/* Buttons - stopPropagation so card click doesn't open modal */}
        <div className="btnGrid" onClick={(e) => e.stopPropagation()}>
          <TapButton className="btn btnBlue" onClick={() => togglePin(note)}>
            {note.is_pinned ? "Unpin" : "Pin"}
          </TapButton>

          <TapButton
            className="btn btnOrange"
            onClick={() => {
              if (!locked) setLockNote(note);
              else requestPinThen(note, "view");
            }}
          >
            {locked ? (unlocked ? "Unlocked" : "Unlock") : "Lock"}
          </TapButton>

          <TapButton
            className="btn btnPurple"
            onClick={() => {
              if (locked && !hasPin(note.id)) return requestPinThen(note, "share");
              doShare(note);
            }}
          >
            Share
          </TapButton>

          <TapButton
            className="btn btnGreen"
            onClick={() => {
              if (locked && !hasPin(note.id)) return requestPinThen(note, "edit");
              setEditInfo({ open: true, note });
            }}
          >
            Edit
          </TapButton>

          <TapButton
            className="btn btnRed"
            onClick={() => {
              if (locked && !hasPin(note.id)) return requestPinThen(note, "delete");
              setDeleteInfo({ open: true, note });
            }}
          >
            Delete
          </TapButton>
        </div>
      </div>
    );
  };

  return (
    <div className="root">
      {/* top bar */}
      <div className="top">
        <div className="h1">Notes</div>
        <div className="h2">Tap a card to view full note • Locked shows only title</div>

        <div className="searchWrap">
          <input className="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." />
        </div>
      </div>

      {/* pinned */}
      <div className="section">
        <div className="sectionHead">
          <div className="sectionTitle">Pinned</div>
          <div className="count">{pinned.length}</div>
        </div>

        {pinned.length === 0 ? <div className="empty">No pinned notes</div> : null}

        <div className="grid">
          {pinned.map((n) => (
            <NoteCard key={n.id} note={n} />
          ))}
        </div>
      </div>

      {/* others */}
      <div className="section">
        <div className="sectionHead">
          <div className="sectionTitle">Others</div>
          <div className="count">{others.length}</div>
        </div>

        {others.length === 0 ? <div className="empty">No notes found</div> : null}

        <div className="grid">
          {others.map((n) => (
            <NoteCard key={n.id} note={n} />
          ))}
        </div>
      </div>

      {/* Modals */}
      <LockModal
        open={!!lockNote}
        note={lockNote}
        onClose={() => setLockNote(null)}
        onLocked={fetchNotes}
        setLoading={setLoading}
        toast={toast}
      />

      <UnlockModal
        open={unlockInfo.open}
        note={unlockInfo.note}
        actionText={
          unlockInfo.next === "share"
            ? "Verify & Share"
            : unlockInfo.next === "delete"
            ? "Verify & Delete"
            : unlockInfo.next === "edit"
            ? "Verify & Edit"
            : "Unlock"
        }
        onClose={() => setUnlockInfo({ open: false, note: null, next: null })}
        onVerified={onUnlockVerified}
        setLoading={setLoading}
        toast={toast}
      />

      <EditModal
        open={editInfo.open}
        note={editInfo.note}
        onClose={() => setEditInfo({ open: false, note: null })}
        onSaved={fetchNotes}
        setLoading={setLoading}
        toast={toast}
        isLocked={isLocked}
        hasPin={hasPin}
        getPin={getPin}
        requestPinThen={requestPinThen}
      />

      <ConfirmDelete
        open={deleteInfo.open}
        title={deleteInfo.note?.title}
        onClose={() => setDeleteInfo({ open: false, note: null })}
        onConfirm={() => {
          const n = deleteInfo.note;
          setDeleteInfo({ open: false, note: null });
          if (n) doDelete(n);
        }}
      />

      <NoteDetailsModal
        open={viewInfo.open}
        note={viewInfo.note}
        onClose={() => setViewInfo({ open: false, note: null })}
      />

      <CenterLoading show={loading.show} text={loading.text} />
      <CenterToast text={toastText} onClose={() => setToastText("")} />

      {/* styles */}
      <style>{`
        * { box-sizing: border-box; }
        .root{
          min-height: 100vh;
          background:
            radial-gradient(900px 500px at 10% 10%, rgba(59,130,246,0.18), transparent 55%),
            radial-gradient(900px 500px at 90% 30%, rgba(34,197,94,0.16), transparent 55%),
            radial-gradient(900px 500px at 40% 90%, rgba(168,85,247,0.14), transparent 60%),
            #ffffff;
          padding-bottom: 18px;
        }

        .top{
          position: sticky;
          top: 0;
          z-index: 40;
          padding: 12px 12px 10px;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(0,0,0,0.08);
        }

        .h1{ font-size: 18px; font-weight: 950; color:#0f172a; }
        .h2{ font-size: 12px; font-weight: 800; color:#334155; margin-top: 2px; }

        @media (min-width: 900px){
          .h1{ font-size: 22px; }
        }

        .searchWrap{ margin-top: 10px; }
        .search{
          width: 100%;
          height: 44px;
          border-radius: 16px;
          border: 1px solid rgba(0,0,0,0.14);
          padding: 0 14px;
          font-weight: 800;
          outline: none;
          background: #fff;
          font-size: 13px;
        }

        .section{ padding: 10px 10px 0; }
        @media (min-width: 900px){
          .section{ padding: 12px 14px 0; }
          .top{ padding: 12px 14px 10px; }
        }

        .sectionHead{
          display:flex;
          align-items:center;
          justify-content:space-between;
          padding: 8px 2px;
        }
        .sectionTitle{ font-weight: 950; color:#0f172a; font-size: 14px; }
        .count{
          padding: 4px 10px;
          border-radius: 999px;
          background: rgba(59,130,246,0.10);
          border: 1px solid rgba(59,130,246,0.18);
          font-weight: 950;
          color: #1d4ed8;
          font-size: 12px;
        }

        .empty{
          border-radius: 16px;
          border: 1px dashed rgba(0,0,0,0.16);
          background: linear-gradient(135deg, #ffffff, #f0f9ff);
          padding: 14px;
          font-weight: 900;
          color:#334155;
          margin-bottom: 10px;
          font-size: 13px;
        }

        /* Mobile: 1 column full width */
        .grid{
          display:grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }
        @media (min-width: 520px){
          .grid{ grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (min-width: 950px){
          .grid{ grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
        @media (min-width: 1280px){
          .grid{ grid-template-columns: repeat(4, minmax(0, 1fr)); }
        }

        .card{
          border-radius: 18px;
          border: 1px solid rgba(0,0,0,0.08);
          box-shadow: 0 10px 25px rgba(16,24,40,0.08);
          padding: 12px;
          cursor: pointer;
          transition: transform .12s ease, box-shadow .12s ease, filter .12s ease;
        }
        .card:hover{
          transform: translateY(-1px);
          box-shadow: 0 16px 35px rgba(16,24,40,0.12);
        }
        .cardLocked{ filter: saturate(0.92); }

        .cardTitle{
          font-weight: 950;
          color:#0f172a;
          font-size: 16px;
          line-height: 1.25;
          white-space: normal;
          overflow-wrap: anywhere;
        }

        .metaRow{ display:flex; gap:8px; flex-wrap:wrap; margin-top: 8px; }
        .tag{
          font-size: 12px;
          font-weight: 950;
          padding: 4px 10px;
          border-radius: 999px;
          border: 1px solid rgba(0,0,0,0.10);
          background: rgba(255,255,255,0.65);
        }
        .tagBlue{ color:#1d4ed8; border-color: rgba(59,130,246,0.22); background: rgba(59,130,246,0.10); }
        .tagRed{ color:#b91c1c; border-color: rgba(239,68,68,0.22); background: rgba(239,68,68,0.10); }
        .tagGreen{ color:#15803d; border-color: rgba(34,197,94,0.22); background: rgba(34,197,94,0.10); }
        .tagPurple{ color:#6d28d9; border-color: rgba(168,85,247,0.25); background: rgba(168,85,247,0.10); }

        .lockedInfo{
          margin-top: 10px;
          font-weight: 900;
          color:#b91c1c;
          background: rgba(239,68,68,0.08);
          border: 1px dashed rgba(239,68,68,0.20);
          border-radius: 14px;
          padding: 10px 12px;
          font-size: 12.5px;
        }

        .desc{
          margin-top: 10px;
          color:#334155;
          font-weight: 800;
          font-size: 12.5px;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }
        .block{ margin-top: 10px; }
        .blockTitle{ font-weight: 950; color:#0f172a; font-size: 12.5px; margin-bottom: 6px; }

        .check{
          display:flex;
          gap: 8px;
          align-items:flex-start;
          padding: 8px 10px;
          border-radius: 14px;
          border: 1px solid rgba(0,0,0,0.06);
          background: rgba(255,255,255,0.65);
          margin-bottom: 6px;
        }
        .checkText{
          font-weight: 900;
          color:#0f172a;
          font-size: 12.5px;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
          flex: 1;
        }
        .moreHint{
          font-weight: 950;
          font-size: 12px;
          color: #334155;
          padding: 6px 2px 0;
        }

        .labels{ display:flex; flex-wrap:wrap; gap: 8px; margin-top: 10px; }
        .lab{
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 950;
          background: rgba(255,255,255,0.75);
          border: 1px solid rgba(0,0,0,0.10);
          color:#0f172a;
          overflow-wrap: anywhere;
        }

        .btnGrid{
          display:grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 12px;
        }
        .btn{
          height: 36px;
          border-radius: 14px;
          border: 1px solid rgba(0,0,0,0.10);
          font-weight: 950;
          background: rgba(255,255,255,0.80);
          color:#0f172a;
          font-size: 12px;
        }
        @media (min-width: 900px){
          .btn{ height: 40px; font-size: 13px; }
        }

        .btnBlue{ border-color: rgba(59,130,246,0.25); background: rgba(59,130,246,0.10); color:#1d4ed8; }
        .btnOrange{ border-color: rgba(249,115,22,0.25); background: rgba(249,115,22,0.10); color:#9a3412; }
        .btnPurple{ border-color: rgba(168,85,247,0.25); background: rgba(168,85,247,0.10); color:#6d28d9; }
        .btnGreen{ border-color: rgba(34,197,94,0.25); background: rgba(34,197,94,0.10); color:#15803d; }
        .btnRed{ border-color: rgba(239,68,68,0.25); background: rgba(239,68,68,0.10); color:#b91c1c; }

        /* tap + ripple */
        .tap{
          position: relative;
          overflow: hidden;
          -webkit-tap-highlight-color: transparent;
          user-select: none;
          cursor: pointer;
          transition: transform .08s ease, filter .08s ease;
        }
        .tap:active{ transform: scale(0.99); filter: brightness(0.98); }
        .ripple{
          position:absolute;
          width: 10px;
          height: 10px;
          border-radius: 999px;
          transform: translate(-50%, -50%);
          background: rgba(0,0,0,0.18);
          animation: rip .52s ease-out;
          pointer-events:none;
        }
        @keyframes rip{
          from { opacity: 0.35; transform: translate(-50%,-50%) scale(1); }
          to { opacity: 0; transform: translate(-50%,-50%) scale(18); }
        }

        /* common modals */
        .backdrop{
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.35);
          z-index: 9990;
        }
        .modalWrap{
          position: fixed;
          inset: 0;
          display:flex;
          align-items:center;
          justify-content:center;
          padding: 12px;
          z-index: 9991;
        }
        .modalCard{
          width: 100%;
          max-width: 560px;
          background: linear-gradient(135deg, #ffffff, #f0f9ff);
          border: 1px solid rgba(0,0,0,0.10);
          border-radius: 20px;
          box-shadow: 0 18px 40px rgba(16,24,40,0.18);
          overflow:hidden;
        }
        .modalHead{
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap: 10px;
          padding: 14px 14px 10px;
          background: linear-gradient(135deg, #fff7ed, #ecfeff);
          border-bottom: 1px solid rgba(0,0,0,0.06);
        }
        .modalTitle{ font-weight: 950; color:#0f172a; font-size: 16px; }
        .modalSub{ margin-top: 2px; font-weight: 800; font-size: 12px; color:#334155; }
        .modalBody{ padding: 14px; }

        .xBtn{
          height: 36px;
          padding: 0 12px;
          border-radius: 14px;
          border: 1px solid rgba(0,0,0,0.10);
          background: rgba(255,255,255,0.9);
          font-weight: 950;
          font-size: 12px;
        }

        .label{ font-weight: 950; color:#0f172a; font-size: 13px; margin-bottom: 8px; }
        .pin{
          width: 100%;
          height: 46px;
          border-radius: 16px;
          border: 1px solid rgba(0,0,0,0.14);
          padding: 0 14px;
          font-size: 18px;
          letter-spacing: 10px;
          text-align: center;
          font-weight: 950;
          outline: none;
          background: #fff;
        }
        .help{
          margin-top: 10px;
          padding: 10px 12px;
          border-radius: 14px;
          background: rgba(34,197,94,0.08);
          border: 1px solid rgba(34,197,94,0.18);
          color: #14532d;
          font-weight: 850;
          font-size: 12px;
          line-height: 1.45;
        }

        .rowBtns{
          display:flex;
          justify-content:flex-end;
          gap: 10px;
          margin-top: 14px;
        }
        .btnSoft{
          height: 36px;
          padding: 0 14px;
          border-radius: 14px;
          border: 1px solid rgba(0,0,0,0.10);
          background: rgba(255,255,255,0.85);
          font-weight: 950;
          font-size: 12px;
        }
        .btnPrimary{
          height: 36px;
          padding: 0 14px;
          border-radius: 14px;
          border: none;
          background: linear-gradient(135deg, #3b82f6, #22c55e);
          color:#fff;
          font-weight: 950;
          font-size: 12px;
        }
        .btnGreen{
          height: 36px;
          padding: 0 14px;
          border-radius: 14px;
          border: none;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color:#fff;
          font-weight: 950;
          font-size: 12px;
        }
        .btnDanger{
          height: 36px;
          padding: 0 14px;
          border-radius: 14px;
          border: none;
          background: linear-gradient(135deg, #ef4444, #f97316);
          color:#fff;
          font-weight: 950;
          font-size: 12px;
        }

        /* edit modal inputs */
        .grid2{
          display:grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }
        @media (min-width: 650px){
          .grid2{ grid-template-columns: 2fr 1fr; }
        }
        .textInput{
          width: 100%;
          height: 44px;
          border-radius: 14px;
          border: 1px solid rgba(0,0,0,0.14);
          padding: 0 12px;
          font-weight: 800;
          outline: none;
          background: #fff;
          font-size: 13px;
        }
        .textArea{
          width: 100%;
          min-height: 110px;
          border-radius: 14px;
          border: 1px solid rgba(0,0,0,0.14);
          padding: 10px 12px;
          font-weight: 800;
          outline: none;
          background: #fff;
          font-size: 13px;
          resize: vertical;
        }
        .colorInput{
          width: 100%;
          height: 44px;
          border-radius: 14px;
          border: 1px solid rgba(0,0,0,0.14);
          padding: 6px;
          background: #fff;
        }

        /* center loading + toast */
        .overlay{
          position: fixed;
          inset: 0;
          z-index: 9998;
          background: rgba(255,255,255,0.55);
          display:flex;
          align-items:center;
          justify-content:center;
          padding: 14px;
        }
        .overlayCard{
          min-width: 220px;
          border-radius: 18px;
          background: #ffffff;
          border: 1px solid rgba(0,0,0,0.10);
          box-shadow: 0 18px 40px rgba(16,24,40,0.18);
          padding: 14px 16px;
          display:flex;
          align-items:center;
          gap: 12px;
        }
        .spin{
          width: 18px;
          height: 18px;
          border-radius: 999px;
          border: 3px solid rgba(59,130,246,0.25);
          border-top-color: rgba(59,130,246,0.9);
          animation: spin .8s linear infinite;
        }
        @keyframes spin{ to { transform: rotate(360deg); } }
        .overlayText{ font-weight: 950; color:#0f172a; font-size: 13px; }

        .toastCenter{
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 9999;
          background: #ffffff;
          border: 1px solid rgba(0,0,0,0.12);
          box-shadow: 0 18px 40px rgba(16,24,40,0.18);
          border-radius: 16px;
          padding: 12px 14px;
          min-width: 220px;
          text-align:center;
          font-weight: 950;
          color:#0f172a;
          font-size: 13px;
        }

        /* ======= Details Modal (Professional, mobile full screen) ======= */
        .detailsBackdrop{
          position: fixed;
          inset: 0;
          background: rgba(2, 6, 23, 0.55);
          z-index: 10020;
        }
        .detailsWrap{
          position: fixed;
          inset: 0;
          z-index: 10021;
          display:flex;
          align-items:center;
          justify-content:center;
          padding: 12px;
        }
        .detailsCard{
          position: relative;
          width: 100%;
          max-width: 760px;
          max-height: calc(100vh - 24px);
          overflow: auto;
          border-radius: 22px;
          border: 1px solid rgba(255,255,255,0.16);
          background:
            radial-gradient(700px 300px at 10% 10%, rgba(59,130,246,0.25), transparent 60%),
            radial-gradient(700px 300px at 90% 30%, rgba(34,197,94,0.20), transparent 60%),
            linear-gradient(135deg, rgba(255,255,255,0.98), rgba(240,249,255,0.98));
          box-shadow: 0 24px 80px rgba(0,0,0,0.35);
          padding: 16px;
        }
        @media (max-width: 520px){
          .detailsWrap{ padding: 0; }
          .detailsCard{
            border-radius: 0;
            max-width: 100%;
            max-height: 100vh;
            height: 100vh;
            padding: 14px 14px 18px;
          }
        }

        .closeIcon{
          position: absolute;
          top: 10px;
          right: 10px;
          width: 34px;
          height: 34px;
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.12);
          background: rgba(255,255,255,0.9);
          font-weight: 950;
          cursor: pointer;
        }
        .closeIcon:active{ transform: scale(0.98); }

        .detailsTop{ padding-top: 6px; }
        .detailsTitle{
          font-size: 20px;
          font-weight: 1000;
          color: #0f172a;
          letter-spacing: -0.2px;
          overflow-wrap: anywhere;
          padding-right: 44px;
        }
        @media (min-width: 900px){
          .detailsTitle{ font-size: 24px; }
        }
        .detailsMetaRow{ display:flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }

        .detailsDesc{
          margin-top: 14px;
          padding: 12px 12px;
          border-radius: 16px;
          border: 1px solid rgba(0,0,0,0.08);
          background: rgba(255,255,255,0.75);
          color: #0f172a;
          font-weight: 850;
          font-size: 13.5px;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
          line-height: 1.55;
        }
        .detailsEmpty{
          margin-top: 14px;
          padding: 12px 12px;
          border-radius: 16px;
          border: 1px dashed rgba(0,0,0,0.14);
          background: rgba(255,255,255,0.65);
          color: #334155;
          font-weight: 900;
          font-size: 13px;
        }

        .detailsBlock{ margin-top: 14px; }
        .detailsBlockTitle{
          font-weight: 1000;
          color: #0f172a;
          font-size: 13px;
          margin-bottom: 8px;
        }
        .detailsChecklist{ display:grid; gap: 8px; }
        .detailsCheck{
          display:flex;
          gap: 10px;
          align-items:flex-start;
          padding: 10px 12px;
          border-radius: 16px;
          background: rgba(255,255,255,0.75);
          border: 1px solid rgba(0,0,0,0.08);
        }
        .detailsCheckText{
          font-weight: 900;
          color:#0f172a;
          font-size: 13px;
          overflow-wrap: anywhere;
        }

        .detailsLabels{ display:flex; flex-wrap: wrap; gap: 8px; }

        .detailsInfoGrid{
          margin-top: 16px;
          display:grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }
        @media (min-width: 700px){
          .detailsInfoGrid{ grid-template-columns: 1fr 1fr; }
        }
        .infoItem{
          border-radius: 16px;
          border: 1px solid rgba(0,0,0,0.08);
          background: rgba(255,255,255,0.75);
          padding: 10px 12px;
        }
        .infoLabel{
          font-weight: 950;
          font-size: 12px;
          color: #334155;
        }
        .infoValue{
          margin-top: 4px;
          font-weight: 1000;
          font-size: 13px;
          color: #0f172a;
          overflow-wrap: anywhere;
          display:flex;
          gap: 10px;
          align-items:center;
        }
        .colorDot{
          width: 14px;
          height: 14px;
          border-radius: 99px;
          border: 1px solid rgba(0,0,0,0.20);
          display:inline-block;
        }
      `}</style>
    </div>
  );
}
