import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const API = "http://localhost:5000/api/notes";

export default function ShareNote() {
  const { token } = useParams();
  const [note, setNote] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${API}/share/${token}`)
      .then(res => setNote(res.data))
      .catch(() => setError("Invalid or expired share link"));
  }, [token]);

  if (error) return <div className="p-4 text-danger">{error}</div>;
  if (!note) return <div className="p-4">Loading...</div>;

  return (
    <div className="container p-4">
      <div
        className="card shadow"
        style={{ backgroundColor: note.color_tag || "#fff" }}
      >
        <div className="card-body">
          <h4 className="fw-bold text-uppercase">{note.title}</h4>

          {note.description && <p>{note.description}</p>}

          {note.has_checklist &&
            note.checklist_items?.map((item, i) => (
              <div key={i} className="form-check">
                <input
                  type="checkbox"
                  checked={item.checked}
                  readOnly
                  className="form-check-input"
                />
                <label className="form-check-label">
                  {item.text}
                </label>
              </div>
            ))}

          <div className="mt-3 d-flex flex-wrap gap-1">
            {note.labels?.map((l, i) => (
              <span key={i} className="badge bg-secondary">
                {l}
              </span>
            ))}
          </div>

          <small className="text-muted d-block mt-3">
            🔒 Read-only shared note
          </small>
        </div>
      </div>
    </div>
  );
}
