import React from "react";

export default function NavbarDoc({ displayName, displayEmail, logout }) {
  const safeName = (displayName || "User").trim() || "User";
  const safeEmail = (displayEmail || "").trim();

  return (
    <>
      <style>{`
        /* ================= ROOT NAV ================= */
        .navDoc {
          position: sticky;
          top: 0;
          z-index: 50;
          background: linear-gradient(
            135deg,
            #1f1147,
            #2a145f,
            #3a1c71
          );
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
          color: #f8fafc;
        }

        /* ================= TOP ACCENT ================= */
        .navAccent {
          height: 4px;
          background: linear-gradient(
            90deg,
            #ec4899,
            #facc15,
            #a855f7
          );
        }

        .navInner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 14px 16px;
          display: flex;
          gap: 12px;
          align-items: center;
          justify-content: space-between;
        }

        /* ================= LEFT ================= */
        .navLeft { min-width: 220px; }

        .navTitleWrap {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .navBadge {
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          background: linear-gradient(
            135deg,
            rgba(236, 72, 153, 0.25),
            rgba(250, 204, 21, 0.2)
          );
          border: 1px solid rgba(255, 255, 255, 0.18);
          box-shadow: 0 10px 30px rgba(236, 72, 153, 0.35);
          font-size: 18px;
          user-select: none;
        }

        .titleStack {
          display: grid;
          line-height: 1.1;
        }

        .navTitle {
          font-weight: 800;
          font-size: 18px;
          letter-spacing: 0.3px;
          color: #fdf4ff;
        }

        .navSub {
          margin-top: 4px;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.7);
        }

        /* ================= RIGHT ================= */
        .navRight {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .userCard {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          border-radius: 16px;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.12),
            rgba(255, 255, 255, 0.06)
          );
          border: 1px solid rgba(255, 255, 255, 0.18);
          box-shadow: 0 14px 35px rgba(0, 0, 0, 0.35);
          transition: transform 180ms ease, box-shadow 180ms ease;
          min-width: 260px;
        }

        .userCard:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 45px rgba(236, 72, 153, 0.35);
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          font-weight: 800;
          color: #1f1147;
          background: radial-gradient(
            circle at 30% 30%,
            #facc15,
            #ec4899
          );
          border: 1px solid rgba(255, 255, 255, 0.35);
          user-select: none;
          flex: 0 0 auto;
        }

        .userInfo {
          display: grid;
          gap: 2px;
          min-width: 0;
          flex: 1;
        }

        .userInfo .name {
          font-weight: 800;
          font-size: 14px;
          color: #ffffff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .userInfo .email {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.75);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* ================= LOGOUT BUTTON ================= */
        .logoutBtn {
          border: none;
          background: linear-gradient(
            135deg,
            #ef4444,
            #dc2626
          );
          color: #ffffff;
          font-weight: 800;
          padding: 10px 16px;
          border-radius: 16px;
          cursor: pointer;
          box-shadow: 0 14px 35px rgba(239, 68, 68, 0.45);
          transition: transform 120ms ease, box-shadow 120ms ease, filter 120ms ease;
        }

        .logoutBtn:hover {
          filter: brightness(1.08);
          transform: translateY(-2px);
          box-shadow: 0 20px 45px rgba(239, 68, 68, 0.55);
        }

        .logoutBtn:active {
          transform: scale(0.96);
          box-shadow: 0 10px 20px rgba(239, 68, 68, 0.4);
        }

        /* ================= MOBILE ================= */
        @media (max-width: 720px) {
          .navInner {
            flex-direction: column;
            align-items: stretch;
          }

          .navRight {
            width: 100%;
            justify-content: space-between;
          }

          .userCard {
            flex: 1;
            min-width: 0;
          }
        }

        @media (max-width: 420px) {
          .navSub { display: none; }
        }
      `}</style>

      <header className="navDoc">
        <div className="navAccent" />

        <div className="navInner">
          {/* Left */}
          <div className="navLeft">
            <div className="navTitleWrap">
              <span className="navBadge">🧾</span>
              <div className="titleStack">
                <span className="navTitle">User Dashboard</span>
                <span className="navSub">Manage your documents & profile</span>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="navRight">
            <div className="userCard">
              <div className="avatar">
                {safeName.charAt(0).toUpperCase()}
              </div>
              <div className="userInfo">
                <div className="name">{safeName}</div>
                {safeEmail && <div className="email">{safeEmail}</div>}
              </div>
            </div>

            <button className="logoutBtn" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
