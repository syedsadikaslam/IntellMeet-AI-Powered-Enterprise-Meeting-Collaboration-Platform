import { useEffect, useState } from 'react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ContactPage from './pages/ContactPage'
import EmailUsPage from './pages/EmailUsPage'
import EnterprisePage from './pages/EnterprisePage'
import FeaturesPage from './pages/FeaturesPage'
import HelpCenterPage from './pages/HelpCenterPage'
import Hero from './pages/Hero'
import AuthPage from './pages/AuthPage'
import MeetingRoom from './pages/MeetingRoom'
import MeetingLobby from './pages/MeetingLobby'
import Dashboard from './pages/Dashboard'
import ProjectBoard from './pages/ProjectBoard'
import ProtectedRoute from './components/ProtectedRoute'
import PlansPage from './pages/PlansPage'
import ProductPage from './pages/ProductPage'
import SolutionsPage from './pages/SolutionsPage'
import TalkToSalesPage from './pages/TalkToSalesPage'
import { ThemeProvider } from './providers/ThemeContext'

const routes: Record<string, any> = {
  '#/': Hero,
  '#/features': FeaturesPage,
  '#/solutions': SolutionsPage,
  '#/login': AuthPage,
  '#/dashboard': Dashboard,
  '#/contact': ContactPage,
  '#/enterprise': EnterprisePage,
  '#/product': ProductPage,
  '#/plans': PlansPage,
  '#/help-center': HelpCenterPage,
  '#/talk-to-sales': TalkToSalesPage,
  '#/email-us': EmailUsPage,
}

function resolveRoute(hash: string) {
  // Handle static routes
  if (routes[hash]) {
    const Component = routes[hash]
    // Wrap Dashboard in ProtectedRoute
    if (hash === '#/dashboard') {
      return { 
        Component: () => <ProtectedRoute><Dashboard /></ProtectedRoute>, 
        params: {} as any 
      }
    }
    return { Component: routes[hash], params: {} as any }
  }

  // Handle dynamic meeting route: #/meeting/CODE/room
  if (hash.startsWith('#/meeting/') && hash.endsWith('/room')) {
    const code = hash.split('#/meeting/')[1].split('/room')[0]
    return { 
      Component: () => <ProtectedRoute><MeetingRoom meetingCode={code} /></ProtectedRoute>, 
      params: { code } 
    }
  }

  // Handle dynamic meeting lobby: #/meeting/CODE
  if (hash.startsWith('#/meeting/')) {
    const code = hash.split('#/meeting/')[1]
    return { 
      Component: () => <ProtectedRoute><MeetingLobby meetingCode={code} /></ProtectedRoute>, 
      params: { code } 
    }
  }

  // Handle dynamic project board: #/projects/ID
  if (hash.startsWith('#/projects/')) {
    const id = hash.split('#/projects/')[1]
    return { 
      Component: () => <ProtectedRoute><ProjectBoard projectId={id} /></ProtectedRoute>, 
      params: { id } 
    }
  }

  return { Component: Hero, params: {} }
}

function App() {
  const [routeInfo, setRouteInfo] = useState(() => resolveRoute(window.location.hash || '#/'))

  useEffect(() => {
    const handleHashChange = () => {
      setRouteInfo(resolveRoute(window.location.hash))
    }

    if (!window.location.hash) {
      window.location.hash = '#/'
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [routeInfo])

  const { Component, params } = routeInfo
  const currentHash = window.location.hash
  const isInMeetingRoom = currentHash.startsWith('#/meeting/') && currentHash.endsWith('/room')
  const isProjectBoard = currentHash.startsWith('#/projects/')
  const hideGlobalUI = isInMeetingRoom || isProjectBoard

  return (
    <ThemeProvider>
      <main className={`min-h-screen text-foreground transition-colors duration-300 ${isInMeetingRoom ? 'dark bg-black' : ''}`}>
        {/* Strictly hide global Navbar and Footer in MeetingRoom and ProjectBoard to restore immersion */}
        {!hideGlobalUI && <Navbar currentRoute={currentHash} />}
        <Component meetingCode={params.code} />
        {!hideGlobalUI && <Footer />}
        <SpeedInsights />
      </main>
    </ThemeProvider>
  )
}

export default App
