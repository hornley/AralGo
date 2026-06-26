export default function ProfileLoading() {
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', paddingTop: 8 }}>
      <div className="pf-skel" style={{ width: 120, height: 22, marginBottom: 24 }} />

      <div className="pf-skel" style={{ width: 80, height: 80, borderRadius: '50%', margin: '0 auto 24px' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i}>
            <div className="pf-skel" style={{ width: 100, height: 12, marginBottom: 8 }} />
            <div className="pf-skel" style={{ width: '100%', height: 48, borderRadius: 14 }} />
          </div>
        ))}
      </div>

      <div className="pf-skel" style={{ width: 160, height: 46, borderRadius: 999, margin: '24px auto 0' }} />

      <style>{`
        .pf-skel {
          border-radius: 12px;
          background: linear-gradient(90deg, var(--color-surface-container, #eaf0e5) 25%, var(--color-surface, #f6fbf1) 50%, var(--color-surface-container, #eaf0e5) 75%);
          background-size: 200% 100%;
          animation: pf-shimmer 1.5s ease-in-out infinite;
        }
        @keyframes pf-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
