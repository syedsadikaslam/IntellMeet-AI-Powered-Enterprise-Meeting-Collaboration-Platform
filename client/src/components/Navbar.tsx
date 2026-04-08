import { Menu, X, LogOut, Layout } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'

const navItems = [
  { href: '#/features', label: 'Features' },
  { href: '#/solutions', label: 'Solutions' },
  { href: '#/pricing', label: 'Pricing' },
  { href: '#/contact', label: 'Contact' },
]

interface NavbarProps {
  currentRoute: string
}

export default function Navbar({ currentRoute }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuthStore()

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const closeAll = () => {
    setIsOpen(false)
  }

  const handleLogout = () => {
    logout()
    window.location.hash = '#/login'
    closeAll()
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
                className={`mx-6 text-sm font-bold no-underline transition-colors duration-150 ${
                  currentRoute === item.href ? 'text-blue-400' : 'text-white/70 hover:text-white'
                }`}
                href={item.href}
                onClick={closeAll}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="inline-flex items-center gap-3.5">
            {user ? (
              <div className="hidden md:flex items-center gap-4">
                 <a
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      currentRoute === '#/dashboard' 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                      : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                    href="#/dashboard"
                    onClick={closeAll}
                  >
                    <Layout size={14} />
                    Dashboard
                  </a>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all border border-red-500/20"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
              </div>
            ) : (
              <a
                className="hidden items-center justify-center rounded-xl bg-white px-6 py-2.5 text-sm font-black text-black no-underline transition hover:bg-blue-50 active:scale-95 md:inline-flex"
                href="#/login"
                onClick={closeAll}
              >
                Login
              </a>
            )}

            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-white md:hidden hover:bg-white/10 transition-all"
              onClick={() => setIsOpen((open) => !open)}
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsOpen(false)}
          />
          <aside className="fixed top-0 right-0 z-50 flex h-screen w-[min(320px,84vw)] flex-col bg-[#0a0f1d] border-l border-white/10 shadow-2xl animate-slide-in-right">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
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
                onClick={() => setIsOpen(false)}
                className="p-2 bg-white/5 rounded-xl text-white/40 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-2">
              <p className="mb-4 text-[10px] font-black tracking-[0.2em] text-white/20 uppercase">Main Links</p>
              {navItems.map((item) => (
                <a
                  key={item.href}
                  className={`flex items-center h-14 rounded-2xl px-5 text-sm font-bold no-underline transition-all ${
                    currentRoute === item.href
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'bg-white/2 text-white/40 hover:bg-white/5 hover:text-white'
                  }`}
                  href={item.href}
                  onClick={closeAll}
                >
                  {item.label}
                </a>
              ))}
              
              {user && (
                <a
                  href="#/dashboard"
                  onClick={closeAll}
                  className={`flex items-center h-14 rounded-2xl px-5 text-sm font-bold no-underline transition-all mt-2 ${
                    currentRoute === '#/dashboard'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'bg-white/2 text-white/40 hover:bg-white/5'
                  }`}
                >
                  <Layout size={18} className="mr-3" />
                  Dashboard
                </a>
              )}
            </div>

            <div className="p-6 border-t border-white/5">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex h-14 items-center justify-center gap-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm font-black text-red-500 uppercase tracking-widest hover:bg-red-500/20 transition-all"
                >
                  <LogOut size={18} />
                  Logout Session
                </button>
              ) : (
                <a
                  href="#/login"
                  onClick={closeAll}
                  className="w-full flex h-14 items-center justify-center rounded-2xl bg-white text-sm font-black text-black uppercase tracking-widest hover:bg-blue-50 transition-all"
                >
                  Login Portal
                </a>
              )}
            </div>
          </aside>
        </>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        .animate-slide-in-right { animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}} />
    </>
  )
}
