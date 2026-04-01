function Hero() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid items-center gap-7 py-7 md:grid-cols-[minmax(0,1fr)_minmax(430px,0.96fr)] md:gap-14 md:py-11">
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
              href="#/contact"
            >
              Start for free
            </a>
            <a
              className="inline-flex min-h-[54px] items-center justify-center rounded-[14px] border border-white/10 bg-white/2 px-6 text-base font-bold text-white no-underline transition hover:-translate-y-px sm:min-w-[172px]"
              href="#/solutions"
            >
              Request Demo
            </a>
          </div>
        </div>

        <div className="relative min-h-[320px] md:min-h-[470px]">
          <div className="relative rounded-[28px] border border-white/8 bg-[rgba(15,18,24,0.82)] p-[18px_18px_20px] shadow-[0_30px_80px_rgba(0,0,0,0.34)] md:absolute md:inset-[30px_0_0_34px]">
            <div className="mb-[18px] flex items-center">
              <span className="mr-2 h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="mr-2 h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <span className="mr-2 h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              <p className="ml-auto text-[0.82rem] font-bold text-white/54 sm:text-base">
                Weekly Sync • Product Team
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <article className="relative min-h-[110px] overflow-hidden rounded-[18px] border border-white/6 bg-gradient-to-b from-[#3947b7] to-[#27357e] sm:min-h-[128px]">
                <span className="absolute bottom-3.5 left-3.5 inline-flex min-h-[30px] items-center rounded-[10px] bg-black/35 px-3 text-sm font-bold text-white">
                  Sarah T.
                </span>
              </article>
              <article className="relative min-h-[110px] overflow-hidden rounded-[18px] border border-white/6 bg-gradient-to-b from-[#187b64] to-[#0c4d3f] sm:min-h-[128px]">
                <span className="absolute bottom-3.5 left-3.5 inline-flex min-h-[30px] items-center rounded-[10px] bg-black/35 px-3 text-sm font-bold text-white">
                  Michael B.
                </span>
              </article>
              <article className="relative min-h-[110px] overflow-hidden rounded-[18px] border border-white/6 bg-gradient-to-b from-[#7d2daa] to-[#53167f] sm:min-h-[128px]">
                <span className="absolute bottom-3.5 left-3.5 inline-flex min-h-[30px] items-center rounded-[10px] bg-black/35 px-3 text-sm font-bold text-white">
                  Priya K.
                </span>
              </article>
              <article className="relative min-h-[110px] overflow-hidden rounded-[18px] border border-white/6 bg-[radial-gradient(circle_at_center,rgba(109,85,255,0.28),rgba(31,24,54,0.92))] sm:min-h-[128px]">
                <div className="absolute inset-0 grid place-items-center text-[2.8rem] text-[#ffb05e]">
                  ✦
                </div>
                <strong className="absolute bottom-3.5 left-3.5 z-10 text-base font-bold text-white/90">
                  IntellMeet AI Generating Notes...
                </strong>
              </article>
            </div>
          </div>

          <div className="absolute top-5 right-[-4px] flex max-w-[210px] items-center gap-3.5 rounded-[22px] border border-white/8 bg-[rgba(18,22,30,0.84)] p-3.5 shadow-[0_24px_40px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:right-[-12px] sm:top-[68px] sm:min-w-[244px] sm:max-w-none sm:p-[16px_18px]">
            <div className="grid h-[42px] w-[42px] place-items-center rounded-[14px] bg-white/8">
              ⚡
            </div>
            <div>
              <strong className="block text-base font-bold text-white">Sentiment Analysis</strong>
              <p className="mt-1 text-[0.88rem] text-white/56">High engagement detected</p>
            </div>
          </div>

          <div className="absolute bottom-[-8px] left-[-4px] flex max-w-[210px] items-center gap-3.5 rounded-[22px] border border-white/8 bg-[rgba(18,22,30,0.84)] p-3.5 shadow-[0_24px_40px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:bottom-[18px] sm:left-[-14px] sm:min-w-[244px] sm:max-w-none sm:p-[16px_18px]">
            <div className="grid h-[42px] w-[42px] place-items-center rounded-[14px] bg-white/8">
              🎯
            </div>
            <div>
              <strong className="block text-base font-bold text-white">Action Items</strong>
              <p className="mt-1 text-[0.88rem] text-white/56">Auto-captured securely</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-2 grid gap-[18px] md:grid-cols-3" id="features">
        <article className="rounded-[24px] border border-white/12 bg-white/6 p-[22px] shadow-[0_24px_80px_rgba(0,0,0,0.2)] backdrop-blur-xl">
          <h3 className="mb-2.5 text-[1.1rem] font-bold text-white">Shared context</h3>
          <p className="text-white/72">
            Keep agendas, notes, and recordings connected to the same meeting
            timeline.
          </p>
        </article>
        <article className="rounded-[24px] border border-white/12 bg-white/6 p-[22px] shadow-[0_24px_80px_rgba(0,0,0,0.2)] backdrop-blur-xl">
          <h3 className="mb-2.5 text-[1.1rem] font-bold text-white">Action tracking</h3>
          <p className="text-white/72">
            Turn decisions into follow-ups with owners, due dates, and status
            updates.
          </p>
        </article>
        <article className="rounded-[24px] border border-white/12 bg-white/6 p-[22px] shadow-[0_24px_80px_rgba(0,0,0,0.2)] backdrop-blur-xl">
          <h3 className="mb-2.5 text-[1.1rem] font-bold text-white">Team visibility</h3>
          <p className="text-white/72">
            Give every stakeholder a quick view of what changed, what is next,
            and who is responsible.
          </p>
        </article>
      </section>
    </section>
  )
}

export default Hero
