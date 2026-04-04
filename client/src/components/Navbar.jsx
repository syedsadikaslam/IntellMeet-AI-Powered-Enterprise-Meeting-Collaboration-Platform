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
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[rgba(4,6,8,0.96)] px-4 backdrop-blur-[14px] sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[60px] w-full max-w-7xl items-center justify-between gap-3 md:min-h-[78px] md:gap-6">
          <a className="inline-flex items-end gap-px no-underline" href="#/" onClick={closeAll}>
            <span className="inline-flex flex-none items-end justify-center">
              <img
                className="block h-auto w-10 object-contain sm:w-[54px]"
                src="/logo.png"
                alt="IntellMeet logo"
              />
            </span>
            <span className="whitespace-nowrap text-[1.28rem] leading-[0.9] font-black tracking-[-0.05em] text-white sm:text-[1.9rem]">
              tellMeet
            </span>
          </a>

          <nav className="hidden flex-1 items-center justify-center md:flex" aria-label="Primary navigation">
            {navItems.map((item) => (
              <a
                key={item.href}
                className={`mx-6 text-base font-bold no-underline transition-colors duration-150 ${
                  currentRoute === item.href ? 'text-white' : 'text-white/72 hover:text-white'
                }`}
                href={item.href}
                onClick={closeAll}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="inline-flex items-center gap-3.5">
            <a
              className="hidden min-w-[84px] items-center justify-center rounded-xl border border-white/8 bg-white/3 px-[18px] py-2.5 text-base font-bold text-white no-underline transition hover:border-white/14 hover:bg-white/8 md:inline-flex"
              href="#/login"
              onClick={closeAll}
            >
              Login
            </a>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-white/4 text-white md:hidden"
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
            className="fixed inset-0 z-40 border-0 bg-slate-900/42"
            aria-label="Close menu"
            onClick={() => setIsOpen(false)}
          />
          <aside className="fixed top-0 right-0 z-50 flex h-screen w-[min(320px,84vw)] flex-col gap-6 bg-white px-5 py-6 text-slate-900 shadow-[-18px_0_46px_rgba(15,23,42,0.16)]">
            <div className="flex items-center justify-between">
              <a className="inline-flex items-end gap-px no-underline" href="#/" onClick={closeAll}>
                <span className="inline-flex flex-none items-end justify-center">
                  <img
                    className="block h-auto w-10 object-contain"
                    src="/logo.png"
                    alt="IntellMeet logo"
                  />
                </span>
              </a>

              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-900 shadow-[0_8px_18px_rgba(15,23,42,0.08)]"
                aria-label="Close menu"
                onClick={() => setIsOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              <p className="mb-1 text-xs font-extrabold tracking-[0.12em] text-slate-500 uppercase">
                Navigation
              </p>
              {navItems.map((item) => (
                <a
                  key={item.href}
                  className={`flex min-h-12 items-center rounded-[14px] border px-4 text-base font-bold no-underline ${
                    currentRoute === item.href
                      ? 'border-blue-200 bg-blue-50 text-blue-600'
                      : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                  href={item.href}
                  onClick={closeAll}
                >
                  {item.label}
                </a>
              ))}
            </div>

            <a
              className="mt-auto flex min-h-12 items-center justify-center rounded-[14px] bg-gradient-to-r from-[#4f73ff] to-[#7b5cff] px-4 text-base font-bold text-white no-underline"
              href="#/login"
              onClick={closeAll}
            >
              Login
            </a>
          </aside>
        </>
      )}
    </>
  )
}

export default Navbar