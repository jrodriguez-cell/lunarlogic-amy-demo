import { ImageResponse } from "next/og";

export const alt = "LunarLogic — Finance Cockpit";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0F172A",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div style={{ position: "relative", width: "56px", height: "56px", display: "flex" }}>
            <div style={{ position: "absolute", width: "56px", height: "56px", borderRadius: "50%", background: "#60A5FA" }} />
            <div style={{ position: "absolute", left: "16px", top: "-10px", width: "56px", height: "56px", borderRadius: "50%", background: "#0F172A" }} />
          </div>
          <div style={{ display: "flex", fontSize: "34px", fontWeight: 700 }}>
            <span style={{ color: "#60A5FA" }}>lunarlogic</span>
            <span style={{ color: "#FFFFFF" }}>.ai</span>
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ color: "#FFFFFF", fontSize: "78px", fontWeight: 700, lineHeight: 1.05 }}>
            Finance Cockpit
          </div>
          <div style={{ color: "#94A3B8", fontSize: "33px", marginTop: "20px", maxWidth: "900px" }}>
            Automated cash-flow forecasting, month-end close &amp; covenant monitoring
          </div>
        </div>

        {/* Footer pill */}
        <div style={{ display: "flex" }}>
          <div
            style={{
              display: "flex",
              color: "#93C5FD",
              fontSize: "24px",
              background: "rgba(96,165,250,0.12)",
              border: "1px solid rgba(96,165,250,0.35)",
              borderRadius: "999px",
              padding: "10px 24px",
            }}
          >
            Live demo · read-only
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
