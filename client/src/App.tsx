import { useEffect, useState } from 'react'
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
import ProtectedRoute from './components/ProtectedRoute'
import PlansPage from './pages/PlansPage'
import PricingPage from './pages/PricingPage'
import ProductPage from './pages/ProductPage'
import SolutionsPage from './pages/SolutionsPage'
import TalkToSalesPage from './pages/TalkToSalesPage'

const routes: Record<string, any> = {
  '#/': Hero,
  '#/features': FeaturesPage,
  '#/solutions': SolutionsPage,
  '#/pricing': PricingPage,
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

  return (
    <main className="min-h-screen text-slate-50">
      {/* Don't show global Navbar in MeetingRoom to keep it clean */}
      {Component !== MeetingRoom && <Navbar currentRoute={window.location.hash} />}
      <Component meetingCode={params.code} />
      {Component !== MeetingRoom && <Footer />}
    </main>
  )
}

export default App
