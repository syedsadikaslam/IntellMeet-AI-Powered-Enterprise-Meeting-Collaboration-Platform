import { Briefcase, Globe, Mail } from 'lucide-react'

function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="mx-auto mt-9 w-full max-w-7xl border-t border-border px-4 py-7 text-muted-foreground sm:px-6 lg:px-8">
      <div className="max-w-[540px]">
        <h2 className="text-[1.05rem] font-black text-foreground sm:text-[1.3rem]">IntellMeet</h2>
        <p className="mt-2 text-[0.92rem] leading-7 text-muted-foreground/80 sm:mt-2.5 sm:text-base sm:leading-7">
          AI-powered meeting collaboration for teams that want clearer discussions,
          faster follow-ups, and better visibility across every project.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-[18px] sm:mt-[30px] sm:grid-cols-3 sm:gap-7 md:grid-cols-4">
        <div>
          <div className="flex flex-col gap-2.5">
            <h3 className="text-[0.88rem] font-extrabold text-foreground sm:text-[0.95rem]">Explore</h3>
            <a className="text-[0.88rem] no-underline transition hover:text-accent sm:text-base" href="#/">Home</a>
            <a className="text-[0.88rem] no-underline transition hover:text-accent sm:text-base" href="#/features">Features</a>
            <a className="text-[0.88rem] no-underline transition hover:text-accent sm:text-base" href="#/solutions">Solutions</a>
          </div>
        </div>

        <div>
          <div className="flex flex-col gap-2.5">
            <h3 className="text-[0.88rem] font-extrabold text-foreground sm:text-[0.95rem]">Company</h3>
            <a className="text-[0.88rem] no-underline transition hover:text-accent sm:text-base" href="#/contact">Contact</a>
            <a className="text-[0.88rem] no-underline transition hover:text-accent sm:text-base" href="#/login">Login</a>
            <a className="text-[0.88rem] no-underline transition hover:text-accent sm:text-base" href="#/enterprise">Enterprise</a>
            <a className="text-[0.88rem] no-underline transition hover:text-accent sm:text-base" href="#/product">Product</a>
          </div>
        </div>

        <div>
          <div className="flex flex-col gap-2.5">
            <h3 className="text-[0.88rem] font-extrabold text-foreground sm:text-[0.95rem]">Support</h3>
            <a className="text-[0.88rem] no-underline transition hover:text-accent sm:text-base" href="#/email-us">Email Us</a>
            <a className="text-[0.88rem] no-underline transition hover:text-accent sm:text-base" href="#/plans">Plans</a>
            <a className="text-[0.88rem] no-underline transition hover:text-accent sm:text-base" href="#/help-center">Help Center</a>
            <a className="text-[0.88rem] no-underline transition hover:text-accent sm:text-base" href="#/talk-to-sales">Talk to Sales</a>
          </div>
        </div>
      </div>

      <div className="mt-7 flex flex-col items-center gap-3.5 border-t border-border pt-5 text-center sm:flex-row sm:justify-between">
        <div className="inline-flex items-center gap-3">
          <SocialLink href="https://github.com/syedsadikaslam" label="GitHub">
            <Globe size={18} />
          </SocialLink>
          <SocialLink href="https://www.linkedin.com/in/𝐌𝐝-𝐒𝐚𝐝𝐢𝐤-9104a2252" label="LinkedIn">
            <Briefcase size={18} />
          </SocialLink>
          <SocialLink href="mailto:mdsadiksadik464@gmail.com" label="Email">
            <Mail size={18} />
          </SocialLink>
        </div>

        <p className="text-[0.8rem] text-muted-foreground/60 sm:text-[0.95rem]">
          © {year} IntellMeet. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

function SocialLink({ href, label, children }) {
  return (
    <a
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted/30 text-muted-foreground transition hover:border-accent/40 hover:bg-accent/10 hover:text-accent"
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noreferrer' : undefined}
      aria-label={label}
    >
      {children}
    </a>
  )
}

export default SiteFooter

