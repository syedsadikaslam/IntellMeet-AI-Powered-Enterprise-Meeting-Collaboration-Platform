import { Menu, X, LogOut, Layout, Sun, Moon, User as UserIcon, Zap, Shield, HelpCircle, ChevronRight, Home } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { useTheme } from '../providers/ThemeContext'

const navItems = [
  { href: '#/features', label: 'Features', icon: Zap },
  { href: '#/solutions', label: 'Solutions', icon: Shield },
  { href: '#/contact', label: 'Contact', icon: HelpCircle },
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

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
      lastScrollY.current = currentScrollY
    }

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
        className={`sticky top-0 z-50 border-b border-border bg-nav-bg px-4 backdrop-blur-xl sm:px-6 lg:px-8 transition-all duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
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
                className={`mx-6 text-sm font-bold no-underline transition-colors duration-150 ${currentRoute === item.href ? 'text-blue-500' : 'text-muted-foreground hover:text-foreground'}`}
                href={item.href}
                onClick={closeAll}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="inline-flex items-center gap-3.5">
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
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${currentRoute === '#/dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-muted text-foreground hover:bg-muted/80'}`}
                  href="#/dashboard"
                  onClick={closeAll}
                >
                  <Layout size={14} />
                  Dashboard
                </a>
                <a
                  className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all hover:scale-110 active:scale-95 ${currentRoute === '#/profile' ? 'ring-2 ring-blue-600 ring-offset-2 ring-offset-background' : 'border-2 border-blue-500/30 hover:border-blue-500'}`}
                  href="#/profile"
                  onClick={closeAll}
                  title="User Profile"
                >
                  <div className="w-full h-full rounded-full overflow-hidden bg-muted">
                    {user.avatar ? (
                      <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <UserIcon size={18} />
                      </div>
                    )}
                  </div>
                </a>
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

      {/* Balanced Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />
      <aside 
        className={`fixed top-0 right-0 z-50 flex h-screen w-[min(300px,80vw)] flex-col bg-background border-l border-border shadow-xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
           <div className="flex items-center gap-2">
             <img src="/logo.png" className="h-8 w-8 object-contain" alt="Logo" />
             <span className="font-bold text-lg tracking-tight">tellMeet</span>
           </div>
           <button onClick={() => setIsOpen(false)} className="p-2 bg-muted rounded-lg text-muted-foreground">
             <X size={20} />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-2">
           <a
              href="#/"
              onClick={closeAll}
              className={`flex items-center gap-3 h-12 rounded-xl px-4 text-sm font-bold transition-all ${currentRoute === '#/' ? 'bg-blue-50 text-blue-600 dark:bg-blue-600/10' : 'text-muted-foreground hover:bg-muted'}`}
           >
              <Home size={18} />
              <span>Home</span>
           </a>

           {navItems.map((item) => (
             <a
                key={item.href}
                href={item.href}
                onClick={closeAll}
                className={`flex items-center justify-between h-12 rounded-xl px-4 text-sm font-bold transition-all ${currentRoute === item.href ? 'bg-blue-50 text-blue-600 dark:bg-blue-600/10' : 'text-muted-foreground hover:bg-muted'}`}
             >
                <div className="flex items-center gap-3">
                   <item.icon size={18} />
                   <span>{item.label}</span>
                </div>
                <ChevronRight size={14} className="opacity-40" />
             </a>
           ))}

           {user && (
             <>
               <a
                  href="#/dashboard"
                  onClick={closeAll}
                  className={`flex items-center gap-3 h-12 rounded-xl px-4 text-sm font-bold transition-all ${currentRoute === '#/dashboard' ? 'bg-blue-50 text-blue-600 dark:bg-blue-600/10' : 'text-muted-foreground hover:bg-muted'}`}
               >
                  <Layout size={18} />
                  <span>Dashboard</span>
               </a>
               <a
                  href="#/profile"
                  onClick={closeAll}
                  className={`flex items-center justify-between h-12 rounded-xl px-4 text-sm font-bold transition-all ${currentRoute === '#/profile' ? 'bg-blue-50 text-blue-600 dark:bg-blue-600/10' : 'text-muted-foreground hover:bg-muted'}`}
               >
                  <div className="flex items-center gap-3">
                     {user.avatar ? (
                        <img src={user.avatar} className="w-5 h-5 rounded-full object-cover" alt="Me" />
                     ) : (
                        <UserIcon size={18} />
                     )}
                     <span>My Profile</span>
                  </div>
                  <ChevronRight size={14} className="opacity-40" />
               </a>
               <button
                 onClick={handleLogout}
                 className="w-full flex items-center justify-center gap-3 h-14 rounded-2xl bg-red-50 border border-red-100 text-sm font-black text-red-600 uppercase tracking-widest hover:bg-red-100 transition-all active:scale-[0.98] mt-4 shadow-sm shadow-red-500/5"
               >
                 <LogOut size={18} />
                 <span>Logout Session</span>
               </button>
             </>
           )}

           {!user && (
             <a
               href="#/login"
               onClick={closeAll}
               className="flex items-center h-12 rounded-xl px-4 text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 mt-4"
             >
               Login Portal
             </a>
           )}
        </div>
      </aside>
    </>
  )
}
