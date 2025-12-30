import { useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const API_BASE = "http://localhost:5000/api/notes";

export default function AddNoteModal({ onClose, onSaved }) {
  const { user } = useAuth();
  const userId = user?.id;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [colorTag, setColorTag] = useState("#ffffff");
  const [labels, setLabels] = useState("");
  const [hasChecklist, setHasChecklist] = useState(false);
  const [checklist, setChecklist] = useState([{ text: "", checked: false }]);
  const [toast, setToast] = useState("");

  const addChecklistItem = () =>
    setChecklist([...checklist, { text: "", checked: false }]);

  const saveNote = async () => {
    if (!title.trim()) {
      setToast("⚠️ Title is required");
      setTimeout(() => setToast(""), 2500);
      return;
    }

    await axios.post(API_BASE, {
      user_id: userId,
      title: title.toUpperCase(),
      description: description || null,
      color_tag: colorTag,
      labels: labels ? labels.split(",").map(l => l.trim()) : [],
      has_checklist: hasChecklist,
      checklist_items: hasChecklist ? checklist : null,
    });

    setToast("✅ Note added successfully");
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
              ✏️ Add New Note
            </h5>
            <button
              className="btn btn-sm"
              style={{ background: "#e9ecef" }}
              onClick={onClose}
            >
              ✕
            </button>
          </div>

          {/* Title */}
          <input
            className="form-control mb-3"
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{
              borderRadius: 12,
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          />

          {/* Description */}
          <textarea
            className="form-control mb-3"
            placeholder="Description (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            style={{ borderRadius: 12 }}
          />

          {/* Options */}
          <div className="row g-3 mb-3">
            <div className="col-6">
              <label className="small fw-semibold">Color</label>
              <input
                type="color"
                className="form-control form-control-color"
                value={colorTag}
                onChange={e => setColorTag(e.target.value)}
                style={{ borderRadius: 10 }}
              />
            </div>

            <div className="col-6">
              <label className="small fw-semibold">Labels</label>
              <input
                className="form-control"
                placeholder="work, personal"
                value={labels}
                onChange={e => setLabels(e.target.value)}
                style={{ borderRadius: 10 }}
              />
            </div>
          </div>

          {/* Checklist Toggle */}
          <div
            className="d-flex align-items-center gap-2 mb-3"
            style={{ cursor: "pointer" }}
            onClick={() => setHasChecklist(!hasChecklist)}
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
                transition: "all .2s",
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
                placeholder={`Item ${i + 1}`}
                value={item.text}
                onChange={e => {
                  const copy = [...checklist];
                  copy[i].text = e.target.value;
                  setChecklist(copy);
                }}
                style={{ borderRadius: 10 }}
              />
            ))}

          {hasChecklist && (
            <button
              className="btn btn-sm mt-2"
              style={{
                background: "#e9ecef",
                borderRadius: 8,
              }}
              onClick={addChecklistItem}
            >
              + Add item
            </button>
          )}

          {/* Footer */}
          <div className="d-flex justify-content-end gap-2 mt-4">
            <button
              className="btn"
              style={{ background: "#dee2e6", borderRadius: 10 }}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="btn"
              style={{
                background: "#84a98c",
                color: "#fff",
                borderRadius: 10,
              }}
              onClick={saveNote}
            >
              Save Note
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
