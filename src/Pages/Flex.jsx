// Pages/Flex.jsx
import React, { useMemo, useState } from "react";
import cibilPng from "../assets/cibiln.png"; // ✅ src/assets/cibiln.png

export default function Flex() {
  const data = useMemo(
    () => ({
      productName: "FlexSalary Loan",
      welcomeName: "Ajay Pravin Kedar",
      info:
        "Instant personal loan with Aadhaar & PAN verification.\nFast approval with flexible repayment options.",
      months: [
        { month: "October", emi: 0, status: "Paid" },
        { month: "November", emi: 17300, status: "Overdue" },
      ],
      penalty: { remaining: 108700, todayAdded: 2000 },
      cibilScore: 329,
      totalOutstanding: 128000, // EMI + penalty + today penalty
    }),
    []
  );

  // ✅ Settlement logic:
  // Pay full penalty today + 50% of EMI (17300 / 2 = 8650)
  const settlement = useMemo(() => {
    const halfEmi = Math.round(17300 * 0.5); // 8650
    const penaltyTodayTotal = data.penalty.remaining + data.penalty.todayAdded; // 108700
    const settleAmount = penaltyTodayTotal + halfEmi; // 117350
    return {
      halfEmi,
      penaltyTodayTotal,
      settleAmount,
    };
  }, [data.penalty.remaining, data.penalty.todayAdded]);

  const [payOpen, setPayOpen] = useState(false);
  const [settleOpen, setSettleOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("UPI");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const inr = (n) => "₹" + Number(n).toLocaleString("en-IN");

  const closeAll = () => {
    setPayOpen(false);
    setSettleOpen(false);
    setProcessing(false);
    setSuccess(false);
    setSelectedMethod("UPI");
  };

  const fakePay = async () => {
    setProcessing(true);
    setSuccess(false);
    await new Promise((r) => setTimeout(r, 900));
    setProcessing(false);
    setSuccess(true);
    setTimeout(() => closeAll(), 1200);
  };

  return (
    <div style={S.page}>
      <div style={S.container}>
        {/* HEADER (logo + icon only professional) */}
        <header style={S.header}>
          <div style={S.brandWrap}>
            <div style={S.brandIcon} aria-hidden="true">
              F
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={S.brandTitle}>{data.productName}</div>
              <div style={S.brandSub}>
                {data.info.split("\n").map((t, i) => (
                  <div key={i}>{t}</div>
                ))}
              </div>
            </div>
          </div>

          <div style={S.welcomeBox}>
            <div style={S.welcomeLabel}>Welcome</div>
            <div style={S.welcomeName}>{data.welcomeName}</div>
          </div>
        </header>

        {/* TOTAL OUTSTANDING */}
        <section style={S.card}>
          <div style={S.cardTop}>
            <div>
              <div style={S.label}>Total Outstanding</div>
              <div style={S.totalAmount}>{inr(data.totalOutstanding)}</div>
              <div style={S.subText}>
                EMI {inr(17300)} + Penalty {inr(108700)} + Today {inr(2000)}
              </div>
            </div>
            <div style={S.pillOverdue}>Overdue</div>
          </div>

          <div style={S.breakGrid}>
            <div style={S.breakItem}>
              <div style={S.breakK}>EMI Due</div>
              <div style={S.breakV}>{inr(17300)}</div>
            </div>

            <div style={{ ...S.breakItem, ...S.breakDanger }}>
              <div style={S.breakK}>Penalty</div>
              <div style={{ ...S.breakV, ...S.dangerText }}>{inr(106700)}</div>
            </div>

            <div style={{ ...S.breakItem, ...S.breakDanger }}>
              <div style={S.breakK}>Today Added</div>
              <div style={{ ...S.breakV, ...S.dangerText }}>{inr(2000)}</div>
            </div>
          </div>

          <div style={S.actionGrid}>
            <button style={S.btnPrimary} onClick={() => setPayOpen(true)} type="button">
              Pay Now
            </button>
            <button
              style={S.btnOutline}
              onClick={() => setSettleOpen(true)}
              type="button"
            >
              Settlement
            </button>
          </div>
        </section>

        {/* MONTH STATUS */}
        <section style={S.card}>
          <div style={S.sectionTitle}>Monthly EMI Status</div>

          {data.months.map((m, idx) => {
            const overdue = m.status === "Overdue";
            return (
              <div key={idx} style={S.row}>
                <div>
                  <div style={S.rowTitle}>{m.month}</div>
                  <div style={{ ...S.rowSub, ...(overdue ? S.dangerText : S.okText) }}>
                    {m.status}
                  </div>
                </div>

                <div style={{ ...S.rowAmount, ...(overdue ? S.dangerText : S.okText) }}>
                  {inr(m.emi)}
                </div>
              </div>
            );
          })}
        </section>

        {/* PENALTY (red only) */}
        <section style={S.penaltyCard}>
          <div style={S.penaltyTop}>
            <div>
              <div style={S.penaltyTitle}>Penalty</div>
              <div style={S.penaltySub}>
                Penalty is increasing due to repeated missed payments.
              </div>
            </div>
            <div style={S.penaltyBadge}>High</div>
          </div>

          <div style={S.penaltyGrid}>
            <div style={S.penaltyLine}>
              <span>Penalty Remaining</span>
              <b style={S.dangerText}>{inr(data.penalty.remaining)}</b>
            </div>
            <div style={S.penaltyLine}>
              <span>Today Added</span>
              <b style={S.dangerText}>{inr(data.penalty.todayAdded)}</b>
            </div>
            <div style={S.hr} />
            <div style={S.penaltyLine}>
              <span>Penalty Payable Now</span>
              <b style={S.dangerText}>
                {inr(data.penalty.remaining + data.penalty.todayAdded)}
              </b>
            </div>
          </div>
        </section>

        {/* WARNING ALERT (red) */}
        <section style={S.alert} role="alert">
          <div style={S.alertIcon}>!</div>
          <div style={{ minWidth: 0 }}>
            <div style={S.alertTitle}>Immediate action required</div>
            <div style={S.alertText}>
              Your CIBIL score may be affected because the loan is overdue. Please pay
              immediately to avoid additional charges.
            </div>
          </div>
        </section>

        {/* CIBIL */}
        <button style={S.cibilBtn} type="button">
          <div style={S.cibilCircle}>
            <img src={cibilPng} alt="CIBIL" style={S.cibilImg} />
            <div style={S.cibilScore}>{data.cibilScore}</div>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={S.cibilTitle}>CIBIL Score</div>
            <div style={S.cibilSub}>Low score due to overdue payments</div>
          </div>
          <div style={S.chev}>›</div>
        </button>

        {/* OPTIONS (black text, professional icons) */}
        <section style={S.card}>
          <div style={S.sectionTitle}>Options</div>

          <div style={S.optList}>
            <Option icon={<UserIcon />} title="Account" subtitle="Loan details, profile & KYC" />
            <Option icon={<CardIcon />} title="Payment Method" subtitle="UPI / Card / Netbanking" />
            <Option icon={<PhoneIcon />} title="Query / Contact" subtitle="Support, disputes & helpdesk" />
          </div>

          <button style={S.btnSoft} type="button">
            Message Me
          </button>
        </section>

        <div style={S.footerNote}>
          Late payment may impact your credit score and may lead to recovery actions.
        </div>
      </div>

      {/* PAY NOW MODAL */}
      {payOpen && (
        <Modal onClose={closeAll} title="Pay Outstanding Amount" subtitle="Select a payment method (demo)">
          <AmountBox
            amount={inr(data.totalOutstanding)}
            note={`EMI ${inr(17300)} + Penalty ${inr(106700)} + Today ${inr(2000)}`}
            danger
          />

          <div style={S.modalSectionTitle}>Payment Options</div>
          <div style={S.methodGrid}>
            <Method active={selectedMethod === "UPI"} onClick={() => setSelectedMethod("UPI")} icon={<UpiIcon />} title="UPI" subtitle="Google Pay, PhonePe, Paytm" />
            <Method active={selectedMethod === "Card"} onClick={() => setSelectedMethod("Card")} icon={<CardIcon />} title="Debit / Credit Card" subtitle="Visa, MasterCard, RuPay" />
            <Method active={selectedMethod === "Netbanking"} onClick={() => setSelectedMethod("Netbanking")} icon={<BankIcon />} title="Netbanking" subtitle="All major banks supported" />
            <Method active={selectedMethod === "Wallet"} onClick={() => setSelectedMethod("Wallet")} icon={<WalletIcon />} title="Wallet" subtitle="Paytm Wallet, Amazon Pay" />
          </div>

          <div style={S.modalFooter}>
            <button style={S.btnCancel} onClick={closeAll} type="button">
              Cancel
            </button>
            <button
              style={{ ...S.btnPrimary, opacity: processing ? 0.85 : 1 }}
              onClick={fakePay}
              type="button"
              disabled={processing}
            >
              {processing ? "Processing..." : `Pay ${inr(data.totalOutstanding)}`}
            </button>
          </div>

          {success && <div style={S.successBox}>✅ Payment Successful (Demo)</div>}
        </Modal>
      )}

      {/* SETTLEMENT MODAL (ONLY penalty today + 50% EMI) */}
      {settleOpen && (
        <Modal onClose={closeAll} title="Settlement Offer" subtitle="Pay today to reduce outstanding (demo)">
          <div style={S.settleNote}>
            Settlement includes <b>full penalty payable today</b> and <b>50% of EMI amount</b>.
          </div>

          <AmountBox
            amount={inr(settlement.settleAmount)}
            note={`Penalty Today ${inr(settlement.penaltyTodayTotal)} + 50% EMI ${inr(settlement.halfEmi)}`}
            danger
          />

          <div style={S.settleBreak}>
            <div style={S.settleRow}>
              <span>Penalty payable today</span>
              <b style={S.dangerText}>{inr(settlement.penaltyTodayTotal)}</b>
            </div>
            <div style={S.settleRow}>
              <span>50% EMI (17300 cut)</span>
              <b>{inr(settlement.halfEmi)}</b>
            </div>
            <div style={S.hr} />
            <div style={S.settleRow}>
              <span>Total settlement amount</span>
              <b style={S.dangerText}>{inr(settlement.settleAmount)}</b>
            </div>
          </div>

          <div style={S.modalSectionTitle}>Payment Options</div>
          <div style={S.methodGrid}>
            <Method active={selectedMethod === "UPI"} onClick={() => setSelectedMethod("UPI")} icon={<UpiIcon />} title="UPI" subtitle="Google Pay, PhonePe, Paytm" />
            <Method active={selectedMethod === "Card"} onClick={() => setSelectedMethod("Card")} icon={<CardIcon />} title="Debit / Credit Card" subtitle="Visa, MasterCard, RuPay" />
            <Method active={selectedMethod === "Netbanking"} onClick={() => setSelectedMethod("Netbanking")} icon={<BankIcon />} title="Netbanking" subtitle="All major banks supported" />
            <Method active={selectedMethod === "Wallet"} onClick={() => setSelectedMethod("Wallet")} icon={<WalletIcon />} title="Wallet" subtitle="Paytm Wallet, Amazon Pay" />
          </div>

          <div style={S.modalFooter}>
            <button style={S.btnCancel} onClick={closeAll} type="button">
              Cancel
            </button>
            <button
              style={{ ...S.btnPrimary, opacity: processing ? 0.85 : 1 }}
              onClick={fakePay}
              type="button"
              disabled={processing}
            >
              {processing ? "Processing..." : `Pay ${inr(settlement.settleAmount)}`}
            </button>
          </div>

          {success && <div style={S.successBox}>✅ Settlement Successful (Demo)</div>}
        </Modal>
      )}
    </div>
  );
}

/* ======================= Reusable UI Components ======================= */

function Option({ icon, title, subtitle }) {
  return (
    <button style={S.optItem} type="button">
      <div style={S.optIcon}>{icon}</div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={S.optTitle}>{title}</div>
        <div style={S.optSub}>{subtitle}</div>
      </div>
      <div style={S.chevSmall}>›</div>
    </button>
  );
}

function Modal({ title, subtitle, children, onClose }) {
  return (
    <div style={S.modalOverlay} onClick={onClose} role="presentation">
      <div style={S.modalCard} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div style={S.modalHeader}>
          <div>
            <div style={S.modalTitle}>{title}</div>
            <div style={S.modalSub}>{subtitle}</div>
          </div>
          <button style={S.closeBtn} onClick={onClose} aria-label="Close" type="button">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AmountBox({ amount, note, danger }) {
  return (
    <div style={danger ? S.amountBoxDanger : S.amountBox}>
      <div style={S.amountLabel}>Amount</div>
      <div style={danger ? S.amountValueDanger : S.amountValue}>{amount}</div>
      <div style={S.amountNote}>{note}</div>
    </div>
  );
}

function Method({ active, title, subtitle, icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...S.methodCard,
        ...(active ? S.methodActive : {}),
      }}
    >
      <div style={S.methodIcon}>{icon}</div>
      <div style={{ minWidth: 0 }}>
        <div style={S.methodName}>{title}</div>
        <div style={S.methodSub}>{subtitle}</div>
      </div>
      <div style={S.methodTick}>{active ? "✓" : ""}</div>
    </button>
  );
}

/* ===================== Professional SVG Icons (No Library) ===================== */
function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Z"
        stroke="#0f172a"
        strokeWidth="2"
      />
      <path
        d="M4 20c1.8-4 14.2-4 16 0"
        stroke="#0f172a"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M22 16.9v3a2 2 0 0 1-2.2 2A19.9 19.9 0 0 1 3 5.2 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.7c.1.8.3 1.6.6 2.3a2 2 0 0 1-.4 2.1L9 10.3a16 16 0 0 0 4.7 4.7l1.2-1.2a2 2 0 0 1 2.1-.4c.7.3 1.5.5 2.3.6A2 2 0 0 1 22 16.9Z"
        stroke="#0f172a"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function CardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"
        stroke="#0f172a"
        strokeWidth="2"
      />
      <path d="M3 10h18" stroke="#0f172a" strokeWidth="2" />
      <path d="M7 15h4" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function UpiIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 7l2 14" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
      <path d="M17 7l-2 14" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function BankIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 4 3 9h18l-9-5Z"
        stroke="#0f172a"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M3 10h18" stroke="#0f172a" strokeWidth="2" />
      <path d="M5 10v10M9 10v10M15 10v10M19 10v10" stroke="#0f172a" strokeWidth="2" />
      <path d="M2 20h20" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function WalletIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2H5a2 2 0 0 0-2 2V7Z"
        stroke="#0f172a"
        strokeWidth="2"
      />
      <path
        d="M3 11a2 2 0 0 1 2-2h16v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V11Z"
        stroke="#0f172a"
        strokeWidth="2"
      />
      <path d="M17 15h2" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ===================== Styles (Black text; Red only for penalty/warning) ===================== */
const S = {
  page: {
     minHeight: "100vh",
  padding: 14,
  paddingTop: "calc(18px + env(safe-area-inset-top))", // ✅ notch safe
  background: "linear-gradient(180deg, #ffffff 0%, #f3f7ff 60%, #ffffff 100%)",
    fontFamily:
      "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
    color: "#0f172a",
  },
  container: {
    maxWidth: 430,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  brandWrap: { display: "flex", gap: 10, minWidth: 0, flex: 1 },
  brandIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    fontWeight: 950,
    color: "#ffffff",
    background: "linear-gradient(135deg, #4f46e5, #06b6d4)",
    boxShadow: "0 12px 25px rgba(79,70,229,0.18)",
    flex: "0 0 auto",
  },
  brandTitle: { fontSize: 18, fontWeight: 950, color: "#0f172a", lineHeight: 1.1 },
  brandSub: { marginTop: 4, fontSize: 12.5, color: "#334155", lineHeight: 1.35 },

  welcomeBox: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    padding: "10px 12px",
    borderRadius: 14,
    boxShadow: "0 10px 25px rgba(15, 23, 42, 0.05)",
    textAlign: "right",
    flex: "0 0 auto",
  },
  welcomeLabel: { fontSize: 11, fontWeight: 900, color: "#64748b" },
  welcomeName: { fontSize: 12.5, fontWeight: 950, color: "#0f172a" },

  card: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 18,
    padding: 14,
    boxShadow: "0 14px 30px rgba(15, 23, 42, 0.06)",
  },
  cardTop: { display: "flex", justifyContent: "space-between", gap: 10 },
  label: { fontSize: 12, fontWeight: 900, color: "#64748b" },
  totalAmount: { fontSize: 26, fontWeight: 950, color: "#dd1732ff", marginTop: 3 },
  subText: { marginTop: 6, fontSize: 12, color: "#334155" },
  pillOverdue: {
    padding: "7px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 950,
    color: "#b91c1c",
    background: "#fee2e2",
    border: "1px solid #fecaca",
    height: "fit-content",
  },

  breakGrid: { marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 },
  breakItem: { padding: 10, borderRadius: 14, border: "1px solid #e2e8f0", background: "#f8fafc" },
  breakDanger: { background: "#fff1f2", borderColor: "#fecdd3" },
  breakK: { fontSize: 11.5, fontWeight: 950, color: "#64748b" },
  breakV: { marginTop: 4, fontSize: 13.5, fontWeight: 950, color: "#0f172a" },

  actionGrid: { marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  btnPrimary: {
    border: "none",
    borderRadius: 14,
    padding: "12px 14px",
    cursor: "pointer",
    fontWeight: 950,
    background: "linear-gradient(135deg, #22c55e, #06b6d4)",
    color: "#052e1a",
  },
  btnOutline: {
    border: "1px solid #cbd5e1",
    borderRadius: 14,
    padding: "12px 14px",
    cursor: "pointer",
    fontWeight: 950,
    background: "#ffffff",
    color: "#0f172a",
  },
  btnSoft: {
    marginTop: 12,
    width: "100%",
    borderRadius: 14,
    padding: "12px 14px",
    border: "1px solid #cbd5e1",
    background: "#f8fafc",
    fontWeight: 950,
    cursor: "pointer",
    color: "#0f172a",
  },

  sectionTitle: { fontSize: 14.5, fontWeight: 950, marginBottom: 10, color: "#0f172a" },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    marginBottom: 10,
  },
  rowTitle: { fontWeight: 950, color: "#0f172a" },
  rowSub: { marginTop: 2, fontSize: 12.5, fontWeight: 900 },
  rowAmount: { fontWeight: 950 },

  penaltyCard: {
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    borderRadius: 18,
    padding: 14,
  },
  penaltyTop: { display: "flex", justifyContent: "space-between", gap: 10 },
  penaltyTitle: { fontSize: 15, fontWeight: 950, color: "#b91c1c" },
  penaltySub: { marginTop: 4, fontSize: 12.5, color: "#0f172a", lineHeight: 1.35 },
  penaltyBadge: {
    padding: "7px 10px",
    borderRadius: 999,
    fontWeight: 950,
    fontSize: 12,
    color: "#b91c1c",
    background: "#fee2e2",
    border: "1px solid #fecaca",
    height: "fit-content",
  },
  penaltyGrid: { marginTop: 12, display: "flex", flexDirection: "column", gap: 10 },
  penaltyLine: { display: "flex", justifyContent: "space-between", fontSize: 13, color: "#0f172a" },

  alert: {
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 18,
    background: "#fff1f2",
    border: "1px solid #fecdd3",
  },
  alertIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    fontWeight: 950,
    background: "#fee2e2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    flex: "0 0 auto",
  },
  alertTitle: { fontWeight: 950, fontSize: 14.5, color: "#b91c1c" },
  alertText: { marginTop: 4, fontSize: 12.5, color: "#0f172a", lineHeight: 1.35 },

  cibilBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 18,
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    boxShadow: "0 14px 30px rgba(15, 23, 42, 0.06)",
    cursor: "pointer",
    textAlign: "left",
  },
  cibilCircle: {
    width: 64,
    height: 64,
    borderRadius: 999,
    position: "relative",
    overflow: "hidden",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    display: "grid",
    placeItems: "center",
    flex: "0 0 auto",
  },
  cibilImg: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.18 },
  cibilScore: { position: "relative", fontWeight: 950, fontSize: 18, color: "#0f172a" },
  cibilTitle: { fontWeight: 950, fontSize: 14.5, color: "#0f172a" },
  cibilSub: { marginTop: 3, fontSize: 12.5, color: "#334155" },
  chev: { marginLeft: "auto", fontSize: 22, fontWeight: 900, color: "#64748b" },

  optList: { display: "flex", flexDirection: "column", gap: 10 },
  optItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 16,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
    textAlign: "left",
  },
  optIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
  },
  optTitle: { fontWeight: 950, color: "#0f172a" },
  optSub: { marginTop: 2, fontSize: 12.5, color: "#334155", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  chevSmall: { fontSize: 22, fontWeight: 900, color: "#64748b" },

  footerNote: { fontSize: 12, textAlign: "center", color: "#334155", paddingBottom: 6 },

  hr: { height: 1, background: "#fecaca", marginTop: 2 },

  amountBox: { marginTop: 12, borderRadius: 18, border: "1px solid #e2e8f0", background: "#f8fafc", padding: 12 },
  amountBoxDanger: { marginTop: 12, borderRadius: 18, border: "1px solid #fecaca", background: "#fff1f2", padding: 12 },
  amountLabel: { fontSize: 12, fontWeight: 950, color: "#0f172a" },
  amountValue: { marginTop: 4, fontSize: 22, fontWeight: 950, color: "#0f172a" },
  amountValueDanger: { marginTop: 4, fontSize: 22, fontWeight: 950, color: "#b91c1c" },
  amountNote: { marginTop: 6, fontSize: 12, color: "#334155" },

  modalOverlay: {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.25)",
  display: "grid",
  placeItems: "center", // ✅ center
  padding: 14,
  paddingBottom: "calc(14px + env(safe-area-inset-bottom))", // ✅ bottom safe
  zIndex: 50
},

  modalCard: {
  width: "100%",
  maxWidth: 430,
  borderRadius: 20,
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  boxShadow: "0 18px 60px rgba(15, 23, 42, 0.18)",
  padding: 14,

  // ✅ ensure modal fits mobile screen & buttons stay visible
  maxHeight: "calc(100vh - 24px - env(safe-area-inset-top) - env(safe-area-inset-bottom))",
  overflow: "auto",
  WebkitOverflowScrolling: "touch",
},

  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
  modalTitle: { fontWeight: 950, fontSize: 15.5, color: "#0f172a" },
  modalSub: { marginTop: 3, fontSize: 12.5, color: "#334155" },
  closeBtn: { border: "1px solid #e2e8f0", background: "#f8fafc", borderRadius: 12, padding: "8px 10px", cursor: "pointer", fontWeight: 900, color: "#0f172a" },

  modalSectionTitle: { marginTop: 12, fontSize: 13.5, fontWeight: 950, color: "#0f172a" },
  methodGrid: { marginTop: 10, display: "grid", gridTemplateColumns: "1fr", gap: 10 },
  methodCard: { display: "flex", alignItems: "center", gap: 12, padding: 12, borderRadius: 16, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", textAlign: "left" },
  methodActive: { borderColor: "#60a5fa", background: "#eff6ff" },
  methodIcon: { width: 40, height: 40, borderRadius: 14, display: "grid", placeItems: "center", background: "#ffffff", border: "1px solid #e2e8f0" },
  methodName: { fontWeight: 950, color: "#0f172a" },
  methodSub: { marginTop: 2, fontSize: 12.5, color: "#334155" },
  methodTick: { marginLeft: "auto", fontWeight: 950, color: "#16a34a" },

  modalFooter: { marginTop: 12, display: "flex", gap: 10 },
  btnCancel: { flex: 1, border: "1px solid #e2e8f0", background: "#f8fafc", borderRadius: 14, padding: "12px 14px", fontWeight: 950, cursor: "pointer", color: "#0f172a" },

  successBox: { marginTop: 10, borderRadius: 14, padding: 10, background: "#dcfce7", border: "1px solid #86efac", color: "#14532d", fontWeight: 900, textAlign: "center" },

  settleNote: { marginTop: 10, fontSize: 12.5, color: "#0f172a", lineHeight: 1.35 },
  settleBreak: { marginTop: 12, borderRadius: 18, border: "1px solid #e2e8f0", background: "#f8fafc", padding: 12, display: "flex", flexDirection: "column", gap: 10 },
  settleRow: { display: "flex", justifyContent: "space-between", fontSize: 13, color: "#0f172a" },

  dangerText: { color: "#b91c1c" },
  okText: { color: "#16a34a" },
};
