// src/pages/Checklist.jsx
// Bright UI, mobile-perfect, edge-to-edge (no outer page padding)
// ✅ Uses YOUR AuthContext exactly (NO CHANGES): { user, login, logout, loading }
// ✅ Token logic (as you asked):
// const token = localStorage.getItem("token") || localStorage.getItem("user_token") || sessionStorage.getItem("token") || "";
//
// UI change (as you asked):
// - Show ONLY checklist titles one-by-one (cards)
// - Each title has "View" button
// - Clicking title/card or View opens that checklist details
// - Inside details: one "Add Item" button -> opens item form (text + optional description + optional image upload)
// - Show items list with checkbox tick/untick anytime, image if available, description, timestamps
//
// APIs (full URLs):
//   GET    http://localhost:5000/api/checklists?userId=UUID&includeItems=true
//   POST   http://localhost:5000/api/checklists
//   DELETE http://localhost:5000/api/checklists/:checklistId?userId=UUID
//   POST   http://localhost:5000/api/checklists/:checklistId/items
//   PATCH  http://localhost:5000/api/checklists/items/:itemId/toggle
//   DELETE http://localhost:5000/api/checklists/items/:itemId?userId=UUID

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

const API_BASE = "https://express-projectrandom.onrender.com/api/checklists";

function formatDateTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const date = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
  const time = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
  return `${date} · ${time}`;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(new Error("Image read failed"));
    r.onload = () => resolve(String(r.result || ""));
    r.readAsDataURL(file);
  });
}

