import { useAuthStore } from '../store/useAuthStore'

const liveParticles = [
  { left: '14%', top: '18%', size: 'h-1.5 w-1.5', delay: '0s', color: 'bg-cyan-300/80' },
  { left: '28%', top: '34%', size: 'h-2 w-2', delay: '.4s', color: 'bg-violet-300/70' },
  { left: '58%', top: '22%', size: 'h-1.5 w-1.5', delay: '.9s', color: 'bg-emerald-300/80' },
  { left: '74%', top: '44%', size: 'h-2.5 w-2.5', delay: '.2s', color: 'bg-sky-300/70' },
  { left: '42%', top: '68%', size: 'h-1.5 w-1.5', delay: '.7s', color: 'bg-fuchsia-300/80' },
  { left: '82%', top: '76%', size: 'h-2 w-2', delay: '1.1s', color: 'bg-cyan-200/70' },
]

const insightBars = [
  { width: 'w-16', delay: '0s' },
  { width: 'w-10', delay: '.35s' },
  { width: 'w-14', delay: '.65s' },
]

const stats = [
  { label: 'Uptime SLA', value: '99.95%' },
  { label: 'AI Accuracy', value: '98.4%' },
  { label: 'Max Concurrency', value: '50+' },
]

const workflow = [
  {
    title: 'High-Concurrency Video',
    text: 'Host up to 50+ participants with ultra-low latency WebRTC and crystal clear 4K video quality.',
  },
  {
    title: 'AI Intelligence Hub',
    text: 'Automated transcription and GPT-powered summaries delivered instantly after every session.',
  },
  {
    title: 'Integrated Team Hub',
    text: 'Sync meeting action items directly into Kanban boards to move from discussion to execution.',
  },
]

const showcases = [
  {
    title: 'Intelligent Recaps',
    text: 'Generate structured summaries for leadership reviews with sentiment, decisions, and risks included.',
  },
  {
    title: 'Enterprise Governance',
    text: 'Maintain full visibility with SOC2 security, JWT auth, and role-based access for all stakeholders.',
  },
  {
    title: 'Velocity Dashboard',
    text: 'Track meeting ROI and team engagement metrics to optimize your organization\'s communication.',
  },
]

