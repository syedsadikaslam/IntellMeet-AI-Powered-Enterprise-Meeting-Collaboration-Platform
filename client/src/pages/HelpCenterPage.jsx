function HelpCenterPage() {
  return (
    <section className="page-shell">
      <div className="page-hero">
        <span className="page-kicker">Help Center</span>
        <h1>Find setup guidance, workflows, and answers in one place.</h1>
        <p>
          Use the help center to onboard new teammates, learn best practices,
          and solve common workspace issues faster.
        </p>
      </div>

      <section className="page-grid three-up">
        <article className="info-card">
          <h2>Getting started</h2>
          <p>Learn how to create workspaces, invite teammates, and run your first session.</p>
        </article>
        <article className="info-card">
          <h2>Workflow guides</h2>
          <p>Explore recommendations for recurring meetings, reviews, and async follow-ups.</p>
        </article>
        <article className="info-card">
          <h2>Support resources</h2>
          <p>Reach support, browse FAQs, and find answers to product and billing questions.</p>
        </article>
      </section>
    </section>
  )
}

export default HelpCenterPage
