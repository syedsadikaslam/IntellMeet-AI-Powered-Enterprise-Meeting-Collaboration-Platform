function ProductPage() {
  return (
    <section className="page-shell">
      <div className="page-hero">
        <span className="page-kicker">Product</span>
        <h1>A meeting product designed to reduce friction after every call.</h1>
        <p>
          IntellMeet keeps notes, action items, decisions, and follow-up workflows
          connected so teams do not lose momentum between conversations.
        </p>
      </div>

      <section className="page-grid three-up">
        <article className="info-card">
          <h2>Capture</h2>
          <p>Record discussions, summarize key points, and preserve searchable context.</p>
        </article>
        <article className="info-card">
          <h2>Coordinate</h2>
          <p>Assign owners, due dates, and next steps without switching tools constantly.</p>
        </article>
        <article className="info-card">
          <h2>Improve</h2>
          <p>Spot patterns in recurring meetings and remove bottlenecks from team rituals.</p>
        </article>
      </section>
    </section>
  )
}

export default ProductPage
