import React from "react";

export default function NavbarDoc({ displayName, displayEmail, logout }) {
  const safeName = displayName || "User";
  const safeEmail = displayEmail || "";

  return (
    <header className="navDoc">
      {/* top accent line */}
      <div className="navAccent" aria-hidden="true" />

      {/* Left */}
      <div className="navLeft">
        <div className="navTitleWrap">
          <span className="navBadge" aria-hidden="true">
            🧾
          </span>
          <div className="titleStack">
            <span className="navTitle">User Dashboard</span>
            <span className="navSub">Manage your documents & profile</span>
          </div>
        </div>
      </div>

      {/* Right */}
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

        <button type="button" className="logoutBtn" onClick={logout}>
          Logout
        </button>
      </div>

      <style>{css}</style>
    </header>
  );
}

const css = `
  *{ box-sizing: border-box; }

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
    overflow: hidden;

    background: rgba(255,255,255,.86);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);

    border-bottom: 1px solid rgba(0,0,0,.08);
    box-shadow: 0 16px 55px rgba(0,0,0,.10);

    /* ✅ entrance animation */
    animation: navIn .5s ease both;
  }

  @keyframes navIn{
    from{ opacity: 0; transform: translateY(-8px); }
    to{ opacity: 1; transform: translateY(0px); }
  }

  /* subtle animated gradient sheen */
  .navDoc::before{
    content:"";
    position:absolute;
    inset:-140px -120px auto -120px;
    height: 220px;
    background: radial-gradient(circle at 20% 25%,
      rgba(59,130,246,.16),
      rgba(168,85,247,.10),
      rgba(255,255,255,0) 62%
    );
    filter: blur(10px);
    opacity: .9;
    animation: floatGlow 7s ease-in-out infinite;
    pointer-events:none;
  }

  @keyframes floatGlow{
    0%,100%{ transform: translateY(0px) translateX(0px); }
    50%{ transform: translateY(14px) translateX(10px); }
  }

  /* top glow line */
  .navAccent{
    position:absolute;
    top:0;
    left:0;
    right:0;
    height: 2px;
    background: linear-gradient(90deg,
      rgba(59,130,246,.0),
      rgba(59,130,246,.55),
      rgba(168,85,247,.50),
      rgba(59,130,246,.0)
    );
    opacity: .9;
    pointer-events:none;
  }

  .navLeft{ min-width: 0; position: relative; z-index: 1; }
  .navRight{ position: relative; z-index: 1; }

  .navTitleWrap{
    display:flex;
    align-items:center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 16px;

    background: rgba(255,255,255,.70);
    border: 1px solid rgba(0,0,0,.06);
    box-shadow: inset 0 2px 12px rgba(255,255,255,.55);
    width: fit-content;

    transition: transform .18s ease, box-shadow .18s ease;
  }

  .navTitleWrap:hover{
    transform: translateY(-1px);
    box-shadow:
      inset 0 2px 14px rgba(255,255,255,.65),
      0 14px 34px rgba(15,23,42,.08);
  }

  .navBadge{
    width: 36px;
    height: 36px;
    display:grid;
    place-items:center;
    border-radius: 14px;

    background: linear-gradient(135deg, rgba(255,106,0,.18), rgba(255,45,85,.12));
    border: 1px solid rgba(255,106,0,.20);
    font-size: 16px;
    flex: 0 0 auto;

    box-shadow: 0 10px 24px rgba(255,106,0,.12);
    transform: translateZ(0);
  }

  .titleStack{
    display:flex;
    flex-direction: column;
    line-height: 1.1;
    gap: 2px;
    min-width: 0;
  }

  .navTitle{
    font-size: 16px;
    font-weight: 950;
    color: #111827;
    white-space: nowrap;
  }

  .navSub{
    font-size: 12px;
    font-weight: 800;
    color: #64748b;
    letter-spacing: .2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 360px;
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
    border-radius: 18px;

    background: rgba(255,255,255,.70);
    border: 1px solid rgba(0,0,0,.06);
    box-shadow:
      inset 0 2px 12px rgba(255,255,255,.55),
      0 12px 34px rgba(0,0,0,.07);

    min-width: 0;
    max-width: 560px;

    transition: transform .18s ease, box-shadow .18s ease;
  }

  .userCard:hover{
    transform: translateY(-1px);
    box-shadow:
      inset 0 2px 14px rgba(255,255,255,.65),
      0 16px 44px rgba(0,0,0,.10);
  }

  .avatar{
    width: 40px;
    height: 40px;
    border-radius: 16px;
    display:grid;
    place-items:center;

    font-weight: 950;
    color: #111827;

    background: linear-gradient(135deg, rgba(59,130,246,.22), rgba(124,58,237,.18));
    border: 1px solid rgba(0,0,0,.06);
    flex: 0 0 auto;

    box-shadow: 0 12px 26px rgba(59,130,246,.10);
  }

  .userInfo{
    display:flex;
    flex-direction:column;
    line-height: 1.2;
    min-width: 0;
  }

  .name{
    font-size: 13px;
    font-weight: 950;
    color: #111827;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 340px;
  }

  .email{
    font-size: 12px;
    font-weight: 800;
    color: #6b7280;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 340px;
  }

  .logoutBtn{
    border: none;
    cursor: pointer;
    padding: 10px 14px;
    border-radius: 16px;
    font-weight: 950;
    color: white;

    background: linear-gradient(135deg, #ef4444, #fb7185);
    box-shadow: 0 16px 40px rgba(239,68,68,.22);

    transition: transform .14s ease, filter .14s ease, box-shadow .14s ease;
    white-space: nowrap;
    flex: 0 0 auto;
    position: relative;
    overflow: hidden;
  }

  /* glossy sweep on hover */
  .logoutBtn::before{
    content:"";
    position:absolute;
    top:-40%;
    left:-60%;
    width: 60%;
    height: 180%;
    transform: rotate(20deg);
    background: linear-gradient(90deg,
      rgba(255,255,255,0),
      rgba(255,255,255,.22),
      rgba(255,255,255,0)
    );
    transition: left .5s ease;
  }

  .logoutBtn:hover{
    filter: brightness(1.03);
    transform: translateY(-1px);
    box-shadow: 0 18px 46px rgba(239,68,68,.28);
  }
  .logoutBtn:hover::before{ left: 120%; }
  .logoutBtn:active{ transform: translateY(0px) scale(.99); }

  /* ✅ MOBILE: perfect fit, no cutting */
  @media (max-width: 820px){
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

    .titleStack{
      align-items: center;
      text-align: center;
    }

    .navSub{
      max-width: 100%;
      white-space: normal;
      overflow: visible;
      text-overflow: unset;
      line-height: 1.25;
    }

    .navRight{
      flex-direction: column;
      align-items: stretch;
      gap: 10px;
      width: 100%;
    }

    .userCard{
      width: 100%;
      max-width: none;
    }

    /* show full text on mobile */
    .name, .email{
      white-space: normal;
      overflow: visible;
      text-overflow: unset;
      max-width: none;
      word-break: break-word;
    }

    .logoutBtn{
      width: 100%;
      padding: 12px 14px;
      border-radius: 18px;
      text-align: center;
    }
  }

  /* ✅ accessibility: reduce motion */
  @media (prefers-reduced-motion: reduce){
    .navDoc{ animation: none; }
    .navDoc::before{ animation: none; }
    .logoutBtn::before{ transition: none; }
  }
`;
