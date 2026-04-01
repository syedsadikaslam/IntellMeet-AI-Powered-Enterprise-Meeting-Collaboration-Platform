import { Briefcase, Globe, Mail } from 'lucide-react'

function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="footer-intro">
        <h2>IntellMeet</h2>
        <p>
          AI-powered meeting collaboration for teams that want clearer discussions,
          faster follow-ups, and better visibility across every project.
        </p>
      </div>

      <div className="footer-grid">
        <div className="footer-column">
          <h3>Explore</h3>
          <a href="#/">Home</a>
          <a href="#/features">Features</a>
          <a href="#/solutions">Solutions</a>
          <a href="#/pricing">Pricing</a>
        </div>

        <div className="footer-column">
          <h3>Company</h3>
          <a href="#/contact">Contact</a>
          <a href="#/login">Login</a>
          <a href="#/enterprise">Enterprise</a>
          <a href="#/product">Product</a>
        </div>

        <div className="footer-column">
          <h3>Support</h3>
          <a href="#/email-us">Email Us</a>
          <a href="#/plans">Plans</a>
          <a href="#/help-center">Help Center</a>
          <a href="#/talk-to-sales">Talk to Sales</a>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-socials">
          <SocialLink href="https://github.com" label="GitHub">
            <Globe size={18} />
          </SocialLink>
          <SocialLink href="https://www.linkedin.com" label="LinkedIn">
            <Briefcase size={18} />
          </SocialLink>
          <SocialLink href="mailto:contact@intellmeet.ai" label="Email">
            <Mail size={18} />
          </SocialLink>
        </div>

        <p>(c) {year} IntellMeet. All rights reserved.</p>
      </div>
    </footer>
  )
}

function SocialLink({ href, label, children }) {
  return (
    <a
      className="footer-social-link"
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
