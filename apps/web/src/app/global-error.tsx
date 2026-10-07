"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#0a0b0d",
          color: "#e8eaed",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div style={{ textAlign: "center", padding: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: "0 0 8px" }}>WorkSphere hit a problem</h1>
          <p style={{ color: "#8a9099", margin: "0 0 20px" }}>Reload to try again.</p>
          <button
            type="button"
            onClick={reset}
            style={{
              background: "#10b981",
              color: "#04130d",
              border: 0,
              borderRadius: 8,
              padding: "10px 16px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
