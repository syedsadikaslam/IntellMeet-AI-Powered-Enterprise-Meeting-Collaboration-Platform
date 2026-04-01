function PricingPage() {
  return (
    <section className="page-shell">
      <div className="page-hero">
        <span className="page-kicker">Pricing</span>
        <h1>Simple plans for growing teams and enterprise collaboration.</h1>
        <p>
          Start with core meeting intelligence, then scale to advanced
          automation, analytics, and workspace controls as your team grows.
        </p>
      </div>

      <section className="page-grid three-up">
        <article className="info-card">
          <h2>Starter</h2>
          <p>For small teams beginning with AI meeting notes and action tracking.</p>
          <p>$19 per user / month</p>
        </article>
        <article className="info-card">
          <h2>Growth</h2>
          <p>For fast-moving teams that need workflow automation and shared dashboards.</p>
          <p>$49 per user / month</p>
        </article>
        <article className="info-card">
          <h2>Enterprise</h2>
          <p>For large organizations needing governance, security, and custom rollout support.</p>
          <p>Custom pricing</p>
        </article>
      </section>
    </section>
  )
}

export default PricingPage
