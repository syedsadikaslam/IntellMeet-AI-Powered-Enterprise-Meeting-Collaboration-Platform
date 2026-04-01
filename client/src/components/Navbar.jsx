import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'

const navItems = [
  { href: '#/features', label: 'Features' },
  { href: '#/solutions', label: 'Solutions' },
  { href: '#/pricing', label: 'Pricing' },
  { href: '#/contact', label: 'Contact' },
]

function Navbar({ currentRoute }) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const closeAll = () => {
    setIsOpen(false)
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="#/" onClick={closeAll}>
            <span className="brand-mark">
              <img className="brand-logo" src="/logo.png" alt="IntellMeet logo" />
            </span>
            <span className="brand-name">tellMeet</span>
          </a>

          <nav className="nav-links" aria-label="Primary navigation">
            {navItems.map((item) => (
              <a
                key={item.href}
                className={currentRoute === item.href ? 'active' : ''}
                href={item.href}
                onClick={closeAll}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="nav-actions">
            <a className="login-button" href="#/login" onClick={closeAll}>
              Login
            </a>
            <button
              type="button"
              className="mobile-menu-button"
              aria-label="Toggle menu"
              aria-expanded={isOpen}
              onClick={() => setIsOpen((open) => !open)}
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {isOpen && (
        <>
          <button
            type="button"
            className="mobile-drawer-backdrop"
            aria-label="Close menu"
            onClick={() => setIsOpen(false)}
          />
          <aside className="mobile-drawer">
            <div className="mobile-drawer-top">
              <a className="mobile-drawer-brand" href="#/" onClick={closeAll}>
                <span className="brand-mark">
                  <img className="brand-logo" src="/logo.png" alt="IntellMeet logo" />
                </span>
                <span className="brand-name">IntellMeet</span>
              </a>

              <button
                type="button"
                className="mobile-drawer-close"
                aria-label="Close menu"
                onClick={() => setIsOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="mobile-drawer-section">
              <p>Navigation</p>
              {navItems.map((item) => (
                <a
                  key={item.href}
                  className={currentRoute === item.href ? 'active' : ''}
                  href={item.href}
                  onClick={closeAll}
                >
                  {item.label}
                </a>
              ))}
            </div>

            <a className="mobile-drawer-cta" href="#/login" onClick={closeAll}>
              Login
            </a>
          </aside>
        </>
      )}
    </>
  )
}

export default Navbar
