import React from "react";

export default function FooterDoc() {
  return (
    <>
      <style>{`
        :root{
          --roseDark: rgba(190, 24, 93, 0.92);   /* navbar/footer base */
          --roseBorder: rgba(255,255,255,.16);
          --roseSoft: rgba(255, 182, 213, .95); /* soft premium pink */
          --roseGlow: rgba(190, 24, 93, .38);
        }

        .footerDoc {
          width: 100%;
          background: var(--roseDark); /* ✅ match navbar */
          border-top: 1px solid var(--roseBorder);
          color: #f8fafc;
          font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* ✅ subtle soft shine (NOT gradient / NOT rainbow) */
        .footerDoc::before{
          content:"";
          position:absolute;
          inset:-60% -30%;
          background: radial-gradient(circle, rgba(255,255,255,.12), transparent 60%);
          transform: rotate(10deg);
          pointer-events:none;
        }

        /* ✅ top accent (single theme) */
        .footerAccent {
          height: 4px;
          width: 100%;
          background: rgba(255, 182, 213, .85); /* ✅ soft pink */
        }

        .footerInner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 18px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          position: relative;
          z-index: 1;
        }

        /* LEFT SIDE */
        .footerLeft {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .codeTag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: 16px;

          /* ✅ single-color glass */
          background: rgba(255,255,255,.12);
          border: 1px solid rgba(255,255,255,.20);
          box-shadow: 0 12px 30px var(--roseGlow);
          user-select: none;
        }

        .codeText {
          font-weight: 900;
          font-size: 13px;
          color: rgba(255,255,255,.95);
        }

        .codeIcon {
          width: 18px;
          height: 18px;
          display: grid;
          place-items: center;
          border-radius: 999px;

          /* ✅ single accent */
          background: rgba(255, 182, 213, .90);
          border: 1px solid rgba(255, 255, 255, 0.35);
          color: rgba(11,18,32,.92);
          font-size: 12px;
          font-weight: 900;
        }

        .devText {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.85);
          white-space: nowrap;
        }

        .devText strong {
          color: #ffffff;
          font-weight: 900;
        }

        /* RIGHT SIDE */
        .footerRight {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .footerChip {
          padding: 8px 14px;
          border-radius: 16px;

          /* ✅ single-color glass */
          background: rgba(255,255,255,.10);
          border: 1px solid rgba(255,255,255,.18);

          font-size: 12px;
          color: rgba(255, 255, 255, 0.88);
          box-shadow: 0 14px 35px rgba(0, 0, 0, 0.22);
          white-space: nowrap;
        }

        /* ✅ MOBILE: everything CENTER */
        @media (max-width: 720px) {
          .footerInner {
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
          }

          .footerLeft {
            justify-content: center;
            width: 100%;
          }

          .footerRight {
            justify-content: center;
            width: 100%;
          }

          .devText {
            white-space: normal;
          }
        }

        /* ✅ EXTRA SMALL: full width chips */
        @media (max-width: 420px) {
          .footerChip,
          .codeTag {
            width: 100%;
            justify-content: center;
            text-align: center;
          }

          .footerLeft {
            flex-direction: column;
            gap: 10px;
          }
        }
      `}</style>

      <footer className="footerDoc" role="contentinfo">
        <div className="footerAccent" />

        <div className="footerInner">
          {/* LEFT */}
          <div className="footerLeft">
            <span className="codeTag" aria-hidden="true">
              <span className="codeText">{"</>"}</span>
              <span className="codeIcon">⚡</span>
            </span>

            <span className="devText">
              Site Developed By <strong>Ajay Kedar</strong>
            </span>
          </div>

          {/* RIGHT */}
          <div className="footerRight">
            <span className="footerChip">
              © {new Date().getFullYear()} • All rights reserved
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
