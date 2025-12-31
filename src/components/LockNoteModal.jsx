import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api/notes";

export default function LockNoteModal({ open, noteTitle, noteId, onClose, onSaved }) {
  const [pin, setPin] = useState("");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);

  const canSave = useMemo(() => /^\d{4}$/.test(pin), [pin]);

  const showToast = (msg, ms = 2200) => {
    setToast(msg);
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(""), ms);
  };

  useEffect(() => {
    if (!open) {
      setPin("");
      setToast("");
      setLoading(false);
    }
  }, [open]);

  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    if (open) window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

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
      }, 650);
    } catch (err) {
      showToast(err.response?.data?.error || "❌ Lock failed");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

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
          maxWidth: 520,
          padding: 14,
          animation: "scaleFade .18s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="shadow"
          style={{
            borderRadius: 18,
            background: "#ffffff",
            overflow: "hidden",
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 d-flex justify-content-between align-items-center"
            style={{
              background: "linear-gradient(135deg, #1f2937, #0b1220)",
              color: "#fff",
            }}
          >
            <div className="d-flex align-items-center gap-3">
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                }}
              >
                🔒
              </div>
              <div>
                <div className="fw-bold" style={{ lineHeight: 1.15, fontSize: 16 }}>
                  Lock Note
                </div>
                <div style={{ fontSize: 12, opacity: 0.85 }}>
                  {noteTitle ? `Protect “${noteTitle}” with a 4-digit PIN` : "Set a 4-digit PIN to protect this note"}
                </div>
              </div>
            </div>

            <button
              className="btn btn-sm"
              style={{
                background: "rgba(255,255,255,0.14)",
                color: "#fff",
                borderRadius: 12,
                padding: "6px 10px",
              }}
              onClick={onClose}
              disabled={loading}
              title="Close"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="p-4">
            <label className="small fw-semibold mb-2" style={{ color: "#111827" }}>
              Enter 4-digit PIN
            </label>

            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              className="form-control"
              placeholder="••••"
              value={pin}
              autoFocus
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                setPin(v);
              }}
              style={{
                borderRadius: 14,
                fontSize: 18,
                letterSpacing: 8,
                textAlign: "center",
                padding: "12px 14px",
                border: "1px solid rgba(0,0,0,0.12)",
              }}
            />

            <div className="mt-3 small text-muted" style={{ lineHeight: 1.5 }}>
              After locking:
              <ul className="mt-2 mb-0">
                <li>Only the <b>title</b> will be visible in the list.</li>
                <li>To open/edit/delete/share, user must enter the same PIN.</li>
              </ul>
            </div>

            {/* Footer */}
            <div className="d-flex justify-content-end gap-2 mt-4">
              <button
                className="btn"
                style={{
                  background: "#eef2f7",
                  borderRadius: 12,
                  padding: "10px 14px",
                  border: "1px solid rgba(0,0,0,0.06)",
                }}
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>

              <button
                className="btn"
                style={{
                  background: canSave ? "linear-gradient(135deg, #ef4444, #b91c1c)" : "#f3f4f6",
                  color: canSave ? "#fff" : "#9ca3af",
                  borderRadius: 12,
                  padding: "10px 16px",
                  border: "none",
                  opacity: loading ? 0.85 : 1,
                }}
                onClick={savePin}
                disabled={loading || !canSave}
              >
                {loading ? "Locking..." : "Lock Note"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast (CENTER ONLY) */}
      {toast && (
        <div
          className="position-fixed top-50 start-50 translate-middle px-4 py-3 shadow"
          style={{
            background: "rgba(17,24,39,0.95)",
            color: "#fff",
            borderRadius: 14,
            zIndex: 9000,
            animation: "fadeIn .18s",
            border: "1px solid rgba(255,255,255,0.08)",
            maxWidth: 420,
            textAlign: "center",
          }}
        >
          {toast}
        </div>
      )}

      <style>{`
        @keyframes scaleFade {
          from { opacity: 0; transform: translate(-50%, -50%) scale(.97); }
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
