import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UserAll() {
  const API_BASE = "https://express-projectrandom.onrender.com";
  const USERS_BASE = `${API_BASE}/api/auth/users`;

  const navigate = useNavigate();
  const aliveRef = useRef(true);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [q, setQ] = useState("");
  const [autoRefresh] = useState(true); // auto ON (no button)
  const [lastSync, setLastSync] = useState(null);

  // Center modal (info/success/error/confirm)
  const [modal, setModal] = useState({
    open: false,
    type: "info",
    title: "",
    message: "",
    onConfirm: null,
    confirmText: "OK",
    cancelText: "Cancel",
  });

  const openModal = (cfg) => {
    setModal({
      open: true,
      type: cfg.type || "info",
      title: cfg.title || "",
      message: cfg.message || "",
      onConfirm: cfg.onConfirm || null,
      confirmText: cfg.confirmText || "OK",
      cancelText: cfg.cancelText || "Cancel",
    });
  };

  const closeModal = () => setModal((p) => ({ ...p, open: false, onConfirm: null }));

  // Details modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailUser, setDetailUser] = useState(null);

  // Update modal (unchanged)
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    mobile_number: "",
    email_address: "",
    village_city: "",
    pincode: "",
    state: "",
    district: "",
    taluka: "",
    password: "",
  });

  const safeText = (v) => (v === null || v === undefined || v === "" ? "-" : String(v));

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

  const filtered = useMemo(() => {
    const key = q.trim().toLowerCase();
    if (!key) return users;
    return users.filter((u) => {
      const blob = `${u.full_name || ""} ${u.first_name || ""} ${u.last_name || ""} ${u.email_address || ""}`
        .toLowerCase();
      return blob.includes(key);
    });
  }, [users, q]);

  const safeFetchJson = async (url, options = {}, controller) => {
    const res = await fetch(url, {
      mode: "cors",
      ...options,
      signal: controller?.signal,
    });

    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    if (!res.ok) {
      const msg = data?.message || text || `HTTP ${res.status}`;
      throw new Error(msg);
    }
    return data;
  };

  const fetchUsers = async (silent = false) => {
    const controller = new AbortController();
    try {
      if (!silent) setLoading(true);

      const data = await safeFetchJson(`${USERS_BASE}`, { method: "GET" }, controller);
      if (!aliveRef.current) return;

      setUsers(Array.isArray(data) ? data : []);
      setLastSync(new Date());
    } catch (e) {
      if (!aliveRef.current) return;
      if (e.name === "AbortError") return;

      openModal({
        type: "error",
        title: "Users Load Failed",
        message: `${e.message}\n\nCheck API: ${USERS_BASE}`,
        confirmText: "OK",
      });
    } finally {
      if (!silent) setLoading(false);
    }
    return () => controller.abort();
  };

  useEffect(() => {
    aliveRef.current = true;
    fetchUsers(false);
    return () => {
      aliveRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => fetchUsers(true), 5000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        closeModal();
        setDetailOpen(false);
        setEditOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openDetails = async (id) => {
    const controller = new AbortController();
    try {
      setDetailOpen(true);
      setDetailLoading(true);
      setDetailUser(null);

      const data = await safeFetchJson(`${USERS_BASE}/${id}`, { method: "GET" }, controller);
      if (!aliveRef.current) return;

      setDetailUser(data);
    } catch (e) {
      if (e.name === "AbortError") return;
      openModal({ type: "error", title: "Details Failed", message: e.message });
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
    return () => controller.abort();
  };

  const openEdit = async (id) => {
    const controller = new AbortController();
    try {
      setEditOpen(true);
      setEditLoading(false);
      setEditId(id);

      const data = await safeFetchJson(`${USERS_BASE}/${id}`, { method: "GET" }, controller);
      if (!aliveRef.current) return;

      setForm({
        first_name: data?.first_name || "",
        last_name: data?.last_name || "",
        mobile_number: data?.mobile_number || "",
        email_address: data?.email_address || "",
        village_city: data?.village_city || "",
        pincode: data?.pincode || "",
        state: data?.state || "",
        district: data?.district || "",
        taluka: data?.taluka || "",
        password: "",
      });
    } catch (e) {
      if (e.name === "AbortError") return;
      openModal({ type: "error", title: "Edit Load Failed", message: e.message });
      setEditOpen(false);
    }
    return () => controller.abort();
  };

  const submitUpdate = async (e) => {
    e.preventDefault();
    if (!editId) return;

    const controller = new AbortController();
    try {
      setEditLoading(true);

      const payload = {
        first_name: form.first_name?.trim() || null,
        last_name: form.last_name?.trim() || null,
        mobile_number: form.mobile_number?.trim() || null,
        email_address: form.email_address?.trim() || null,
        village_city: form.village_city?.trim() || null,
        pincode: form.pincode?.trim() || null,
        state: form.state?.trim() || null,
        district: form.district?.trim() || null,
        taluka: form.taluka?.trim() || null,
        password: form.password?.trim() ? form.password.trim() : null,
      };

      const data = await safeFetchJson(
        `${USERS_BASE}/${editId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
        controller
      );

      setEditOpen(false);
      setEditId(null);

      openModal({ type: "success", title: "Updated", message: data?.message || "Updated successfully" });

      await fetchUsers(true);

      if (detailOpen && detailUser?.id === editId) {
        await openDetails(editId);
      }
    } catch (e2) {
      openModal({ type: "error", title: "Update Failed", message: e2.message });
    } finally {
      setEditLoading(false);
    }
    return () => controller.abort();
  };

  const askDelete = (u) => {
    openModal({
      type: "confirm",
      title: "Delete User?",
      message: `Delete "${u.full_name || `${u.first_name || ""} ${u.last_name || ""}`.trim()}"?\nThis cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        closeModal();
        await doDelete(u.id);
      },
    });
  };

  const doDelete = async (id) => {
    const controller = new AbortController();
    try {
      setLoading(true);

      const data = await safeFetchJson(`${USERS_BASE}/${id}`, { method: "DELETE" }, controller);

      openModal({ type: "success", title: "Deleted", message: data?.message || "Deleted successfully" });

      if (detailOpen && detailUser?.id === id) {
        setDetailOpen(false);
        setDetailUser(null);
      }

      await fetchUsers(true);
    } catch (e) {
      openModal({ type: "error", title: "Delete Failed", message: e.message });
    } finally {
      setLoading(false);
    }
    return () => controller.abort();
  };

  const closeDetails = () => {
    if (detailLoading) return;
    setDetailOpen(false);
  };
  const closeEdit = () => {
    if (editLoading) return;
    setEditOpen(false);
  };

  return (
    <div className="ua">
      <style>{css}</style>

      {/* Center Modal */}
      {modal.open ? (
        <div className="mb" onClick={closeModal}>
          <div className="mc" onClick={(e) => e.stopPropagation()}>
            <div className={`pill ${modal.type}`}>{modal.type.toUpperCase()}</div>
            <h3 className="mt">{modal.title}</h3>
            <div className="mBody">
              <p className="mm" style={{ whiteSpace: "pre-line" }}>
                {modal.message}
              </p>
            </div>
            <div className="mActions">
              {modal.type === "confirm" ? (
                <div className="mRow">
                  <button className="mBtn ghost" type="button" onClick={closeModal}>
                    {modal.cancelText}
                  </button>
                  <button className="mBtn danger" type="button" onClick={() => modal.onConfirm && modal.onConfirm()}>
                    {modal.confirmText}
                  </button>
                </div>
              ) : (
                <button className="mBtn" type="button" onClick={closeModal}>
                  {modal.confirmText || "OK"}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Details Modal (full details, only Close) */}
      {detailOpen ? (
        <div className="mb" onClick={closeDetails}>
          <div className="mc" onClick={(e) => e.stopPropagation()}>
            <div className="mHeader">
              <div>
                <div className="pill info">DETAILS</div>
                <h3 className="mt">User Details</h3>
              </div>
              <button className="xBtn" type="button" onClick={closeDetails} aria-label="Close details">
                ✕
              </button>
            </div>

            <div className="mBody">
              {detailLoading ? (
                <div className="loadingRow">
                  <div className="spin" /> Loading...
                </div>
              ) : !detailUser ? (
                <div className="emptyBox">No details</div>
              ) : (
                <div className="detailGrid">
                  <div className="kv">
                    <span>ID</span>
                    <b>{safeText(detailUser.id)}</b>
                  </div>
                  <div className="kv">
                    <span>Full Name</span>
                    <b>{safeText(detailUser.full_name)}</b>
                  </div>
                  <div className="kv">
                    <span>Email</span>
                    <b>{safeText(detailUser.email_address)}</b>
                  </div>
                  <div className="kv">
                    <span>Mobile</span>
                    <b>{safeText(detailUser.mobile_number)}</b>
                  </div>
                  <div className="kv">
                    <span>Village/City</span>
                    <b>{safeText(detailUser.village_city)}</b>
                  </div>
                  <div className="kv">
                    <span>Pincode</span>
                    <b>{safeText(detailUser.pincode)}</b>
                  </div>
                  <div className="kv">
                    <span>State</span>
                    <b>{safeText(detailUser.state)}</b>
                  </div>
                  <div className="kv">
                    <span>District</span>
                    <b>{safeText(detailUser.district)}</b>
                  </div>
                  <div className="kv">
                    <span>Taluka</span>
                    <b>{safeText(detailUser.taluka)}</b>
                  </div>
                  <div className="kv full">
                    <span>Created At</span>
                    <b>{formatIndia(detailUser.created_at)}</b>
                  </div>
                </div>
              )}
            </div>

            <div className="mActions">
              <div className="mRow">
                <button className="mBtn" type="button" onClick={closeDetails} disabled={detailLoading}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Update Modal (same) */}
      {editOpen ? (
        <div className="mb" onClick={closeEdit}>
          <div className="mc" onClick={(e) => e.stopPropagation()}>
            <div className="mHeader">
              <div>
                <div className="pill info">UPDATE</div>
                <h3 className="mt">Update User</h3>
              </div>
              <button className="xBtn" type="button" onClick={closeEdit} aria-label="Close update">
                ✕
              </button>
            </div>

            <form onSubmit={submitUpdate} className="form">
              <div className="mBody">
                <div className="row2">
                  <div>
                    <label className="lbl">First Name</label>
                    <input
                      className="inp"
                      value={form.first_name}
                      onChange={(e) => setForm((p) => ({ ...p, first_name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="lbl">Last Name</label>
                    <input
                      className="inp"
                      value={form.last_name}
                      onChange={(e) => setForm((p) => ({ ...p, last_name: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="row2">
                  <div>
                    <label className="lbl">Mobile</label>
                    <input
                      className="inp"
                      value={form.mobile_number}
                      onChange={(e) => setForm((p) => ({ ...p, mobile_number: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="lbl">Email</label>
                    <input
                      className="inp"
                      value={form.email_address}
                      onChange={(e) => setForm((p) => ({ ...p, email_address: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="row2">
                  <div>
                    <label className="lbl">Village/City</label>
                    <input
                      className="inp"
                      value={form.village_city}
                      onChange={(e) => setForm((p) => ({ ...p, village_city: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="lbl">Pincode</label>
                    <input
                      className="inp"
                      value={form.pincode}
                      onChange={(e) => setForm((p) => ({ ...p, pincode: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="row2">
                  <div>
                    <label className="lbl">State</label>
                    <input className="inp" value={form.state} onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))} />
                  </div>
                  <div>
                    <label className="lbl">District</label>
                    <input
                      className="inp"
                      value={form.district}
                      onChange={(e) => setForm((p) => ({ ...p, district: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="row2">
                  <div>
                    <label className="lbl">Taluka</label>
                    <input
                      className="inp"
                      value={form.taluka}
                      onChange={(e) => setForm((p) => ({ ...p, taluka: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="lbl">New Password (optional)</label>
                    <input
                      className="inp"
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                      placeholder="Leave blank to keep same"
                    />
                  </div>
                </div>
              </div>

              <div className="mActions">
                <div className="mRow">
                  <button className="mBtn ghost" type="button" onClick={closeEdit} disabled={editLoading}>
                    Cancel
                  </button>
                  <button className="mBtn" type="submit" disabled={editLoading}>
                    {editLoading ? "Updating..." : "Update"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Page */}
      <div className="wrap">
        <div className="top">
          <div>
            <h2 className="title">All Registered Users</h2>
            <p className="sub">
              Total: <b>{users.length}</b> • Showing: <b>{filtered.length}</b>
              {lastSync ? <span className="sync"> • Last sync: {lastSync.toLocaleTimeString("en-IN")}</span> : null}
            </p>
          </div>

          <div className="topActions">
            <input className="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name/email..." />
            <button className="btn" type="button" onClick={() => fetchUsers(false)} disabled={loading}>
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* ✅ GRID (auto adjust) */}
        <div className="grid">
          {loading && users.length === 0 ? (
            <div className="emptyBox" style={{ gridColumn: "1 / -1" }}>
              <div className="loadingRow">
                <div className="spin" /> Loading users...
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="emptyBox" style={{ gridColumn: "1 / -1" }}>
              No users found.
            </div>
          ) : (
            filtered.map((u) => (
              <div key={u.id} className="card">
                <div className="cardLeft" onClick={() => openDetails(u.id)} role="button" tabIndex={0}>
                  <div className="avatar2">{(u.first_name?.[0] || "U").toUpperCase()}</div>

                  <div className="info">
                    {/* ✅ ONLY NAME + EMAIL */}
                    <div className="name">{u.full_name || `${u.first_name || ""} ${u.last_name || ""}`.trim() || "User"}</div>
                    <div className="email">{safeText(u.email_address)}</div>
                  </div>
                </div>

                <div className="cardRight">
                  <button className="miniBtn" type="button" onClick={() => openDetails(u.id)}>
                    Details
                  </button>
                  <button className="miniBtn ghost" type="button" onClick={() => openEdit(u.id)}>
                    Update
                  </button>
                  <button className="miniBtn danger" type="button" onClick={() => askDelete(u)}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      
      </div>
    </div>
  );
}

const css = `
  :root{ --ink:#0b1220; --muted: rgba(11,18,32,.65); }
  *{ box-sizing: border-box; }

  /* full page */
  .ua{
    min-height:100vh;
    margin:0;
    padding:0;
    background:
      radial-gradient(900px 520px at 12% 12%, rgba(255, 0, 150, .22), transparent 60%),
      radial-gradient(900px 520px at 88% 16%, rgba(0, 200, 255, .18), transparent 58%),
      radial-gradient(1000px 650px at 50% 92%, rgba(0, 255, 150, .15), transparent 60%),
      linear-gradient(135deg, #fffbeb 0%, #eff6ff 34%, #ecfeff 67%, #f0fdf4 100%);
    color: var(--ink);
  }

  /* container full width but with small safe gutter (so not touch edges) */
  .wrap{
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    background: rgba(255,255,255,.86);
    border-radius: 0;
    padding: 0;
  }

  .top{
    display:flex;
    justify-content:space-between;
    align-items:flex-start;
    gap: 12px;
    flex-wrap:wrap;
    padding: 12px;
  }
  .title{ margin:0; font-size: clamp(18px, 2.8vw, 26px); font-weight: 1100; }
  .sub{ margin: 8px 0 0; font-weight: 850; color: var(--muted); font-size: 13px; }
  .sync{ color: rgba(11,18,32,.55); }

  .topActions{
    display:flex;
    gap: 10px;
    flex-wrap: wrap;
    align-items:center;
    justify-content:flex-end;
    width: min(520px, 100%);
  }
  .search{
    flex: 1 1 240px;
    min-width: 180px;
    padding: 12px 12px;
    border-radius: 16px;
    border: 1px solid rgba(17,24,39,.10);
    outline:none;
    font-weight: 900;
    background: rgba(255,255,255,.70);
  }
  .btn{
    border:none;
    padding: 12px 14px;
    border-radius: 16px;
    cursor:pointer;
    color:#fff;
    font-weight:1000;
    background: linear-gradient(90deg, #7c3aed 0%, #06b6d4 55%, #22c55e 100%);
    white-space: nowrap;
  }
  .btn:disabled{ opacity:.75; cursor:not-allowed; }

  /* ✅ responsive grid */
  .grid{
    padding: 12px;
    display:grid;
    gap: 10px;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }

  /* card auto fit (no stretch overflow) */
  .card{
    background: rgba(255,255,255,.72);
    border: 1px solid rgba(17,24,39,.08);
    border-radius: 18px;
    padding: 12px;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap: 12px;
    min-width: 0;
  }

  .cardLeft{
    display:flex;
    align-items:center;
    gap: 12px;
    min-width: 0;
    cursor:pointer;
    flex: 1 1 auto;
  }

  .avatar2{
    width: 44px; height: 44px;
    border-radius: 16px;
    display:flex; align-items:center; justify-content:center;
    font-weight: 1100;
    background: rgba(124,58,237,.14);
    border: 1px solid rgba(124,58,237,.20);
    flex: 0 0 auto;
  }

  .info{ min-width: 0; }
  .name{
    font-weight: 1100;
    color: rgba(11,18,32,.92);
    word-break: break-word;
    line-height: 1.1;
  }
  .email{
    margin-top: 6px;
    font-size: 12px;
    font-weight: 900;
    color: rgba(11,18,32,.66);
    word-break: break-word;
  }

  .cardRight{
    display:flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content:flex-end;
    flex: 0 0 auto;
  }

  .miniBtn{
    border:none;
    padding: 10px 12px;
    border-radius: 14px;
    cursor:pointer;
    font-weight: 1000;
    background: rgba(17,24,39,.08);
    color: #111827;
    white-space: nowrap;
  }
  .miniBtn.ghost{ background: rgba(6,182,212,.14); color: rgba(11,18,32,.92); }
  .miniBtn.danger{ background: rgba(255,45,85,.14); color: #9f1239; }

  .emptyBox{
    padding: 16px;
    border-radius: 18px;
    background: rgba(255,255,255,.65);
    border: 1px solid rgba(17,24,39,.08);
    text-align:center;
    font-weight: 950;
    color: rgba(11,18,32,.70);
  }

  .loadingRow{
    display:flex;
    gap: 10px;
    align-items:center;
    justify-content:center;
    padding: 8px;
    font-weight: 950;
    color: rgba(11,18,32,.70);
  }
  .spin{
    width: 16px; height: 16px;
    border-radius: 999px;
    border: 3px solid rgba(11,18,32,.15);
    border-top-color: rgba(124,58,237,.65);
    animation: spin 1s linear infinite;
  }
  @keyframes spin{ to{ transform: rotate(360deg); } }

  .bottomNote{
    padding: 12px;
    font-size: 12px;
    font-weight: 900;
    color: rgba(11,18,32,.60);
    word-break: break-all;
  }

  /* modals */
  .mb{
    position:fixed; inset:0;
    display:flex;
    align-items:center;
    justify-content:center;
    background: rgba(0,0,0,.42);
    z-index: 9999;
    padding: 0;
  }

  .mc{
    width:100%;
    max-width: 560px;
    background: rgba(255,255,255,.92);
    border: 1px solid rgba(255,255,255,.60);
    border-radius: 24px;
    box-shadow: 0 35px 95px rgba(0,0,0,.28);
    backdrop-filter: blur(14px);
    max-height: 100vh;
    display:flex;
    flex-direction:column;
    overflow:hidden;
    margin: 0;
  }

  .mHeader{
    display:flex;
    align-items:flex-start;
    justify-content:space-between;
    gap: 10px;
    padding: 18px 18px 10px;
    border-bottom: 1px solid rgba(17,24,39,.08);
  }

  .mBody{
    padding: 12px 18px;
    overflow:auto;
    -webkit-overflow-scrolling: touch;
  }

  .mActions{
    padding: 12px 18px;
    border-top: 1px solid rgba(17,24,39,.08);
    background: rgba(255,255,255,.92);
  }

  .xBtn{
    border:none;
    width: 40px; height: 40px;
    border-radius: 14px;
    cursor:pointer;
    font-weight: 1100;
    background: rgba(17,24,39,.08);
    flex: 0 0 auto;
  }

  .pill{
    display:inline-block;
    padding:6px 12px;
    border-radius:999px;
    font-weight:1000;
    font-size:12px;
    border: 1px solid rgba(0,0,0,.08);
    margin-bottom:8px;
    background: rgba(124,58,237,.12);
    color:#4c1d95;
  }
  .pill.success{ background: rgba(34,197,94,.14); color:#0f5132; }
  .pill.error{ background: rgba(255,45,85,.12); color:#9f1239; }
  .pill.info{ background: rgba(124,58,237,.12); color:#4c1d95; }
  .pill.confirm{ background: rgba(255,193,7,.14); color:#7c2d12; }

  .mt{ margin: 0; font-weight:1100; color:var(--ink); font-size:18px; }
  .mm{ margin: 0; color: rgba(11,18,32,.78); font-weight:900; line-height:1.45; }

  .mRow{
    display:flex;
    gap:10px;
    justify-content:flex-end;
    flex-wrap:wrap;
  }
  .mBtn{
    flex: 1 1 140px;
    border:none;
    padding:12px 14px;
    border-radius:16px;
    background: linear-gradient(90deg, #111827 0%, #334155 100%);
    color:#fff;
    font-weight:1100;
    cursor:pointer;
    text-align:center;
    white-space: nowrap;
  }
  .mBtn.ghost{ background: rgba(17,24,39,.08); color:#111827; }
  .mBtn.danger{ background: linear-gradient(90deg, #9f1239 0%, #ef4444 100%); }

  .detailGrid{
    display:grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .kv{
    background: rgba(255,255,255,.72);
    border: 1px solid rgba(11,18,32,.08);
    border-radius: 18px;
    padding: 10px;
  }
  .kv span{ display:block; font-size: 11px; font-weight: 950; color: rgba(11,18,32,.58); }
  .kv b{ display:block; margin-top: 6px; font-weight: 1100; font-size: 13px; word-break: break-word; }
  .kv.full{ grid-column: 1 / -1; }

  .form{ margin:0; }
  .lbl{ display:block; font-weight:1000; color: rgba(11,18,32,.85); margin: 10px 0 6px; font-size: 13px; }
  .inp{
    width:100%;
    padding: 12px 12px;
    border-radius: 16px;
    border: 1px solid rgba(17,24,39,.10);
    outline:none;
    font-weight: 900;
    background: rgba(255,255,255,.75);
  }
  .row2{ display:grid; grid-template-columns: 1fr 1fr; gap: 10px; }

  @media (max-width: 760px){
    .topActions{ width:100%; }
    .search, .btn{ width:100%; }
    .card{ flex-direction:column; align-items:flex-start; }
    .cardRight{ width:100%; justify-content:flex-start; }
    .detailGrid{ grid-template-columns: 1fr; }
    .row2{ grid-template-columns: 1fr; }
    .mc{ max-width: 100%; border-radius: 0; }
  }
`;
