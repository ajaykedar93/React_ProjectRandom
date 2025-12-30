import { useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5000/api/notes";

export default function EditNoteModal({ note, onClose, onSaved }) {
  const [title, setTitle] = useState(note.title);
  const [description, setDescription] = useState(note.description || "");
  const [colorTag, setColorTag] = useState(note.color_tag || "#ffffff");
  const [labels, setLabels] = useState(note.labels?.join(", ") || "");
  const [hasChecklist, setHasChecklist] = useState(note.has_checklist);
  const [checklist, setChecklist] = useState(note.checklist_items || []);
  const [toast, setToast] = useState("");

  /* ===== BLOCK EDIT IF LOCKED ===== */
  const isLocked = note.is_locked;

  const saveChanges = async () => {
    if (isLocked) {
      setToast("🔒 This note is locked and cannot be edited");
      setTimeout(() => setToast(""), 2500);
      return;
    }

    await axios.put(`${API_BASE}/${note.id}`, {
      title: title.toUpperCase(),
      description,
      color_tag: colorTag,
      labels: labels
        ? labels.split(",").map((l) => l.trim())
        : [],
      has_checklist: hasChecklist,
      checklist_items: hasChecklist ? checklist : null,
    });

    setToast("✅ Note updated successfully");
    setTimeout(() => {
      setToast("");
      onSaved();
      onClose();
    }, 1200);
  };

  return (
    <>
      {/* ================= BACKDROP ================= */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
        style={{ zIndex: 2000 }}
        onClick={onClose}
      />

      {/* ================= MODAL ================= */}
      <div
        className="position-fixed top-50 start-50 translate-middle"
        style={{
          zIndex: 2100,
          width: "100%",
          maxWidth: 620,
          animation: "scaleFade .25s ease",
        }}
      >
        <div
          className="p-4 shadow"
          style={{
            borderRadius: 18,
            background: "#ffffff",
          }}
        >
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold m-0" style={{ color: "#2f3e46" }}>
              ✏️ Edit Note
            </h5>
            <button
              className="btn btn-sm"
              style={{ background: "#e9ecef" }}
              onClick={onClose}
            >
              ✕
            </button>
          </div>

          {/* Locked warning */}
          {isLocked && (
            <div
              className="mb-3 px-3 py-2"
              style={{
                background: "#fff3cd",
                borderRadius: 10,
                color: "#856404",
                fontSize: 14,
              }}
            >
              🔒 This note is locked. Editing is disabled.
            </div>
          )}

          {/* Title */}
          <input
            className="form-control mb-3"
            value={title}
            disabled={isLocked}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              borderRadius: 12,
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          />

          {/* Description */}
          <textarea
            className="form-control mb-3"
            value={description}
            disabled={isLocked}
            onChange={(e) => setDescription(e.target.value)}
            style={{ borderRadius: 12 }}
          />

          {/* Options */}
          <div className="row g-3 mb-3">
            <div className="col-6">
              <label className="small fw-semibold">Color</label>
              <input
                type="color"
                className="form-control form-control-color"
                disabled={isLocked}
                value={colorTag}
                onChange={(e) => setColorTag(e.target.value)}
                style={{ borderRadius: 10 }}
              />
            </div>

            <div className="col-6">
              <label className="small fw-semibold">Labels</label>
              <input
                className="form-control"
                disabled={isLocked}
                value={labels}
                onChange={(e) => setLabels(e.target.value)}
                style={{ borderRadius: 10 }}
              />
            </div>
          </div>

          {/* Checklist Toggle */}
          <div
            className="d-flex align-items-center gap-2 mb-3"
            style={{ cursor: isLocked ? "not-allowed" : "pointer" }}
            onClick={() => !isLocked && setHasChecklist(!hasChecklist)}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 4,
                border: "2px solid #52796f",
                background: hasChecklist ? "#52796f" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 12,
                opacity: isLocked ? 0.5 : 1,
              }}
            >
              {hasChecklist && "✓"}
            </div>
            <span className="fw-semibold">Checklist</span>
          </div>

          {/* Checklist Items */}
          {hasChecklist &&
            checklist.map((item, i) => (
              <input
                key={i}
                className="form-control mb-2"
                disabled={isLocked}
                value={item.text}
                onChange={(e) => {
                  const copy = [...checklist];
                  copy[i].text = e.target.value;
                  setChecklist(copy);
                }}
                style={{ borderRadius: 10 }}
              />
            ))}

          {/* Footer */}
          <div className="d-flex justify-content-end gap-2 mt-4">
            <button
              className="btn"
              style={{ background: "#dee2e6", borderRadius: 10 }}
              onClick={onClose}
            >
              Close
            </button>
            <button
              className="btn"
              disabled={isLocked}
              style={{
                background: isLocked ? "#adb5bd" : "#84a98c",
                color: "#fff",
                borderRadius: 10,
              }}
              onClick={saveChanges}
            >
              Update Note
            </button>
          </div>
        </div>
      </div>

      {/* ================= TOAST ================= */}
      {toast && (
        <div
          className="position-fixed top-50 start-50 translate-middle px-4 py-3 shadow"
          style={{
            background: "#2f3e46",
            color: "#fff",
            borderRadius: 14,
            zIndex: 3000,
            animation: "fadeIn .3s",
          }}
        >
          {toast}
        </div>
      )}

      {/* ================= ANIMATIONS ================= */}
      <style>
        {`
          @keyframes scaleFade {
            from { opacity: 0; transform: scale(.95); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
      </style>
    </>
  );
}
