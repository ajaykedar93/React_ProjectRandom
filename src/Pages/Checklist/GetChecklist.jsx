// src/pages/GetChecklist.jsx
// ✅ Only Get/View checklists UI (edge-to-edge)
// ✅ Titles-only view + Detail view (with Add Item form)
// ✅ NEW FEATURES ADDED:
//   (3) Priority (High/Medium/Low) -> dropdown while adding item + badge on item + sort by priority
//   (4) Progress % -> progress bar on title card + detail header (computed from is_checked)
//   (6) Category + Tags -> show chips on checklist cards + detail header (data comes from API)
// ✅ UI UPDATE (your request):
//   ✅ When item is checked -> show professional "Completed" line
//   ✅ Show BIG green tick above details header when checklist is 100% complete
//   ✅ Item image should NOT cut/hide: show FULL image (contain), small height for mobile
// ✅ Base URL localhost:5000

import React, { useEffect, useMemo, useRef, useState } from "react";

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

// ✅ Progress helper
function getProgress(items) {
  const arr = Array.isArray(items) ? items : [];
  const total = arr.length;
  const done = arr.filter((x) => x.is_checked).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { total, done, percent };
}

// ✅ Priority order helper
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
    if (!isAuthenticated) return setErr("Please login first.");
    if (!canUse) return setErr("Login user id not found (UUID required).");

    setErr("");
    setLoading(true);
    try {
      const data = await apiJson(
        `${API_BASE}?userId=${encodeURIComponent(userId)}&includeItems=true`
      );
      const rows = Array.isArray(data.checklists) ? data.checklists : [];

      // ensure priority exists for old data
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

  // ✅ Derived for selected items: filter + sort
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

  // ✅ show big tick only when 100% and at least 1 item
  const isChecklistComplete =
    selectedProgress.total > 0 && selectedProgress.done === selectedProgress.total;

  return (
    <div style={styles.wrap}>
      <div style={styles.actionsRow}>
        <button
          style={{ ...styles.btnSoft, ...(loading ? styles.btnDisabled : null) }}
          onClick={loadAll}
          disabled={authLoading || !isAuthenticated || !canUse || loading}
          title="Refresh"
        >
          Refresh
        </button>
      </div>

      {err ? <div style={styles.error}>{err}</div> : null}

      {authLoading ? (
        <div style={styles.empty}>Loading user session…</div>
      ) : !isAuthenticated ? (
        <div style={styles.empty}>Please login to see your checklists.</div>
      ) : !canUse ? (
        <div style={styles.empty}>
          User UUID not found. Your logged user must have <b>user.id</b> = register_random.id (UUID).
        </div>
      ) : selected ? (
        <div style={styles.detailWrap}>
          {/* ✅ BIG GREEN TICK ABOVE DETAILS WHEN COMPLETE */}
          {isChecklistComplete ? (
            <div style={styles.bigTickWrap}>
              <div style={styles.bigTickCircle} aria-label="Checklist Completed">
                ✓
              </div>
              <div style={styles.bigTickText}>Checklist Completed</div>
            </div>
          ) : null}

          <div style={styles.detailHeader}>
            <button style={styles.backBtn} onClick={closeChecklist}>
              ← Back
            </button>

            <div style={styles.detailTitleArea}>
              <div style={styles.detailTitleRow}>
                <div style={styles.detailTitle}>{selected.title}</div>

                <div style={styles.chipsRow}>
                  {selected.category ? (
                    <span style={{ ...styles.chip, ...styles.chipCategory }}>
                      {selected.category}
                    </span>
                  ) : null}

                  {Array.isArray(selected.tags) && selected.tags.length > 0
                    ? selected.tags.slice(0, 6).map((t, i) => (
                        <span key={`${t}-${i}`} style={styles.chip}>
                          #{t}
                        </span>
                      ))
                    : null}
                </div>
              </div>

              {selected.description ? (
                <div style={styles.detailDesc}>{selected.description}</div>
              ) : null}

              <div style={styles.progressWrap}>
                <div style={styles.progressTop}>
                  <span style={styles.progressText}>
                    Progress: {selectedProgress.done}/{selectedProgress.total} (
                    {selectedProgress.percent}%)
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

              <div style={styles.detailMeta}>
                <span>Created: {formatDateTime(selected.created_at)}</span>
                <span style={{ marginLeft: 10 }}>
                  Updated: {formatDateTime(selected.updated_at)}
                </span>
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
                  placeholder="Item name (e.g., Pant)"
                />

                <div style={styles.priorityRow}>
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
              <div style={styles.emptySmall}>No items found.</div>
            ) : (
              displayItems.map((it) => {
                const checked = !!it.is_checked;
                return (
                  <div key={it.item_id} style={styles.itemRow}>
                    <button
                      style={{
                        ...styles.checkBtn,
                        ...(checked ? styles.checkBtnOn : styles.checkBtnOff),
                      }}
                      onClick={() => toggleItem(it.item_id)}
                      title="Tick / Untick"
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
                          title="Priority"
                        >
                          {it.priority || "Medium"}
                        </span>
                      </div>

                      {/* ✅ Professional line after check */}
                      {checked ? (
                        <div style={styles.completedLine}>✅ Completed — Great job!</div>
                      ) : (
                        <div style={styles.pendingLine}>⏳ Pending — Tap checkbox when done</div>
                      )}

                      {it.item_description ? (
                        <div style={styles.itemDesc}>{it.item_description}</div>
                      ) : null}

                      <div style={styles.itemMeta}>
                        <span>Created: {formatDateTime(it.created_at)}</span>
                        <span style={{ marginLeft: 10 }}>
                          Updated: {formatDateTime(it.updated_at)}
                        </span>
                      </div>

                      {/* ✅ Image FULL visible (not cut) and small for mobile */}
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
        <div style={styles.empty}>No lists yet. Create from “Add Checklist” tab.</div>
      ) : (
        <div style={styles.titleList}>
          {lists.map((c) => {
            const prog = getProgress(c.items || []);
            const showTags = Array.isArray(c.tags) ? c.tags : [];
            return (
              <div key={c.checklist_id} style={styles.titleCard}>
                <button style={styles.titleCardMain} onClick={() => openChecklist(c.checklist_id)}>
                  <div style={styles.titleTopRow}>
                    <div style={styles.titleText}>{c.title}</div>
                    <div style={styles.titleProgText}>{prog.percent}%</div>
                  </div>

                  <div style={styles.chipsRow}>
                    {c.category ? (
                      <span style={{ ...styles.chip, ...styles.chipCategory }}>{c.category}</span>
                    ) : null}
                    {showTags.length > 0
                      ? showTags.slice(0, 4).map((t, i) => (
                          <span key={`${t}-${i}`} style={styles.chip}>
                            #{t}
                          </span>
                        ))
                      : null}
                  </div>

                  {c.description ? (
                    <div style={styles.titleSub}>{c.description}</div>
                  ) : (
                    <div style={styles.titleSubMuted}>No description</div>
                  )}

                  <div style={styles.progressBarSmall}>
                    <div style={{ ...styles.progressFill, width: `${prog.percent}%` }} />
                  </div>

                  <div style={styles.titleMeta}>
                    <span>{formatDateTime(c.created_at)}</span>
                    <span style={{ marginLeft: 10 }}>
                      {prog.done}/{prog.total} done
                    </span>
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
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  wrap: {
    width: "100%",
    padding: "12px 12px",
    boxSizing: "border-box",
  },

  actionsRow: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: 10,
  },

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

  error: {
    width: "100%",
    background: "#FEE2E2",
    color: "#991B1B",
    border: "1px solid rgba(153,27,27,0.20)",
    borderRadius: 14,
    padding: "10px 12px",
    fontSize: 13,
    fontWeight: 800,
    marginBottom: 10,
  },

  empty: { padding: "16px 0", color: "#475569", fontSize: 14, fontWeight: 800 },
  emptySmall: { padding: "12px 0", color: "#64748B", fontSize: 13, fontWeight: 800 },

  // ✅ BIG TICK (details top)
  bigTickWrap: {
    width: "100%",
    display: "grid",
    placeItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  bigTickCircle: {
    width: 68,
    height: 68,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    fontSize: 38,
    fontWeight: 900,
    background: "linear-gradient(180deg, #BBF7D0 0%, #86EFAC 100%)",
    border: "1px solid rgba(22,163,74,0.30)",
    color: "#064E3B",
    boxShadow: "0 10px 22px rgba(22,163,74,0.12)",
  },
  bigTickText: { fontSize: 14, fontWeight: 900, color: "#14532D" },

  // Filter / Sort row
  filterRow: {
    marginTop: 10,
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  filterGroup: {
    flex: 1,
    minWidth: 160,
    background: "#FFFFFF",
    border: "1px solid rgba(15,23,42,0.10)",
    borderRadius: 16,
    padding: "10px 12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    boxSizing: "border-box",
  },
  filterLabel: { fontSize: 12, fontWeight: 900, color: "#334155" },
  select: {
    height: 38,
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,0.14)",
    background: "#FFFFFF",
    color: "#0F172A",
    fontWeight: 800,
    padding: "0 10px",
    outline: "none",
  },
  selectWide: {
    width: "100%",
    height: 42,
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,0.14)",
    background: "#FFFFFF",
    color: "#0F172A",
    fontWeight: 800,
    padding: "0 10px",
    outline: "none",
  },

  // Titles list
  titleList: {
    width: "100%",
    display: "grid",
    gap: 10,
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

  titleTopRow: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 10,
  },

  titleText: { fontSize: 15, fontWeight: 900 },
  titleProgText: {
    fontSize: 13,
    fontWeight: 900,
    color: "#0F172A",
    background: "rgba(255,255,255,0.75)",
    border: "1px solid rgba(15,23,42,0.10)",
    padding: "4px 8px",
    borderRadius: 999,
    whiteSpace: "nowrap",
  },

  titleSub: { marginTop: 6, fontSize: 13, color: "#334155", fontWeight: 700 },
  titleSubMuted: { marginTop: 6, fontSize: 13, color: "#64748B", fontWeight: 700 },
  titleMeta: { marginTop: 8, fontSize: 12, color: "#64748B", fontWeight: 700 },

  titleCardActions: {
    display: "flex",
    gap: 8,
    padding: "10px 12px",
    background: "#FFFFFF",
    justifyContent: "flex-end",
  },

  // Detail view
  detailWrap: {
    width: "100%",
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

  detailTitleRow: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },

  detailTitle: { fontSize: 16, fontWeight: 900 },

  chipsRow: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
  },

  chip: {
    fontSize: 12,
    fontWeight: 900,
    color: "#0F172A",
    background: "rgba(255,255,255,0.75)",
    border: "1px solid rgba(15,23,42,0.10)",
    padding: "4px 8px",
    borderRadius: 999,
    whiteSpace: "nowrap",
  },

  chipCategory: {
    background: "rgba(219,234,254,0.85)",
    border: "1px solid rgba(59,130,246,0.25)",
  },

  detailDesc: {
    marginTop: 6,
    fontSize: 13,
    color: "#334155",
    fontWeight: 700,
    wordBreak: "break-word",
  },

  // progress
  progressWrap: { marginTop: 10 },
  progressTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  progressText: { fontSize: 12, fontWeight: 900, color: "#334155" },
  progressBar: {
    marginTop: 6,
    height: 10,
    borderRadius: 999,
    background: "rgba(255,255,255,0.70)",
    border: "1px solid rgba(15,23,42,0.10)",
    overflow: "hidden",
  },
  progressBarSmall: {
    marginTop: 10,
    height: 8,
    borderRadius: 999,
    background: "rgba(255,255,255,0.70)",
    border: "1px solid rgba(15,23,42,0.10)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #38BDF8 0%, #A78BFA 50%, #FB7185 100%)",
    borderRadius: 999,
  },

  detailMeta: {
    marginTop: 10,
    fontSize: 12,
    color: "#64748B",
    fontWeight: 700,
    flexWrap: "wrap",
  },

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

  priorityRow: {
    display: "grid",
    gap: 6,
  },

  uploadRow: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    flexWrap: "wrap",
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
    boxSizing: "border-box",
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
    boxSizing: "border-box",
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
    objectFit: "contain",
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "#FFFFFF",
  },

  // Items
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

  itemTopRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },

  itemText: { fontSize: 14, fontWeight: 900, lineHeight: 1.25, wordBreak: "break-word" },
  itemTextChecked: { opacity: 0.7, textDecoration: "line-through" },

  completedLine: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: 900,
    color: "#14532D",
    background: "rgba(220,252,231,0.75)",
    border: "1px solid rgba(22,163,74,0.18)",
    padding: "6px 10px",
    borderRadius: 12,
    width: "fit-content",
  },
  pendingLine: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: 900,
    color: "#7C2D12",
    background: "rgba(254,215,170,0.45)",
    border: "1px solid rgba(234,88,12,0.18)",
    padding: "6px 10px",
    borderRadius: 12,
    width: "fit-content",
  },

  // priority badge
  badge: {
    fontSize: 11,
    fontWeight: 900,
    padding: "4px 8px",
    borderRadius: 999,
    border: "1px solid rgba(15,23,42,0.10)",
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

  // ✅ Full image visible + small for mobile (contain)
  itemImgContain: {
    marginTop: 10,
    width: "100%",
    maxHeight: 220,           // small on mobile
    height: "auto",
    objectFit: "contain",     // IMPORTANT: no cut
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "#FFFFFF",
    display: "block",
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
