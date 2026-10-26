import { ImageResponse } from "next/og";

/**
 * Open Graph card, 1200×630, generated from code (no raster asset, no external font fetch).
 *
 * The layout mirrors the site's airy editorial language: flat paper, one warm sun, layered
 * hills and an original house — never the reference site's photography. The bundled Geist
 * face from `@vercel/og` is used as-is (font weight is not synthesised, so hierarchy comes
 * from size, colour and spacing rather than boldness).
 */

export const alt =
  "MaMaisonQC — la valeur des propriétés du Québec, appuyée sur le rôle d'évaluation foncière et le Registre foncier";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#12181F";
const INK_SOFT = "#3D4650";
const MUTED = "#5A6570";
const PAPER = "#FBFAF7";
const PRIMARY = "#1D5B4F";
const PRIMARY_SOFT = "#E7F0ED";
const PRIMARY_STRONG = "#14453C";
const ACCENT = "#A84E1C";
const ACCENT_SOFT = "#FBEEE6";
const MIST_DEEP = "#D5E3DC";
const SAGE = "#A9C2B6";
const CLAY = "#C97B4E";
const SLATE = "#4B5A64";
const OCHRE = "#D9A441";
const OCHRE_PALE = "#F0DDB8";

const PILLS = ["Comparables réels", "Fourchette et confiance", "Provenance affichée"];

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: PAPER,
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}
      >
        {/* Editorial illustration, built from flat shapes only */}
        <div style={{ position: "absolute", left: 680, top: 0, width: 520, height: 630, display: "flex" }}>
          <div
            style={{
              position: "absolute",
              left: 300,
              top: 48,
              width: 200,
              height: 200,
              borderRadius: 100,
              background: OCHRE_PALE,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 350,
              top: 98,
              width: 100,
              height: 100,
              borderRadius: 50,
              background: OCHRE,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: -40,
              top: 300,
              width: 680,
              height: 480,
              borderRadius: 340,
              background: MIST_DEEP,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 20,
              top: 196,
              width: 150,
              height: 150,
              borderRadius: 75,
              background: SAGE,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 54,
              top: 186,
              width: 76,
              height: 76,
              borderRadius: 38,
              background: "#C4D6CB",
            }}
          />
          <div style={{ position: "absolute", left: 104, top: 300, width: 16, height: 120, background: CLAY }} />

          {/* House */}
          <div style={{ position: "absolute", left: 188, top: 250, width: 300, height: 240, display: "flex" }}>
            <div
              style={{
                position: "absolute",
                left: 45,
                top: -60,
                width: 210,
                height: 210,
                background: PRIMARY,
                transform: "rotate(45deg)",
              }}
            />
            <div style={{ position: "absolute", left: 20, top: 90, width: 260, height: 150, background: "#FFFFFF" }} />
            <div style={{ position: "absolute", left: 48, top: 130, width: 62, height: 52, background: SLATE }} />
            <div style={{ position: "absolute", left: 130, top: 150, width: 44, height: 90, background: ACCENT }} />
            <div style={{ position: "absolute", left: 216, top: 130, width: 44, height: 52, background: SLATE }} />
          </div>

          <div
            style={{
              position: "absolute",
              left: -40,
              top: 462,
              width: 660,
              height: 420,
              borderRadius: 330,
              background: "#F1E6D6",
            }}
          />
          <div style={{ position: "absolute", left: 372, top: 486, width: 18, height: 82, borderRadius: 6, background: CLAY }} />
          <div
            style={{
              position: "absolute",
              left: 330,
              top: 448,
              width: 104,
              height: 104,
              borderRadius: 52,
              background: SAGE,
            }}
          />
        </div>

        {/* Text column */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            width: 720,
            height: "100%",
            padding: "64px 0 52px 72px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 36, height: 4, background: ACCENT }} />
            <div style={{ color: ACCENT, fontSize: 18, letterSpacing: 3, textTransform: "uppercase" }}>
              Évaluation foncière · Québec
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", marginTop: 26 }}>
            <div style={{ display: "flex", fontSize: 58, lineHeight: 1.08, letterSpacing: -1.3, color: INK }}>
              <span>Combien vaut</span>
              <span style={{ color: PRIMARY, marginLeft: 16 }}>vraiment</span>
            </div>
            <div style={{ display: "flex", fontSize: 58, lineHeight: 1.08, letterSpacing: -1.3, color: INK }}>
              votre maison?
            </div>
          </div>

          <div style={{ marginTop: 24, maxWidth: 540, fontSize: 22, lineHeight: 1.45, color: INK_SOFT }}>
            Rôle d&apos;évaluation foncière, Registre foncier et Adresses Québec. Une fourchette, ses
            comparables, et la source de chaque chiffre.
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 34 }}>
            {PILLS.map((label) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  background: PRIMARY_SOFT,
                  color: PRIMARY_STRONG,
                  fontSize: 16,
                  padding: "9px 16px",
                  borderRadius: 999,
                }}
              >
                {label}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", marginTop: "auto" }}>
            <div
              style={{
                display: "flex",
                width: 42,
                height: 42,
                borderRadius: 12,
                background: PRIMARY,
                position: "relative",
                marginRight: 12,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 13,
                  top: 10,
                  width: 16,
                  height: 16,
                  background: PAPER,
                  transform: "rotate(45deg)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 12,
                  top: 20,
                  width: 18,
                  height: 12,
                  background: PAPER,
                }}
              />
            </div>
            <div style={{ display: "flex", fontSize: 22, color: INK }}>
              MaMaison<span style={{ color: PRIMARY }}>QC</span>
            </div>
            <div style={{ display: "flex", marginLeft: "auto", alignItems: "center", gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, background: ACCENT }} />
              <div style={{ fontSize: 16, color: MUTED }}>Données ouvertes · Québec</div>
            </div>
          </div>

          <div style={{ display: "flex", marginTop: 22, alignItems: "center", gap: 8 }}>
            <div style={{ width: 120, height: 3, background: ACCENT_SOFT }} />
            <div style={{ width: 46, height: 3, background: ACCENT }} />
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
