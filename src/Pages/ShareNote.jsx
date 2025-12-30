import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const API_BASE = "http://localhost:5000/api/notes";

export default function ShareNote() {
  const { token } = useParams();
  const [note, setNote] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    axios
      .get(`${API_BASE}/share/${token}`)
      .then((res) => {
        setNote(res.data);
      })
      .catch(() => {
        setError("Invalid or expired share link");
      });
  }, [token]);

  if (error) {
    return (
      <div className="container p-4 text-center">
        <h5 className="text-danger">{error}</h5>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="container p-4 text-center text-muted">
        Loading shared note...
      </div>
    );
  }

  return (
    <div className="container d-flex justify-content-center p-4">
      <div
        className="card shadow w-100"
        style={{
          maxWidth: "600px",
          backgroundColor: note.color_tag || "#ffffff",
        }}
      >
        <div className="card-body">
          {/* Title */}
          <h4 className="fw-bold text-uppercase text-break">
            {note.title}
          </h4>

          {/* Description */}
          {note.description && (
            <p className="mt-2 text-break">
              {note.description}
            </p>
          )}

          {/* Checklist */}
          {note.has_checklist &&
            note.checklist_items?.map((item, index) => (
              <div key={index} className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={item.checked}
                  readOnly
                />
                <label className="form-check-label text-break">
                  {item.text}
                </label>
              </div>
            ))}

          {/* Labels */}
          {note.labels?.length > 0 && (
            <div className="mt-3 d-flex flex-wrap gap-2">
              {note.labels.map((label, index) => (
                <span
                  key={index}
                  className="badge bg-secondary text-break"
                >
                  {label}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4 text-muted small">
            🔒 This note is shared as <strong>read-only</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
