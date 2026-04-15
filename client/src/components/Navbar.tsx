import { Menu, X, LogOut, Layout, Sun, Moon } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { useTheme } from '../providers/ThemeContext'

const navItems = [
  { href: '#/features', label: 'Features' },
  { href: '#/solutions', label: 'Solutions' },
  { href: '#/contact', label: 'Contact' },
]

interface NavbarProps {
  currentRoute: string
}

export default function Navbar({ currentRoute }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useTheme()

  const [isVisible, setIsVisible] = useState(true)
  const lastScrollY = useRef(0)

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset'
    
    // Logic for hiding/showing navbar on scroll
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
        setIsVisible(false) // Scrolling down
      } else {
        setIsVisible(true) // Scrolling up
      }
      lastScrollY.current = currentScrollY
    }

    // Logic for showing navbar on click
    const handleDocumentClick = () => {
      setIsVisible(true)
    }

    if (!isOpen) {
      window.addEventListener('scroll', handleScroll, { passive: true })
      window.addEventListener('click', handleDocumentClick)
    }

    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('click', handleDocumentClick)
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
      <header 
        className={`sticky top-0 z-50 border-b border-border bg-nav-bg px-4 backdrop-blur-xl sm:px-6 lg:px-8 transition-all duration-300 ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="mx-auto flex min-h-[64px] w-full max-w-7xl items-center justify-between gap-3 md:min-h-[78px] md:gap-6">
          <a className="inline-flex items-end gap-px no-underline" href="#/" onClick={closeAll}>
            <span className="inline-flex flex-none items-end justify-center">
              <img
                className="block h-auto w-12 object-contain sm:w-[54px]"
                src="/logo.png"
                alt="IntellMeet logo"
              />
            </span>
            <span className="whitespace-nowrap text-[1.6rem] leading-[0.9] font-black tracking-[-0.05em] text-foreground sm:text-[1.9rem]">
              tellMeet
            </span>
          </a>

          <nav className="hidden flex-1 items-center justify-center md:flex" aria-label="Primary navigation">
            {navItems.map((item) => (
              <a
                key={item.href}
                className={`mx-6 text-sm font-bold no-underline transition-colors duration-150 ${
                  currentRoute === item.href ? 'text-blue-500' : 'text-muted-foreground hover:text-foreground'
                }`}
                href={item.href}
                onClick={closeAll}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="inline-flex items-center gap-3.5">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground transition-all border border-border group"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? (
                <Moon size={18} className="group-hover:rotate-12 transition-transform" />
              ) : (
                <Sun size={18} className="group-hover:rotate-45 transition-transform" />
              )}
            </button>

            {user && (
              <div className="hidden lg:flex items-center gap-2 mr-2">
                <div className="relative group/join">
                  <input 
                    type="text"
                    placeholder="Enter code"
                    id="navbar-join-input"
                    className="w-32 bg-muted border border-border rounded-xl py-2 pl-3 pr-10 text-[11px] font-bold focus:outline-none focus:border-blue-500/50 focus:w-48 transition-all text-foreground"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = (e.target as HTMLInputElement).value;
                        if (val.trim()) window.location.hash = `#/meeting/${val.trim()}`;
                      }
                    }}
                  />
                  <button 
                    onClick={() => {
                      const input = document.getElementById('navbar-join-input') as HTMLInputElement;
                      if (input.value.trim()) window.location.hash = `#/meeting/${input.value.trim()}`;
                    }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-blue-500 font-black text-[10px] uppercase transition-colors"
                  >
                    Join
                  </button>
                </div>
                <div className="w-px h-6 bg-border mx-1" />
              </div>
            )}
            
            {user ? (
              <div className="hidden md:flex items-center gap-4">
                 <a
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      currentRoute === '#/dashboard' 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                      : 'bg-muted text-foreground hover:bg-muted/80'
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
                className="hidden items-center justify-center rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-black text-white no-underline transition hover:bg-blue-500 active:scale-95 md:inline-flex"
                href="#/login"
                onClick={closeAll}
              >
                Login
              </a>
            )}

            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-muted text-foreground md:hidden hover:bg-muted/80 transition-all"
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
          <aside className="fixed top-0 right-0 z-50 flex h-screen w-[min(320px,84vw)] flex-col bg-background border-l border-border shadow-2xl animate-slide-in-right">
            <div className="flex items-center justify-between p-6 border-b border-border">
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
                className="p-2 bg-muted rounded-xl text-muted-foreground hover:text-foreground transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-2">
              <p className="mb-4 text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase">Main Links</p>
              {navItems.map((item) => (
                <a
                  key={item.href}
                  className={`flex items-center h-14 rounded-2xl px-5 text-sm font-bold no-underline transition-all ${
                    currentRoute === item.href
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  }`}
                  href={item.href}
                  onClick={closeAll}
                >
                  {item.label}
                </a>
              ))}
              
              {user ? (
                <div className="pt-4 space-y-4">
                  <a
                    href="#/dashboard"
                    onClick={closeAll}
                    className={`flex items-center h-14 rounded-2xl px-5 text-sm font-bold no-underline transition-all ${
                      currentRoute === '#/dashboard'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <Layout size={18} className="mr-3" />
                    Dashboard
                  </a>
                  <button
                    onClick={handleLogout}
                    className="w-full flex h-14 items-center justify-center gap-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm font-black text-red-500 uppercase tracking-widest hover:bg-red-500/20 transition-all"
                  >
                    <LogOut size={18} />
                    Logout Session
                  </button>
                </div>
              ) : (
                <div className="pt-8">
                  <a
                    href="#/login"
                    onClick={closeAll}
                    className="w-full flex h-14 items-center justify-center rounded-2xl bg-blue-600 text-sm font-black text-white uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
                  >
                    Login Portal
                  </a>
                </div>
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
