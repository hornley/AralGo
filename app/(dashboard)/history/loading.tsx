export default function HistoryLoading() {
  return (
    <div style={{ paddingTop: 8 }}>
      <div className="hist-skel" style={{ width: 140, height: 22, marginBottom: 20 }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="hist-skel" style={{ width: '100%', height: 72, borderRadius: 16 }} />
        ))}
      </div>

      <style>{`
        .hist-skel {
          border-radius: 12px;
          background: linear-gradient(90deg, var(--color-surface-container, #eaf0e5) 25%, var(--color-surface, #f6fbf1) 50%, var(--color-surface-container, #eaf0e5) 75%);
          background-size: 200% 100%;
          animation: hist-shimmer 1.5s ease-in-out infinite;
        }
        @keyframes hist-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
