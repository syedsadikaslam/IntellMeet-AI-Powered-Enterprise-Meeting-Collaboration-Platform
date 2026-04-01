import { CardGrid, InfoCard, PageHero, PageWrap } from './PagePrimitives'

function TalkToSalesPage() {
  return (
    <PageWrap>
      <PageHero
        kicker="Talk to Sales"
        title="Connect with our team for demos, pricing, and rollout planning."
        description="We help you evaluate team fit, estimate adoption, and map the right collaboration workflow for your organization."
      />

      <CardGrid>
        <InfoCard title="Sales email">
          <p>sales@intellmeet.ai</p>
          <p>Response within one business day.</p>
        </InfoCard>
        <InfoCard title="Demo support">
          <p>Book product walkthroughs for founders, managers, and operations teams.</p>
        </InfoCard>
        <InfoCard title="Rollout planning">
          <p>Discuss onboarding timelines, integrations, and workspace setup for launch.</p>
        </InfoCard>
      </CardGrid>
    </PageWrap>
  )
}

export default TalkToSalesPage
