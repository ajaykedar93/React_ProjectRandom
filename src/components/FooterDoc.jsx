import React from "react";

export default function FooterDoc() {
  return (
    <>
      <style>{`
        .footerDoc {
          background: linear-gradient(135deg, #1f1147, #2a145f, #3a1c71);
          border-top: 1px solid rgba(255, 255, 255, 0.12);
          color: #f8fafc;
          font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
          width: 100%;
        }

        .footerAccent {
          height: 4px;
          background: linear-gradient(90deg, #ec4899, #facc15, #a855f7);
          width: 100%;
        }

        .footerInner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 18px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
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
          background: linear-gradient(
            135deg,
            rgba(236, 72, 153, 0.25),
            rgba(250, 204, 21, 0.18)
          );
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 12px 30px rgba(236, 72, 153, 0.35);
          user-select: none;
        }

        .codeText {
          font-weight: 900;
          font-size: 13px;
          color: #fdf4ff;
        }

        .codeIcon {
          width: 18px;
          height: 18px;
          display: grid;
          place-items: center;
          border-radius: 999px;
          background: radial-gradient(circle at 30% 30%, #facc15, #ec4899);
          border: 1px solid rgba(255, 255, 255, 0.35);
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
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.1),
            rgba(255, 255, 255, 0.05)
          );
          border: 1px solid rgba(255, 255, 255, 0.15);
          font-size: 12px;
          color: rgba(255, 255, 255, 0.8);
          box-shadow: 0 14px 35px rgba(0, 0, 0, 0.35);
          white-space: nowrap;
        }

        /* ✅ MOBILE: everything CENTER */
        @media (max-width: 720px) {
          .footerInner {
            flex-direction: column;
            align-items: center;     /* center */
            justify-content: center; /* center */
            text-align: center;      /* center text */
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

        /* ✅ EXTRA SMALL: still center, but allow full width if needed */
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
