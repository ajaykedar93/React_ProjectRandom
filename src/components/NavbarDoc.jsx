import React from "react";

export default function NavbarDoc({ displayName, displayEmail, logout }) {
  const safeName = displayName || "User";
  const safeEmail = displayEmail || "";

  return (
    <header className="navDoc">
      {/* Left: Title */}
      <div className="navLeft">
        <div className="navTitleWrap">
          <span className="navBadge" aria-hidden="true">
            🧾
          </span>
          <span className="navTitle">User Dashboard</span>
        </div>
      </div>

      {/* Right: User Info */}
      <div className="navRight">
        <div className="userCard">
          <div className="avatar" aria-hidden="true">
            {safeName.trim().charAt(0).toUpperCase()}
          </div>

          <div className="userInfo">
            <div className="name">{safeName}</div>
            <div className="email">{safeEmail}</div>
          </div>
        </div>

        {/* ✅ Logout button always visible */}
        <button type="button" className="logoutBtn" onClick={logout}>
          Logout
        </button>
      </div>

      <style>{css}</style>
    </header>
  );
}

const css = `
  .navDoc{
    position: sticky;
    top: 0;
    z-index: 60;
    width: 100%;
    display:flex;
    align-items:center;
    justify-content: space-between;
    gap: 14px;
    padding: 10px 18px;

    background: rgba(255,255,255,.88);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(0,0,0,.08);
    box-shadow: 0 14px 40px rgba(0,0,0,.08);
  }

  .navLeft{ min-width: 0; }

  .navTitleWrap{
    display:flex;
    align-items:center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 14px;
    background: rgba(255,255,255,.72);
    border: 1px solid rgba(0,0,0,.06);
    width: fit-content;
  }

  .navBadge{
    width: 34px;
    height: 34px;
    display:grid;
    place-items:center;
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(255,106,0,.16), rgba(255,45,85,.12));
    border: 1px solid rgba(255,106,0,.18);
    font-size: 16px;
    flex: 0 0 auto;
  }

  .navTitle{
    font-size: 16px;
    font-weight: 900;
    color: #111827;
    white-space: nowrap;
  }

  .navRight{
    display:flex;
    align-items:center;
    gap: 10px;
    min-width: 0;
  }

  .userCard{
    display:flex;
    align-items:center;
    gap: 10px;
    padding: 9px 10px;
    border-radius: 16px;
    background: rgba(255,255,255,.72);
    border: 1px solid rgba(0,0,0,.06);
    box-shadow: 0 10px 30px rgba(0,0,0,.06);
    min-width: 0;
    max-width: 520px;
  }

  .avatar{
    width: 38px;
    height: 38px;
    border-radius: 14px;
    display:grid;
    place-items:center;
    font-weight: 900;
    color: #111827;
    background: linear-gradient(135deg, rgba(0,200,255,.20), rgba(124,58,237,.16));
    border: 1px solid rgba(0,0,0,.06);
    flex: 0 0 auto;
  }

  .userInfo{
    display:flex;
    flex-direction:column;
    line-height: 1.2;
    min-width: 0;
  }

  /* Desktop: keep neat with ellipsis if super long */
  .name{
    font-size: 13px;
    font-weight: 900;
    color: #111827;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 320px;
  }

  .email{
    font-size: 12px;
    font-weight: 700;
    color: #6b7280;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 320px;
  }

  .logoutBtn{
    border: none;
    cursor: pointer;
    padding: 10px 14px;
    border-radius: 14px;
    font-weight: 900;
    color: white;
    background: linear-gradient(135deg, #ef4444, #fb7185);
    box-shadow: 0 14px 34px rgba(239,68,68,.22);
    transition: transform .12s ease, filter .12s ease;
    white-space: nowrap;
    flex: 0 0 auto;
  }
  .logoutBtn:hover{ filter: brightness(1.02); transform: translateY(-1px); }
  .logoutBtn:active{ transform: translateY(0px) scale(.99); }

  /* ✅ MOBILE: user card on first line, logout below full width, no cutting */
  @media (max-width: 740px){
    .navDoc{
      flex-direction: column;
      align-items: stretch;
      padding: 10px 12px;
      gap: 10px;
    }

    .navTitleWrap{
      width: 100%;
      justify-content: center;
    }

    .navRight{
      flex-direction: column;   /* ✅ one below one */
      align-items: stretch;
      gap: 10px;
      width: 100%;
    }

    .userCard{
      width: 100%;
      max-width: none;
    }

    /* ✅ show FULL text, never cut, never single letters */
    .name, .email{
      white-space: normal;
      overflow: visible;
      text-overflow: unset;
      max-width: none;
      word-break: break-word;
    }

    /* ✅ logout button full width and slightly smaller height */
    .logoutBtn{
      width: 100%;
      padding: 12px 14px;
      border-radius: 16px;
      text-align: center;
    }
  }
`;
