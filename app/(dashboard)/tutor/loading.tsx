export default function TutorLoading() {
  return (
    <div style={{ padding: 20 }}>
      <div className="skeleton-block" style={{ width: 180, height: 22, marginBottom: 24 }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="skeleton-bubble" style={{ width: '60%', height: 80, alignSelf: 'flex-start' }} />
        <div className="skeleton-bubble" style={{ width: '40%', height: 48, alignSelf: 'flex-end' }} />
        <div className="skeleton-bubble" style={{ width: '70%', height: 96, alignSelf: 'flex-start' }} />
        <div className="skeleton-bubble" style={{ width: '35%', height: 48, alignSelf: 'flex-end' }} />
      </div>

      <style>{`
        .skeleton-block, .skeleton-bubble {
          border-radius: 12px;
          background: linear-gradient(90deg, var(--color-surface-container, #eaf0e5) 25%, var(--color-surface, #f6fbf1) 50%, var(--color-surface-container, #eaf0e5) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s ease-in-out infinite;
        }
        .skeleton-bubble {
          border-radius: 16px;
          border-bottom-left-radius: 4px;
        }
        .skeleton-bubble:nth-child(even) {
          border-bottom-left-radius: 16px;
          border-bottom-right-radius: 4px;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
