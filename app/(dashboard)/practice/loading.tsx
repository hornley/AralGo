export default function PracticeLoading() {
  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '20px 0' }}>
      <div className="pl-skeleton" style={{ width: 160, height: 24, marginBottom: 24 }} />

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="pl-skeleton" style={{ width: 80, height: 36, borderRadius: 999 }} />
        ))}
      </div>

      <div className="pl-skeleton" style={{ width: '100%', height: 48, marginBottom: 16 }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="pl-skeleton" style={{ width: '100%', height: 52, borderRadius: 14 }} />
        ))}
      </div>

      <div className="pl-skeleton" style={{ width: 180, height: 46, borderRadius: 999, margin: '24px auto 0' }} />

      <style>{`
        .pl-skeleton {
          border-radius: 12px;
          background: linear-gradient(90deg, var(--color-surface-container, #eaf0e5) 25%, var(--color-surface, #f6fbf1) 50%, var(--color-surface-container, #eaf0e5) 75%);
          background-size: 200% 100%;
          animation: pl-shimmer 1.5s ease-in-out infinite;
        }
        @keyframes pl-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
