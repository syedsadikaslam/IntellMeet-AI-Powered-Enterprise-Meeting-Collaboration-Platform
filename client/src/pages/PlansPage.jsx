import { CardGrid, InfoCard, PageHero, PageWrap } from './PagePrimitives'

function PlansPage() {
  return (
    <PageWrap>
      <PageHero
        kicker="Plans"
        title="Choose the plan that matches your team stage."
        description="Whether you are just getting started or scaling across departments, IntellMeet offers flexible collaboration plans with room to grow."
      />

      <CardGrid>
        <InfoCard title="Team">
          <p>Core AI meeting notes, searchable history, and lightweight action tracking.</p>
          <p>Best for small teams.</p>
        </InfoCard>
        <InfoCard title="Business">
          <p>Shared dashboards, workflow templates, and stronger reporting for managers.</p>
          <p>Best for growing organizations.</p>
        </InfoCard>
        <InfoCard title="Custom">
          <p>Security reviews, rollout planning, and enterprise-grade controls on request.</p>
          <p>Best for large organizations.</p>
        </InfoCard>
      </CardGrid>
    </PageWrap>
  )
}

export default PlansPage
