"use client";

import { useEffect, useState } from "react";

export default function OfflinePage() {
  const [online, setOnline] = useState(false);

  useEffect(() => {
    const check = () => setOnline(navigator.onLine);
    window.addEventListener("online", check);
    return () => window.removeEventListener("online", check);
  }, []);

  useEffect(() => {
    if (online) window.location.reload();
  }, [online]);

  return (
    <main style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100dvh",
      padding: "24px",
      textAlign: "center",
      backgroundColor: "#f6fbf1",
      color: "#171d17",
      fontFamily: "system-ui, sans-serif",
    }}>
      <span style={{ fontSize: "64px", marginBottom: "16px", lineHeight: 1 }}>
        &#x1F4E1;&#xFE0F;
      </span>
      <h1 style={{ fontSize: "20px", fontWeight: 600, margin: "0 0 8px" }}>
        You&apos;re offline
      </h1>
      <p style={{
        fontSize: "14px", color: "#43483e", margin: "0 0 24px", maxWidth: "280px",
      }}>
        Don&apos;t worry — your recent lessons and practice sets are still
        available. Connect to the internet to ask new questions.
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          padding: "12px 24px",
          borderRadius: "999px",
          border: "none",
          backgroundColor: "#456732",
          color: "#fff",
          fontSize: "14px",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </main>
  );
}
