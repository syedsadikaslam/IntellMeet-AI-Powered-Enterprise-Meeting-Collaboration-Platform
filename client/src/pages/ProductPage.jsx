import { CardGrid, InfoCard, PageHero, PageWrap } from './PagePrimitives'

function ProductPage() {
  return (
    <PageWrap>
      <PageHero
        kicker="Product"
        title="A meeting product designed to reduce friction after every call."
        description="IntellMeet keeps notes, action items, decisions, and follow-up workflows connected so teams do not lose momentum between conversations."
      />

      <CardGrid>
        <InfoCard title="Capture">
          <p>Record discussions, summarize key points, and preserve searchable context.</p>
        </InfoCard>
        <InfoCard title="Coordinate">
          <p>Assign owners, due dates, and next steps without switching tools constantly.</p>
        </InfoCard>
        <InfoCard title="Improve">
          <p>Spot patterns in recurring meetings and remove bottlenecks from team rituals.</p>
        </InfoCard>
      </CardGrid>
    </PageWrap>
  )
}

export default ProductPage
