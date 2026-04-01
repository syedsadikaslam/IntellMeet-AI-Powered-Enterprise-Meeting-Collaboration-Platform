import './App.css'
import { useEffect, useState } from 'react'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import ContactPage from './pages/ContactPage'
import FeaturesPage from './pages/FeaturesPage'
import Hero from './pages/Hero'
import LoginPage from './pages/LoginPage'
import PricingPage from './pages/PricingPage'
import SolutionsPage from './pages/SolutionsPage'

const routes = {
  '#/': Hero,
  '#/features': FeaturesPage,
  '#/solutions': SolutionsPage,
  '#/pricing': PricingPage,
  '#/login': LoginPage,
  '#/contact': ContactPage,
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

  const CurrentPage = routes[currentRoute] ?? Hero

  return (
    <main className="app-shell">
      <Navbar currentRoute={currentRoute} />
      <CurrentPage />
      <Footer />
    </main>
  )
}

export default App
