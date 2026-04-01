function TalkToSalesPage() {
  return (
    <section className="page-shell">
      <div className="page-hero">
        <span className="page-kicker">Talk to Sales</span>
        <h1>Connect with our team for demos, pricing, and rollout planning.</h1>
        <p>
          We help you evaluate team fit, estimate adoption, and map the right
          collaboration workflow for your organization.
        </p>
      </div>

      <section className="page-grid contact-layout">
        <article className="info-card">
          <h2>Sales email</h2>
          <p>sales@intellmeet.ai</p>
          <p>Response within one business day.</p>
        </article>
        <article className="info-card">
          <h2>Demo support</h2>
          <p>Book product walkthroughs for founders, managers, and operations teams.</p>
        </article>
        <article className="info-card">
          <h2>Rollout planning</h2>
          <p>Discuss onboarding timelines, integrations, and workspace setup for launch.</p>
        </article>
      </section>
    </section>
  )
}

export default TalkToSalesPage
