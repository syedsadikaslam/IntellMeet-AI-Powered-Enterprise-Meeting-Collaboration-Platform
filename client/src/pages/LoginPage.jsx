import { useState } from 'react'

function LoginPage() {
  const [mode, setMode] = useState('login')

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(360px,430px)]">
        <div>
          <span className="mb-4 inline-flex rounded-full border border-white/12 bg-white/6 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.2em] text-sky-300">
            Welcome Back
          </span>
          <h1 className="text-[clamp(2.6rem,5vw,4.6rem)] leading-[0.98] font-black tracking-[-0.05em] text-white">
            {mode === 'login' ? 'Login to IntellMeet' : 'Create your IntellMeet account'}
          </h1>
          <p className="mt-3 max-w-[56ch] text-[1.02rem] leading-7 text-white/72">
            {mode === 'login'
              ? 'Access your meetings, action items, and AI-generated collaboration workspace.'
              : 'Sign up to start managing meetings, notes, and follow-ups from one unified platform.'}
          </p>

          <div className="mt-7 grid gap-[18px] md:grid-cols-2">
            <article className="rounded-[24px] border border-white/10 bg-white/6 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl">
              <h2 className="mb-3 text-xl font-extrabold text-white">AI meeting notes</h2>
              <p className="text-[15px] leading-7 text-white/72">
                Capture key decisions and summaries instantly after every sync.
              </p>
            </article>
            <article className="rounded-[24px] border border-white/10 bg-white/6 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl">
              <h2 className="mb-3 text-xl font-extrabold text-white">Action tracking</h2>
              <p className="text-[15px] leading-7 text-white/72">
                Assign owners, due dates, and status updates without losing context.
              </p>
            </article>
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/6 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl">
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white/4 p-1.5">
            <button
              type="button"
              className={`min-h-[46px] rounded-xl font-bold ${
                mode === 'login'
                  ? 'bg-gradient-to-br from-[#4f73ff] to-[#7b5cff] text-white'
                  : 'bg-transparent text-white/70'
              }`}
              onClick={() => setMode('login')}
            >
              Login
            </button>
            <button
              type="button"
              className={`min-h-[46px] rounded-xl font-bold ${
                mode === 'signup'
                  ? 'bg-gradient-to-br from-[#4f73ff] to-[#7b5cff] text-white'
                  : 'bg-transparent text-white/70'
              }`}
              onClick={() => setMode('signup')}
            >
              Sign Up
            </button>
          </div>

          <form className="mt-[22px] grid gap-4">
            {mode === 'signup' && (
              <label className="grid gap-2 font-semibold text-white">
                Full Name
                <input
                  className="h-12 rounded-[14px] border border-white/10 bg-white/4 px-3.5 text-white outline-none placeholder:text-white/42 focus:border-[#4f73ffbf] focus:shadow-[0_0_0_4px_rgba(79,115,255,0.16)]"
                  type="text"
                  placeholder="Enter your full name"
                />
              </label>
            )}

            <label className="grid gap-2 font-semibold text-white">
              Email
              <input
                className="h-12 rounded-[14px] border border-white/10 bg-white/4 px-3.5 text-white outline-none placeholder:text-white/42 focus:border-[#4f73ffbf] focus:shadow-[0_0_0_4px_rgba(79,115,255,0.16)]"
                type="email"
                placeholder="Enter your email"
              />
            </label>

            <label className="grid gap-2 font-semibold text-white">
              Password
              <input
                className="h-12 rounded-[14px] border border-white/10 bg-white/4 px-3.5 text-white outline-none placeholder:text-white/42 focus:border-[#4f73ffbf] focus:shadow-[0_0_0_4px_rgba(79,115,255,0.16)]"
                type="password"
                placeholder="Enter your password"
              />
            </label>

            {mode === 'signup' && (
              <label className="grid gap-2 font-semibold text-white">
                Confirm Password
                <input
                  className="h-12 rounded-[14px] border border-white/10 bg-white/4 px-3.5 text-white outline-none placeholder:text-white/42 focus:border-[#4f73ffbf] focus:shadow-[0_0_0_4px_rgba(79,115,255,0.16)]"
                  type="password"
                  placeholder="Confirm your password"
                />
              </label>
            )}

            <button
              type="submit"
              className="mt-1 min-h-[50px] rounded-[14px] bg-gradient-to-br from-[#4f73ff] to-[#7b5cff] text-base font-extrabold text-white"
            >
              {mode === 'login' ? 'Login' : 'Create Account'}
            </button>
          </form>

          <p className="mt-[18px] text-white/72">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            <button
              type="button"
              className="ml-2 bg-transparent font-extrabold text-[#84a9ff]"
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
