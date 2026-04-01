function EmailUsPage() {
  return (
    <section className="page-shell">
      <div className="page-hero">
        <span className="page-kicker">Email Us</span>
        <h1>Reach the IntellMeet team directly by email.</h1>
        <p>
          For support, product questions, billing help, or partnership requests,
          our team is available across the addresses below.
        </p>
      </div>

      <section className="page-grid contact-layout">
        <article className="info-card">
          <h2>General</h2>
          <p>hello@intellmeet.ai</p>
          <p>For onboarding, product, and team questions.</p>
        </article>
        <article className="info-card">
          <h2>Support</h2>
          <p>support@intellmeet.ai</p>
          <p>For workspace issues and day-to-day help.</p>
        </article>
        <article className="info-card">
          <h2>Sales</h2>
          <p>sales@intellmeet.ai</p>
          <p>For demos, plans, and enterprise conversations.</p>
        </article>
      </section>
    </section>
  )
}

export default EmailUsPage
