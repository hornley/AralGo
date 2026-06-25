const focusAreas = [
  "Bilingual tutoring in Filipino and English",
  "Practice generation matched to learner level",
  "Low-bandwidth mobile-first delivery",
];

const nextSteps = [
  "Use hosted Supabase anonymous sessions from .env.local",
  "Persist learner profiles and study sessions with RLS",
  "Add the first chat and practice vertical slice",
];

export default function HomePage() {
  return (
    <main>
      <div className="shell stack">
        <section className="hero">
          <div className="card">
            <p className="eyebrow">AralGo</p>
            <h1 className="title">Study support built for real mobile constraints.</h1>
            <p className="lede">
              The project scaffold is now in place for a Next.js and Supabase-based study
              companion focused on Filipino learners, bilingual tutoring, and low-bandwidth
              reliability.
            </p>
            <div className="actions">
              <a className="button primary" href="/study">
                Open study shell
              </a>
              <a className="button secondary" href="/api/health">
                Check health route
              </a>
            </div>
          </div>

          <div className="card stack">
            <div>
              <h2 className="section-title">Current focus</h2>
              <p className="muted">
                This initial app shell keeps the repo runnable while the tutoring, auth,
                and persistence layers are implemented.
              </p>
            </div>
            <div className="stack">
              {focusAreas.map((item) => (
                <span className="pill" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="grid">
          <article className="card">
            <h2 className="section-title">Next app routes</h2>
            <p className="mono">/study</p>
            <p className="mono">/api/health</p>
          </article>

          <article className="card">
            <h2 className="section-title">Build queue</h2>
            <div className="stack">
              {nextSteps.map((step) => (
                <p className="muted" key={step}>
                  {step}
                </p>
              ))}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
