import { CardGrid, InfoCard, PageHero, PageWrap } from './PagePrimitives'

function PricingPage() {
  return (
    <PageWrap>
      <PageHero
        kicker="Pricing"
        title="Simple plans for growing teams and enterprise collaboration."
        description="Start with core meeting intelligence, then scale to advanced automation, analytics, and workspace controls as your team grows."
      />

      <CardGrid>
        <InfoCard title="Starter">
          <p>For small teams beginning with AI meeting notes and action tracking.</p>
          <p>$19 per user / month</p>
        </InfoCard>
        <InfoCard title="Growth">
          <p>For fast-moving teams that need workflow automation and shared dashboards.</p>
          <p>$49 per user / month</p>
        </InfoCard>
        <InfoCard title="Enterprise">
          <p>For large organizations needing governance, security, and custom rollout support.</p>
          <p>Custom pricing</p>
        </InfoCard>
      </CardGrid>
    </PageWrap>
  )
}

export default PricingPage
