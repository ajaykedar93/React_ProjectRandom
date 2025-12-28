import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DocumentGet() {
  const navigate = useNavigate();

  const API_BASE = "https://express-projectrandom.onrender.com";
  const DOCS_URL = `${API_BASE}/api/documents`;

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("user_token") ||
    sessionStorage.getItem("token") ||
    "";

  const PAGE_SIZE = 10;

  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  // update modal
  const [editOpen, setEditOpen] = useState(false);
  const [editDoc, setEditDoc] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editFile, setEditFile] = useState(null);
  const [saving, setSaving] = useState(false);

  // delete confirm
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteDoc, setDeleteDoc] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // center modal popup
  const [modal, setModal] = useState({
    open: false,
    type: "info", // success | error | info
    title: "",
    message: "",
  });
  const openModal = (type, title, message) =>
    setModal({ open: true, type, title, message });
  const closeModal = () => setModal((p) => ({ ...p, open: false }));

  const prettySize = useMemo(
    () => (bytes) => {
      if (bytes === null || bytes === undefined) return "-";
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

  const formatDate = (v) => {
    if (!v) return "-";
    try {
      return new Date(v).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return String(v);
    }
  };

  const fileBadge = (doc) => {
    const ext = String(doc?.file_ext || "").toLowerCase().replace(".", "");
    const mt = String(doc?.mime_type || "").toLowerCase();
    const name = String(doc?.original_name || "").toLowerCase();
    const is = (...arr) => arr.includes(ext);

    if (
      mt.startsWith("image/") ||
      is("png", "jpg", "jpeg", "webp", "gif", "bmp", "svg")
    )
      return { icon: "🖼️", label: "IMAGE", tone: "img" };
    if (ext === "pdf" || mt.includes("pdf"))
      return { icon: "📕", label: "PDF", tone: "pdf" };
    if (is("xls", "xlsx", "csv") || mt.includes("spreadsheet") || name.endsWith(".csv"))
      return { icon: "📊", label: "EXCEL", tone: "xls" };
    if (is("doc", "docx") || mt.includes("word"))
      return { icon: "📝", label: "WORD", tone: "doc" };
    if (is("ppt", "pptx") || mt.includes("presentation"))
      return { icon: "📽️", label: "PPT", tone: "ppt" };
    if (
      mt.startsWith("text/") ||
      is("txt", "md", "json", "js", "ts", "jsx", "tsx", "html", "css", "sql", "xml", "yml", "yaml")
    )
      return { icon: "💻", label: "TEXT", tone: "txt" };
    if (is("zip", "rar", "7z", "tar", "gz"))
      return { icon: "🗜️", label: "ZIP", tone: "zip" };
    if (mt.startsWith("video/") || is("mp4", "mov", "mkv", "avi", "webm"))
      return { icon: "🎬", label: "VIDEO", tone: "vid" };
    if (mt.startsWith("audio/") || is("mp3", "wav", "m4a", "aac"))
      return { icon: "🎵", label: "AUDIO", tone: "aud" };

    return { icon: "📄", label: "FILE", tone: "file" };
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        closeModal();
        setEditOpen(false);
        setDeleteOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!token) {
      openModal("error", "Login Required", "Please login first to view your documents.");
      setTimeout(() => navigate("/login", { replace: true }), 700);
      return;
    }
    fetchDocs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const authHeaders = (extra = {}) => ({
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  });

  const handle401 = (msg = "Session expired. Please login again.") => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_token");
    sessionStorage.removeItem("token");
    openModal("error", "Unauthorized", msg);
    setTimeout(() => navigate("/login", { replace: true }), 700);
  };

  const safeJson = async (res) => {
    const raw = await res.text();
    try {
      return { data: JSON.parse(raw), raw };
    } catch {
      return { data: null, raw };
    }
  };

  const fetchDocs = async (newPage = 1) => {
    try {
      setLoading(true);
      const url = q.trim() ? `${DOCS_URL}?q=${encodeURIComponent(q.trim())}` : DOCS_URL;

      const res = await fetch(url, {
        method: "GET",
        headers: authHeaders(),
        credentials: "include",
      });

      const { data, raw } = await safeJson(res);

      if (res.status === 401) return handle401(data?.message || "Unauthorized");
      if (!res.ok) throw new Error(data?.message || raw || `HTTP ${res.status}`);

      setDocs(Array.isArray(data) ? data : []);
      setPage(newPage);
    } catch (e) {
      openModal("error", "Load Failed", e?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = useMemo(() => {
    const n = Math.ceil(docs.length / PAGE_SIZE);
    return n === 0 ? 1 : n;
  }, [docs.length]);

  const pageDocs = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return docs.slice(start, start + PAGE_SIZE);
  }, [docs, page]);

  const downloadDoc = async (doc) => {
    try {
      if (!doc?.id) return;

      const res = await fetch(`${DOCS_URL}/${doc.id}/download`, {
        method: "GET",
        headers: authHeaders(),
        credentials: "include",
      });

      if (res.status === 401) return handle401("Session expired. Please login again.");
      if (!res.ok) {
        const { data, raw } = await safeJson(res);
        throw new Error(data?.message || raw || `Download failed (HTTP ${res.status})`);
      }

      const blob = await res.blob();
      const filename =
        doc.original_name || `${doc.document_title || "document"}.${doc.file_ext || "bin"}`;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      openModal("error", "Download Failed", e?.message || "Server error");
    }
  };

  const openEdit = (doc) => {
    setEditDoc(doc);
    setEditTitle(doc?.document_title || "");
    setEditDesc(doc?.short_desc || "");
    setEditFile(null);
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editDoc?.id) return;
    if (!editTitle.trim()) {
      openModal("error", "Missing Title", "Document title is required.");
      return;
    }

    try {
      setSaving(true);

      const fd = new FormData();
      fd.append("document_title", editTitle.trim());
      fd.append("short_desc", editDesc.trim());
      if (editFile) fd.append("file", editFile);

      const res = await fetch(`${DOCS_URL}/${editDoc.id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: fd,
        credentials: "include",
      });

      const { data, raw } = await safeJson(res);
      if (res.status === 401) return handle401(data?.message || "Unauthorized");
      if (!res.ok) throw new Error(data?.message || raw || `HTTP ${res.status}`);

      openModal("success", "Updated", data?.message || "Document updated ✅");
      setEditOpen(false);
      await fetchDocs(page);
    } catch (e) {
      openModal("error", "Update Failed", e?.message || "Server error");
    } finally {
      setSaving(false);
    }
  };

  const openDelete = (doc) => {
    setDeleteDoc(doc);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteDoc?.id) return;

    try {
      setDeleting(true);

      const res = await fetch(`${DOCS_URL}/${deleteDoc.id}`, {
        method: "DELETE",
        headers: authHeaders({ "Content-Type": "application/json" }),
        credentials: "include",
      });

      const { data, raw } = await safeJson(res);
      if (res.status === 401) return handle401(data?.message || "Unauthorized");
      if (!res.ok) throw new Error(data?.message || raw || `HTTP ${res.status}`);

      openModal("success", "Deleted", data?.message || "Document deleted ✅");
      setDeleteOpen(false);

      const nextDocs = docs.filter((x) => x.id !== deleteDoc.id);
      setDocs(nextDocs);
      const newTotal = Math.max(1, Math.ceil(nextDocs.length / PAGE_SIZE));
      setPage((p) => Math.min(p, newTotal));
    } catch (e) {
      openModal("error", "Delete Failed", e?.message || "Server error");
    } finally {
      setDeleting(false);
    }
  };

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div id="docgetPage">
      <style>{css}</style>

      {/* Center Alert Modal */}
      {modal.open && (
        <div className="dg_mb" onClick={closeModal}>
          <div className="dg_mc" onClick={(e) => e.stopPropagation()}>
            <div className={`dg_pill ${modal.type}`}>{modal.type.toUpperCase()}</div>
            <h3 className="dg_mt">{modal.title}</h3>
            <p className="dg_mm">{modal.message}</p>
            <button className="dg_mBtn" onClick={closeModal} type="button">
              OK
            </button>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {editOpen && (
        <div className="dg_mb" onClick={() => setEditOpen(false)}>
          <div className="dg_mc dg_wide" onClick={(e) => e.stopPropagation()}>
            <div className="dg_modalTop">
              <div>
                <div className="dg_modalTitle">Update Document</div>
                <div className="dg_modalSub">Edit title/description (optional file replace)</div>
              </div>
              <button className="dg_x" onClick={() => setEditOpen(false)} type="button">
                ✕
              </button>
            </div>

            <div className="dg_field">
              <label className="dg_label">
                Title <span className="dg_req">*</span>
              </label>
              <input
                className="dg_input2"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Document title"
                autoFocus
              />
            </div>

            <div className="dg_field">
              <label className="dg_label">Description (Optional)</label>
              <textarea
                className="dg_textarea"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="Short description"
              />
            </div>

            <div className="dg_field">
              <label className="dg_label">Replace File (Optional)</label>
              <input
                className="dg_file"
                type="file"
                onChange={(e) => setEditFile(e.target.files?.[0] || null)}
              />
              <div className="dg_mini2">
                {editFile ? (
                  <>
                    Selected: <b>{editFile.name}</b> • {prettySize(editFile.size)}
                  </>
                ) : (
                  "No file selected"
                )}
              </div>
            </div>

            <div className="dg_btnRow">
              <button className="dg_btn dg_ghost" onClick={() => setEditOpen(false)} type="button">
                Cancel
              </button>
              <button className="dg_btn dg_primary" onClick={saveEdit} disabled={saving} type="button">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteOpen && (
        <div className="dg_mb" onClick={() => setDeleteOpen(false)}>
          <div className="dg_mc" onClick={(e) => e.stopPropagation()}>
            <div className="dg_modalTop">
              <div>
                <div className="dg_modalTitle">Delete Document</div>
                <div className="dg_modalSub">This action cannot be undone.</div>
              </div>
              <button className="dg_x" onClick={() => setDeleteOpen(false)} type="button">
                ✕
              </button>
            </div>

            <div className="dg_confirmBox">
              Are you sure you want to delete:
              <div className="dg_confirmName">{deleteDoc?.document_title || "Untitled"}</div>
            </div>

            <div className="dg_btnRow">
              <button className="dg_btn dg_ghost" onClick={() => setDeleteOpen(false)} type="button">
                Cancel
              </button>
              <button className="dg_btn dg_danger" onClick={confirmDelete} disabled={deleting} type="button">
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Content (upload removed) */}
      <div className="dg_shell">
        <div className="dg_head">
          <div className="dg_title">My Documents</div>
        </div>

        <div className="dg_searchRow">
          <input
            className="dg_searchInput"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search document name..."
            onKeyDown={(e) => e.key === "Enter" && fetchDocs(1)}
          />
          <button className="dg_btn dg_ghost" onClick={() => fetchDocs(1)} disabled={loading} type="button">
            {loading ? "..." : "Go"}
          </button>
        </div>

        <div className="dg_list">
          {loading ? (
            <div className="dg_empty">Loading...</div>
          ) : pageDocs.length === 0 ? (
            <div className="dg_empty">No documents found.</div>
          ) : (
            pageDocs.map((d) => {
              const b = fileBadge(d);
              return (
                <div className="dg_card" key={d.id}>
                  <div className="dg_cardBody">
                    <div className="dg_docTitle">{d.document_title || "Untitled"}</div>

                    <div className="dg_meta">
                      {d.original_name || "-"} • {prettySize(d.file_size_bytes)} • {formatDate(d.uploaded_at)}
                    </div>

                    {d.short_desc ? <div className="dg_desc">{d.short_desc}</div> : null}

                    <div className="dg_actions">
                      <button className="dg_mini dg_down" onClick={() => downloadDoc(d)} type="button">
                        Download
                      </button>
                      <button className="dg_mini dg_edit" onClick={() => openEdit(d)} type="button">
                        Update
                      </button>
                      <button className="dg_mini dg_del" onClick={() => openDelete(d)} type="button">
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="dg_cardSide">
                    <div className={`dg_badge ${b.tone}`}>
                      <div className="dg_ico">{b.icon}</div>
                      <div className="dg_lbl">{b.label}</div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="dg_pager">
          <button className="dg_btn dg_ghost" onClick={goPrev} disabled={page <= 1 || loading} type="button">
            Prev
          </button>
          <div className="dg_ptext">
            Page <b>{page}</b> / <b>{totalPages}</b> • Total <b>{docs.length}</b>
          </div>
          <button className="dg_btn dg_ghost" onClick={goNext} disabled={page >= totalPages || loading} type="button">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

const css = `
  /* ✅ ONLY inside this page */
  #docgetPage { width:100%; }

  #docgetPage *{ box-sizing:border-box; }

  #docgetPage .dg_shell{
    width:100%;
    background:#f7f8fb;
    padding:0; margin:0;
  }

  /* desktop fit, tabs unaffected because scoped */
  @media (min-width: 900px){
    #docgetPage .dg_shell{
      max-width: 1100px;
      margin: 0 auto;
      padding: 0 12px;
    }
  }

  #docgetPage .dg_head{
    padding:12px;
    background:#fff;
    border:1px solid rgba(11,18,32,.10);
    border-left:none; border-right:none;
  }
  @media (min-width:900px){
    #docgetPage .dg_head{ border-radius:16px; border:1px solid rgba(11,18,32,.10); margin-top:12px; }
  }

  #docgetPage .dg_title{
    font-size:16px;
    font-weight:1100;
    color:#0b1220;
  }

  #docgetPage .dg_searchRow{
    display:flex;
    gap:10px;
    padding:12px;
    background:#fff;
    border-bottom:1px solid rgba(11,18,32,.10);
  }
  @media (min-width:900px){
    #docgetPage .dg_searchRow{
      border:1px solid rgba(11,18,32,.10);
      border-radius:16px;
      margin-top:10px;
    }
  }

  #docgetPage .dg_searchInput{
    flex:1;
    width:100%;
    padding:12px;
    border-radius:14px;
    border:1px solid rgba(11,18,32,.10);
    outline:none;
    font-weight:900;
    font-size:14px;
    background:#fff;
  }

  #docgetPage .dg_btn{
    border:none;
    padding:12px 14px;
    border-radius:14px;
    font-weight:1100;
    cursor:pointer;
    font-size:13px;
    white-space:nowrap;
  }
  #docgetPage .dg_btn:disabled{ opacity:.55; cursor:not-allowed; }

  #docgetPage .dg_ghost{
    background:rgba(124,58,237,.10);
    border:1px solid rgba(124,58,237,.18);
    color:#4c1d95;
  }
  #docgetPage .dg_primary{
    color:#081018;
    background:linear-gradient(90deg,#fde047 0%,#fb7185 40%,#60a5fa 70%,#34d399 100%);
    box-shadow:0 10px 24px rgba(0,0,0,.10);
  }
  #docgetPage .dg_danger{
    background:rgba(255,45,85,.12);
    border:1px solid rgba(255,45,85,.18);
    color:#9f1239;
  }

  #docgetPage .dg_list{
    padding:10px 0;
    display:flex;
    flex-direction:column;
    gap:10px;
  }

  #docgetPage .dg_card{
    width:100%;
    background:#fff;
    box-shadow:0 10px 26px rgba(0,0,0,.10);
    padding:12px;
    display:flex;
    gap:12px;
    align-items:flex-start;
    border-top:1px solid rgba(11,18,32,.10);
    border-bottom:1px solid rgba(11,18,32,.10);
  }
  @media (min-width:900px){
    #docgetPage .dg_card{
      border:1px solid rgba(11,18,32,.10);
      border-radius:18px;
    }
  }

  #docgetPage .dg_cardBody{ flex:1; min-width:0; }
  #docgetPage .dg_docTitle{
    font-weight:1200;
    color:rgba(11,18,32,.92);
    font-size:16px;
    line-height:1.25;
    word-break:break-word;
  }
  #docgetPage .dg_meta{
    margin-top:6px;
    font-weight:900;
    color:rgba(11,18,32,.60);
    font-size:12px;
    word-break:break-word;
  }
  #docgetPage .dg_desc{
    margin-top:8px;
    font-weight:900;
    color:rgba(11,18,32,.78);
    font-size:12px;
    line-height:1.35;
    word-break:break-word;
  }
  #docgetPage .dg_actions{
    margin-top:10px;
    display:flex;
    gap:8px;
    flex-wrap:wrap;
  }

  #docgetPage .dg_mini{
    border:none;
    padding:10px 12px;
    border-radius:12px;
    font-weight:1100;
    cursor:pointer;
    font-size:12px;
  }
  #docgetPage .dg_down{ background:rgba(34,197,94,.12); border:1px solid rgba(34,197,94,.20); color:#065f46; }
  #docgetPage .dg_edit{ background:rgba(124,58,237,.10); border:1px solid rgba(124,58,237,.18); color:#4c1d95; }
  #docgetPage .dg_del{ background:rgba(255,45,85,.12); border:1px solid rgba(255,45,85,.18); color:#9f1239; }

  #docgetPage .dg_cardSide{ width:82px; flex:0 0 auto; display:flex; justify-content:flex-end; }
  #docgetPage .dg_badge{
    width:82px;
    padding:10px 8px;
    border-radius:16px;
    border:1px solid rgba(11,18,32,.10);
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    gap:6px;
    user-select:none;
  }
  #docgetPage .dg_ico{ font-size:20px; }
  #docgetPage .dg_lbl{ font-size:11px; font-weight:1100; letter-spacing:.3px; }

  #docgetPage .dg_badge.pdf{ background:rgba(239,68,68,.10); color:#991b1b; border-color:rgba(239,68,68,.18); }
  #docgetPage .dg_badge.img{ background:rgba(34,197,94,.10); color:#065f46; border-color:rgba(34,197,94,.18); }
  #docgetPage .dg_badge.xls{ background:rgba(59,130,246,.10); color:#1e3a8a; border-color:rgba(59,130,246,.18); }
  #docgetPage .dg_badge.doc{ background:rgba(99,102,241,.10); color:#312e81; border-color:rgba(99,102,241,.18); }
  #docgetPage .dg_badge.ppt{ background:rgba(245,158,11,.10); color:#7c2d12; border-color:rgba(245,158,11,.18); }
  #docgetPage .dg_badge.txt{ background:rgba(107,114,128,.10); color:#111827; border-color:rgba(107,114,128,.18); }
  #docgetPage .dg_badge.zip{ background:rgba(168,85,247,.10); color:#581c87; border-color:rgba(168,85,247,.18); }
  #docgetPage .dg_badge.vid{ background:rgba(14,165,233,.10); color:#0c4a6e; border-color:rgba(14,165,233,.18); }
  #docgetPage .dg_badge.aud{ background:rgba(236,72,153,.10); color:#831843; border-color:rgba(236,72,153,.18); }
  #docgetPage .dg_badge.file{ background:rgba(148,163,184,.18); color:#0f172a; border-color:rgba(148,163,184,.22); }

  #docgetPage .dg_empty{
    width:100%;
    padding:18px 12px;
    text-align:center;
    font-weight:1000;
    color:rgba(11,18,32,.60);
  }

  #docgetPage .dg_pager{
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:10px;
    padding:12px;
    background:#fff;
    border-top:1px solid rgba(11,18,32,.10);
  }
  @media (min-width:900px){
    #docgetPage .dg_pager{
      border:1px solid rgba(11,18,32,.10);
      border-radius:16px;
      margin: 10px 0 14px;
    }
  }
  #docgetPage .dg_ptext{
    font-size:12px;
    font-weight:950;
    color:rgba(11,18,32,.70);
    text-align:center;
    flex:1;
  }

  /* Modals - scoped */
  #docgetPage .dg_mb{
    position:fixed; inset:0;
    display:flex; align-items:center; justify-content:center;
    padding:16px;
    background:rgba(0,0,0,.42);
    z-index:9999;
  }
  #docgetPage .dg_mc{
    width:100%;
    max-width:520px;
    background:rgba(255,255,255,.96);
    border:1px solid rgba(255,255,255,.60);
    border-radius:22px;
    padding:16px;
    box-shadow:0 35px 95px rgba(0,0,0,.28);
    backdrop-filter: blur(14px);
  }
  #docgetPage .dg_wide{ max-width:560px; }

  #docgetPage .dg_pill{
    display:inline-block;
    padding:6px 12px;
    border-radius:999px;
    font-weight:1100;
    font-size:12px;
    border:1px solid rgba(0,0,0,.08);
    margin-bottom:10px;
  }
  #docgetPage .dg_pill.success{ background:rgba(34,197,94,.14); color:#0f5132; }
  #docgetPage .dg_pill.error{ background:rgba(255,45,85,.12); color:#9f1239; }
  #docgetPage .dg_pill.info{ background:rgba(124,58,237,.12); color:#4c1d95; }

  #docgetPage .dg_mt{ margin:4px 0 6px; font-weight:1100; color:rgba(11,18,32,.92); font-size:18px; }
  #docgetPage .dg_mm{ margin:0 0 14px; color:rgba(11,18,32,.78); font-weight:950; line-height:1.4; }
  #docgetPage .dg_mBtn{
    width:100%;
    border:none;
    padding:12px 14px;
    border-radius:16px;
    background:linear-gradient(90deg,#111827 0%,#334155 100%);
    color:#fff;
    font-weight:1100;
    cursor:pointer;
  }

  #docgetPage .dg_modalTop{ display:flex; justify-content:space-between; align-items:flex-start; gap:10px; margin-bottom:10px; }
  #docgetPage .dg_modalTitle{ font-weight:1100; color:rgba(11,18,32,.92); font-size:16px; }
  #docgetPage .dg_modalSub{ margin-top:4px; font-weight:900; color:rgba(11,18,32,.62); font-size:12px; }
  #docgetPage .dg_x{ border:none; background:rgba(11,18,32,.08); border:1px solid rgba(11,18,32,.10); border-radius:12px; padding:10px 12px; cursor:pointer; font-weight:1100; }

  #docgetPage .dg_field{ margin-top:10px; display:flex; flex-direction:column; }
  #docgetPage .dg_label{ font-size:12px; font-weight:1000; color:rgba(11,18,32,.85); margin-bottom:6px; }
  #docgetPage .dg_req{ color:#ff2d55; }
  #docgetPage .dg_input2{ width:100%; padding:12px; border-radius:14px; border:1px solid rgba(11,18,32,.10); background:#fff; outline:none; font-weight:900; font-size:14px; }
  #docgetPage .dg_textarea{ width:100%; min-height:110px; padding:12px; border-radius:14px; border:1px solid rgba(11,18,32,.10); background:#fff; outline:none; font-weight:900; font-size:14px; resize:vertical; }
  #docgetPage .dg_file{ width:100%; padding:12px; border-radius:14px; border:1px solid rgba(11,18,32,.10); background:#fff; }
  #docgetPage .dg_mini2{ margin-top:8px; font-weight:900; font-size:12px; color:rgba(11,18,32,.62); }

  #docgetPage .dg_btnRow{ margin-top:12px; display:flex; gap:10px; }
  #docgetPage .dg_btnRow .dg_btn{ flex:1; }

  #docgetPage .dg_confirmBox{
    margin-top:10px;
    padding:12px;
    border-radius:16px;
    background:#f8fafc;
    border:1px solid rgba(11,18,32,.10);
    font-weight:950;
    color:rgba(11,18,32,.78);
    text-align:center;
  }
  #docgetPage .dg_confirmName{ margin-top:8px; font-weight:1100; color:rgba(11,18,32,.92); word-break:break-word; }
`;