export default function Checklist() {
  // ✅ YOUR AuthContext
  const { user, loading: authLoading } = useAuth();

  // ✅ Token logic (exactly as requested)
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("user_token") ||
    sessionStorage.getItem("token") ||
    "";

  const isAuthenticated = !!user;

  const userId = useMemo(() => {
    return (
      user?.id ||
      user?.user_id ||
      user?.userid ||
      user?.UserId ||
      localStorage.getItem("user_id") ||
      ""
    );
  }, [user]);

  const canUse = useMemo(
    () =>
      typeof userId === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        userId
      ),
    [userId]
  );

  const [lists, setLists] = useState([]); // each has items (loaded once)
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Create checklist
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  // Selected checklist view
  const [selectedId, setSelectedId] = useState(null); // checklist_id
  const selected = useMemo(
    () => lists.find((x) => x.checklist_id === selectedId) || null,
    [lists, selectedId]
  );

  // Add item form (opens only when button clicked)
  const [showAddItem, setShowAddItem] = useState(false);
  const [itemText, setItemText] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemImage, setItemImage] = useState(null);
  const fileRef = useRef(null);

  // Ensure edge-to-edge
  useEffect(() => {
    const prevMargin = document.body.style.margin;
    document.body.style.margin = "0";
    return () => {
      document.body.style.margin = prevMargin;
    };
  }, []);

  useEffect(() => {
    if (userId) localStorage.setItem("user_id", userId);
  }, [userId]);

  async function apiJson(url, options = {}) {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      ...options,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
    return data;
  }

  async function loadAll() {
    if (!isAuthenticated) return setErr("Please login first.");
    if (!canUse) return setErr("Login user id not found (UUID required).");
    setErr("");
    setLoading(true);
    try {
      const data = await apiJson(
        `${API_BASE}?userId=${encodeURIComponent(userId)}&includeItems=true`
      );
      const rows = Array.isArray(data.checklists) ? data.checklists : [];
      setLists(rows);

      // If selected list deleted/removed, close detail view
      if (selectedId && !rows.some((r) => r.checklist_id === selectedId)) {
        setSelectedId(null);
        setShowAddItem(false);
      }
    } catch (e) {
      setErr(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authLoading && isAuthenticated && canUse) loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, canUse]);

  async function createChecklist() {
    if (!isAuthenticated) return setErr("Please login first.");
    if (!canUse) return setErr("Login user id not found (UUID required).");
    if (!newTitle.trim()) return setErr("Checklist title required.");

    setErr("");
    try {
      const payload = {
        user_id: userId,
        title: newTitle.trim(),
        description: newDesc.trim() ? newDesc.trim() : null,
        items: [],
      };
      const data = await apiJson(API_BASE, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const created = { ...data.checklist, items: [] };
      setLists((p) => [created, ...p]);

      setNewTitle("");
      setNewDesc("");
    } catch (e) {
      setErr(e.message || "Create failed");
    }
  }

  async function deleteChecklist(checklistId) {
    if (!isAuthenticated || !canUse) return;
    setErr("");
    try {
      await apiJson(`${API_BASE}/${checklistId}?userId=${encodeURIComponent(userId)}`, {
        method: "DELETE",
      });

      setLists((p) => p.filter((c) => c.checklist_id !== checklistId));

      if (selectedId === checklistId) {
        setSelectedId(null);
        setShowAddItem(false);
      }
    } catch (e) {
      setErr(e.message || "Delete failed");
    }
  }

  function openChecklist(checklistId) {
    setSelectedId(checklistId);
    setShowAddItem(false);
    setItemText("");
    setItemDesc("");
    setItemImage(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function closeChecklist() {
    setSelectedId(null);
    setShowAddItem(false);
    setItemText("");
    setItemDesc("");
    setItemImage(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function onPickImage(file) {
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      setItemImage(dataUrl);
    } catch {
      setErr("Image upload failed.");
    }
  }

  async function addItem() {
    if (!selected) return;
    if (!isAuthenticated) return setErr("Please login first.");
    if (!canUse) return setErr("Login user id not found (UUID required).");

    const text = itemText.trim();
    const desc = itemDesc.trim();
    if (!text) return setErr("Item name required.");

    setErr("");
    try {
      const payload = {
        user_id: userId,
        item_text: text,
        item_description: desc ? desc : null,
        image_data: itemImage || null,
      };

      const data = await apiJson(`${API_BASE}/${selected.checklist_id}/items`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setLists((prev) =>
        prev.map((c) =>
          c.checklist_id === selected.checklist_id
            ? { ...c, items: [...(c.items || []), data.item] }
            : c
        )
      );

      // reset form + close form
      setShowAddItem(false);
      setItemText("");
      setItemDesc("");
      setItemImage(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (e) {
      setErr(e.message || "Add item failed");
    }
  }

  async function toggleItem(itemId) {
    if (!isAuthenticated || !canUse) return;

    setErr("");

    // Optimistic
    setLists((prev) =>
      prev.map((c) =>
        c.checklist_id !== selectedId
          ? c
          : {
              ...c,
              items: (c.items || []).map((it) =>
                it.item_id === itemId ? { ...it, is_checked: !it.is_checked } : it
              ),
            }
      )
    );

    try {
      const data = await apiJson(`${API_BASE}/items/${itemId}/toggle`, {
        method: "PATCH",
        body: JSON.stringify({ user_id: userId }),
      });
      const updated = data.item;

      setLists((prev) =>
        prev.map((c) =>
          c.checklist_id !== selectedId
            ? c
            : {
                ...c,
                items: (c.items || []).map((it) => (it.item_id === itemId ? updated : it)),
              }
        )
      );
    } catch (e) {
      // Rollback
      setLists((prev) =>
        prev.map((c) =>
          c.checklist_id !== selectedId
            ? c
            : {
                ...c,
                items: (c.items || []).map((it) =>
                  it.item_id === itemId ? { ...it, is_checked: !it.is_checked } : it
                ),
              }
        )
      );
      setErr(e.message || "Toggle failed");
    }
  }

  async function deleteItem(itemId) {
    if (!isAuthenticated || !canUse) return;
    setErr("");
    try {
      await apiJson(`${API_BASE}/items/${itemId}?userId=${encodeURIComponent(userId)}`, {
        method: "DELETE",
      });

      setLists((prev) =>
        prev.map((c) =>
          c.checklist_id !== selectedId
            ? c
            : { ...c, items: (c.items || []).filter((it) => it.item_id !== itemId) }
        )
      );
    } catch (e) {
      setErr(e.message || "Delete item failed");
    }
  }

  const displayName =
    user?.full_name ||
    user?.fullName ||
    `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
    "Logged User";

  const displayEmail = user?.email_address || user?.email || "";
  const displayMobile = user?.mobile_number || user?.mobile || "";

  return (
    <div style={styles.page}>
      {/* TOP BAR */}
      <div style={styles.topBar}>
        <div style={styles.brandRow}>
          <div style={styles.brand}>✅ Checklist</div>

          <button
            style={{ ...styles.btnSoft, ...(loading ? styles.btnDisabled : null) }}
            onClick={loadAll}
            disabled={authLoading || !isAuthenticated || !canUse || loading}
            title="Refresh"
          >
            Refresh
          </button>
        </div>

        <div style={styles.userInfo}>
          <div style={styles.userChip}>
            <div style={styles.userName}>
              {authLoading ? "Loading..." : isAuthenticated ? displayName : "Not Logged In"}
            </div>
            <div style={styles.userSub}>
              {authLoading
                ? "Restoring session..."
                : isAuthenticated
                ? [displayEmail, displayMobile].filter(Boolean).join(" • ")
                : "Please login to use checklists"}
            </div>
          </div>

          <div style={styles.userIdRow}>
            <span style={styles.userIdLabel}>UserId:</span>
            <span style={styles.userIdValue}>{userId || "-"}</span>
          </div>
        </div>
      </div>

      {/* ERROR */}
      {err ? <div style={styles.error}>{err}</div> : null}

      {/* CREATE CHECKLIST (always on top) */}
      <div style={styles.createWrap}>
        <input
          style={styles.input}
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Create list title (e.g., Flipkart)"
          disabled={authLoading || !isAuthenticated}
        />

        <textarea
          style={styles.textarea}
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
          placeholder="List description (optional)"
          rows={2}
          disabled={authLoading || !isAuthenticated}
        />

        <button
          style={styles.btnPrimary}
          onClick={createChecklist}
          disabled={authLoading || !isAuthenticated || !canUse}
        >
          + Create List
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div style={styles.listWrap}>
        {authLoading ? (
          <div style={styles.empty}>Loading user session…</div>
        ) : !isAuthenticated ? (
          <div style={styles.empty}>Please login to see your checklists.</div>
        ) : !canUse ? (
          <div style={styles.empty}>
            User UUID not found. Your logged user must have <b>user.id</b> = register_random.id (UUID).
          </div>
        ) : selected ? (
          // ✅ DETAILS VIEW
          <div style={styles.detailWrap}>
            <div style={styles.detailHeader}>
              <button style={styles.backBtn} onClick={closeChecklist}>
                ← Back
              </button>

              <div style={styles.detailTitleArea}>
                <div style={styles.detailTitle}>{selected.title}</div>
                {selected.description ? (
                  <div style={styles.detailDesc}>{selected.description}</div>
                ) : null}
                <div style={styles.detailMeta}>
                  <span>Created: {formatDateTime(selected.created_at)}</span>
                  <span style={{ marginLeft: 10 }}>Updated: {formatDateTime(selected.updated_at)}</span>
                </div>
              </div>

              <button
                style={styles.iconBtnDanger}
                onClick={() => deleteChecklist(selected.checklist_id)}
                title="Delete list"
              >
                Delete
              </button>
            </div>

            {/* Add Item Button -> opens form */}
            <div style={styles.detailActions}>
              {!showAddItem ? (
                <button style={styles.btnPrimary} onClick={() => setShowAddItem(true)}>
                  + Add Item
                </button>
              ) : (
                <div style={styles.addItemForm}>
                  <input
                    style={styles.input}
                    value={itemText}
                    onChange={(e) => setItemText(e.target.value)}
                    placeholder="Item name (e.g., Pant)"
                  />

                  <textarea
                    style={styles.textarea}
                    value={itemDesc}
                    onChange={(e) => setItemDesc(e.target.value)}
                    placeholder="Item description (optional)"
                    rows={2}
                  />

                  <div style={styles.uploadRow}>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      style={styles.file}
                      onChange={(e) => onPickImage(e.target.files?.[0])}
                    />

                    <button style={styles.btnPrimary} onClick={addItem}>
                      Save Item
                    </button>

                    <button
                      style={styles.btnSoft}
                      onClick={() => {
                        setShowAddItem(false);
                        setItemText("");
                        setItemDesc("");
                        setItemImage(null);
                        if (fileRef.current) fileRef.current.value = "";
                      }}
                    >
                      Cancel
                    </button>
                  </div>

                  {itemImage ? (
                    <img src={itemImage} alt="preview" style={styles.previewImg} />
                  ) : null}
                </div>
              )}
            </div>

            {/* Items list */}
            <div style={styles.itemsWrap}>
              {(selected.items || []).length === 0 ? (
                <div style={styles.emptySmall}>No items yet.</div>
              ) : (
                (selected.items || []).map((it) => (
                  <div key={it.item_id} style={styles.itemRow}>
                    <button
                      style={{
                        ...styles.checkBtn,
                        ...(it.is_checked ? styles.checkBtnOn : styles.checkBtnOff),
                      }}
                      onClick={() => toggleItem(it.item_id)}
                      title="Tick / Untick"
                    >
                      {it.is_checked ? "✔" : ""}
                    </button>

                    <div style={styles.itemMain}>
                      <div
                        style={{
                          ...styles.itemText,
                          ...(it.is_checked ? styles.itemTextChecked : null),
                        }}
                      >
                        {it.item_text}
                      </div>

                      {it.item_description ? (
                        <div style={styles.itemDesc}>{it.item_description}</div>
                      ) : null}

                      <div style={styles.itemMeta}>
                        <span>Created: {formatDateTime(it.created_at)}</span>
                        <span style={{ marginLeft: 10 }}>Updated: {formatDateTime(it.updated_at)}</span>
                      </div>

                      {it.image_data ? (
                        <img src={it.image_data} alt="item" style={styles.itemImg} />
                      ) : null}
                    </div>

                    <button
                      style={styles.iconBtnDangerSmall}
                      onClick={() => deleteItem(it.item_id)}
                      title="Delete item"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : loading ? (
          <div style={styles.empty}>Loading…</div>
        ) : lists.length === 0 ? (
          <div style={styles.empty}>No lists yet. Create one above.</div>
        ) : (
          // ✅ TITLES ONLY VIEW
          <div style={styles.titleList}>
            {lists.map((c) => (
              <div key={c.checklist_id} style={styles.titleCard}>
                <button style={styles.titleCardMain} onClick={() => openChecklist(c.checklist_id)}>
                  <div style={styles.titleText}>{c.title}</div>
                  {c.description ? (
                    <div style={styles.titleSub}>{c.description}</div>
                  ) : (
                    <div style={styles.titleSubMuted}>No description</div>
                  )}
                  <div style={styles.titleMeta}>
                    <span>{formatDateTime(c.created_at)}</span>
                  </div>
                </button>

                <div style={styles.titleCardActions}>
                  <button style={styles.btnSoft} onClick={() => openChecklist(c.checklist_id)}>
                    View
                  </button>
                  <button
                    style={styles.iconBtnDanger}
                    onClick={() => deleteChecklist(c.checklist_id)}
                    title="Delete list"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Bright color styles, no dark theme
const styles = {
  page: {
    width: "100vw",
    minHeight: "100vh",
    background: "linear-gradient(180deg, #F7FBFF 0%, #FFFFFF 60%, #FFF7FB 100%)",
    color: "#0F172A",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
  },

  topBar: {
    width: "100%",
    background: "linear-gradient(90deg, #E0F2FE 0%, #FCE7F3 100%)",
    borderBottom: "1px solid rgba(15,23,42,0.10)",
  },

  brandRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    padding: "12px 12px",
  },
  brand: { fontSize: 18, fontWeight: 900 },

  btnSoft: {
    height: 40,
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,0.14)",
    background: "#FFFFFF",
    color: "#0F172A",
    fontWeight: 900,
    cursor: "pointer",
    padding: "0 12px",
    whiteSpace: "nowrap",
  },
  btnDisabled: { opacity: 0.6, cursor: "not-allowed" },

  btnPrimary: {
    height: 46,
    borderRadius: 12,
    border: "1px solid rgba(2,132,199,0.25)",
    background: "linear-gradient(90deg, #38BDF8 0%, #A78BFA 50%, #FB7185 100%)",
    color: "#0B1220",
    fontWeight: 900,
    cursor: "pointer",
    padding: "0 14px",
    whiteSpace: "nowrap",
  },

  userInfo: { padding: "0 12px 12px 12px" },
  userChip: {
    background: "rgba(255,255,255,0.9)",
    border: "1px solid rgba(15,23,42,0.10)",
    borderRadius: 14,
    padding: "10px 12px",
  },
  userName: { fontSize: 14, fontWeight: 900 },
  userSub: { marginTop: 2, fontSize: 12, color: "#475569", fontWeight: 700 },

  userIdRow: {
    marginTop: 10,
    display: "flex",
    gap: 8,
    alignItems: "center",
    flexWrap: "wrap",
  },
  userIdLabel: { fontSize: 12, color: "#334155", fontWeight: 900 },
  userIdValue: {
    fontSize: 12,
    fontWeight: 900,
    color: "#0F172A",
    background: "rgba(255,255,255,0.9)",
    border: "1px solid rgba(15,23,42,0.10)",
    padding: "6px 10px",
    borderRadius: 999,
  },

  error: {
    width: "100%",
    background: "#FEE2E2",
    color: "#991B1B",
    borderBottom: "1px solid rgba(153,27,27,0.20)",
    padding: "10px 12px",
    fontSize: 13,
    fontWeight: 800,
  },

  createWrap: {
    width: "100%",
    background: "#FFFFFF",
    borderBottom: "1px solid rgba(15,23,42,0.10)",
    display: "grid",
    gap: 10,
    padding: "12px 12px",
  },

  input: {
    width: "100%",
    height: 46,
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,0.14)",
    background: "#FFFFFF",
    color: "#0F172A",
    outline: "none",
    padding: "0 12px",
    fontSize: 14,
    fontWeight: 700,
  },

  textarea: {
    width: "100%",
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,0.14)",
    background: "#FFFFFF",
    color: "#0F172A",
    outline: "none",
    padding: "10px 12px",
    fontSize: 14,
    resize: "none",
    fontWeight: 700,
  },

  listWrap: { width: "100%" },

  empty: { padding: "16px 12px", color: "#475569", fontSize: 14, fontWeight: 800 },
  emptySmall: { padding: "12px", color: "#64748B", fontSize: 13, fontWeight: 800 },

  // ----- Titles only view -----
  titleList: {
    width: "100%",
    display: "grid",
    gap: 10,
    padding: "12px 12px",
    boxSizing: "border-box",
  },

  titleCard: {
    width: "100%",
    background: "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)",
    border: "1px solid rgba(15,23,42,0.10)",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 1px 0 rgba(15, 23, 42, 0.04)",
  },

  titleCardMain: {
    width: "100%",
    textAlign: "left",
    border: "none",
    background: "linear-gradient(90deg, #ECFEFF 0%, #EEF2FF 100%)",
    padding: "12px 12px",
    cursor: "pointer",
  },

  titleText: { fontSize: 15, fontWeight: 900 },
  titleSub: { marginTop: 4, fontSize: 13, color: "#334155", fontWeight: 700 },
  titleSubMuted: { marginTop: 4, fontSize: 13, color: "#64748B", fontWeight: 700 },
  titleMeta: { marginTop: 6, fontSize: 12, color: "#64748B", fontWeight: 700 },

  titleCardActions: {
    display: "flex",
    gap: 8,
    padding: "10px 12px",
    background: "#FFFFFF",
    justifyContent: "flex-end",
  },

  // ----- Detail view -----
  detailWrap: {
    width: "100%",
    padding: "12px 12px",
    boxSizing: "border-box",
  },

  detailHeader: {
    width: "100%",
    background: "linear-gradient(90deg, #ECFEFF 0%, #EEF2FF 100%)",
    border: "1px solid rgba(15,23,42,0.10)",
    borderRadius: 16,
    padding: "12px 12px",
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    boxSizing: "border-box",
  },

  backBtn: {
    height: 40,
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,0.14)",
    background: "#FFFFFF",
    color: "#0F172A",
    fontWeight: 900,
    cursor: "pointer",
    padding: "0 12px",
    whiteSpace: "nowrap",
  },

  detailTitleArea: { flex: 1, minWidth: 0 },
  detailTitle: { fontSize: 16, fontWeight: 900 },
  detailDesc: { marginTop: 4, fontSize: 13, color: "#334155", fontWeight: 700, wordBreak: "break-word" },
  detailMeta: { marginTop: 6, fontSize: 12, color: "#64748B", fontWeight: 700, flexWrap: "wrap" },

  detailActions: {
    marginTop: 10,
    width: "100%",
  },

  addItemForm: {
    marginTop: 8,
    display: "grid",
    gap: 10,
    background: "#FFFFFF",
    border: "1px solid rgba(15,23,42,0.10)",
    borderRadius: 16,
    padding: "12px 12px",
    boxSizing: "border-box",
  },

  uploadRow: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    flexWrap: "wrap",
  },

  file: {
    flex: 1,
    minWidth: 160,
    height: 44,
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,0.14)",
    background: "#FFFFFF",
    color: "#0F172A",
    padding: "9px 10px",
    fontSize: 13,
    fontWeight: 700,
  },

  previewImg: {
    width: "100%",
    maxHeight: 220,
    objectFit: "cover",
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,0.10)",
  },

  // ----- Items -----
  itemsWrap: { width: "100%", marginTop: 10 },

  itemRow: {
    width: "100%",
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    padding: "12px 12px",
    boxSizing: "border-box",
    background: "#FFFFFF",
    border: "1px solid rgba(15,23,42,0.10)",
    borderRadius: 16,
    marginTop: 10,
  },

  checkBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,0.14)",
    display: "grid",
    placeItems: "center",
    fontSize: 18,
    fontWeight: 900,
    cursor: "pointer",
    flexShrink: 0,
    background: "#FFFFFF",
  },
  checkBtnOn: {
    background: "linear-gradient(180deg, #BBF7D0 0%, #86EFAC 100%)",
    border: "1px solid rgba(22,163,74,0.30)",
    color: "#064E3B",
  },
  checkBtnOff: { background: "#FFFFFF", color: "transparent" },

  itemMain: { flex: 1, minWidth: 0 },
  itemText: { fontSize: 14, fontWeight: 900, lineHeight: 1.25, wordBreak: "break-word" },
  itemTextChecked: { opacity: 0.7, textDecoration: "line-through" },

  itemDesc: { marginTop: 6, fontSize: 13, color: "#334155", wordBreak: "break-word", fontWeight: 700 },

  itemMeta: {
    marginTop: 6,
    fontSize: 12,
    color: "#64748B",
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    fontWeight: 700,
  },

  itemImg: {
    marginTop: 10,
    width: "100%",
    maxHeight: 280,
    objectFit: "cover",
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,0.10)",
  },

  iconBtnDanger: {
    height: 38,
    borderRadius: 12,
    border: "1px solid rgba(244,63,94,0.25)",
    background: "linear-gradient(180deg, #FFE4E6 0%, #FECDD3 100%)",
    color: "#9F1239",
    fontWeight: 900,
    cursor: "pointer",
    padding: "0 10px",
    flexShrink: 0,
    whiteSpace: "nowrap",
  },

  iconBtnDangerSmall: {
    width: 38,
    height: 38,
    borderRadius: 12,
    border: "1px solid rgba(244,63,94,0.25)",
    background: "linear-gradient(180deg, #FFE4E6 0%, #FECDD3 100%)",
    color: "#9F1239",
    fontWeight: 900,
    cursor: "pointer",
    flexShrink: 0,
  },
};
