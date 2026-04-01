import { CardGrid, InfoCard, PageHero, PageWrap } from './PagePrimitives'

function HelpCenterPage() {
  return (
    <PageWrap>
      <PageHero
        kicker="Help Center"
        title="Find setup guidance, workflows, and answers in one place."
        description="Use the help center to onboard new teammates, learn best practices, and solve common workspace issues faster."
      />

      <CardGrid>
        <InfoCard title="Getting started">
          <p>Learn how to create workspaces, invite teammates, and run your first session.</p>
        </InfoCard>
        <InfoCard title="Workflow guides">
          <p>Explore recommendations for recurring meetings, reviews, and async follow-ups.</p>
        </InfoCard>
        <InfoCard title="Support resources">
          <p>Reach support, browse FAQs, and find answers to product and billing questions.</p>
        </InfoCard>
      </CardGrid>
    </PageWrap>
  )
}

export default HelpCenterPage
