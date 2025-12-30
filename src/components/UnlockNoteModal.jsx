import { useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5000/api/notes";

export default function UnlockNoteModal({ noteId, onClose, onUnlocked }) {
  const [pin, setPin] = useState("");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);

  const unlock = async () => {
    if (!pin || pin.length < 4) {
      setToast("⚠️ Enter valid PIN (4+ digits)");
      setTimeout(() => setToast(""), 2200);
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${API_BASE}/${noteId}/unlock`, { pin });
      setToast("✅ Unlocked");
      setTimeout(() => {
        setToast("");
        onUnlocked(noteId);
        onClose();
      }, 700);
    } catch (err) {
      setToast("❌ Wrong PIN");
      setTimeout(() => setToast(""), 2200);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
        style={{ zIndex: 3000 }}
        onClick={onClose}
      />

      <div
        className="position-fixed top-50 start-50 translate-middle"
        style={{
          zIndex: 3100,
          width: "100%",
          maxWidth: 420,
          animation: "scaleFade .22s ease",
        }}
      >
        <div
          className="p-4 shadow"
          style={{ borderRadius: 18, background: "#fff" }}
        >
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="fw-bold m-0" style={{ color: "#2f3e46" }}>
              🔒 Enter PIN to Open Note
            </h6>
            <button
              className="btn btn-sm"
              style={{ background: "#e9ecef" }}
              onClick={onClose}
            >
              ✕
            </button>
          </div>

          <p className="text-muted small mb-3">
            This note is locked. Please enter the correct PIN.
          </p>

          <input
            type="password"
            className="form-control mb-3"
            placeholder="Enter PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            style={{ borderRadius: 12 }}
          />

          <div className="d-flex justify-content-end gap-2">
            <button
              className="btn"
              style={{ background: "#dee2e6", borderRadius: 10 }}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              className="btn"
              style={{
                background: "#84a98c",
                color: "#fff",
                borderRadius: 10,
                opacity: loading ? 0.8 : 1,
              }}
              onClick={unlock}
              disabled={loading}
            >
              {loading ? "Unlocking..." : "Unlock"}
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div
          className="position-fixed top-50 start-50 translate-middle px-4 py-3 shadow"
          style={{
            background: "#2f3e46",
            color: "#fff",
            borderRadius: 14,
            zIndex: 4000,
            animation: "fadeIn .25s",
          }}
        >
          {toast}
        </div>
      )}

      <style>{`
        @keyframes scaleFade { from {opacity:0; transform:scale(.96)} to {opacity:1; transform:scale(1)} }
        @keyframes fadeIn { from {opacity:0} to {opacity:1} }
      `}</style>
    </>
  );
}
