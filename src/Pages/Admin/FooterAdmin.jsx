import React, { useEffect, useMemo, useState } from "react";

const API_BASE = "https://express-projectrandom.onrender.com/api/footer";

const SOCIAL_SUGGESTIONS = [
  { name: "whatsapp", placeholder: "https://wa.me/919999999999" },
  { name: "instagram", placeholder: "https://instagram.com/yourpage" },
  { name: "facebook", placeholder: "https://facebook.com/yourpage" },
  { name: "youtube", placeholder: "https://youtube.com/@yourchannel" },
  { name: "linkedin", placeholder: "https://linkedin.com/in/yourprofile" },
  { name: "website", placeholder: "https://yourdomain.com" },
];

export default function FooterAdmin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create form
  const [tagline, setTagline] = useState("");
  const [desc, setDesc] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [links, setLinks] = useState([]);
  const canCreate = useMemo(() => tagline.trim().length > 0, [tagline]);

  const [saving, setSaving] = useState(false);

  // Edit
  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [editSaving, setEditSaving] = useState(false);

  // Center toast
  const [toast, setToast] = useState(null); // {type:'success'|'error'|'info', title, message}

  // Center confirm modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmRow, setConfirmRow] = useState(null);

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function showToast(type, title, message) {
    setToast({ type, title, message });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), 2200);
  }

  async function fetchAll() {
    setLoading(true);
    try {
      const res = await fetch(API_BASE);
      const json = await res.json();
      setRows(Array.isArray(json?.data) ? json.data : []);
    } catch (e) {
      setRows([]);
      showToast("error", "Load Failed", "Failed to load footer data.");
    } finally {
      setLoading(false);
    }
  }

  function normalizeLinks(arr) {
    if (!Array.isArray(arr)) return null;
    const cleaned = arr
      .map((x) => ({
        name: (x?.name ?? "").toString().trim(),
        url: (x?.url ?? "").toString().trim(),
      }))
      .filter((x) => x.url.length > 0);
    return cleaned.length ? cleaned : null;
  }

  // -------- Create links ----------
  function addLink() {
    setLinks((p) => [...p, { name: "", url: "" }]);
  }
  function removeLink(i) {
    setLinks((p) => p.filter((_, idx) => idx !== i));
  }
  function updateLink(i, key, value) {
    setLinks((p) =>
      p.map((item, idx) => (idx === i ? { ...item, [key]: value } : item))
    );
  }

  async function onCreate(e) {
    e.preventDefault();

    if (!canCreate) {
      showToast("error", "Validation", "Tagline is required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        footer_tagline: tagline.trim(),
        footer_description: desc.trim() ? desc.trim() : null,
        footer_links: normalizeLinks(links),
        is_active: isActive,
      };

      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        showToast("error", "Create Failed", json?.message || "Failed to create footer.");
        return;
      }

      setTagline("");
      setDesc("");
      setLinks([]);
      setIsActive(true);

      showToast("success", "Saved", "Footer created successfully.");
      await fetchAll();
    } catch (e) {
      showToast("error", "Server Error", "Server error while creating footer.");
    } finally {
      setSaving(false);
    }
  }

  // -------- Edit ----------
  function openEdit(row) {
    const rowLinks = Array.isArray(row?.footer_links) ? row.footer_links : [];
    setEditRow({
      footer_id: row.footer_id,
      footer_tagline: row.footer_tagline || "",
      footer_description: row.footer_description || "",
      footer_links: rowLinks.map((l) => ({
        name: (l?.name ?? "").toString(),
        url: (l?.url ?? "").toString(),
      })),
      is_active: !!row.is_active,
    });
    setEditOpen(true);
  }

  function closeEdit() {
    setEditOpen(false);
    setEditRow(null);
    setEditSaving(false);
  }

  function editAddLink() {
    setEditRow((p) => ({
      ...p,
      footer_links: [...(p.footer_links || []), { name: "", url: "" }],
    }));
  }
  function editRemoveLink(i) {
    setEditRow((p) => ({
      ...p,
      footer_links: (p.footer_links || []).filter((_, idx) => idx !== i),
    }));
  }
  function editUpdateLink(i, key, value) {
    setEditRow((p) => ({
      ...p,
      footer_links: (p.footer_links || []).map((item, idx) =>
        idx === i ? { ...item, [key]: value } : item
      ),
    }));
  }

  async function onUpdate() {
    if (!editRow) return;

    if (!editRow.footer_tagline || editRow.footer_tagline.trim() === "") {
      showToast("error", "Validation", "Tagline is required.");
      return;
    }

    setEditSaving(true);
    try {
      const payload = {
        footer_tagline: editRow.footer_tagline.trim(),
        footer_description: editRow.footer_description?.trim()
          ? editRow.footer_description.trim()
          : null,
        footer_links: normalizeLinks(editRow.footer_links),
        is_active: editRow.is_active,
      };

      const res = await fetch(`${API_BASE}/${editRow.footer_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        showToast("error", "Update Failed", json?.message || "Failed to update footer.");
        return;
      }

      closeEdit();
      showToast("success", "Updated", "Footer updated successfully.");
      await fetchAll();
    } catch (e) {
      showToast("error", "Server Error", "Server error while updating footer.");
    } finally {
      setEditSaving(false);
    }
  }

  // -------- Delete (center confirm) ----------
  function askDelete(row) {
    setConfirmRow(row);
    setConfirmOpen(true);
  }
  function closeConfirm() {
    setConfirmOpen(false);
    setConfirmRow(null);
  }

  async function confirmDelete() {
    if (!confirmRow) return;

    try {
      const res = await fetch(`${API_BASE}/${confirmRow.footer_id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) {
        showToast("error", "Delete Failed", json?.message || "Failed to delete footer.");
        closeConfirm();
        return;
      }
      showToast("success", "Deleted", "Footer deleted successfully.");
      closeConfirm();
      await fetchAll();
    } catch (e) {
      showToast("error", "Server Error", "Server error while deleting footer.");
      closeConfirm();
    }
  }

  return (
    <div className="fa-app">
      <style>{css}</style>

      {/* App bar */}
      <div className="fa-appbar">
        <div className="fa-appbarTitle">Footer</div>
        <button className="fa-iconBtn" type="button" onClick={fetchAll} title="Refresh">
          ↻
        </button>
      </div>

      {/* Content (no extra outer padding) */}
      <div className="fa-body">
        {/* Existing */}
        <div className="fa-card">
          <div className="fa-cardHeader">
            <div className="fa-cardTitle">Existing Footers</div>
            <div className="fa-chip">{loading ? "Loading" : rows.length}</div>
          </div>

          {rows.length === 0 && !loading ? (
            <div className="fa-empty">
              No footer found. Add new footer below.
            </div>
          ) : null}

          {rows.length > 0 ? (
            <div className="fa-list">
              {rows.map((r) => {
                const hasDesc =
                  !!(r.footer_description && String(r.footer_description).trim());
                const hasLinks =
                  Array.isArray(r.footer_links) && r.footer_links.length > 0;

                return (
                  <div className="fa-row" key={r.footer_id}>
                    <div className="fa-rowMain">
                      <div className="fa-tagline">{r.footer_tagline}</div>

                      <div className="fa-meta">
                        <span className={`fa-status ${r.is_active ? "on" : "off"}`}>
                          {r.is_active ? "Active" : "Inactive"}
                        </span>

                        {hasDesc ? <span className="fa-metaText">• Description</span> : null}
                        {hasLinks ? (
                          <span className="fa-metaText">• {r.footer_links.length} Link(s)</span>
                        ) : null}
                      </div>
                    </div>

                    <div className="fa-rowActions">
                      <button className="fa-btn ghost" type="button" onClick={() => openEdit(r)}>
                        Update
                      </button>
                      <button className="fa-btn danger" type="button" onClick={() => askDelete(r)}>
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>

        {/* Create */}
        <div className="fa-card">
          <div className="fa-cardHeader">
            <div className="fa-cardTitle">Add Footer</div>
            <div className="fa-subNote">Tagline is mandatory</div>
          </div>

          <form className="fa-form" onSubmit={onCreate}>
            <div className="fa-field">
              <label className="fa-label">
                Tagline <span className="fa-req">*</span>
              </label>
              <input
                className="fa-input"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder='e.g. "Built with ❤️ in India"'
              />
            </div>

            <div className="fa-field">
              <label className="fa-label">Short Description (Optional)</label>
              <textarea
                className="fa-textarea"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Optional short line…"
                rows={3}
              />
            </div>

            <div className="fa-field">
              <div className="fa-linksHeader">
                <label className="fa-label">Links (Optional)</label>
                <button className="fa-btn ghost" type="button" onClick={addLink}>
                  + Add
                </button>
              </div>

              {links.length === 0 ? (
                <div className="fa-emptySmall">No links added.</div>
              ) : (
                <div className="fa-linksList">
                  {links.map((l, idx) => (
                    <div className="fa-linkRow" key={idx}>
                      <select
                        className="fa-select"
                        value={l.name}
                        onChange={(e) => updateLink(idx, "name", e.target.value)}
                      >
                        <option value="">Select</option>
                        {SOCIAL_SUGGESTIONS.map((s) => (
                          <option key={s.name} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </select>

                      <input
                        className="fa-input"
                        value={l.url}
                        onChange={(e) => updateLink(idx, "url", e.target.value)}
                        placeholder={
                          SOCIAL_SUGGESTIONS.find((x) => x.name === l.name)?.placeholder ||
                          "https://..."
                        }
                      />

                      <button
                        className="fa-btn danger"
                        type="button"
                        onClick={() => removeLink(idx)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="fa-field">
              <div className="fa-switch">
                <input
                  id="active"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <label htmlFor="active" className="fa-switchLabel">
                  Set Active
                </label>
              </div>
            </div>

            <button className="fa-btn primary" type="submit" disabled={saving || !canCreate}>
              {saving ? "Saving..." : "Save"}
            </button>
          </form>
        </div>
      </div>

      {/* Edit Modal - CENTER */}
      {editOpen && editRow ? (
        <div className="fa-overlay" onMouseDown={closeEdit}>
          <div className="fa-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="fa-modalHeader">
              <div className="fa-modalTitle">Update Footer</div>
              <button className="fa-iconBtn" type="button" onClick={closeEdit} title="Close">
                ✕
              </button>
            </div>

            <div className="fa-form">
              <div className="fa-field">
                <label className="fa-label">
                  Tagline <span className="fa-req">*</span>
                </label>
                <input
                  className="fa-input"
                  value={editRow.footer_tagline}
                  onChange={(e) =>
                    setEditRow((p) => ({ ...p, footer_tagline: e.target.value }))
                  }
                />
              </div>

              <div className="fa-field">
                <label className="fa-label">Short Description (Optional)</label>
                <textarea
                  className="fa-textarea"
                  rows={3}
                  value={editRow.footer_description || ""}
                  onChange={(e) =>
                    setEditRow((p) => ({ ...p, footer_description: e.target.value }))
                  }
                />
              </div>

              <div className="fa-field">
                <div className="fa-linksHeader">
                  <label className="fa-label">Links (Optional)</label>
                  <button className="fa-btn ghost" type="button" onClick={editAddLink}>
                    + Add
                  </button>
                </div>

                {(editRow.footer_links || []).length === 0 ? (
                  <div className="fa-emptySmall">No links added.</div>
                ) : (
                  <div className="fa-linksList">
                    {(editRow.footer_links || []).map((l, idx) => (
                      <div className="fa-linkRow" key={idx}>
                        <select
                          className="fa-select"
                          value={l.name}
                          onChange={(e) => editUpdateLink(idx, "name", e.target.value)}
                        >
                          <option value="">Select</option>
                          {SOCIAL_SUGGESTIONS.map((s) => (
                            <option key={s.name} value={s.name}>
                              {s.name}
                            </option>
                          ))}
                        </select>

                        <input
                          className="fa-input"
                          value={l.url}
                          onChange={(e) => editUpdateLink(idx, "url", e.target.value)}
                          placeholder={
                            SOCIAL_SUGGESTIONS.find((x) => x.name === l.name)?.placeholder ||
                            "https://..."
                          }
                        />

                        <button className="fa-btn danger" type="button" onClick={() => editRemoveLink(idx)}>
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="fa-field">
                <div className="fa-switch">
                  <input
                    id="editActive"
                    type="checkbox"
                    checked={!!editRow.is_active}
                    onChange={(e) =>
                      setEditRow((p) => ({ ...p, is_active: e.target.checked }))
                    }
                  />
                  <label htmlFor="editActive" className="fa-switchLabel">
                    Set Active
                  </label>
                </div>
              </div>

              <div className="fa-modalActions">
                <button className="fa-btn ghost" type="button" onClick={closeEdit}>
                  Cancel
                </button>
                <button className="fa-btn primary" type="button" onClick={onUpdate} disabled={editSaving}>
                  {editSaving ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Delete Confirm Modal - CENTER */}
      {confirmOpen && confirmRow ? (
        <div className="fa-overlay" onMouseDown={closeConfirm}>
          <div className="fa-confirm" onMouseDown={(e) => e.stopPropagation()}>
            <div className="fa-confirmTitle">Delete Footer?</div>
            <div className="fa-confirmText">
              This will permanently delete: <b>“{confirmRow.footer_tagline}”</b>
            </div>

            <div className="fa-modalActions">
              <button className="fa-btn ghost" type="button" onClick={closeConfirm}>
                Cancel
              </button>
              <button className="fa-btn danger" type="button" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Center Toast */}
      {toast ? (
        <div className="fa-toastWrap" aria-live="polite">
          <div className={`fa-toast ${toast.type}`}>
            <div className="fa-toastTitle">{toast.title}</div>
            <div className="fa-toastMsg">{toast.message}</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const css = `
/* FULL SCREEN – no outer padding, no empty space */
.fa-app{
  min-height: 100vh;
  width: 100%;
  background: #f4f6fb;
  margin: 0;
  padding: 0;
  color: #0b1220;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
}

/* Top app bar */
.fa-appbar{
  height: 56px;
  width: 100%;
  display:flex;
  align-items:center;
  justify-content: space-between;
  padding: 0 12px;
  background: rgba(255,255,255,.92);
  border-bottom: 1px solid rgba(11,18,32,.08);
  box-shadow: 0 10px 30px rgba(0,0,0,.06);
}

.fa-appbarTitle{
  font-weight: 1400;
  font-size: 18px; /* bold title */
  letter-spacing: .2px;
}

/* No big outer padding */
.fa-body{
  width: 100%;
  max-width: 980px;
  margin: 0 auto;
  padding: 0px; /* tiny safe padding (no empty space feel) */
  display:flex;
  flex-direction:column;
  gap: 10px;
}

/* Card layout */
.fa-card{
  border-radius: 18px;
  background: rgba(255,255,255,.92);
  border: 1px solid rgba(11,18,32,.08);
  box-shadow: 0 14px 44px rgba(0,0,0,.10);
  overflow: hidden;
}

.fa-cardHeader{
  display:flex;
  align-items:center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px; /* small and clean */
  border-bottom: 1px solid rgba(11,18,32,.06);
}

.fa-cardTitle{
  font-weight: 1400;     /* ✅ bold headline */
  font-size: 15px;
  letter-spacing: .2px;
}

.fa-subNote{
  font-weight: 1100;
  font-size: 12px;
  color: rgba(11,18,32,.60);
}

.fa-chip{
  min-width: 34px;
  text-align:center;
  padding: 6px 10px;
  border-radius: 999px;
  font-weight: 1300;
  font-size: 12px;
  background: rgba(0,0,0,.04);
  border: 1px solid rgba(0,0,0,.06);
}

/* List */
.fa-list{
  display:flex;
  flex-direction:column;
}

.fa-row{
  display:flex;
  align-items:flex-start;
  justify-content: space-between;
  gap: 10px;
  padding: 12px;
  border-top: 1px solid rgba(11,18,32,.06);
}

.fa-row:first-child{
  border-top: 0;
}

.fa-rowMain{
  flex: 1 1 auto;
  min-width: 0;
}

/* IMPORTANT: no letter breaking like f o o t e r */
.fa-tagline{
  font-weight: 1400;
  font-size: 14px;
  color: #071126;
  letter-spacing: .15px;
  word-break: normal;
  overflow-wrap: break-word;
  white-space: normal;
}

.fa-meta{
  margin-top: 8px;
  display:flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items:center;
}

.fa-status{
  padding: 6px 10px;
  border-radius: 999px;
  font-weight: 1300;
  font-size: 12px;
  border: 1px solid rgba(0,0,0,.06);
  background: rgba(0,0,0,.03);
}

.fa-status.on{ color: #0b7a3b; }
.fa-status.off{ color: #8B0000; }

.fa-metaText{
  font-weight: 1100;
  font-size: 12px;
  color: rgba(11,18,32,.70);
}

.fa-rowActions{
  display:flex;
  gap: 8px;
  flex: 0 0 auto;
}

/* Form */
.fa-form{
  padding: 12px;
  display:flex;
  flex-direction:column;
  gap: 10px;
}

.fa-field{
  display:flex;
  flex-direction:column;
  gap: 8px;
}

.fa-label{
  font-weight: 1300;
  font-size: 12px;
  color: rgba(11,18,32,.78);
}

.fa-req{
  color: #8B0000;
}

.fa-input, .fa-textarea, .fa-select{
  width: 100%;
  border-radius: 14px;
  padding: 12px 12px;
  background: rgba(0,0,0,.03);
  border: 1px solid rgba(0,0,0,.08);
  outline: none;
  font-weight: 1200;
  color: #0b1220;
}

.fa-textarea{ resize: vertical; }

.fa-linksHeader{
  display:flex;
  align-items:center;
  justify-content: space-between;
  gap: 10px;
}

.fa-linksList{
  display:flex;
  flex-direction:column;
  gap: 10px;
}

.fa-linkRow{
  display:grid;
  grid-template-columns: 1fr;
  gap: 10px;
  padding: 10px;
  border-radius: 16px;
  background: rgba(0,0,0,.02);
  border: 1px solid rgba(0,0,0,.06);
}

.fa-switch{
  display:flex;
  align-items:center;
  gap: 10px;
  font-weight: 1200;
}

.fa-switchLabel{
  font-weight: 1300;
  color: rgba(11,18,32,.80);
}

.fa-empty{
  padding: 12px;
  font-weight: 1100;
  color: rgba(11,18,32,.65);
}

.fa-emptySmall{
  padding: 10px;
  border-radius: 14px;
  background: rgba(0,0,0,.02);
  border: 1px dashed rgba(0,0,0,.10);
  color: rgba(11,18,32,.65);
  font-weight: 1100;
}

/* Buttons */
.fa-btn{
  border: none;
  cursor: pointer;
  border-radius: 14px;
  padding: 10px 12px;
  font-weight: 1400;
  transition: transform .12s ease, opacity .12s ease;
}

.fa-btn:hover{ opacity: .92; transform: translateY(-1px); }
.fa-btn:active{ transform: translateY(0); }

.fa-btn.primary{
  color: #fff;
  background: linear-gradient(90deg, #0b1220 0%, #111827 60%, #1f2937 100%);
}

.fa-btn.ghost{
  background: rgba(0,0,0,.03);
  border: 1px solid rgba(0,0,0,.08);
}

.fa-btn.danger{
  color:#fff;
  background: linear-gradient(90deg, #8B0000 0%, #ef4444 55%, #fb7185 100%);
}

/* Icon button */
.fa-iconBtn{
  border: none;
  cursor: pointer;
  width: 42px;
  height: 42px;
  border-radius: 14px;
  font-weight: 1400;
  background: rgba(0,0,0,.03);
  border: 1px solid rgba(0,0,0,.08);
}

/* Overlays center */
.fa-overlay{
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.38);
  display:flex;
  align-items:center;
  justify-content:center;
  padding: 12px;
  z-index: 9999;
}

.fa-modal{
  width: 100%;
  max-width: 720px;
  border-radius: 18px;
  background: rgba(255,255,255,.96);
  border: 1px solid rgba(255,255,255,.80);
  box-shadow: 0 24px 90px rgba(0,0,0,.30);
  overflow: hidden;
}

.fa-modalHeader{
  display:flex;
  align-items:center;
  justify-content: space-between;
  padding: 12px;
  border-bottom: 1px solid rgba(11,18,32,.06);
}

.fa-modalTitle{
  font-weight: 1500;
  font-size: 15px;
}

.fa-modalActions{
  display:flex;
  justify-content:flex-end;
  gap: 10px;
  padding-top: 4px;
}

/* Confirm */
.fa-confirm{
  width: 100%;
  max-width: 420px;
  border-radius: 18px;
  background: rgba(255,255,255,.96);
  border: 1px solid rgba(255,255,255,.80);
  box-shadow: 0 24px 90px rgba(0,0,0,.30);
  padding: 14px;
}

.fa-confirmTitle{
  font-weight: 1500;
  font-size: 16px;
}

.fa-confirmText{
  margin-top: 8px;
  font-weight: 1100;
  color: rgba(11,18,32,.72);
  line-height: 1.4;
}

/* Center Toast */
.fa-toastWrap{
  position: fixed;
  inset: 0;
  display:flex;
  align-items:center;
  justify-content:center;
  pointer-events:none;
  z-index: 10000;
}

.fa-toast{
  width: min(420px, calc(100vw - 24px));
  border-radius: 18px;
  padding: 14px;
  background: rgba(255,255,255,.96);
  border: 1px solid rgba(0,0,0,.08);
  box-shadow: 0 24px 90px rgba(0,0,0,.22);
  pointer-events:auto;
}

.fa-toastTitle{
  font-weight: 1500;
  font-size: 14px;
}

.fa-toastMsg{
  margin-top: 6px;
  font-weight: 1100;
  font-size: 13px;
  color: rgba(11,18,32,.72);
  line-height: 1.35;
}

.fa-toast.success{ border-color: rgba(11,122,59,.20); }
.fa-toast.error{ border-color: rgba(139,0,0,.22); }
.fa-toast.info{ border-color: rgba(0,0,0,.10); }

/* Desktop layout improvements */
@media (min-width: 860px){
  .fa-body{ padding: 12px; }
  .fa-rowActions{ align-items:center; }
  .fa-linkRow{
    grid-template-columns: .7fr 1.3fr auto;
    align-items:center;
  }
}
`;
