import React from "react";
import logoImg from "../assets/randomnew.png";

export default function NavbarDoc({ displayName, displayEmail, logout }) {
  return (
    <header className="top">
      <style>{css}</style>

      {/* Left */}
      <div className="brand">
        <img src={logoImg} alt="Logo" className="logoImg" />
        <div className="brandText">
          <div className="brandTitle">User Dashboard</div>
        </div>
      </div>

      {/* Right */}
      <div className="right">
        <div className="infoBlock">
          <div className="devline" aria-label="developer-credit">
            <span className="codeIcon" aria-hidden="true">
              {"</>"}
            </span>
            <span className="devText">Developed by Ajay Kedar</span>
          </div>

          <div className="userLine">
            <div className="meName">{displayName}</div>
            {displayEmail ? <div className="meEmail">{displayEmail}</div> : null}
          </div>
        </div>

        <button className="logoutBtn" onClick={logout} type="button">
          Logout
        </button>
      </div>
    </header>
  );
}

const css = `
*{ box-sizing: border-box; }

.top{
  position: sticky;
  top: 0;
  z-index: 50;
  width: 100%;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  background: rgba(255,255,255,.78);
  border-bottom: 1px solid rgba(255,255,255,.65);
  box-shadow: 0 18px 60px rgba(0,0,0,.12);
  backdrop-filter: blur(16px);
}

/* Left */
.brand{
  display:flex;
  align-items:center;
  gap: 14px;
  min-width: 220px;
  flex: 1 1 auto;
}

.logoImg{
  width: 64px;     /* ✅ medium professional */
  height: 64px;
  object-fit: contain;
  border-radius: 14px;
  background: transparent; /* ✅ no white box */
  padding: 0;              /* ✅ no padding */
  box-shadow: 0 12px 26px rgba(0,0,0,.12);
  user-select: none;
}

.brandText{
  display:flex;
  flex-direction:column;
  line-height: 1.05;
}

.brandTitle{
  font-weight: 1200;
  font-size: 18px;  /* ✅ bold title */
  color: #071126;
  letter-spacing: .2px;
}

/* Right */
.right{
  display:flex;
  align-items:center;
  justify-content:flex-end;
  gap: 14px;
  flex: 0 0 auto;
}

.infoBlock{
  display:flex;
  flex-direction:column;
  align-items:flex-end;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 18px;

  background: rgba(255,255,255,.62);
  border: 1px solid rgba(255,255,255,.65);
  box-shadow: 0 18px 60px rgba(0,0,0,.10);
  backdrop-filter: blur(14px);
}

.devline{
  display:flex;
  align-items:center;
  justify-content:flex-end;
  gap: 10px;

  padding: 8px 10px;
  border-radius: 16px;

  background: rgba(255,255,255,.55);
  border: 1px solid rgba(255,255,255,.55);
  box-shadow: 0 14px 40px rgba(0,0,0,.08);
  user-select:none;
}

.codeIcon{
  font-weight: 1800;
  color: #8B0000;
  font-size: 20px;
}

.devText{
  font-weight: 1600;              /* ✅ more bold */
  color: #8B0000;                 /* ✅ dark red */
  font-size: 13px;
}

.userLine{
  text-align: right;
}


.meName{
  font-size: 13px;
  font-weight: 1200;
  color: #071126;
  word-break: break-word;
}

.meEmail{
  margin-top: 2px;
  font-size: 12px;
  font-weight: 900;
  color: rgba(7,17,38,.55);
  word-break: break-word;
}

.logoutBtn{
  border:none;
  cursor:pointer;
  padding: 12px 16px;
  border-radius: 16px;
  font-weight: 1200;
  color:#fff;
  white-space: nowrap;

  background: linear-gradient(90deg, #ff2d55 0%, #ef4444 55%, #fb7185 100%);
  box-shadow: 0 14px 30px rgba(255,45,85,.22);
  transition: transform .12s ease, opacity .12s ease;
}

.logoutBtn:hover{ opacity: .92; transform: translateY(-1px); }
.logoutBtn:active{ transform: translateY(0px); }

/* ✅ Mobile: stacked (one below one) */
@media (max-width: 740px){
  .top{
    padding: 12px 12px;
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .brand{
    width: 100%;
    min-width: 0;
    justify-content:flex-start;
  }

  .logoImg{
    width: 56px;   /* ✅ not too small on mobile */
    height: 56px;
    border-radius: 14px;
  }

  .brandTitle{
    font-size: 17px;
  }

  .right{
    width: 100%;
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .infoBlock{
    align-items: flex-start;
    text-align: left;
  }

  .devline{
    justify-content:flex-start;
  }

  .userLine{
    text-align: left;
  }

  .logoutBtn{
    width: 100%;
  }
}
`;
