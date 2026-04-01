import { CardGrid, InfoCard, PageHero, PageWrap } from './PagePrimitives'

function FeaturesPage() {
  return (
    <PageWrap>
      <PageHero
        kicker="Features"
        title="Every meeting signal stays organized in one place."
        description="IntellMeet combines agendas, transcripts, decisions, and ownership so teams can move from discussion to execution without losing context."
      />

      <CardGrid>
        <InfoCard title="Smart notes">
          <p>Capture live summaries, decisions, and follow-ups while meetings are still happening.</p>
        </InfoCard>
        <InfoCard title="Speaker timeline">
          <p>Track who said what with searchable moments, key highlights, and shared playback context.</p>
        </InfoCard>
        <InfoCard title="Action handoff">
          <p>Convert discussion points into accountable tasks with due dates and status visibility.</p>
        </InfoCard>
      </CardGrid>
    </PageWrap>
  )
}

export default FeaturesPage
