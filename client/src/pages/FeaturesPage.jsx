function FeaturesPage() {
  return (
    <section className="page-shell">
      <div className="page-hero">
        <span className="page-kicker">Features</span>
        <h1>Every meeting signal stays organized in one place.</h1>
        <p>
          IntellMeet combines agendas, transcripts, decisions, and ownership so
          teams can move from discussion to execution without losing context.
        </p>
      </div>

      <section className="page-grid three-up">
        <article className="info-card">
          <h2>Smart notes</h2>
          <p>
            Capture live summaries, decisions, and follow-ups while meetings are
            still happening.
          </p>
        </article>
        <article className="info-card">
          <h2>Speaker timeline</h2>
          <p>
            Track who said what with searchable moments, key highlights, and
            shared playback context.
          </p>
        </article>
        <article className="info-card">
          <h2>Action handoff</h2>
          <p>
            Convert discussion points into accountable tasks with due dates and
            status visibility.
          </p>
        </article>
      </section>
    </section>
  )
}

export default FeaturesPage
