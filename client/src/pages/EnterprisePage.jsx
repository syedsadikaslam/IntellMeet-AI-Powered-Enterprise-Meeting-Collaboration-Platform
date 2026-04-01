function EnterprisePage() {
  return (
    <section className="page-shell">
      <div className="page-hero">
        <span className="page-kicker">Enterprise</span>
        <h1>Enterprise rollout built for security, governance, and scale.</h1>
        <p>
          Give leadership, operations, and delivery teams one collaboration layer
          with advanced controls, onboarding support, and organization-wide visibility.
        </p>
      </div>

      <section className="page-grid three-up">
        <article className="info-card">
          <h2>Admin controls</h2>
          <p>Manage workspaces, access, approvals, and data retention policies centrally.</p>
        </article>
        <article className="info-card">
          <h2>Secure deployment</h2>
          <p>Support governed rollouts for teams that need stronger privacy and compliance.</p>
        </article>
        <article className="info-card">
          <h2>Dedicated success</h2>
          <p>Get onboarding, migration planning, and stakeholder training for adoption at scale.</p>
        </article>
      </section>
    </section>
  )
}

export default EnterprisePage
