function DashboardPage() {
  return (
    <section className="page-shell">
      <div className="page-hero">
        <span className="page-kicker">Dashboard</span>
        <h1>A clear control center for meetings, notes, and next steps.</h1>
        <p>
          Monitor active meetings, pending action items, and team momentum from
          one focused workspace.
        </p>
      </div>

      <section className="page-grid dashboard-layout">
        <article className="info-card tall-card">
          <p className="card-label">Today</p>
          <h2>6 meetings scheduled</h2>
          <ul className="stack-list">
            <li>09:00 Product sync with engineering</li>
            <li>11:30 Client onboarding review</li>
            <li>16:00 Executive weekly recap</li>
          </ul>
        </article>
        <article className="info-card">
          <p className="card-label">Actions</p>
          <h2>14 pending follow-ups</h2>
          <p>7 due today, 4 blocked, 3 ready for approval.</p>
        </article>
        <article className="info-card">
          <p className="card-label">Insights</p>
          <h2>Team alignment score: 91%</h2>
          <p>Decision clarity and owner assignment are improving week over week.</p>
        </article>
      </section>
    </section>
  )
}

export default DashboardPage
