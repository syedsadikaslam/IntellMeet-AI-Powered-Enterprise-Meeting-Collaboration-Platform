export function PageWrap({ children }) {
  return <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</section>
}

export function PageHero({ kicker, title, description }) {
  return (
    <div className="mb-8 max-w-3xl">
      <span className="mb-4 inline-flex rounded-full border border-white/12 bg-white/6 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.2em] text-sky-300">
        {kicker}
      </span>
      <h1 className="text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl">{title}</h1>
      <p className="mt-4 max-w-3xl text-base leading-8 text-white/72 sm:text-lg">{description}</p>
    </div>
  )
}

export function CardGrid({ children }) {
  return <section className="grid gap-5 md:grid-cols-3">{children}</section>
}

export function InfoCard({ title, children }) {
  return (
    <article className="rounded-[24px] border border-white/12 bg-white/6 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.2)] backdrop-blur-xl">
      <h2 className="mb-3 text-xl font-extrabold text-white">{title}</h2>
      <div className="space-y-3 text-[15px] leading-7 text-white/72">{children}</div>
    </article>
  )
}
