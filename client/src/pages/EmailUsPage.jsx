import { CardGrid, InfoCard, PageHero, PageWrap } from './PagePrimitives'

function EmailUsPage() {
  return (
    <PageWrap>
      <PageHero
        kicker="Email Us"
        title="Reach the IntellMeet team directly by email."
        description="For support, product questions, billing help, or partnership requests, our team is available across the addresses below."
      />

      <CardGrid>
        <InfoCard title="General">
          <p>hello@intellmeet.ai</p>
          <p>For onboarding, product, and team questions.</p>
        </InfoCard>
        <InfoCard title="Support">
          <p>support@intellmeet.ai</p>
          <p>For workspace issues and day-to-day help.</p>
        </InfoCard>
        <InfoCard title="Sales">
          <p>sales@intellmeet.ai</p>
          <p>For demos, plans, and enterprise conversations.</p>
        </InfoCard>
      </CardGrid>
    </PageWrap>
  )
}

export default EmailUsPage
