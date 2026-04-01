import { CardGrid, InfoCard, PageHero, PageWrap } from './PagePrimitives'

function ContactPage() {
  return (
    <PageWrap>
      <PageHero
        kicker="Contact"
        title="Bring your team onto a calmer, smarter meeting workflow."
        description="Reach out for demos, onboarding help, or enterprise collaboration setup tailored to your organization."
      />

      <CardGrid>
        <InfoCard title="Talk to sales">
          <p>hello@intellmeet.ai</p>
          <p>Mon to Fri, 9:00 AM to 6:00 PM IST</p>
        </InfoCard>
        <InfoCard title="Support desk">
          <p>support@intellmeet.ai</p>
          <p>Response time under 2 hours for active workspaces.</p>
        </InfoCard>
        <InfoCard title="Office">
          <p>Sector V, Salt Lake</p>
          <p>Kolkata, India</p>
        </InfoCard>
      </CardGrid>
    </PageWrap>
  )
}

export default ContactPage
