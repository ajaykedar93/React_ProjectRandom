import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DocumentGet() {
  const API_BASE = "https://express-projectrandom.onrender.com";
  const navigate = useNavigate();

  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");

  // Center modal (alert/confirm)
  const [modal, setModal] = useState({
    open: false,
    type: "info", // info | success | error | confirm
    title: "",
    message: "",
    onConfirm: null,
    confirmText: "Yes",
    cancelText: "Cancel",
  });

  const openModal = (cfg) =>
    setModal({
      open: true,
      type: cfg.type || "info",
      title: cfg.title || "",
      message: cfg.message || "",
      onConfirm: cfg.onConfirm || null,
      confirmText: cfg.confirmText || "Yes",
      cancelText: cfg.cancelText || "Cancel",
    });

  const closeModal = () => setModal((p) => ({ ...p, open: false, onConfirm: null }));

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editFile, setEditFile] = useState(null);

  const prettySize = useMemo(
    () => (bytes) => {
      if (!bytes && bytes !== 0) return "-";
      const units = ["B", "KB", "MB", "GB"];
      let i = 0;
      let n = Number(bytes);
      while (n >= 1024 && i < units.length - 1) {
        n /= 1024;
        i += 1;
      }
      return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
    },
    []
  );

  const formatIndia = useMemo(
    () => (iso) => {
      if (!iso) return "-";
      try {
        return new Date(iso).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch {
        return String(iso);
      }
    },
    []
  );

  const fileIcon = useMemo(
    () => (ext = "", mime = "") => {
      const e = String(ext || "").toLowerCase();
      const m = String(mime || "").toLowerCase();

      if (e === "pdf" || m.includes("pdf")) return { emoji: "📕", label: "PDF" };
      if (["jpg", "jpeg", "png", "webp", "gif", "bmp", "svg"].includes(e) || m.startsWith("image/"))
        return { emoji: "🖼️", label: "IMAGE" };
      if (["doc", "docx"].includes(e)) return { emoji: "📝", label: "WORD" };
      if (["xls", "xlsx"].includes(e)) return { emoji: "📊", label: "EXCEL" };
      if (["csv"].includes(e)) return { emoji: "🧾", label: "CSV" };
      if (["txt"].includes(e)) return { emoji: "📄", label: "TEXT" };
      if (
        ["js", "ts", "jsx", "tsx", "json", "html", "css", "py", "java", "c", "cpp", "php", "go", "rs"].includes(e)
      )
        return { emoji: "💻", label: "CODE" };
      if (["zip", "rar", "7z"].includes(e)) return { emoji: "🗜️", label: "ZIP" };
      return { emoji: "📁", label: (e || "FILE").toUpperCase() };
    },
    []
  );

  const canPreviewInBrowser = (doc) => {
    const ext = String(doc.file_ext || "").toLowerCase();
    const mime = String(doc.mime_type || "").toLowerCase();
    if (ext === "pdf" || mime.includes("pdf")) return true;
    if (mime.startsWith("image/")) return true;
    if (["jpg", "jpeg", "png", "webp", "gif", "bmp", "svg"].includes(ext)) return true;
    return false;
  };

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const url = q.trim()
        ? `${API_BASE}/api/documents?q=${encodeURIComponent(q.trim())}`
        : `${API_BASE}/api/documents`;

      const res = await fetch(url);
      const text = await res.text();
      let data = null;
      try {
        data = JSON.parse(text);
      } catch {}

      if (!res.ok) throw new Error(data?.message || text || `HTTP ${res.status}`);
      setDocs(Array.isArray(data) ? data : []);
    } catch (e) {
      openModal({ type: "error", title: "Load Failed", message: e.message || "Server error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onView = (doc) => {
    if (!canPreviewInBrowser(doc)) return;
    const url = `${API_BASE}/api/documents/${doc.id}/download`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const onDownload = (doc) => {
    const url = `${API_BASE}/api/documents/${doc.id}/download`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // ✅ Open edit modal (same page)
  const openEdit = (doc) => {
    setSelectedDoc(doc);
    setEditTitle(doc.document_title || "");
    setEditDesc(doc.short_desc || "");
    setEditFile(null);
    setEditOpen(true);
  };

  const closeEdit = () => {
    if (editLoading) return;
    setEditOpen(false);
    setSelectedDoc(null);
    setEditFile(null);
  };

  // ✅ UPDATE (multipart/form-data)
  const submitUpdate = async (e) => {
    e.preventDefault();
    if (!selectedDoc?.id) return;

    try {
      setEditLoading(true);

      const fd = new FormData();
      // backend: document_title optional, short_desc optional, file optional
      // but title usually should not be empty if user changed it
      if (editTitle.trim()) fd.append("document_title", editTitle.trim());
      // allow empty desc -> send empty string (backend will COALESCE; empty string will set empty)
      fd.append("short_desc", editDesc ?? "");
      if (editFile) fd.append("file", editFile);

      const res = await fetch(`${API_BASE}/api/documents/${selectedDoc.id}`, {
        method: "PUT",
        body: fd,
      });

      const text = await res.text();
      let data = null;
      try {
        data = JSON.parse(text);
      } catch {}

      if (!res.ok) throw new Error(data?.message || text || `HTTP ${res.status}`);

      setEditOpen(false);
      setSelectedDoc(null);
      setEditFile(null);

      openModal({ type: "success", title: "Updated", message: data?.message || "Updated successfully" });
      await fetchDocs();
    } catch (e2) {
      openModal({ type: "error", title: "Update Failed", message: e2.message || "Server error" });
    } finally {
      setEditLoading(false);
    }
  };

  // ✅ DELETE confirm + delete same page
  const askDelete = (doc) => {
    openModal({
      type: "confirm",
      title: "Delete Document?",
      message: `Are you sure you want to delete "${doc.document_title}"?\nThis cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        closeModal();
        await doDelete(doc.id);
      },
    });
  };

  const doDelete = async (id) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/documents/${id}`, { method: "DELETE" });

      const text = await res.text();
      let data = null;
      try {
        data = JSON.parse(text);
      } catch {}

      if (!res.ok) throw new Error(data?.message || text || `HTTP ${res.status}`);

      openModal({ type: "success", title: "Deleted", message: data?.message || "Deleted successfully" });
      await fetchDocs();
    } catch (e) {
      openModal({ type: "error", title: "Delete Failed", message: e.message || "Server error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dg">
      <style>{css}</style>
      <div className="bg" />

      {/* ✅ CENTER MODAL (alert + confirm) */}
      {modal.open ? (
        <div className="mb" onClick={closeModal}>
          <div className="mc" onClick={(e) => e.stopPropagation()}>
            <div className={`pill ${modal.type}`}>{modal.type.toUpperCase()}</div>
            <h3 className="mt">{modal.title}</h3>
            <p className="mm" style={{ whiteSpace: "pre-line" }}>
              {modal.message}
            </p>

            {modal.type === "confirm" ? (
              <div className="mRow">
                <button className="mBtn ghost" type="button" onClick={closeModal}>
                  {modal.cancelText}
                </button>
                <button
                  className="mBtn danger"
                  type="button"
                  onClick={() => modal.onConfirm && modal.onConfirm()}
                >
                  {modal.confirmText}
                </button>
              </div>
            ) : (
              <button className="mBtn" type="button" onClick={closeModal}>
                OK
              </button>
            )}
          </div>
        </div>
      ) : null}

      {/* ✅ EDIT MODAL (center) */}
      {editOpen ? (
        <div className="mb" onClick={closeEdit}>
          <div className="mc" onClick={(e) => e.stopPropagation()}>
            <div className="pill info">EDIT</div>
            <h3 className="mt">Update Document</h3>

            <form onSubmit={submitUpdate} className="form">
              <label className="lbl">Title</label>
              <input
                className="inp"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter document title"
                required
              />

              <label className="lbl">Short Description</label>
              <textarea
                className="ta"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="Enter short description (optional)"
                rows={3}
              />

              <label className="lbl">Replace File (optional)</label>
              <input
                className="inp"
                type="file"
                onChange={(e) => setEditFile(e.target.files?.[0] || null)}
              />

              <div className="mRow" style={{ marginTop: 12 }}>
                <button className="mBtn ghost" type="button" onClick={closeEdit} disabled={editLoading}>
                  Cancel
                </button>
                <button className="mBtn" type="submit" disabled={editLoading}>
                  {editLoading ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <div className="card">
        <div className="head">
          <div className="hleft">
            <h2 className="title">Uploaded Documents</h2>
            <p className="sub">Search • View • Download • Update • Delete</p>
          </div>

          <div className="actions">
            <input className="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title..." />
            <button className="btn2" type="button" onClick={fetchDocs} disabled={loading}>
              {loading ? "Loading..." : "Search"}
            </button>
            <button className="btnGhost" type="button" onClick={() => navigate("/document")}>
              + Upload
            </button>
          </div>
        </div>

        <div className="listWrap">
          {loading ? (
            <div className="loading">
              <div className="spinner" />
              Loading...
            </div>
          ) : docs.length === 0 ? (
            <div className="empty">
              No documents found.
              <div className="emptyLink" onClick={() => navigate("/document")}>
                Upload new document
              </div>
            </div>
          ) : (
            <div className="grid">
              {docs.map((d) => {
                const ic = fileIcon(d.file_ext, d.mime_type);
                const previewable = canPreviewInBrowser(d);

                return (
                  <div key={d.id} className="item">
                    <div className="topRow">
                      <div className="iconBox">
                        <div className="emoji">{ic.emoji}</div>
                        <div className="tag">{ic.label}</div>
                      </div>

                      <div className="titleBox">
                        <div className="t1">{d.document_title}</div>
                        {d.short_desc ? <div className="t2">{d.short_desc}</div> : <div className="t2 muted">No description</div>}
                      </div>
                    </div>

                    <div className="infoRow">
                      <span className="chip">{prettySize(d.file_size_bytes)}</span>
                      <span className="chip">{(d.file_ext || "file").toUpperCase()}</span>
                      <span className="chip">{formatIndia(d.uploaded_at)}</span>
                      {d.mime_type ? <span className="chip">{d.mime_type}</span> : null}
                    </div>

                    <div className="btnRow">
                      <button
                        className={`view ${previewable ? "" : "disabled"}`}
                        type="button"
                        onClick={() => onView(d)}
                        disabled={!previewable}
                        title={previewable ? "Preview in new tab" : "Preview not supported for this file type"}
                      >
                        View
                      </button>

                      <button className="down" type="button" onClick={() => onDownload(d)}>
                        Download
                      </button>

                      {/* ✅ NEW: Update */}
                      <button className="edit" type="button" onClick={() => openEdit(d)}>
                        Update
                      </button>

                      {/* ✅ NEW: Delete */}
                      <button className="del" type="button" onClick={() => askDelete(d)}>
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="links">
          <span className="link" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </span>
        </div>
      </div>
    </div>
  );
}

const css = `
  :root{
    --txt:#0b1220;
    --muted:rgba(11,18,32,.65);
    --card:rgba(255,255,255,.90);
    --shadow: 0 26px 80px rgba(0,0,0,.18);
  }

  .dg{
    min-height:100vh;
    width:100%;
    position:relative;
    overflow-x:hidden;
    overflow-y:auto;
    display:flex;
    justify-content:center;
    align-items:flex-start;
    padding:20px;
    box-sizing:border-box;
  }

  .bg{
    position:fixed; inset:0;
    background:
      radial-gradient(900px 520px at 12% 12%, rgba(255, 0, 150, .22), transparent 60%),
      radial-gradient(900px 520px at 88% 16%, rgba(0, 200, 255, .18), transparent 58%),
      radial-gradient(1000px 650px at 50% 92%, rgba(0, 255, 150, .15), transparent 60%),
      linear-gradient(135deg, #fffbeb 0%, #eff6ff 34%, #ecfeff 67%, #f0fdf4 100%);
    z-index:0; pointer-events:none;
  }

  .card{
    width:100%;
    max-width: 980px;
    background:var(--card);
    border:1px solid rgba(255,255,255,.55);
    border-radius:22px;
    padding:22px;
    box-shadow:var(--shadow);
    backdrop-filter: blur(14px);
    z-index:1;
    box-sizing:border-box;
  }

  .head{
    display:flex;
    justify-content:space-between;
    gap:12px;
    flex-wrap:wrap;
    align-items:flex-start;
    margin-bottom: 14px;
  }
  .hleft{ min-width:0; }

  .title{
    margin:0;
    font-weight:1000;
    color:var(--txt);
    font-size: clamp(20px, 3.2vw, 30px);
    word-break: break-word;
  }
  .sub{
    margin:8px 0 0;
    color:var(--muted);
    font-weight:800;
    font-size: clamp(12px, 1.8vw, 14px);
    word-break: break-word;
  }

  .actions{
    display:flex;
    gap:10px;
    flex-wrap:wrap;
    align-items:center;
    justify-content:flex-end;
    width: min(520px, 100%);
  }

  .search{
    flex: 1 1 220px;
    min-width: 180px;
    padding: 12px 12px;
    border-radius: 16px;
    border: 1px solid rgba(17,24,39,.10);
    outline:none;
    font-weight: 900;
    background: rgba(255,255,255,.75);
  }
  .search:focus{
    border-color: rgba(124,58,237,.35);
    box-shadow: 0 0 0 5px rgba(124,58,237,.12);
  }

  .btn2{
    border:none;
    padding: 12px 14px;
    border-radius: 16px;
    cursor:pointer;
    color:#fff;
    font-weight:1000;
    background: linear-gradient(90deg, #7c3aed 0%, #06b6d4 55%, #22c55e 100%);
    box-shadow: 0 14px 30px rgba(124,58,237,.18);
    white-space: nowrap;
  }
  .btn2:disabled{ opacity:.75; cursor:not-allowed; }

  .btnGhost{
    border:none;
    padding: 12px 14px;
    border-radius: 16px;
    cursor:pointer;
    font-weight:1000;
    background: rgba(17,24,39,.08);
    color: #111827;
    white-space: nowrap;
  }

  .listWrap{ margin-top: 10px; }
  .loading{
    display:flex;
    gap:10px;
    align-items:center;
    justify-content:center;
    padding: 26px;
    font-weight: 950;
    color: rgba(11,18,32,.70);
  }
  .spinner{
    width: 16px; height: 16px;
    border-radius: 999px;
    border: 3px solid rgba(11,18,32,.15);
    border-top-color: rgba(124,58,237,.65);
    animation: spin 1s linear infinite;
  }
  @keyframes spin{ to{ transform: rotate(360deg); } }

  .empty{
    padding: 22px;
    border-radius: 18px;
    background: rgba(255,255,255,.65);
    border: 1px solid rgba(17,24,39,.08);
    text-align:center;
    font-weight: 950;
    color: rgba(11,18,32,.70);
  }
  .emptyLink{
    margin-top: 10px;
    color:#7c3aed;
    font-weight: 1000;
    cursor:pointer;
    text-decoration: underline;
  }

  .grid{ display:grid; gap: 12px; }

  .item{
    display:flex;
    flex-direction:column;
    gap: 10px;
    padding: 14px;
    border-radius: 20px;
    background: rgba(255,255,255,.72);
    border: 1px solid rgba(17,24,39,.08);
    box-shadow: 0 14px 34px rgba(0,0,0,.10);
    animation: fadeIn .26s ease both;
  }

  .topRow{
    display:flex;
    align-items:flex-start;
    gap: 12px;
    min-width:0;
  }

  .iconBox{
    width: 86px;
    flex: 0 0 auto;
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    gap: 6px;
    border-radius: 18px;
    background:
      radial-gradient(220px 120px at 20% 20%, rgba(124,58,237,.14), transparent 60%),
      radial-gradient(220px 120px at 80% 40%, rgba(6,182,212,.12), transparent 60%),
      rgba(255,255,255,.60);
    border: 1px solid rgba(124,58,237,.14);
    padding: 10px 8px;
  }

  .emoji{ font-size: 26px; line-height: 1; }
  .tag{
    font-size: 11px;
    font-weight: 1000;
    color: rgba(11,18,32,.80);
    background: rgba(17,24,39,.06);
    border: 1px solid rgba(17,24,39,.08);
    padding: 4px 8px;
    border-radius: 999px;
    text-align:center;
  }

  .titleBox{ min-width:0; }
  .t1{
    font-weight: 1100;
    color: rgba(11,18,32,.92);
    font-size: 15px;
    word-break: break-word;
    white-space: normal;
  }
  .t2{
    margin-top: 4px;
    font-weight: 850;
    color: rgba(11,18,32,.68);
    font-size: 13px;
    word-break: break-word;
    white-space: normal;
  }
  .t2.muted{ color: rgba(11,18,32,.55); }

  .infoRow{
    display:flex;
    flex-wrap:wrap;
    gap: 8px;
  }
  .chip{
    font-size: 11px;
    font-weight: 1000;
    color: rgba(11,18,32,.72);
    background: rgba(17,24,39,.06);
    border: 1px solid rgba(17,24,39,.08);
    padding: 6px 10px;
    border-radius: 999px;
    white-space: normal;
    word-break: break-word;
  }

  .btnRow{
    display:flex;
    gap: 10px;
    flex-wrap:wrap;
    justify-content:flex-end;
  }

  .view{
    border:none;
    padding: 10px 12px;
    border-radius: 14px;
    cursor:pointer;
    font-weight: 1000;
    background: rgba(17,24,39,.08);
    color: #111827;
    white-space: nowrap;
  }
  .view.disabled{
    opacity: .45;
    cursor: not-allowed;
    filter: grayscale(1);
  }

  .down{
    border:none;
    padding: 10px 12px;
    border-radius: 14px;
    cursor:pointer;
    font-weight: 1000;
    color:#fff;
    background: linear-gradient(90deg, #7c3aed 0%, #06b6d4 55%, #22c55e 100%);
    box-shadow: 0 14px 30px rgba(124,58,237,.18);
    white-space: nowrap;
  }

  .edit{
    border:none;
    padding: 10px 12px;
    border-radius: 14px;
    cursor:pointer;
    font-weight: 1000;
    background: rgba(6,182,212,.14);
    color: rgba(11,18,32,.92);
    white-space: nowrap;
  }

  .del{
    border:none;
    padding: 10px 12px;
    border-radius: 14px;
    cursor:pointer;
    font-weight: 1000;
    background: rgba(255,45,85,.14);
    color: #9f1239;
    white-space: nowrap;
  }

  .links{
    margin-top: 14px;
    display:flex;
    justify-content:center;
    gap:10px;
    flex-wrap:wrap;
    color: var(--muted);
    font-weight:900;
    font-size: 13px;
  }
  .link{
    color:#7c3aed;
    cursor:pointer;
    text-decoration: underline;
    font-weight:1000;
  }

  @keyframes fadeIn{ from{ opacity:0; transform: translateY(6px);} to{ opacity:1; transform: translateY(0);} }

  /* ✅ MODALS CENTER */
  .mb{
    position:fixed; inset:0;
    display:flex; align-items:center; justify-content:center;
    background: rgba(0,0,0,.42);
    z-index: 9999;
    padding: 16px;
    box-sizing:border-box;
  }
  .mc{
    width:100%;
    max-width: 520px;
    background: rgba(255,255,255,.92);
    border: 1px solid rgba(255,255,255,.60);
    border-radius: 24px;
    padding: 18px;
    text-align:left;
    box-shadow: 0 35px 95px rgba(0,0,0,.28);
    backdrop-filter: blur(14px);
  }
  .pill{
    display:inline-block;
    padding:6px 12px;
    border-radius:999px;
    font-weight:1000;
    font-size:12px;
    border: 1px solid rgba(0,0,0,.08);
    margin-bottom:10px;
    background: rgba(124,58,237,.12);
    color:#4c1d95;
  }
  .pill.success{ background: rgba(34,197,94,.14); color:#0f5132; }
  .pill.error{ background: rgba(255,45,85,.12); color:#9f1239; }
  .pill.info{ background: rgba(124,58,237,.12); color:#4c1d95; }
  .pill.confirm{ background: rgba(255,193,7,.14); color:#7c2d12; }

  .mt{ margin:4px 0 6px; font-weight:1100; color:var(--txt); font-size:18px; }
  .mm{ margin:0 0 14px; color: rgba(11,18,32,.78); font-weight:900; line-height:1.4; }

  .mRow{ display:flex; gap:10px; justify-content:flex-end; }
  .mBtn{
    flex:1;
    border:none;
    padding:12px 14px;
    border-radius:16px;
    background: linear-gradient(90deg, #111827 0%, #334155 100%);
    color:#fff;
    font-weight:1100;
    cursor:pointer;
    text-align:center;
  }
  .mBtn.ghost{
    background: rgba(17,24,39,.08);
    color:#111827;
  }
  .mBtn.danger{
    background: linear-gradient(90deg, #9f1239 0%, #ef4444 100%);
  }

  /* Edit form */
  .form{ margin-top: 10px; }
  .lbl{
    display:block;
    font-weight:1000;
    color: rgba(11,18,32,.85);
    margin: 10px 0 6px;
    font-size: 13px;
  }
  .inp{
    width:100%;
    padding: 12px 12px;
    border-radius: 16px;
    border: 1px solid rgba(17,24,39,.10);
    outline:none;
    font-weight: 900;
    background: rgba(255,255,255,.75);
    box-sizing:border-box;
  }
  .ta{
    width:100%;
    padding: 12px 12px;
    border-radius: 16px;
    border: 1px solid rgba(17,24,39,.10);
    outline:none;
    font-weight: 900;
    background: rgba(255,255,255,.75);
    box-sizing:border-box;
    resize: vertical;
  }

  @media (max-width: 720px){
    .dg{ padding: 0; justify-content:flex-start; align-items:stretch; min-height:100vh; }
    .card{
      max-width:none; width:100%;
      border-radius:0; border-left:0; border-right:0;
      padding: 14px 12px; box-shadow:none;
    }
    .actions{ width:100%; justify-content:stretch; }
    .search, .btn2, .btnGhost{ width:100%; }
    .btnRow{ justify-content:flex-start; }
    .mb{ padding: 16px; }
    .mc{ border-radius: 20px; }
  }
`;
