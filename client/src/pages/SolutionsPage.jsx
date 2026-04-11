import { PageHero, PageWrap, FeatureRow, CardGrid, InfoCard } from './PagePrimitives'
import { BarChart3, Users, Zap, Shield, Target, Cpu } from 'lucide-react'

function SolutionsPage() {
  return (
    <PageWrap>
      <PageHero
        centered
        kicker="Enterprise Solutions"
        title="Transform every meeting into a strategic asset."
        description="IntellMeet provides purpose-built workflows for every department, ensuring that collective intelligence is captured, structured, and actionable."
      />

      <div className="space-y-4 sm:space-y-32">
        <FeatureRow
          title="Executive Leadership & Strategy"
          image="/platform-preview.png"
          description="High-stakes meetings require precision. IntellMeet helps leadership teams track strategic initiatives, board updates, and cross-functional approvals without manually chasing status."
          features={[
            "Automated executive summaries for board review",
            "Decision tracking with multi-year audit logs",
            "Strategic initiative health dashboards",
            "Confidential meeting modes for sensitive discussions"
          ]}
        />

        <FeatureRow
          reversed
          title="Product Operations & Engineering"
          image="/product-preview.png"
          description="Bridge the gap between vision and execution. Automatically sync meeting action items with Jira, GitHub, or Linear to keep your roadmap moving at light speed."
          features={[
            "Real-time blocker identification and extraction",
            "Direct integration with sprint management tools",
            "Technical transcription with code snippet recognition",
            "Review cycle acceleration via AI-driven highlights"
          ]}
        />

        <FeatureRow
          title="Revenue & Client Success"
          image="/revenue-preview.png"
          description="Never miss a client requirement again. Sales and Success teams use IntellMeet to capture every nuance of client feedback and ensure 100% follow-through on commitments."
          features={[
            "Sentiment analysis for client health monitoring",
            "Automated CRM updates (Salesforce, HubSpot)",
            "Commitment tracking with deadline alerts",
            "Sales coaching insights from top performer transcripts"
          ]}
        />
      </div>

      <div className="mt-20 sm:mt-32 rounded-3xl sm:rounded-[3rem] bg-gradient-to-b from-sky-500/10 to-transparent p-6 sm:p-12 lg:p-20">
        <div className="mb-10 sm:mb-16 text-center">
          <h2 className="text-2xl font-black text-white sm:text-5xl">Universal Enterprise Capabilities</h2>
          <p className="mt-4 text-sm sm:text-base text-slate-400">Core intelligence that powers every department across your organization.</p>
        </div>
        
        <CardGrid columns={3}>
          <InfoCard title="Decision Intelligence" icon={Target} delay={0.1}>
            <p>Our AI identifies the exact moment a decision is made, capturing the context, the owner, and the rationale automatically.</p>
          </InfoCard>
          
          <InfoCard title="Cross-Team Visibility" icon={Users} delay={0.2}>
            <p>Break down silos with shared meeting workspaces that allow teams to see related discussions across projects.</p>
          </InfoCard>
          
          <InfoCard title="Seamless Automation" icon={Zap} delay={0.3}>
            <p>Connect your meeting data to 2,000+ apps. If it was discussed in a meeting, it can trigger a workflow elsewhere.</p>
          </InfoCard>
          
          <InfoCard title="Analytics & Trends" icon={BarChart3} delay={0.4}>
            <p>Quantify your meeting culture. Track engagement metrics, meeting frequency, and time-to-action across the company.</p>
          </InfoCard>
          
          <InfoCard title="Enterprise Security" icon={Shield} delay={0.5}>
            <p>End-to-end encryption, SOC2 compliance, and advanced RBAC to ensure your intellectual property stays yours.</p>
          </InfoCard>
          
          <InfoCard title="Scalable AI Infrastructure" icon={Cpu} delay={0.6}>
            <p>Deploy AI that grows with you. Host on-premise or in our secure cloud with guaranteed 99.95% uptime.</p>
          </InfoCard>
        </CardGrid>
      </div>
      
      <div className="mt-20 sm:mt-32 text-center">
        <h2 className="text-2xl font-bold text-white mb-8">Ready to evolve your meeting culture?</h2>
        <div className="flex flex-col sm:flex-row justify-center gap-4 px-4 sm:px-0">
          <button className="rounded-full bg-sky-500 px-8 py-4 font-bold text-white hover:bg-sky-400 transition-all shadow-lg shadow-sky-500/20">
            Schedule a Demo
          </button>
          <button className="rounded-full bg-white/10 px-8 py-4 font-bold text-white hover:bg-white/15 transition-all">
            Contact Sales
          </button>
        </div>
      </div>
    </PageWrap>
  )
}

export default SolutionsPage

