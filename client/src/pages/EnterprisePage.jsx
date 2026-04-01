import { CardGrid, InfoCard, PageHero, PageWrap } from './PagePrimitives'

function EnterprisePage() {
  return (
    <PageWrap>
      <PageHero
        kicker="Enterprise"
        title="Enterprise rollout built for security, governance, and scale."
        description="Give leadership, operations, and delivery teams one collaboration layer with advanced controls, onboarding support, and organization-wide visibility."
      />

      <CardGrid>
        <InfoCard title="Admin controls">
          <p>Manage workspaces, access, approvals, and data retention policies centrally.</p>
        </InfoCard>
        <InfoCard title="Secure deployment">
          <p>Support governed rollouts for teams that need stronger privacy and compliance.</p>
        </InfoCard>
        <InfoCard title="Dedicated success">
          <p>Get onboarding, migration planning, and stakeholder training for adoption at scale.</p>
        </InfoCard>
      </CardGrid>
    </PageWrap>
  )
}

export default EnterprisePage
