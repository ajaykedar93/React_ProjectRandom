import React from "react";

export default function FooterDoc() {
  return (
    <footer className="footerDoc">
      <div className="footerInner">
        <span className="codeTag" aria-hidden="true">
          {"</>"}
        </span>
        <span className="footerText">
          Site Developed By <strong>Ajay Kedar</strong>
        </span>
      </div>

      {/* footer css */}
      <style>{css}</style>
    </footer>
  );
}

const css = `
  .footerDoc{
    width: 100%;
    background: rgba(255,255,255,.88);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-top: 1px solid rgba(0,0,0,.08);
    box-shadow: 0 -14px 40px rgba(0,0,0,.10);
    padding: 16px 20px;
  }

  .footerInner{
    max-width: 1280px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    font-size: 14px;
    font-weight: 800;
    color: #334155; /* slate / charcoal */
    letter-spacing: .3px;
  }

  .codeTag{
    padding: 4px 10px;
    border-radius: 10px;
    font-weight: 900;
    color: #475569;
    background: linear-gradient(
      135deg,
      rgba(15,23,42,.08),
      rgba(15,23,42,.04)
    );
    border: 1px solid rgba(15,23,42,.14);
    box-shadow: inset 0 2px 6px rgba(255,255,255,.6);
  }

  .footerText strong{
    font-weight: 900;
    color: #1f2937;
  }

  /* ✅ MOBILE SAFE SPACE */
  @media (max-width: 740px){
    .footerDoc{
      padding-bottom: 26px; /* extra space so footer never hides */
    }

    .footerInner{
      flex-wrap: wrap;
      text-align: center;
      line-height: 1.4;
    }
  }
`;
