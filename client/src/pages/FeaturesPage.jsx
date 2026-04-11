import { PageHero, PageWrap, FeatureRow, CardGrid, InfoCard } from './PagePrimitives'
import { Activity, Layout, Lock, MessageSquare, Repeat, Settings } from 'lucide-react'

function FeaturesPage() {
  return (
    <PageWrap>
      <PageHero
        centered
        kicker="Platform Features"
        title="Intelligence that powers high-velocity teams."
        description="IntellMeet combines real-time communication with deep AI insights to ensure your team stays focused on execution, not documentation."
      />

      <div className="space-y-4 sm:space-y-32">
        <FeatureRow
          title="AI Meeting Intelligence"
          image="/ai-preview.png"
          description="Focus on the conversation, not the notes. Our proprietary AI processing engine captures every word and transforms it into structured intelligence."
          features={[
            "Real-time transcription with speaker identification",
            "Automated summary generation (GPT-4 / Whisper)",
            "One-click action item extraction and assignment",
            "Multi-language support with instant translation"
          ]}
        />

        <FeatureRow
          reversed
          title="Enterprise Video Meetings"
          image="/platform-preview.png"
          description="Built on industrial-grade WebRTC and Socket.io for ultra-low latency. Support for 50+ concurrent participants with crystal clear audio and 4K video."
          features={[
            "Low-latency global meeting infrastructure",
            "End-to-end encrypted video and screen sharing",
            "Live in-meeting collaborative whiteboards",
            "Automated cloud recording with instant playback"
          ]}
        />

        <FeatureRow
          title="Unified Team Workspace"
          image="/workspace-preview.png"
          description="Bridge the gap between meetings and projects. Turn every discussion point into an actionable ticket in your team's workspace automatically."
          features={[
            "Real-time Kanban boards for task management",
            "Automated task syncing with Jira & GitHub",
            "Team-specific workspaces and permission sets",
            "Mentions, comments, and file attachments"
          ]}
        />
      </div>

      <div className="mt-20 sm:mt-32 rounded-3xl sm:rounded-[3rem] bg-gradient-to-b from-sky-500/10 to-transparent p-6 sm:p-12 lg:p-20">
        <div className="mb-10 sm:mb-16 text-center">
          <h2 className="text-2xl font-black text-white sm:text-5xl">Built for Reliability</h2>
          <p className="mt-4 text-sm sm:text-base text-slate-400">The infrastructure that powers thousands of enterprise meetings every day.</p>
        </div>
        
        <CardGrid columns={3}>
          <InfoCard title="Enterprise Security" icon={Lock} delay={0.1}>
            <p>JWT-based authentication, role-based access control (RBAC), and industry-standard encryption to protect your data.</p>
          </InfoCard>
          
          <InfoCard title="Advanced Analytics" icon={Activity} delay={0.2}>
            <p>Track meeting ROI, speaker engagement, and team productivity with deep data-driven insights.</p>
          </InfoCard>
          
          <InfoCard title="Global Infrastructure" icon={Repeat} delay={0.3}>
            <p>Scale horizontally with Kubernetes and Redis. 99.95% uptime SLA for business-critical communications.</p>
          </InfoCard>
          
          <InfoCard title="Deep Integrations" icon={Settings} delay={0.4}>
            <p>Connect with Slack, MS Teams, and major CRMs. Your meeting data flows where your work happens.</p>
          </InfoCard>
          
          <InfoCard title="Template Gallery" icon={Layout} delay={0.5}>
            <p>Standups, retrospectives, board meetings. Standardize your meeting culture with expert-designed templates.</p>
          </InfoCard>
          
          <InfoCard title="Real-time Chat" icon={MessageSquare} delay={0.6}>
            <p>Persistent chat threads for every meeting. Share files, links, and reactions without losing context.</p>
          </InfoCard>
        </CardGrid>
      </div>

      <div className="mt-20 sm:mt-32 text-center">
        <h2 className="text-2xl font-bold text-white mb-8">Ready to supercharge your meetings?</h2>
        <div className="flex flex-col sm:flex-row justify-center gap-4 px-4 sm:px-0">
          <button className="rounded-full bg-sky-500 px-8 py-4 font-bold text-white hover:bg-sky-400 transition-all shadow-lg shadow-sky-500/20">
            Get Started Free
          </button>
          <button className="rounded-full bg-white/10 px-8 py-4 font-bold text-white hover:bg-white/15 transition-all">
            View Live Demo
          </button>
        </div>
      </div>
    </PageWrap>
  )
}

export default FeaturesPage

