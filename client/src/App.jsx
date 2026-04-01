import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ContactPage from './pages/ContactPage'
import EmailUsPage from './pages/EmailUsPage'
import EnterprisePage from './pages/EnterprisePage'
import FeaturesPage from './pages/FeaturesPage'
import HelpCenterPage from './pages/HelpCenterPage'
import Hero from './pages/Hero'
import LoginPage from './pages/LoginPage'
import PlansPage from './pages/PlansPage'
import PricingPage from './pages/PricingPage'
import ProductPage from './pages/ProductPage'
import SolutionsPage from './pages/SolutionsPage'
import TalkToSalesPage from './pages/TalkToSalesPage'

const routes = {
  '#/': Hero,
  '#/features': FeaturesPage,
  '#/solutions': SolutionsPage,
  '#/pricing': PricingPage,
  '#/login': LoginPage,
  '#/contact': ContactPage,
  '#/enterprise': EnterprisePage,
  '#/product': ProductPage,
  '#/plans': PlansPage,
  '#/help-center': HelpCenterPage,
  '#/talk-to-sales': TalkToSalesPage,
  '#/email-us': EmailUsPage,
}

function getCurrentRoute() {
  const { hash, pathname } = window.location

  if (routes[hash]) {
    return hash
  }

  const pathnameRoute = `#${pathname}`
  if (routes[pathnameRoute]) {
    return pathnameRoute
  }

  return '#/'
}

function App() {
  const [currentRoute, setCurrentRoute] = useState(getCurrentRoute)

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(getCurrentRoute())
    }

    if (!window.location.hash) {
      const pathnameRoute = `#${window.location.pathname}`
      window.location.hash = routes[pathnameRoute] ? pathnameRoute : '#/'
    }

    window.addEventListener('hashchange', handleHashChange)

    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentRoute])

  const CurrentPage = routes[currentRoute] ?? Hero

  return (
    <main className="min-h-screen text-slate-50">
      <Navbar currentRoute={currentRoute} />
      <CurrentPage />
      <Footer />
    </main>
  )
}

export default App

