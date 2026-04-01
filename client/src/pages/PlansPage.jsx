function PlansPage() {
  return (
    <section className="page-shell">
      <div className="page-hero">
        <span className="page-kicker">Plans</span>
        <h1>Choose the plan that matches your team stage.</h1>
        <p>
          Whether you are just getting started or scaling across departments,
          IntellMeet offers flexible collaboration plans with room to grow.
        </p>
      </div>

      <section className="page-grid three-up">
        <article className="info-card">
          <h2>Team</h2>
          <p>Core AI meeting notes, searchable history, and lightweight action tracking.</p>
          <p>Best for small teams.</p>
        </article>
        <article className="info-card">
          <h2>Business</h2>
          <p>Shared dashboards, workflow templates, and stronger reporting for managers.</p>
          <p>Best for growing organizations.</p>
        </article>
        <article className="info-card">
          <h2>Custom</h2>
          <p>Security reviews, rollout planning, and enterprise-grade controls on request.</p>
          <p>Best for large organizations.</p>
        </article>
      </section>
    </section>
  )
}

export default PlansPage
