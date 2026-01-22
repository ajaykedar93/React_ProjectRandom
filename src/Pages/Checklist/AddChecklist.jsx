// src/pages/AddChecklist.jsx
// ✅ Only Add Checklist UI (edge-to-edge)
// ✅ Uses passed props from Checklist.jsx (AuthContext untouched)
// ✅ API: POST /api/checklists

import React, { useState } from "react";

export default function AddChecklist({
  API_BASE,
  authLoading,
  isAuthenticated,
  canUse,
  userId,
  token,
}) {
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

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

  async function createChecklist() {
    setOk("");
    if (!isAuthenticated) return setErr("Please login first.");
    if (!canUse) return setErr("Login user id not found (UUID required).");
    if (!newTitle.trim()) return setErr("Checklist title required.");

    setErr("");
    setLoading(true);
    try {
      const payload = {
        user_id: userId,
        title: newTitle.trim(),
        description: newDesc.trim() ? newDesc.trim() : null,
        items: [],
      };

      await apiJson(API_BASE, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setNewTitle("");
      setNewDesc("");
      setOk("Checklist created successfully ✅");
    } catch (e) {
      setErr(e.message || "Create failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.wrap}>
      {err ? <div style={styles.error}>{err}</div> : null}
      {ok ? <div style={styles.success}>{ok}</div> : null}

      <div style={styles.card}>
        <div style={styles.cardTitle}>Create New Checklist</div>
        <div style={styles.cardSub}>Add title and optional description.</div>

        <input
          style={styles.input}
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Checklist title (e.g., Flipkart)"
          disabled={authLoading || !isAuthenticated || loading}
        />

        <textarea
          style={styles.textarea}
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
          placeholder="Checklist description (optional)"
          rows={3}
          disabled={authLoading || !isAuthenticated || loading}
        />

        <button
          style={{
            ...styles.btnPrimary,
            ...(loading || authLoading || !isAuthenticated || !canUse ? styles.btnDisabled : null),
          }}
          onClick={createChecklist}
          disabled={loading || authLoading || !isAuthenticated || !canUse}
        >
          {loading ? "Creating..." : "+ Create List"}
        </button>

        {!isAuthenticated ? (
          <div style={styles.note}>Login required to create a checklist.</div>
        ) : !canUse ? (
          <div style={styles.note}>
            User UUID not found. Your logged user must have <b>user.id</b> = register_random.id (UUID).
          </div>
        ) : null}
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    width: "100%",
    padding: "12px 12px",
    boxSizing: "border-box",
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

  success: {
    width: "100%",
    background: "#DCFCE7",
    color: "#166534",
    border: "1px solid rgba(22,101,52,0.20)",
    borderRadius: 14,
    padding: "10px 12px",
    fontSize: 13,
    fontWeight: 900,
    marginBottom: 10,
  },

  card: {
    width: "100%",
    background: "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)",
    border: "1px solid rgba(15,23,42,0.10)",
    borderRadius: 16,
    padding: "12px 12px",
    boxSizing: "border-box",
  },

  cardTitle: { fontSize: 16, fontWeight: 900 },
  cardSub: { marginTop: 4, fontSize: 13, color: "#475569", fontWeight: 700 },

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
    marginTop: 12,
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
    marginTop: 10,
    boxSizing: "border-box",
  },

  btnPrimary: {
    width: "100%",
    height: 46,
    borderRadius: 12,
    border: "1px solid rgba(2,132,199,0.25)",
    background: "linear-gradient(90deg, #38BDF8 0%, #A78BFA 50%, #FB7185 100%)",
    color: "#0B1220",
    fontWeight: 900,
    cursor: "pointer",
    padding: "0 14px",
    marginTop: 12,
  },

  btnDisabled: { opacity: 0.6, cursor: "not-allowed" },

  note: {
    marginTop: 10,
    fontSize: 13,
    color: "#64748B",
    fontWeight: 800,
    lineHeight: 1.35,
  },
};
