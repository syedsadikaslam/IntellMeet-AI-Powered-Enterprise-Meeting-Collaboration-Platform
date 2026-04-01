import { useState } from 'react'

function LoginPage() {
  const [mode, setMode] = useState('login')

  return (
    <section className="auth-page">
      <div className="auth-shell">
        <div className="auth-copy">
          <span className="page-kicker">Welcome Back</span>
          <h1>{mode === 'login' ? 'Login to IntellMeet' : 'Create your IntellMeet account'}</h1>
          <p>
            {mode === 'login'
              ? 'Access your meetings, action items, and AI-generated collaboration workspace.'
              : 'Sign up to start managing meetings, notes, and follow-ups from one unified platform.'}
          </p>

          <div className="auth-benefits">
            <article className="info-card">
              <h2>AI meeting notes</h2>
              <p>Capture key decisions and summaries instantly after every sync.</p>
            </article>
            <article className="info-card">
              <h2>Action tracking</h2>
              <p>Assign owners, due dates, and status updates without losing context.</p>
            </article>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-toggle">
            <button
              type="button"
              className={mode === 'login' ? 'active' : ''}
              onClick={() => setMode('login')}
            >
              Login
            </button>
            <button
              type="button"
              className={mode === 'signup' ? 'active' : ''}
              onClick={() => setMode('signup')}
            >
              Sign Up
            </button>
          </div>

          <form className="auth-form">
            {mode === 'signup' && (
              <label>
                Full Name
                <input type="text" placeholder="Enter your full name" />
              </label>
            )}

            <label>
              Email
              <input type="email" placeholder="Enter your email" />
            </label>

            <label>
              Password
              <input type="password" placeholder="Enter your password" />
            </label>

            {mode === 'signup' && (
              <label>
                Confirm Password
                <input type="password" placeholder="Confirm your password" />
              </label>
            )}

            <button type="submit" className="auth-submit">
              {mode === 'login' ? 'Login' : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            >
              {mode === 'login' ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </section>
  )
}

export default LoginPage
