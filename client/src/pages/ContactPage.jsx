function ContactPage() {
  return (
    <section className="page-shell">
      <div className="page-hero">
        <span className="page-kicker">Contact</span>
        <h1>Bring your team onto a calmer, smarter meeting workflow.</h1>
        <p>
          Reach out for demos, onboarding help, or enterprise collaboration
          setup tailored to your organization.
        </p>
      </div>

      <section className="page-grid contact-layout">
        <article className="info-card">
          <h2>Talk to sales</h2>
          <p>hello@intellmeet.ai</p>
          <p>Mon to Fri, 9:00 AM to 6:00 PM IST</p>
        </article>
        <article className="info-card">
          <h2>Support desk</h2>
          <p>support@intellmeet.ai</p>
          <p>Response time under 2 hours for active workspaces.</p>
        </article>
        <article className="info-card">
          <h2>Office</h2>
          <p>Sector V, Salt Lake</p>
          <p>Kolkata, India</p>
        </article>
      </section>
    </section>
  )
}

export default ContactPage