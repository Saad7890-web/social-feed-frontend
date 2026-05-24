export function LoadingScreen({ label = "Loading..." }: { label?: string }) {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "4px solid rgba(0,0,0,0.12)",
            borderTopColor: "#111",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 12px",
          }}
        />
        <p style={{ margin: 0 }}>{label}</p>
      </div>
    </div>
  );
}
