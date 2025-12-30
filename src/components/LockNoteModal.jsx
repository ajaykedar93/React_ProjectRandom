import { useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api/notes";

export default function LockNoteModal({ noteId, onClose, onSaved }) {
  const [pin, setPin] = useState("");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);

  const showToast = (msg, ms = 2200) => {
    setToast(msg);
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(""), ms);
  };

  const savePin = async () => {
    if (!/^\d{4}$/.test(pin)) {
      showToast("⚠️ PIN must be exactly 4 digits");
      return;
    }

    try {
      setLoading(true);
      await axios.patch(`${API}/${noteId}/lock-pin`, { pin });
      showToast("🔒 Note locked");
      setTimeout(() => {
        onSaved?.();
        onClose?.();
      }, 700);
    } catch (err) {
      showToast(err.response?.data?.error || "❌ Lock failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{
          background: "rgba(0,0,0,0.55)",
          zIndex: 5000,
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="position-fixed top-50 start-50 translate-middle"
        style={{
          zIndex: 5100,
          width: "100%",
          maxWidth: 460,
          animation: "scaleFade .22s ease",
        }}
      >
        <div
          className="shadow"
          style={{
            borderRadius: 18,
            background: "#ffffff",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 d-flex justify-content-between align-items-center"
            style={{
              background: "#2f3e46",
              color: "#fff",
            }}
          >
            <div className="d-flex align-items-center gap-2">
              <span
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                }}
              >
                🔒
              </span>
              <div>
                <div className="fw-bold" style={{ lineHeight: 1.1 }}>
                  Lock Note
                </div>
                <div style={{ fontSize: 12, opacity: 0.85 }}>
                  Set a 4-digit PIN to protect this note
                </div>
              </div>
            </div>

            <button
              className="btn btn-sm"
              style={{
                background: "rgba(255,255,255,0.15)",
                color: "#fff",
                borderRadius: 10,
              }}
              onClick={onClose}
              disabled={loading}
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="p-4">
            <label className="small fw-semibold mb-2" style={{ color: "#2f3e46" }}>
              Enter 4-digit PIN
            </label>

            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              className="form-control"
              placeholder="••••"
              value={pin}
              onChange={(e) => {
                // allow only digits
                const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                setPin(v);
              }}
              style={{
                borderRadius: 14,
                fontSize: 18,
                letterSpacing: 6,
                textAlign: "center",
                padding: "12px 14px",
              }}
            />

            <div className="mt-3 small text-muted">
              After locking:
              <ul className="mt-2 mb-0">
                <li>Only the title will be visible.</li>
                <li>To open/edit/delete/share, user must enter the PIN.</li>
              </ul>
            </div>

            {/* Footer buttons */}
            <div className="d-flex justify-content-end gap-2 mt-4">
              <button
                className="btn"
                style={{
                  background: "#dee2e6",
                  borderRadius: 12,
                  padding: "10px 14px",
                }}
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>

              <button
                className="btn"
                style={{
                  background: "#d64550",
                  color: "#fff",
                  borderRadius: 12,
                  padding: "10px 16px",
                  opacity: loading ? 0.8 : 1,
                }}
                onClick={savePin}
                disabled={loading}
              >
                {loading ? "Locking..." : "Lock Note"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast (center) */}
      {toast && (
        <div
          className="position-fixed top-50 start-50 translate-middle px-4 py-3 shadow"
          style={{
            background: "#2f3e46",
            color: "#fff",
            borderRadius: 14,
            zIndex: 9000,
            animation: "fadeIn .2s",
          }}
        >
          {toast}
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes scaleFade {
          from { opacity: 0; transform: translate(-50%, -50%) scale(.96); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
}
