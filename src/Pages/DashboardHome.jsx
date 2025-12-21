import React from "react";

export default function DashboardHome() {
  const me = (() => {
    try {
      return JSON.parse(localStorage.getItem("auth_user") || "null");
    } catch {
      return null;
    }
  })();

  const displayName =
    me?.full_name || [me?.first_name, me?.last_name].filter(Boolean).join(" ") || "User";

  const email = me?.email_address || me?.email || "";

  return (
    <div className="homeOuter">
      <style>{css}</style>

      <div className="homeCard">
        <div className="badgeRow">
          <span className="badgeDot" aria-hidden="true" />
          <span className="badgeText">Welcome back</span>
        </div>

        <h1 className="name">{displayName}</h1>
        {email ? <div className="email">{email}</div> : null}

        <div className="line" />

        <p className="desc">
          This application is designed to help users manage personal documents in a simple, secure,
          and reliable way. You can upload, view, and organize documents with a clean interface that
          works smoothly on both mobile and desktop devices.
        </p>

        <p className="devDesc">
          This website is developed by <strong className="devName">Ajay Kedar</strong> with a focus
          on performance, user experience, and mobile-first design. The system is built to be fast,
          responsive, and easy to use for managing personal or professional documents. If you have
          any questions or future requirements, this platform is structured to scale and improve
          over time.
        </p>

        <div className="miniGrid">
          <div className="miniItem">
            <div className="miniTitle">Fast</div>
            <div className="miniSub">Optimized performance for smooth usage</div>
          </div>

          <div className="miniItem">
            <div className="miniTitle">Secure</div>
            <div className="miniSub">Session-based access with safe data handling</div>
          </div>

          <div className="miniItem">
            <div className="miniTitle">Reliable</div>
            <div className="miniSub">Stable structure with clean code practices</div>
          </div>
        </div>

        <div className="footer">
          <span className="footerLabel">Developer</span>
          <span className="footerName">Ajay Kedar</span>
        </div>
      </div>
    </div>
  );
}

const css = `
  .homeOuter{
    width: 100%;
    box-sizing: border-box;
    padding: 0;     /* ✅ no outside space */
    margin: 0;
  }

  .homeCard{
    width: 100%;
    box-sizing: border-box;
    text-align: center;

    /* desktop/tablet look */
    border-radius: 22px;
    padding: 18px 16px;
    background: rgba(255,255,255,.62);
    border: 1px solid rgba(255,255,255,.62);
    box-shadow: 0 26px 80px rgba(0,0,0,.12);
    backdrop-filter: blur(16px);
  }

  /* Badge */
  .badgeRow{
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(17,24,39,.06);
    border: 1px solid rgba(17,24,39,.08);
  }
  .badgeDot{
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: linear-gradient(90deg, #ff6a00, #ff2d55);
    box-shadow: 0 0 14px rgba(255,106,0,.35);
  }
  .badgeText{
    font-weight: 800;
    font-size: 12px;
    opacity: 0.85;
  }

  .name{
    margin-top: 12px;
    font-size: clamp(28px, 6.8vw, 52px);
    font-weight: 1000;
    line-height: 1.05;
    word-break: break-word;
    background-image: linear-gradient(90deg, #ff6a00, #ff2d55, #7c3aed, #06b6d4);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    text-shadow: 0 12px 30px rgba(0,0,0,.08);
  }

  .email{
    margin-top: 6px;
    font-weight: 800;
    font-size: clamp(11px, 3.2vw, 14px);
    opacity: 0.72;
    word-break: break-word;
  }

  .line{
    margin: 14px auto 12px;
    width: min(520px, 92%);
    height: 1px;
    background: linear-gradient(90deg, rgba(255,106,0,.35), rgba(255,45,85,.22), rgba(6,182,212,.25));
    border-radius: 999px;
  }

  .desc{
    margin: 0 auto;
    width: min(680px, 100%);
    font-size: clamp(12px, 3.6vw, 15px);
    font-weight: 700;
    opacity: 0.82;
    line-height: 1.65;
  }

  .devDesc{
    margin: 10px auto 0;
    width: min(680px, 100%);
    font-size: clamp(12px, 3.5vw, 14px);
    font-weight: 700;
    opacity: 0.75;
    line-height: 1.65;
  }

  .devName{
    background-image: linear-gradient(90deg, #ff2d55, #ff6a00, #ffb703);
    -webkit-background-clip: text;
    background-clip: text;
    color: #dc2626;
    font-weight: 1000;
    letter-spacing: 0.3px;
    text-shadow: 0 4px 14px rgba(255,45,85,.35);
  }

  .miniGrid{
    margin-top: 14px;
    display: grid;
    gap: 10px;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .miniItem{
    padding: 12px 12px;
    border-radius: 18px;
    background: rgba(255,255,255,.55);
    border: 1px solid rgba(255,255,255,.60);
    box-shadow: 0 14px 40px rgba(0,0,0,.08);
    text-align: left;
  }

  .miniTitle{
    font-weight: 1000;
    font-size: 14px;
    background-image: linear-gradient(90deg, #ff6a00, #ff2d55);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .miniSub{
    margin-top: 4px;
    font-weight: 700;
    font-size: 12px;
    opacity: 0.78;
    line-height: 1.45;
  }

  .footer{
    margin-top: 14px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    padding-top: 10px;
  }

  .footerLabel{
    font-weight: 900;
    font-size: 12px;
    opacity: 0.7;
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(17,24,39,.06);
    border: 1px solid rgba(17,24,39,.08);
  }

  .footerName{
    font-weight: 1000;
    font-size: 13px;
    padding: 6px 10px;
    border-radius: 999px;
    color: #111827;
    background: linear-gradient(90deg, rgba(255,106,0,.18), rgba(255,45,85,.14), rgba(6,182,212,.14));
    border: 1px solid rgba(255,255,255,.65);
  }

  /* ✅ Responsive grid */
  @media (max-width: 820px){
    .miniGrid{ grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @media (max-width: 520px){
    .miniGrid{ grid-template-columns: 1fr; }
  }

  /* ✅ MOBILE EDGE-TO-EDGE: remove ALL outside feeling */
  @media (max-width: 740px){
    .homeCard{
      border-radius: 0;       /* ✅ touch edges */
      border-left: 0;
      border-right: 0;
      box-shadow: none;       /* ✅ no floating */
      padding: 14px 12px;     /* only inner padding */
    }
  }
`;
