function Hero() {
  return (
    <section className="home-page">
      <section className="landing-hero">
        <div className="landing-copy">
          <span className="platform-badge">AI-Powered Enterprise Platform</span>
          <h1>
            The Future of
            <span> Meetings &</span>
            <span> Collaboration</span>
          </h1>
          <p>
            IntellMeet transforms how your enterprise connects. Experience
            seamless video conferencing, AI-driven insights, and next-generation
            collaboration tools in one unified workspace.
          </p>

          <div className="landing-actions">
            <a className="hero-primary" href="#/contact">
              Start for free
            </a>
            <a className="hero-secondary" href="#/solutions">
              Request Demo
            </a>
          </div>
        </div>

        <div className="landing-visual">
          <div className="meeting-window">
            <div className="window-top">
              <span />
              <span />
              <span />
              <p>Weekly Sync • Product Team</p>
            </div>

            <div className="video-grid">
              <article className="video-card card-blue">
                <span>Sarah T.</span>
              </article>
              <article className="video-card card-green">
                <span>Michael B.</span>
              </article>
              <article className="video-card card-purple">
                <span>Priya K.</span>
              </article>
              <article className="video-card card-dark">
                <strong>IntellMeet AI Generating Notes...</strong>
              </article>
            </div>
          </div>

          <div className="floating-note note-top">
            <div className="note-icon">⚡</div>
            <div>
              <strong>Sentiment Analysis</strong>
              <p>High engagement detected</p>
            </div>
          </div>

          <div className="floating-note note-bottom">
            <div className="note-icon">🎯</div>
            <div>
              <strong>Action Items</strong>
              <p>Auto-captured securely</p>
            </div>
          </div>
        </div>
      </section>

      <section className="feature-grid compact-features" id="features">
        <article>
          <h3>Shared context</h3>
          <p>
            Keep agendas, notes, and recordings connected to the same meeting
            timeline.
          </p>
        </article>
        <article>
          <h3>Action tracking</h3>
          <p>
            Turn decisions into follow-ups with owners, due dates, and status
            updates.
          </p>
        </article>
        <article>
          <h3>Team visibility</h3>
          <p>
            Give every stakeholder a quick view of what changed, what is next,
            and who is responsible.
          </p>
        </article>
      </section>
    </section>
  )
}

export default Hero
