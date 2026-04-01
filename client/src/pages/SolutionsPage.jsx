import { CardGrid, InfoCard, PageHero, PageWrap } from './PagePrimitives'

function SolutionsPage() {
  return (
    <PageWrap>
      <PageHero
        kicker="Solutions"
        title="Purpose-built collaboration workflows for modern enterprise teams."
        description="IntellMeet helps product, operations, leadership, and client-facing teams run better meetings with clearer decisions, ownership, and follow-through."
      />

      <CardGrid>
        <InfoCard title="Executive syncs">
          <p>Track strategic updates, approvals, and action items across weekly leadership reviews.</p>
        </InfoCard>
        <InfoCard title="Product operations">
          <p>Bring roadmap meetings, blockers, notes, and owners into one shared workflow.</p>
        </InfoCard>
        <InfoCard title="Client delivery">
          <p>Keep client calls, feedback, and next steps documented with clear follow-up accountability.</p>
        </InfoCard>
      </CardGrid>
    </PageWrap>
  )
}

export default SolutionsPage
