/**
 * Décorations latérales — sparkles dorés discrets dans les marges de page.
 * Purement visuel, aria-hidden.
 */
export default function PageEdgeDecorations() {
  return (
    <div
      aria-hidden="true"
      className="page-edge-decor pointer-events-none hidden lg:block"
    >
      <div className="page-edge-decor__column page-edge-decor__column--left">
        <span className="edge-sparkle edge-sparkle--sm" style={{ top: "10%", left: "35%" }} />
        <span className="edge-sparkle edge-sparkle--md" style={{ top: "22%", left: "55%" }} />
        <span className="edge-sparkle-diamond" style={{ top: "38%", left: "25%" }} />
        <span className="edge-sparkle edge-sparkle--sm" style={{ top: "58%", left: "45%" }} />
        <span className="edge-sparkle edge-sparkle--md" style={{ top: "72%", left: "30%" }} />
      </div>

      <div className="page-edge-decor__column page-edge-decor__column--right">
        <span className="edge-sparkle edge-sparkle--md" style={{ top: "14%", right: "40%" }} />
        <span className="edge-sparkle-diamond" style={{ top: "30%", right: "28%" }} />
        <span className="edge-sparkle edge-sparkle--sm" style={{ top: "48%", right: "50%" }} />
        <span className="edge-sparkle edge-sparkle--sm" style={{ top: "65%", right: "35%" }} />
        <span className="edge-sparkle edge-sparkle--md" style={{ top: "82%", right: "45%" }} />
      </div>
    </div>
  );
}
