// src/pages/GetChecklist.jsx
// ✅ View checklists (titles) + detail (items)
// ✅ Clean professional UI
// ✅ Priority + Progress + Category/Tags
// ✅ BIG green tick when 100% complete
// ✅ Item image NOT cut (objectFit: contain)
// ✅ NEW: Strong BLACK border for each checklist card + each item card (easy separation)
// ✅ Removed unnecessary texts (no extra pending/completed lines, no created/updated lines)

import React, { useEffect, useMemo, useRef, useState } from "react";

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(new Error("Image read failed"));
    r.onload = () => resolve(String(r.result || ""));
    r.readAsDataURL(file);
  });
}

function getProgress(items) {
  const arr = Array.isArray(items) ? items : [];
  const total = arr.length;
  const done = arr.filter((x) => x.is_checked).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { total, done, percent };
}

const priorityRank = (p) => {
  const s = String(p || "Medium");
  if (s === "High") return 0;
  if (s === "Medium") return 1;
  if (s === "Low") return 2;
  return 1;
};

export default function GetChecklist({
  API_BASE = "https://express-projectrandom.onrender.com/api/checklists",
  authLoading,
  isAuthenticated,
  canUse,
  userId,
  token,
}) {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [selectedId, setSelectedId] = useState(null);
  const selected = useMemo(
    () => lists.find((x) => x.checklist_id === selectedId) || null,
    [lists, selectedId]
  );

  // Add item form
  const [showAddItem, setShowAddItem] = useState(false);
  const [itemText, setItemText] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemImage, setItemImage] = useState(null);
  const [itemPriority, setItemPriority] = useState("Medium");
  const fileRef = useRef(null);

  // UI toggles
  const [sortMode, setSortMode] = useState("smart");
  const [filterMode, setFilterMode] = useState("all");

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
    if (!isAuthenticated) return setErr("Login required.");
    if (!canUse) return setErr("User id not found.");

    setErr("");
    setLoading(true);
    try {
      const data = await apiJson(
        `${API_BASE}?userId=${encodeURIComponent(userId)}&includeItems=true`
      );
      const rows = Array.isArray(data.checklists) ? data.checklists : [];

      const normalized = rows.map((c) => ({
        ...c,
        items: (c.items || []).map((it) => ({
          ...it,
          priority: it.priority || "Medium",
        })),
      }));

      setLists(normalized);

      if (selectedId && !normalized.some((r) => r.checklist_id === selectedId)) {
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

  function openChecklist(checklistId) {
    setSelectedId(checklistId);
    setShowAddItem(false);
    setItemText("");
    setItemDesc("");
    setItemImage(null);
    setItemPriority("Medium");
    setSortMode("smart");
    setFilterMode("all");
    if (fileRef.current) fileRef.current.value = "";
  }

  function closeChecklist() {
    setSelectedId(null);
    setShowAddItem(false);
    setItemText("");
    setItemDesc("");
    setItemImage(null);
    setItemPriority("Medium");
    if (fileRef.current) fileRef.current.value = "";
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
    if (!isAuthenticated) return setErr("Login required.");
    if (!canUse) return setErr("User id not found.");

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
        priority: itemPriority || "Medium",
      };

      const data = await apiJson(`${API_BASE}/${selected.checklist_id}/items`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const newItem = {
        ...data.item,
        priority: data.item?.priority || itemPriority || "Medium",
      };

      setLists((prev) =>
        prev.map((c) =>
          c.checklist_id === selected.checklist_id
            ? { ...c, items: [...(c.items || []), newItem] }
            : c
        )
      );

      setShowAddItem(false);
      setItemText("");
      setItemDesc("");
      setItemImage(null);
      setItemPriority("Medium");
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
      const updated = { ...data.item, priority: data.item?.priority || "Medium" };

      setLists((prev) =>
        prev.map((c) =>
          c.checklist_id !== selectedId
            ? c
            : {
                ...c,
                items: (c.items || []).map((it) =>
                  it.item_id === itemId ? updated : it
                ),
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

  const displayItems = useMemo(() => {
    if (!selected) return [];

    let arr = Array.isArray(selected.items) ? [...selected.items] : [];
    arr = arr.map((it) => ({ ...it, priority: it.priority || "Medium" }));

    if (filterMode === "pending") arr = arr.filter((x) => !x.is_checked);
    if (filterMode === "done") arr = arr.filter((x) => x.is_checked);

    if (sortMode === "newest") {
      arr.sort((a, b) => Number(b.item_id) - Number(a.item_id));
    } else {
      arr.sort((a, b) => {
        const pr = priorityRank(a.priority) - priorityRank(b.priority);
        if (pr !== 0) return pr;

        const chk = Number(a.is_checked) - Number(b.is_checked); // unchecked first
        if (chk !== 0) return chk;

        const so = Number(a.sort_order || 0) - Number(b.sort_order || 0);
        if (so !== 0) return so;

        return Number(a.item_id) - Number(b.item_id);
      });
    }

    return arr;
  }, [selected, sortMode, filterMode]);

  const selectedProgress = useMemo(() => getProgress(selected?.items || []), [selected]);
  const isChecklistComplete =
    selectedProgress.total > 0 && selectedProgress.done === selectedProgress.total;

  return (
    <div style={styles.wrap}>
      <div style={styles.topRow}>
        <button
          style={{ ...styles.btnSoft, ...(loading ? styles.btnDisabled : null) }}
          onClick={loadAll}
          disabled={authLoading || !isAuthenticated || !canUse || loading}
        >
          Refresh
        </button>
      </div>

      {err ? <div style={styles.error}>{err}</div> : null}

      {authLoading ? (
        <div style={styles.empty}>Loading…</div>
      ) : !isAuthenticated ? (
        <div style={styles.empty}>Login required.</div>
      ) : !canUse ? (
        <div style={styles.empty}>User id not found.</div>
      ) : selected ? (
        <div style={styles.detailWrap}>
          {isChecklistComplete ? (
            <div style={styles.bigTickWrap}>
              <div style={styles.bigTickCircle} aria-label="Checklist Completed">
                ✓
              </div>
              <div style={styles.bigTickText}>Completed</div>
            </div>
          ) : null}

          <div style={styles.detailHeader}>
            <button style={styles.backBtn} onClick={closeChecklist}>
              ← Back
            </button>

            <div style={styles.detailTitleArea}>
              <div style={styles.detailTitle}>{selected.title}</div>

              <div style={styles.chipsRow}>
                {selected.category ? (
                  <span style={{ ...styles.chip, ...styles.chipCategory }}>
                    {selected.category}
                  </span>
                ) : null}

                {Array.isArray(selected.tags) && selected.tags.length > 0
                  ? selected.tags.slice(0, 8).map((t, i) => (
                      <span key={`${t}-${i}`} style={styles.chip}>
                        #{t}
                      </span>
                    ))
                  : null}
              </div>

              {selected.description ? (
                <div style={styles.detailDesc}>{selected.description}</div>
              ) : null}

              <div style={styles.progressWrap}>
                <div style={styles.progressTop}>
                  <span style={styles.progressText}>
                    {selectedProgress.done}/{selectedProgress.total} ({selectedProgress.percent}%)
                  </span>
                </div>
                <div style={styles.progressBar}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${selectedProgress.percent}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <button
              style={styles.btnDanger}
              onClick={() => deleteChecklist(selected.checklist_id)}
            >
              Delete
            </button>
          </div>

          <div style={styles.filterRow}>
            <div style={styles.filterGroup}>
              <span style={styles.filterLabel}>Filter</span>
              <select
                style={styles.select}
                value={filterMode}
                onChange={(e) => setFilterMode(e.target.value)}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div style={styles.filterGroup}>
              <span style={styles.filterLabel}>Sort</span>
              <select
                style={styles.select}
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value)}
              >
                <option value="smart">Smart</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

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
                  placeholder="Item name"
                />

                <div style={styles.rowGap}>
                  <span style={styles.filterLabel}>Priority</span>
                  <select
                    style={styles.selectWide}
                    value={itemPriority}
                    onChange={(e) => setItemPriority(e.target.value)}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <textarea
                  style={styles.textarea}
                  value={itemDesc}
                  onChange={(e) => setItemDesc(e.target.value)}
                  placeholder="Description (optional)"
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
                    Save
                  </button>

                  <button
                    style={styles.btnSoft}
                    onClick={() => {
                      setShowAddItem(false);
                      setItemText("");
                      setItemDesc("");
                      setItemImage(null);
                      setItemPriority("Medium");
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

          <div style={styles.itemsWrap}>
            {displayItems.length === 0 ? (
              <div style={styles.emptySmall}>No items.</div>
            ) : (
              displayItems.map((it) => {
                const checked = !!it.is_checked;
                return (
                  <div key={it.item_id} style={styles.itemCard}>
                    <button
                      style={{
                        ...styles.checkBtn,
                        ...(checked ? styles.checkBtnOn : styles.checkBtnOff),
                      }}
                      onClick={() => toggleItem(it.item_id)}
                      title="Done / Undone"
                    >
                      {checked ? "✔" : ""}
                    </button>

                    <div style={styles.itemMain}>
                      <div style={styles.itemTopRow}>
                        <div
                          style={{
                            ...styles.itemText,
                            ...(checked ? styles.itemTextChecked : null),
                          }}
                        >
                          {it.item_text}
                        </div>

                        <span
                          style={{
                            ...styles.badge,
                            ...(it.priority === "High"
                              ? styles.badgeHigh
                              : it.priority === "Low"
                              ? styles.badgeLow
                              : styles.badgeMed),
                          }}
                        >
                          {it.priority || "Medium"}
                        </span>
                      </div>

                      {it.item_description ? (
                        <div style={styles.itemDesc}>{it.item_description}</div>
                      ) : null}

                      {it.image_data ? (
                        <img
                          src={it.image_data}
                          alt="item"
                          style={styles.itemImgContain}
                          loading="lazy"
                        />
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
                );
              })
            )}
          </div>
        </div>
      ) : loading ? (
        <div style={styles.empty}>Loading…</div>
      ) : lists.length === 0 ? (
        <div style={styles.empty}>No checklists.</div>
      ) : (
        <div style={styles.titleList}>
          {lists.map((c) => {
            const prog = getProgress(c.items || []);
            const showTags = Array.isArray(c.tags) ? c.tags : [];
            return (
              <div key={c.checklist_id} style={styles.listCard}>
                <button
                  style={styles.listCardMain}
                  onClick={() => openChecklist(c.checklist_id)}
                >
                  <div style={styles.titleTopRow}>
                    <div style={styles.titleText}>{c.title}</div>
                    <div style={styles.titleProgText}>{prog.percent}%</div>
                  </div>

                  <div style={styles.chipsRow}>
                    {c.category ? (
                      <span style={{ ...styles.chip, ...styles.chipCategory }}>
                        {c.category}
                      </span>
                    ) : null}
                    {showTags.length > 0
                      ? showTags.slice(0, 5).map((t, i) => (
                          <span key={`${t}-${i}`} style={styles.chip}>
                            #{t}
                          </span>
                        ))
                      : null}
                  </div>

                  {c.description ? <div style={styles.titleSub}>{c.description}</div> : null}

                  <div style={styles.progressBarSmall}>
                    <div style={{ ...styles.progressFill, width: `${prog.percent}%` }} />
                  </div>

                  <div style={styles.smallMeta}>
                    {prog.done}/{prog.total}
                  </div>
                </button>

                <div style={styles.listCardActions}>
                  <button style={styles.btnSoft} onClick={() => openChecklist(c.checklist_id)}>
                    View
                  </button>
                  <button
                    style={styles.btnDanger}
                    onClick={() => deleteChecklist(c.checklist_id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  wrap: { width: "100%", padding: 12, boxSizing: "border-box" },

  topRow: { width: "100%", display: "flex", justifyContent: "flex-end", marginBottom: 10 },

  btnSoft: {
    height: 40,
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,0.20)",
    background: "#fff",
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

  btnDanger: {
    height: 40,
    borderRadius: 12,
    border: "1px solid rgba(244,63,94,0.35)",
    background: "linear-gradient(180deg, #FFE4E6 0%, #FECDD3 100%)",
    color: "#9F1239",
    fontWeight: 900,
    cursor: "pointer",
    padding: "0 12px",
    whiteSpace: "nowrap",
  },

  error: {
    width: "100%",
    background: "#FEE2E2",
    color: "#991B1B",
    border: "2px solid rgba(0,0,0,0.85)",
    borderRadius: 14,
    padding: "10px 12px",
    fontSize: 13,
    fontWeight: 900,
    marginBottom: 10,
  },

  empty: { padding: "16px 0", color: "#475569", fontSize: 14, fontWeight: 900 },
  emptySmall: { padding: "12px 0", color: "#64748B", fontSize: 13, fontWeight: 900 },

  // ✅ Completed tick
  bigTickWrap: {
    width: "100%",
    display: "grid",
    placeItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  bigTickCircle: {
    width: 64,
    height: 64,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    fontSize: 36,
    fontWeight: 900,
    background: "linear-gradient(180deg, #BBF7D0 0%, #86EFAC 100%)",
    border: "2px solid rgba(0,0,0,0.85)",
    color: "#064E3B",
    boxShadow: "0 10px 22px rgba(22,163,74,0.12)",
  },
  bigTickText: { fontSize: 14, fontWeight: 900, color: "#14532D" },

  // Filters
  filterRow: { marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" },
  filterGroup: {
    flex: 1,
    minWidth: 160,
    background: "#fff",
    border: "2px solid rgba(0,0,0,0.85)",
    borderRadius: 16,
    padding: "10px 12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    boxSizing: "border-box",
  },
  filterLabel: { fontSize: 12, fontWeight: 900, color: "#0F172A" },
  select: {
    height: 38,
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,0.20)",
    background: "#fff",
    color: "#0F172A",
    fontWeight: 900,
    padding: "0 10px",
    outline: "none",
  },
  selectWide: {
    width: "100%",
    height: 42,
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,0.20)",
    background: "#fff",
    color: "#0F172A",
    fontWeight: 900,
    padding: "0 10px",
    outline: "none",
  },

  // Titles list
  titleList: { width: "100%", display: "grid", gap: 12, boxSizing: "border-box" },

  // ✅ Strong black border checklist card
  listCard: {
    width: "100%",
    background: "#fff",
    border: "2px solid rgba(0,0,0,0.85)",
    borderRadius: 16,
    overflow: "hidden",
  },
  listCardMain: {
    width: "100%",
    textAlign: "left",
    border: "none",
    background: "linear-gradient(90deg, #ECFEFF 0%, #EEF2FF 100%)",
    padding: 12,
    cursor: "pointer",
  },
  listCardActions: {
    display: "flex",
    gap: 8,
    padding: 12,
    background: "#fff",
    justifyContent: "flex-end",
    borderTop: "1px solid rgba(15,23,42,0.10)",
  },

  titleTopRow: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 },
  titleText: { fontSize: 15, fontWeight: 900, color: "#0F172A" },
  titleProgText: {
    fontSize: 12,
    fontWeight: 900,
    color: "#0F172A",
    background: "rgba(255,255,255,0.85)",
    border: "1px solid rgba(15,23,42,0.14)",
    padding: "4px 8px",
    borderRadius: 999,
    whiteSpace: "nowrap",
  },
  titleSub: { marginTop: 6, fontSize: 13, color: "#334155", fontWeight: 800 },

  smallMeta: { marginTop: 8, fontSize: 12, fontWeight: 900, color: "#334155" },

  chipsRow: { display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 },
  chip: {
    fontSize: 12,
    fontWeight: 900,
    color: "#0F172A",
    background: "rgba(255,255,255,0.85)",
    border: "1px solid rgba(15,23,42,0.12)",
    padding: "4px 8px",
    borderRadius: 999,
    whiteSpace: "nowrap",
  },
  chipCategory: { background: "rgba(254,215,170,0.55)", border: "1px solid rgba(234,88,12,0.18)" },

  // Detail view
  detailWrap: { width: "100%", boxSizing: "border-box" },
  detailHeader: {
    width: "100%",
    background: "linear-gradient(90deg, #ECFEFF 0%, #EEF2FF 100%)",
    border: "2px solid rgba(0,0,0,0.85)",
    borderRadius: 16,
    padding: 12,
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    boxSizing: "border-box",
  },
  backBtn: {
    height: 40,
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,0.20)",
    background: "#fff",
    color: "#0F172A",
    fontWeight: 900,
    cursor: "pointer",
    padding: "0 12px",
    whiteSpace: "nowrap",
  },
  detailTitleArea: { flex: 1, minWidth: 0 },
  detailTitle: { fontSize: 16, fontWeight: 900, color: "#0F172A" },
  detailDesc: { marginTop: 8, fontSize: 13, color: "#334155", fontWeight: 800, wordBreak: "break-word" },

  progressWrap: { marginTop: 10 },
  progressTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  progressText: { fontSize: 12, fontWeight: 900, color: "#0F172A" },
  progressBar: {
    marginTop: 6,
    height: 10,
    borderRadius: 999,
    background: "rgba(255,255,255,0.80)",
    border: "1px solid rgba(15,23,42,0.12)",
    overflow: "hidden",
  },
  progressBarSmall: {
    marginTop: 10,
    height: 8,
    borderRadius: 999,
    background: "rgba(255,255,255,0.80)",
    border: "1px solid rgba(15,23,42,0.12)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #38BDF8 0%, #A78BFA 50%, #FB7185 100%)",
    borderRadius: 999,
  },

  detailActions: { marginTop: 10, width: "100%" },

  addItemForm: {
    marginTop: 8,
    display: "grid",
    gap: 10,
    background: "#fff",
    border: "2px solid rgba(0,0,0,0.85)",
    borderRadius: 16,
    padding: 12,
    boxSizing: "border-box",
  },

  rowGap: { display: "grid", gap: 6 },

  uploadRow: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" },

  input: {
    width: "100%",
    height: 46,
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,0.20)",
    background: "#fff",
    color: "#0F172A",
    outline: "none",
    padding: "0 12px",
    fontSize: 14,
    fontWeight: 800,
    boxSizing: "border-box",
  },

  textarea: {
    width: "100%",
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,0.20)",
    background: "#fff",
    color: "#0F172A",
    outline: "none",
    padding: "10px 12px",
    fontSize: 14,
    resize: "none",
    fontWeight: 800,
    boxSizing: "border-box",
  },

  file: {
    flex: 1,
    minWidth: 160,
    height: 44,
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,0.20)",
    background: "#fff",
    color: "#0F172A",
    padding: "9px 10px",
    fontSize: 13,
    fontWeight: 800,
  },

  previewImg: {
    width: "100%",
    maxHeight: 220,
    objectFit: "contain",
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,0.12)",
    background: "#fff",
  },

  // Items
  itemsWrap: { width: "100%", marginTop: 10 },

  // ✅ Strong black border per item card
  itemCard: {
    width: "100%",
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    padding: 12,
    boxSizing: "border-box",
    background: "#fff",
    border: "2px solid rgba(0,0,0,0.85)",
    borderRadius: 16,
    marginTop: 10,
  },

  checkBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,0.20)",
    display: "grid",
    placeItems: "center",
    fontSize: 18,
    fontWeight: 900,
    cursor: "pointer",
    flexShrink: 0,
    background: "#fff",
  },
  checkBtnOn: {
    background: "linear-gradient(180deg, #BBF7D0 0%, #86EFAC 100%)",
    border: "1px solid rgba(22,163,74,0.30)",
    color: "#064E3B",
  },
  checkBtnOff: { background: "#fff", color: "transparent" },

  itemMain: { flex: 1, minWidth: 0 },

  itemTopRow: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 },
  itemText: { fontSize: 14, fontWeight: 900, lineHeight: 1.25, wordBreak: "break-word", color: "#0F172A" },
  itemTextChecked: { opacity: 0.7, textDecoration: "line-through" },

  badge: {
    fontSize: 11,
    fontWeight: 900,
    padding: "4px 8px",
    borderRadius: 999,
    border: "1px solid rgba(15,23,42,0.12)",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  badgeHigh: {
    background: "rgba(254,202,202,0.75)",
    border: "1px solid rgba(239,68,68,0.25)",
    color: "#7F1D1D",
  },
  badgeMed: {
    background: "rgba(254,249,195,0.85)",
    border: "1px solid rgba(234,179,8,0.25)",
    color: "#713F12",
  },
  badgeLow: {
    background: "rgba(219,234,254,0.85)",
    border: "1px solid rgba(59,130,246,0.25)",
    color: "#1E3A8A",
  },

  itemDesc: { marginTop: 6, fontSize: 13, color: "#334155", wordBreak: "break-word", fontWeight: 800 },

  itemImgContain: {
    marginTop: 10,
    width: "100%",
    maxHeight: 220,
    height: "auto",
    objectFit: "contain",
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,0.12)",
    background: "#fff",
    display: "block",
  },

  iconBtnDangerSmall: {
    width: 38,
    height: 38,
    borderRadius: 12,
    border: "1px solid rgba(244,63,94,0.35)",
    background: "linear-gradient(180deg, #FFE4E6 0%, #FECDD3 100%)",
    color: "#9F1239",
    fontWeight: 900,
    cursor: "pointer",
    flexShrink: 0,
  },
};
