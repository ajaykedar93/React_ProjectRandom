import React, { useEffect, useState } from "react";

const API_BASE = "https://express-projectrandom.onrender.com";

export default function Gettextdoc() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editValues, setEditValues] = useState({});

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/textdocs`);
      const data = await res.json();
      setDocs(Array.isArray(data) ? data : []);
    } catch {
      showModal("error", "Error", "Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const showModal = (type, title, message, onConfirm = null) => {
    setModal({ type, title, message, onConfirm });
  };

  const closeModal = () => setModal(null);

  const copyText = async (text) => {
    await navigator.clipboard.writeText(String(text));
    showModal("success", "Copied", "Text copied to clipboard");
  };

  const deleteDoc = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/textdocs/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showModal("success", "Deleted", "Document deleted successfully");
      fetchDocs();
    } catch (e) {
      showModal("error", "Error", e.message || "Delete failed");
    }
  };

  const startEdit = (doc) => {
    setEditId(doc.id);
    setEditValues({ ...doc.fields });
  };

  const saveUpdate = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/textdocs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: editValues }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setEditId(null);
      setEditValues({});
      showModal("success", "Updated", "Document updated successfully");
      fetchDocs();
    } catch (e) {
      showModal("error", "Error", e.message || "Update failed");
    }
  };

  return (
    <div className="gtd">
      <style>{css}</style>

      {/* MODAL */}
      {modal && (
        <div className="modalBack">
          <div className={`modal ${modal.type}`}>
            <h3>{modal.title}</h3>
            <p>{modal.message}</p>
            <div className="modalBtns">
              {modal.onConfirm ? (
                <>
                  <button
                    className="btn danger"
                    onClick={() => {
                      modal.onConfirm();
                      closeModal();
                    }}
                  >
                    Yes
                  </button>
                  <button className="btn ghost" onClick={closeModal}>
                    Cancel
                  </button>
                </>
              ) : (
                <button className="btn" onClick={closeModal}>
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="header">Text Documents</div>

      {loading ? (
        <div className="center">Loading...</div>
      ) : docs.length === 0 ? (
        <div className="center">No documents found</div>
      ) : (
        <div className="list">
          {docs.map((d) => (
            <div key={d.id} className="card">
              <div className="cardTop">
                <div className="docType">{d.doc_type}</div>
                <div className="date">
                  {new Date(d.created_at).toLocaleString()}
                </div>
              </div>

              <div className="fields">
                {Object.entries(d.fields || {}).map(([k, v]) => (
                  <div key={k} className="fieldRow">
                    <span>{k}</span>

                    {editId === d.id ? (
                      <input
                        className="editInput"
                        value={editValues[k] || ""}
                        onChange={(e) =>
                          setEditValues((p) => ({
                            ...p,
                            [k]: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      <div className="valueBox">
                        <b>{v}</b>
                        <button
                          className="copyBtn"
                          title="Copy"
                          onClick={() => copyText(v)}
                        >
                          📋
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {d.file_path && (
                <a
                  href={`${API_BASE}${d.file_path}`}
                  target="_blank"
                  rel="noreferrer"
                  className="file"
                >
                  📎 {d.file_name}
                </a>
              )}

              <div className="actions">
                {editId === d.id ? (
                  <>
                    <button className="btn" onClick={() => saveUpdate(d.id)}>
                      Save
                    </button>
                    <button
                      className="btn ghost"
                      onClick={() => setEditId(null)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn ghost"
                      onClick={() => startEdit(d)}
                    >
                      Update
                    </button>
                    <button
                      className="btn danger"
                      onClick={() =>
                        showModal(
                          "confirm",
                          "Confirm Delete",
                          "Are you sure you want to delete this document?",
                          () => deleteDoc(d.id)
                        )
                      }
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const css = `
.gtd{
  width:100%;
  min-height:100%;
  margin:0;
  padding:0;
}

/* Header */
.header{
  padding:14px 12px;
  font-size:18px;
  font-weight:1100;
  background: linear-gradient(90deg, #7c3aed, #06b6d4, #22c55e);
  -webkit-background-clip:text;
  color:transparent;
}

/* List */
.list{ display:grid; gap:12px; }

/* Card */
.card{
  background:#fff;
  padding:14px 12px;
  border-bottom:1px solid #eee;
}

/* Top */
.cardTop{
  display:flex;
  justify-content:space-between;
}
.docType{
  font-weight:1000;
  background: linear-gradient(90deg, #ff6a00, #ff2d55);
  -webkit-background-clip:text;
  color:transparent;
}
.date{ font-size:11px; opacity:.6; }

/* Fields */
.fields{ margin-top:10px; display:grid; gap:8px; }

.fieldRow{
  display:grid;
  grid-template-columns: 110px 1fr;
  gap:10px;
  align-items:center;
}

/* TITLE (small + bold) */
.fieldRow span{
  font-size:11px;
  font-weight:800;
  color:#374151;
  text-transform:capitalize;
}

/* VALUE (normal + purple) */
.valueBox{
  display:flex;
  align-items:center;
  gap:8px;
}
.valueBox b{
  font-weight:500;
  font-size:13px;
  color:#4c1d95;
  word-break:break-word;
}

/* Copy */
.copyBtn{
  border:none;
  background: linear-gradient(90deg, #6d28d9, #7c3aed);
  color:#fff;
  border-radius:6px;
  padding:4px 6px;
  cursor:pointer;
  font-size:12px;
}

/* Edit */
.editInput{
  width:100%;
  padding:6px 8px;
  border-radius:8px;
  border:1px solid #ddd;
  font-size:13px;
  color:#4c1d95;
}

/* File */
.file{
  display:block;
  margin-top:8px;
  font-size:12px;
  color:#6d28d9;
  text-decoration:underline;
}

/* Actions */
.actions{
  margin-top:12px;
  display:flex;
  gap:8px;
}

/* Buttons */
.btn{
  flex:1;
  padding:10px;
  border:none;
  border-radius:10px;
  font-weight:1000;
  background: linear-gradient(90deg, #7c3aed, #06b6d4, #22c55e);
  color:#fff;
}
.btn.ghost{
  background:#f3f4f6;
  color:#111;
}
.btn.danger{
  background: linear-gradient(90deg, #dc2626, #f97316);
}

/* Center */
.center{
  padding:20px;
  text-align:center;
  font-weight:900;
  opacity:.7;
}

/* Modal */
.modalBack{
  position:fixed;
  inset:0;
  background:rgba(0,0,0,.45);
  display:flex;
  align-items:center;
  justify-content:center;
  z-index:9999;
}
.modal{
  width:min(90%, 340px);
  background:#fff;
  border-radius:16px;
  padding:16px;
  text-align:center;
}
.modal h3{ margin:0 0 6px; }
.modal p{ font-size:13px; opacity:.75; }
.modalBtns{ margin-top:12px; display:flex; gap:10px; }

/* Mobile */
@media (max-width:740px){
  .card{ border-radius:0; }
  .fieldRow{ grid-template-columns: 90px 1fr; }
}
`;
