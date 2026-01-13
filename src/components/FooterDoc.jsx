import React from "react";

export default function FooterDoc() {
  return (
    <footer className="footerDoc">
      <div className="footerAccent" aria-hidden="true" />

      <div className="footerInner">
        <div className="brand">
          {/* ✅ red + bold code icon */}
          <span className="codeTag" aria-hidden="true">
            {"</>"}
          </span>

          <span className="footerText">
            Site Developed By <strong>Ajay Kedar</strong>
          </span>
        </div>

        <div className="right">
          <span className="dot" aria-hidden="true" />
          <span className="smallText">Crafted with clean UI & performance</span>
        </div>
      </div>

      <style>{css}</style>
    </footer>
  );
}

const css = `
  .footerDoc{
    width: 100%;
    position: relative;
    overflow: hidden;

    /* glass */
    background: rgba(255,255,255,.82);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);

    border-top: 1px solid rgba(0,0,0,.08);
    box-shadow: 0 -18px 50px rgba(0,0,0,.12);

    padding: 18px 22px;

    /* ✅ perfect sizing */
    box-sizing: border-box;
  }

  *{ box-sizing: border-box; }

  .footerDoc::before{
    content: "";
    position: absolute;
    inset: -120px -80px auto -80px;
    height: 220px;
    background: radial-gradient(circle at 20% 20%,
      rgba(59,130,246,.16),
      rgba(168,85,247,.10),
      rgba(255,255,255,0) 60%
    );
    filter: blur(10px);
    opacity: .8;
    animation: floatGlow 7s ease-in-out infinite;
    pointer-events: none;
  }

  .footerDoc::after{
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg,
      rgba(15,23,42,.02),
      rgba(15,23,42,.00) 40%,
      rgba(15,23,42,.02)
    );
    pointer-events: none;
  }

  @keyframes floatGlow{
    0%,100%{ transform: translateY(0px) translateX(0px); }
    50%{ transform: translateY(14px) translateX(10px); }
  }

  .footerAccent{
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg,
      rgba(59,130,246,.0),
      rgba(59,130,246,.55),
      rgba(168,85,247,.50),
      rgba(59,130,246,.0)
    );
    opacity: .9;
  }

  .footerInner{
    max-width: 1280px;
    margin: 0 auto;
    position: relative;
    z-index: 1;

    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;

    font-size: 14px;
    font-weight: 800;
    color: #334155;
    letter-spacing: .25px;

    /* ✅ prevents overflow on small screens */
    width: 100%;
    min-width: 0;
  }

  .brand{
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }

  /* ✅ red + bold code icon */
  .codeTag{
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 36px;
    min-width: 44px;
    padding: 0 12px;
    border-radius: 12px;

    font-weight: 1000;
    letter-spacing: .5px;
    color: #ffffff;

    background: linear-gradient(135deg,
      rgba(239,68,68,1),
      rgba(220,38,38,1)
    );
    border: 1px solid rgba(185,28,28,.45);
    box-shadow:
      0 12px 28px rgba(239,68,68,.25),
      inset 0 2px 8px rgba(255,255,255,.25);

    transform: translateZ(0);
    transition: transform .22s ease, box-shadow .22s ease;
    user-select: none;
  }

  .brand:hover .codeTag{
    transform: translateY(-2px);
    box-shadow:
      0 16px 38px rgba(239,68,68,.30),
      inset 0 2px 10px rgba(255,255,255,.28);
  }

  .footerText{
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    flex-wrap: wrap;
  }

  .footerText strong{
    font-weight: 900;
    color: #111827;
    position: relative;
  }

  .footerText strong::after{
    content: "";
    position: absolute;
    left: 0;
    bottom: -4px;
    width: 100%;
    height: 2px;
    border-radius: 2px;
    background: linear-gradient(90deg,
      rgba(59,130,246,.65),
      rgba(168,85,247,.55)
    );
    transform: scaleX(.65);
    transform-origin: left;
    opacity: .85;
    transition: transform .22s ease;
  }

  .brand:hover .footerText strong::after{
    transform: scaleX(1);
  }

  .right{
    display: flex;
    align-items: center;
    gap: 10px;

    padding: 10px 12px;
    border-radius: 14px;
    border: 1px solid rgba(15,23,42,.08);
    background: rgba(255,255,255,.55);
    box-shadow: inset 0 2px 10px rgba(255,255,255,.65);

    /* ✅ prevents overflow */
    min-width: 0;
  }

  .dot{
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: radial-gradient(circle at 30% 30%,
      rgba(59,130,246,.95),
      rgba(168,85,247,.85)
    );
    box-shadow: 0 0 0 4px rgba(59,130,246,.12);
    flex: 0 0 auto;
  }

  .smallText{
    font-size: 12px;
    font-weight: 800;
    color: #475569;
    letter-spacing: .2px;

    /* ✅ wraps nicely on mobile */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 520px;
  }

  /* ✅ TABLET + MOBILE PERFECT FIT */
  @media (max-width: 900px){
    .footerInner{
      flex-direction: column;
      justify-content: center;
      text-align: center;
      gap: 12px;
    }

    .brand{
      justify-content: center;
    }

    .right{
      width: 100%;
      justify-content: center;
    }

    .smallText{
      white-space: normal;
      overflow: visible;
      text-overflow: unset;
      max-width: 100%;
      line-height: 1.35;
    }
  }

  /* ✅ extra safe area for very small phones */
  @media (max-width: 740px){
    .footerDoc{
      padding: 16px 16px 26px;
    }

    .footerInner{
      font-size: 13px;
    }

    .codeTag{
      height: 34px;
      min-width: 42px;
      padding: 0 11px;
    }
  }
`;
