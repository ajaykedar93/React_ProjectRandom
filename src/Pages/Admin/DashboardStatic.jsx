import React, { useMemo } from "react";

export default function DashboardStatic() {
  const adminNotes = useMemo(
    () => [
      {
        title: "Keep footer tagline short & professional",
        info: "Best readability on mobile + clean brand look.",
        color: "green",
      },
      {
        title: "Add only valid social links",
        info: "Use correct URLs for WhatsApp, Instagram, Facebook, etc.",
        color: "purple",
      },
      {
        title: "Maintain only one Active footer",
        info: "Avoid multiple active records to prevent UI confusion.",
        color: "pink",
      },
      {
        title: "Review settings before publishing changes",
        info: "Always check the final UI view after update.",
        color: "blue",
      },
    ],
    []
  );

  const securityPoints = useMemo(
    () => [
      {
        title: "Do not share admin credentials",
        info: "Keep password private and never store it in plain text.",
        color: "green",
      },
      {
        title: "Use strong passwords & change regularly",
        info: "Minimum 8+ characters with symbols and numbers.",
        color: "purple",
      },
      {
        title: "Restrict admin panel access",
        info: "Only authorized users should access admin routes.",
        color: "pink",
      },
      {
        title: "Logout after work",
        info: "Especially on shared devices or public networks.",
        color: "blue",
      },
    ],
    []
  );

  return (
    <div className="dsx">
      <style>{css}</style>

      <div className="dsx-head">
        <div className="dsx-title">Admin Notes & Security</div>
        <div className="dsx-sub">Important points for managing website settings safely.</div>
      </div>

      <div className="dsx-grid">
        {/* Admin Notes */}
        <section className="dsx-card">
          <div className="dsx-cardTop">
            <div className="dsx-cardTitle">Admin Notes</div>
            <span className="dsx-chip red">Important</span>
          </div>

          <div className="dsx-list">
            {adminNotes.map((n, i) => (
              <PointRow key={i} title={n.title} info={n.info} color={n.color} />
            ))}
          </div>
        </section>

        {/* Security Points */}
        <section className="dsx-card">
          <div className="dsx-cardTop">
            <div className="dsx-cardTitle">Security Points</div>
            <span className="dsx-chip red">Secure</span>
          </div>

          <div className="dsx-list">
            {securityPoints.map((n, i) => (
              <PointRow key={i} title={n.title} info={n.info} color={n.color} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function PointRow({ title, info, color }) {
  return (
    <div className="dsx-item">
      <div className="dsx-point">• {title}</div>

      <div className="dsx-infoRow">
        <span className={`dsx-badge ${color}`} />
        <span className="dsx-info">{info}</span>
      </div>
    </div>
  );
}

const css = `
.dsx{
  width: 100%;
  margin: 0;
  padding: 0;
  color: #0b1220;
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial;
}

.dsx-head{
  padding: 10px 6px 12px;
}

.dsx-title{
  font-weight: 1600;
  font-size: 16px;
  letter-spacing: .2px;
}

.dsx-sub{
  margin-top: 6px;
  font-weight: 1100;
  font-size: 12.5px;
  color: rgba(11,18,32,.65);
  line-height: 1.45;
}

.dsx-grid{
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.dsx-card{
  border-radius: 18px;
  background: rgba(255,255,255,.94);
  border: 1px solid rgba(11,18,32,.08);
  box-shadow: 0 14px 44px rgba(0,0,0,.10);
  overflow: hidden;
}

.dsx-cardTop{
  padding: 12px;
  display:flex;
  align-items:center;
  justify-content: space-between;
  gap: 10px;
  border-bottom: 1px solid rgba(11,18,32,.06);
}

.dsx-cardTitle{
  font-weight: 1600;
  font-size: 14px;
}

.dsx-chip{
  padding: 7px 10px;
  border-radius: 999px;
  font-weight: 1500;
  font-size: 12px;
  border: 1px solid rgba(0,0,0,.08);
  background: rgba(0,0,0,.03);
}

.dsx-chip.red{
  color: #8B0000;
  border-color: rgba(139,0,0,.18);
  background: rgba(139,0,0,.06);
}

.dsx-list{
  padding: 12px;
  display:flex;
  flex-direction: column;
  gap: 12px;
}

.dsx-item{
  padding: 12px;
  border-radius: 16px;
  background: rgba(0,0,0,.02);
  border: 1px solid rgba(0,0,0,.06);
  box-shadow: 0 12px 34px rgba(0,0,0,.06);
}

/* ✅ Bold red point text */
.dsx-point{
  font-weight: 1600;
  font-size: 13px;
  color: #8B0000;
  line-height: 1.35;
}

/* ✅ Colored info row below */
.dsx-infoRow{
  margin-top: 10px;
  display:flex;
  align-items:center;
  gap: 10px;
}

.dsx-badge{
  width: 12px;
  height: 12px;
  border-radius: 999px;
  box-shadow: 0 0 0 6px rgba(0,0,0,.04);
  flex: 0 0 auto;
}

/* color dots */
.dsx-badge.green{ background: #16a34a; box-shadow: 0 0 0 6px rgba(22,163,74,.12); }
.dsx-badge.purple{ background: #7c3aed; box-shadow: 0 0 0 6px rgba(124,58,237,.12); }
.dsx-badge.pink{ background: #ec4899; box-shadow: 0 0 0 6px rgba(236,72,153,.12); }
.dsx-badge.blue{ background: #3b82f6; box-shadow: 0 0 0 6px rgba(59,130,246,.12); }

.dsx-info{
  font-weight: 1200;
  font-size: 12.5px;
  color: rgba(11,18,32,.74);
  line-height: 1.45;
}

/* Desktop */
@media (min-width: 900px){
  .dsx-grid{
    grid-template-columns: 1fr 1fr;
  }
  .dsx-title{ font-size: 18px; }
}
`;
