/**
 * /madie-signature — one-page render of Madie's email signature.
 *
 * Why: pasting raw HTML into Gmail's signature box shows the markup as
 * literal text. Gmail only stores the RENDERED version. So Madie (or
 * Ben helping her set up) loads this page → selects the card → copies
 * → pastes into Gmail Settings → Signature → the styled card sticks.
 *
 * Public route, no auth. Cheap render, no SSR data deps.
 */

export const metadata = {
  title: "Madie Signature — copy + paste into Gmail",
  robots: { index: false, follow: false },
};

export default function MadieSignaturePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "32px 24px",
        fontFamily:
          "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
        color: "#0f172a",
      }}
    >
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <h1
          style={{
            fontSize: 18,
            fontWeight: 700,
            marginBottom: 8,
            color: "#0f172a",
          }}
        >
          Madie's Gmail signature
        </h1>
        <p
          style={{
            fontSize: 13,
            color: "#475569",
            marginBottom: 24,
            lineHeight: 1.5,
          }}
        >
          Select the card below (triple-click or click-drag), copy
          (Cmd/Ctrl+C), then open Gmail → ⚙ → See all settings → General →
          Signature → Create new → paste in the editor → set as default
          for new emails AND replies → Save. The styled card will stick.
        </p>

        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 12,
            padding: 24,
            marginBottom: 16,
          }}
        >
          {/* ▼▼▼ This is the signature itself — copy what's below ▼▼▼ */}
          <table
            cellPadding={0}
            cellSpacing={0}
            border={0}
            style={{
              fontFamily:
                "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
              color: "#0f172a",
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            <tbody>
              <tr>
                <td
                  style={{
                    paddingRight: 14,
                    borderRight: "2px solid #f59e0b",
                    verticalAlign: "top",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 15,
                      color: "#0f172a",
                    }}
                  >
                    Madie
                  </div>
                  <div style={{ color: "#475569", fontSize: 13 }}>
                    Sales · BlueJays
                  </div>
                </td>
                <td style={{ paddingLeft: 14, verticalAlign: "top" }}>
                  <div style={{ fontSize: 13 }}>
                    <a
                      href="mailto:madie@bluejayportfolio.com"
                      style={{ color: "#0ea5e9", textDecoration: "none" }}
                    >
                      madie@bluejayportfolio.com
                    </a>
                    <br />
                    <a
                      href="https://bluejayportfolio.com"
                      style={{ color: "#0ea5e9", textDecoration: "none" }}
                    >
                      bluejayportfolio.com
                    </a>
                    <br />
                    <a
                      href="https://bluejayportfolio.com/book-ben"
                      style={{
                        color: "#f59e0b",
                        textDecoration: "none",
                        fontWeight: 600,
                      }}
                    >
                      📅 Book a 15-min call with Ben
                    </a>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          {/* ▲▲▲ End signature ▲▲▲ */}
        </div>

        <p
          style={{
            fontSize: 12,
            color: "#64748b",
            lineHeight: 1.5,
            marginTop: 16,
          }}
        >
          <strong>Tip:</strong> Click anywhere on the card, press
          Ctrl+A (or Cmd+A) to select everything inside the white box,
          then Ctrl+C to copy. Don't worry if Gmail's editor looks
          stretched — once you save and send a test, it renders
          correctly.
        </p>
      </div>
    </main>
  );
}
