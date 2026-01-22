// src/pages/Checklist.jsx
// ✅ Tabs wrapper page (edge-to-edge, mobile-perfect)
// ✅ Shows only TWO tabs: Add Checklist + Get Checklists
// ✅ Opens tab content BELOW tabs
// ✅ Uses YOUR AuthContext exactly (NO CHANGES): { user, login, logout, loading }

import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import AddChecklist from "../Checklist/AddChecklist";
import GetChecklist from "../Checklist/GetChecklist";

const API_BASE = "https://express-projectrandom.onrender.com/api/checklists";

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

  const displayName =
    user?.full_name ||
    user?.fullName ||
    `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
    "Logged User";

  const displayEmail = user?.email_address || user?.email || "";
  const displayMobile = user?.mobile_number || user?.mobile || "";

  const [tab, setTab] = useState("add"); // "add" | "get"

  return (
    <div style={styles.page}>
      {/* TOP BAR */}
      <div style={styles.topBar}>
        <div style={styles.brandRow}>
          <div style={styles.brand}>✅ Checklist</div>
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

        {/* TABS */}
        <div style={styles.tabsRow}>
          <button
            style={{
              ...styles.tabBtn,
              ...(tab === "add" ? styles.tabBtnActive : null),
            }}
            onClick={() => setTab("add")}
          >
            ➕ Add Checklist
          </button>

          <button
            style={{
              ...styles.tabBtn,
              ...(tab === "get" ? styles.tabBtnActive : null),
            }}
            onClick={() => setTab("get")}
          >
            📋 Get Checklists
          </button>
        </div>
      </div>

      {/* TAB CONTENT BELOW */}
      <div style={styles.content}>
        {tab === "add" ? (
          <AddChecklist
            API_BASE={API_BASE}
            authLoading={authLoading}
            isAuthenticated={isAuthenticated}
            canUse={canUse}
            userId={userId}
            token={token}
          />
        ) : (
          <GetChecklist
            API_BASE={API_BASE}
            authLoading={authLoading}
            isAuthenticated={isAuthenticated}
            canUse={canUse}
            userId={userId}
            token={token}
          />
        )}
      </div>
    </div>
  );
}

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

  tabsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    padding: "0 12px 12px 12px",
    boxSizing: "border-box",
  },

  tabBtn: {
    height: 46,
    borderRadius: 14,
    border: "1px solid rgba(15,23,42,0.14)",
    background: "#FFFFFF",
    color: "#0F172A",
    fontWeight: 900,
    cursor: "pointer",
    padding: "0 12px",
    whiteSpace: "nowrap",
  },

  tabBtnActive: {
    border: "1px solid rgba(2,132,199,0.25)",
    background: "linear-gradient(90deg, #38BDF8 0%, #A78BFA 50%, #FB7185 100%)",
    color: "#0B1220",
  },

  content: {
    width: "100%",
  },
};