function PresenceCard({ name, className, badgeClassName, children }) {
  return (
    <article
      className={`group relative min-h-[110px] overflow-hidden rounded-[22px] border border-white/8 sm:min-h-[128px] ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_36%)] opacity-70" />
      <div className="absolute -top-8 right-8 h-20 w-20 rounded-full bg-white/8 blur-2xl transition group-hover:scale-125" />
      <div className="absolute inset-x-6 top-5 flex items-center justify-between">
        <div className="flex gap-1.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/70" />
          <span
            className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/45"
            style={{ animationDelay: '0.4s' }}
          />
          <span
            className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/30"
            style={{ animationDelay: '0.8s' }}
          />
        </div>
        {children}
      </div>
      <span
        className={`absolute bottom-3.5 left-3.5 inline-flex min-h-[30px] items-center rounded-[10px] px-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(0,0,0,0.18)] ${badgeClassName}`}
      >
        {name}
      </span>
    </article>
  )
}

function FloatingChip({ icon, title, text, className, iconClassName }) {
  return (
    <div
      className={`absolute flex max-w-[210px] items-center gap-3.5 rounded-[22px] border border-white/8 bg-[linear-gradient(135deg,rgba(20,24,34,0.96),rgba(26,31,42,0.88))] p-3.5 shadow-[0_24px_40px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:min-w-[244px] sm:max-w-none sm:p-[16px_18px] ${className}`}
    >
      <div
        className={`relative grid h-[42px] w-[42px] place-items-center overflow-hidden rounded-[14px] text-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ${iconClassName}`}
      >
        <span className="absolute inset-0 animate-pulse bg-white/8" />
        <span className="relative z-10">{icon}</span>
      </div>
      <div>
        <strong className="block text-base font-bold text-white">{title}</strong>
        <p className="mt-1 text-[0.88rem] text-white/56">{text}</p>
      </div>
    </div>
  )
}

function HeroModern() {
  const { user } = useAuthStore()

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pt-4 pb-8 sm:px-6 lg:px-8">
      <section className="grid items-center gap-7 pt-2 pb-7 md:grid-cols-[minmax(0,1fr)_minmax(430px,0.96fr)] md:gap-14 md:pb-11">
        <div className="max-w-[620px]">
          <span className="inline-flex min-h-[34px] items-center rounded-full border border-[#4f74ff3d] bg-[#23489d42] px-3.5 text-[0.78rem] font-bold text-[#78a8ff] sm:min-h-10 sm:px-4 sm:text-[0.98rem]">
            <span className="mr-2.5 h-2 w-2 rounded-full bg-[#4f7fff] shadow-[0_0_12px_rgba(79,127,255,0.8)]" />
            AI-Powered Enterprise Platform
          </span>
          <h1 className="mt-7 text-[3.7rem] leading-[0.94] font-black tracking-[-0.08em] text-white sm:text-[clamp(4.1rem,8vw,6.8rem)]">
            The Future of
            <span className="block bg-gradient-to-r from-[#4f8cff] via-[#a96cff] to-[#2be4d7] bg-clip-text text-transparent">
              {' '}
              Meetings &
            </span>
            <span className="block bg-gradient-to-r from-[#4f8cff] via-[#a96cff] to-[#2be4d7] bg-clip-text text-transparent">
              {' '}
              Collaboration
            </span>
          </h1>
          <p className="mt-7 max-w-[620px] text-base leading-7 text-white/72 sm:text-[1.1rem] sm:leading-[1.8]">
            IntellMeet transforms how your enterprise connects. Experience
            seamless video conferencing, AI-driven insights, and next-generation
            collaboration tools in one unified workspace.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:mt-9 sm:flex-row">
            <a
              className="inline-flex min-h-[54px] items-center justify-center rounded-[14px] bg-gradient-to-br from-[#4f73ff] to-[#7b5cff] px-6 text-base font-bold text-white no-underline shadow-[0_20px_40px_rgba(79,115,255,0.28)] transition hover:-translate-y-px sm:min-w-[172px]"
              href={user ? '#/dashboard' : '#/login'}
            >
              Host a Meeting
            </a>
            <a
              className="inline-flex min-h-[54px] items-center justify-center rounded-[14px] border border-white/10 bg-white/2 px-6 text-base font-bold text-white no-underline transition hover:-translate-y-px sm:min-w-[172px]"
              href={user ? '#/dashboard' : '#/login'}
            >
              Join with Code
            </a>
          </div>
        </div>

        <div className="relative min-h-[320px] md:min-h-[470px]">
          <div className="relative overflow-hidden rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,17,25,0.96),rgba(12,15,22,0.92))] p-[18px_18px_20px] shadow-[0_30px_80px_rgba(0,0,0,0.34)] md:absolute md:inset-[30px_0_0_34px]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(95,118,255,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(40,220,190,0.08),transparent_26%)]" />
            <div className="pointer-events-none absolute inset-0">
              {liveParticles.map((particle) => (
                <span
                  key={`${particle.left}-${particle.top}`}
                  className={`absolute rounded-full ${particle.size} ${particle.color} animate-pulse shadow-[0_0_16px_rgba(255,255,255,0.22)]`}
                  style={{
                    left: particle.left,
                    top: particle.top,
                    animationDelay: particle.delay,
                    animationDuration: '1.8s',
                  }}
                />
              ))}
            </div>

            <div className="relative mb-[18px] flex items-center">
              <span className="mr-2 h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="mr-2 h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <span className="mr-2 h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              <div className="ml-auto flex items-center gap-3">
                <div className="hidden items-center gap-1 sm:flex">
                  {insightBars.map((bar) => (
                    <span
                      key={bar.delay}
                      className={`h-1 rounded-full bg-cyan-300/70 ${bar.width} animate-pulse`}
                      style={{ animationDelay: bar.delay, animationDuration: '1.3s' }}
                    />
                  ))}
                </div>
                <p className="text-[0.82rem] font-bold text-white/54 sm:text-base">
                  Weekly Sync • Product Team
                </p>
              </div>
            </div>

            <div className="relative grid grid-cols-2 gap-3 sm:gap-4">
              <PresenceCard
                name="Sarah T."
                className="bg-[linear-gradient(180deg,#4a56cf_0%,#303c9e_100%)]"
                badgeClassName="bg-[#1f2d77]/78"
              >
                <div className="rounded-full border border-white/10 bg-white/8 px-2 py-1 text-[10px] font-semibold tracking-[0.18em] text-white/70 uppercase">
                  Live
                </div>
              </PresenceCard>

              <PresenceCard
                name="Michael B."
                className="bg-[linear-gradient(180deg,#1b876f_0%,#0c5d4f_100%)]"
                badgeClassName="bg-[#0c5145]/80"
              >
                <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/8 px-2 py-1 text-[10px] font-semibold text-white/70">
                  <span className="h-1.5 w-1.5 animate-ping rounded-full bg-emerald-300" />
                  synced
                </div>
              </PresenceCard>

              <PresenceCard
                name="Priya K."
                className="bg-[linear-gradient(180deg,#8f31be_0%,#64188e_100%)]"
                badgeClassName="bg-[#541776]/80"
              >
                <div className="rounded-full border border-white/10 bg-white/8 px-2 py-1 text-[10px] font-semibold tracking-[0.18em] text-white/70 uppercase">
                  Focus
                </div>
              </PresenceCard>

              <article className="relative min-h-[110px] overflow-hidden rounded-[22px] border border-white/8 bg-[radial-gradient(circle_at_center,rgba(109,85,255,0.28),rgba(31,24,54,0.96))] sm:min-h-[128px]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,187,94,0.12),transparent_32%)]" />
                <div className="absolute inset-x-6 top-5 flex items-center justify-between">
                  <div className="flex gap-2">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#ffb05e]" />
                    <span
                      className="h-2 w-2 animate-pulse rounded-full bg-[#8e7cff]"
                      style={{ animationDelay: '.4s' }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold tracking-[0.18em] text-white/45 uppercase">
                    AI Live
                  </span>
                </div>
                <div className="absolute inset-0 grid place-items-center text-[2.6rem] text-[#ffb05e] drop-shadow-[0_0_18px_rgba(255,176,94,0.28)]">
                  ✦
                </div>
                <strong className="absolute right-4 bottom-4 left-4 z-10 text-base font-bold leading-7 text-white/92">
                  IntellMeet AI Generating Notes...
                </strong>
              </article>
            </div>
          </div>

          <FloatingChip
            icon="⚡"
            title="Sentiment Analysis"
            text="High engagement detected"
            iconClassName="bg-[linear-gradient(135deg,rgba(255,154,84,0.22),rgba(255,255,255,0.06))] text-[#ff9954]"
            className="top-5 right-[-4px] sm:top-[68px] sm:right-[-12px]"
          />

          <FloatingChip
            icon="◎"
            title="Action Items"
            text="Auto-captured securely"
            iconClassName="bg-[linear-gradient(135deg,rgba(76,122,255,0.2),rgba(255,255,255,0.06))] text-[#7f9dff]"
            className="bottom-[-8px] left-[-4px] sm:bottom-[18px] sm:left-[-14px]"
          />
        </div>
      </section>

      <section className="mt-2 grid gap-[18px] md:grid-cols-3" id="features">
        <article className="rounded-[24px] border border-white/12 bg-white/6 p-[22px] shadow-[0_24px_80px_rgba(0,0,0,0.2)] backdrop-blur-xl">
          <h3 className="mb-2.5 text-[1.1rem] font-bold text-white">AI Intelligence</h3>
          <p className="text-white/72">
            Proprietary AI engine for real-time transcription, translation, and automated summarizing.
          </p>
        </article>
        <article className="rounded-[24px] border border-white/12 bg-white/6 p-[22px] shadow-[0_24px_80px_rgba(0,0,0,0.2)] backdrop-blur-xl">
          <h3 className="mb-2.5 text-[1.1rem] font-bold text-white">Unified Workspace</h3>
          <p className="text-white/72">
            Integrated project boards and team chat to keep all meeting outcomes in one searchable hub.
          </p>
        </article>
        <article className="rounded-[24px] border border-white/12 bg-white/6 p-[22px] shadow-[0_24px_80px_rgba(0,0,0,0.2)] backdrop-blur-xl">
          <h3 className="mb-2.5 text-[1.1rem] font-bold text-white">Bank-Grade Tech</h3>
          <p className="text-white/72">
            Scalable WebRTC infrastructure with Redis-powered real-time sync and E2E encryption.
          </p>
        </article>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.16)] backdrop-blur-xl"
          >
            <p className="text-sm font-semibold tracking-[0.16em] text-white/45 uppercase">
              {stat.label}
            </p>
            <p className="mt-3 text-4xl font-black tracking-[-0.06em] text-white">{stat.value}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.2)] backdrop-blur-xl sm:p-8">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/8 px-3 py-1 text-[11px] font-extrabold tracking-[0.22em] text-cyan-200 uppercase">
              Production Stack
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.05em] text-white sm:text-4xl">
              Engineered for consistency and maximum performance.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-white/68">
              From real-time signaling to AI inference, every layer of IntellMeet is built to support mission-critical enterprise communication.
            </p>
          </div>

          <div className="mt-8 grid gap-4">
            {workflow.map((item, index) => (
              <div
                key={item.title}
                className="flex gap-4 rounded-[22px] border border-white/8 bg-white/4 p-4 backdrop-blur-xl"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4f73ff] to-[#7b5cff] text-sm font-black text-white">
                  0{index + 1}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-white/65">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(14,20,34,0.94),rgba(10,16,28,0.88))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold tracking-[0.18em] text-white/45 uppercase">
                Live adoption
              </p>
              <h3 className="mt-2 text-2xl font-black tracking-[-0.05em] text-white">
                Workspace pulse
              </h3>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-bold text-emerald-200">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
              Healthy
            </span>
          </div>

          <div className="mt-8 space-y-4">
            {showcases.map((item, index) => (
              <div
                key={item.title}
                className="rounded-[20px] border border-white/8 bg-white/4 p-4 backdrop-blur-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-base font-bold text-white">{item.title}</h4>
                    <p className="mt-2 text-sm leading-7 text-white/62">{item.text}</p>
                  </div>
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-cyan-300" />
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/8">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#4f8cff] via-[#8a67ff] to-[#2be4d7]"
                    style={{ width: `${72 + index * 8}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </section>
  )
}

export default HeroModern

