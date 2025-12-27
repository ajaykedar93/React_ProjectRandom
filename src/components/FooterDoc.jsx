import React, { useEffect, useMemo, useState } from "react";

export default function FooterDoc() {
  const [footer, setFooter] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch active footer
  useEffect(() => {
    const fetchFooter = async () => {
      try {
        const res = await fetch("https://express-projectrandom.onrender.com/api/footer/active");
        const data = await res.json();
        setFooter(data?.data || null);
      } catch (e) {
        setFooter(null);
      } finally {
        setLoading(false);
      }
    };
    fetchFooter();
  }, []);

  const detailsAvailable = useMemo(() => {
    if (!footer) return false;
    const hasDesc = footer.footer_description && footer.footer_description.trim() !== "";
    const hasLinks = Array.isArray(footer.footer_links) && footer.footer_links.length > 0;
    return hasDesc || hasLinks;
  }, [footer]);

  useEffect(() => {
    setOpen(false);
  }, [footer?.footer_id]);

  if (loading) return null;
  if (!footer) return null;

  const tagline = footer.footer_tagline || "";
  const desc = footer.footer_description || "";
  const links = Array.isArray(footer.footer_links) ? footer.footer_links : [];

  return (
    <footer className="ft-wrap">
      <style>{css}</style>

      {/* ✅ Desktop / Laptop: SAME (unchanged look) */}
      <div className="ft-desktop">
        <div className="ft-card">
          <div className="ft-row">
            <div className="ft-tag">{tagline}</div>
          </div>

          {desc?.trim() ? <div className="ft-desc">{desc}</div> : null}

          {links?.length ? (
            <div className="ft-links">
              {links.map((l, idx) => (
                <a
                  key={idx}
                  className="ft-link"
                  href={l.url || "#"}
                  target="_blank"
                  rel="noreferrer"
                  title={l.name || "link"}
                >
                  <span className="ft-linkText">{formatName(l.name) || "Link"}</span>
                  <span className="ft-ext">↗</span>
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* ✅ Mobile: STATIC footer (below page content), NOT fixed */}
      <div className="ft-mobile">
        <div className="ft-mobileBar">
          <div className="ft-mobileTag">{tagline}</div>

          {detailsAvailable ? (
            <button
              className="ft-arrowBtn"
              type="button"
              onClick={() => setOpen((p) => !p)}
              aria-label={open ? "Close footer details" : "Open footer details"}
            >
              <span className={`ft-arrow ${open ? "rot" : ""}`}>▴</span>
            </button>
          ) : null}
        </div>

        {/* Open UP panel (still works) */}
        {detailsAvailable ? (
          <div className={`ft-panel ${open ? "show" : ""}`}>
            {desc?.trim() ? <div className="ft-desc">{desc}</div> : null}

            {links?.length ? (
              <div className="ft-links">
                {links.map((l, idx) => (
                  <a
                    key={idx}
                    className="ft-link"
                    href={l.url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    title={l.name || "link"}
                  >
                    <span className="ft-linkText">{formatName(l.name) || "Link"}</span>
                    <span className="ft-ext">↗</span>
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </footer>
  );
}

function formatName(name) {
  if (!name) return "";
  const n = String(name).trim();
  return n.charAt(0).toUpperCase() + n.slice(1);
}

const css = `
/* ✅ Professional font + no weird letter breaks */
.ft-wrap, .ft-wrap *{
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial;
  letter-spacing: .15px;
  word-break: normal;
  overflow-wrap: break-word;
}

/* Wrapper */
.ft-wrap{
  width: 100%;
  position: relative;
  z-index: 20;
}

/* ✅ Desktop footer (unchanged) */
.ft-desktop{
  display: block;
  padding: 14px 14px 18px;
}

.ft-card{
  max-width: 1200px;
  margin: 0 auto;
  border-radius: 22px;
  padding: 16px 16px;

  background: rgba(255,255,255,.88);
  border: 1px solid rgba(11,18,32,.08);
  box-shadow: 0 18px 60px rgba(0,0,0,.12);
  backdrop-filter: blur(16px);
}

.ft-row{
  display:flex;
  align-items:center;
  justify-content: space-between;
  gap: 10px;
}

.ft-tag{
  font-weight: 1500;
  font-size: 15px;
  color: #0b1220;
}

.ft-desc{
  margin-top: 10px;
  font-size: 13px;
  font-weight: 1000;
  color: rgba(11,18,32,.72);
  line-height: 1.5;
}

.ft-links{
  margin-top: 12px;
  display:flex;
  flex-wrap: wrap;
  gap: 10px;
}

.ft-link{
  display:inline-flex;
  align-items:center;
  gap: 8px;

  padding: 10px 12px;
  border-radius: 16px;
  text-decoration:none;

  font-weight: 1200;
  font-size: 13px;
  color: rgba(11,18,32,.92);

  background: rgba(255,255,255,.70);
  border: 1px solid rgba(11,18,32,.08);
  box-shadow: 0 12px 34px rgba(0,0,0,.08);

  transition: transform .12s ease, opacity .12s ease;
}

.ft-link:hover{ opacity: .92; transform: translateY(-1px); }
.ft-linkText{ font-weight: 1300; }
.ft-ext{ font-weight: 1500; color: #8B0000; }

/* ✅ Mobile footer: STATIC (below content) */
.ft-mobile{
  display:none;
  padding: 12px 12px 18px; /* bottom space after footer */
}

.ft-mobileBar{
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;

  display:flex;
  align-items:center;
  justify-content: space-between;
  gap: 10px;

  padding: 12px 12px;
  border-radius: 18px;

  background: rgba(255,255,255,.92);
  border: 1px solid rgba(11,18,32,.08);
  box-shadow: 0 18px 60px rgba(0,0,0,.16);
  backdrop-filter: blur(16px);
}

.ft-mobileTag{
  font-weight: 1500;
  font-size: 13px;
  color: #0b1220;
  line-height: 1.25;
}

.ft-arrowBtn{
  border:none;
  cursor:pointer;
  width: 40px;
  height: 40px;
  border-radius: 14px;

  background: rgba(0,0,0,.03);
  border: 1px solid rgba(0,0,0,.08);
  box-shadow: 0 12px 34px rgba(0,0,0,.10);
}

.ft-arrow{
  display:inline-block;
  font-weight: 1500;
  font-size: 16px;
  color: #8B0000;
  transition: transform .18s ease;
}
.ft-arrow.rot{ transform: rotate(180deg); }

/* Panel opens UP under the bar */
.ft-panel{
  max-width: 1200px;
  margin: 10px auto 0;
  border-radius: 20px;
  padding: 14px 14px;

  background: rgba(255,255,255,.95);
  border: 1px solid rgba(11,18,32,.08);
  box-shadow: 0 18px 60px rgba(0,0,0,.16);
  backdrop-filter: blur(16px);

  transform: translateY(10px);
  opacity: 0;
  pointer-events: none;
  transition: transform .18s ease, opacity .18s ease;
}

.ft-panel.show{
  transform: translateY(0px);
  opacity: 1;
  pointer-events: auto;
}

/* ✅ Responsive behavior:
   - Desktop: show desktop footer only
   - Mobile: show mobile footer only (static below)
*/
@media (max-width: 740px){
  .ft-desktop{ display:none; }
  .ft-mobile{ display:block; }
}
`;
