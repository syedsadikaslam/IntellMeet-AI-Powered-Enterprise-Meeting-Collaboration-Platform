import { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import api from '../utils/api'
import { ChevronRight, Eye, EyeOff, Lock, Mail, User as UserIcon, ShieldCheck } from 'lucide-react'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')

  const { setUser, setToken } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (mode === 'signup' && formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match')
      }

      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register'
      const response = await api.post(endpoint, formData)

      const data = response.data
      const user = {
        id: data._id,
        name: data.name,
        email: data.email,
        avatar: data.avatar
      }
      const token = data.accessToken
      const refreshToken = data.refreshToken

      setUser(user)
      setToken(token, refreshToken)
      localStorage.setItem('token', token)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(user))

      window.location.hash = '#/dashboard'
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background transition-colors duration-300">
      <div className="w-full max-w-md">
        {/* Simplified Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black tracking-tight text-foreground mb-2">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            {mode === 'login' 
              ? 'Enter your credentials to access your workspace' 
              : 'Join thousands of teams using IntellMeet AI'}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-card border border-border rounded-[32px] p-6 sm:p-8 shadow-2xl transition-colors">
          <div className="flex gap-2 p-1.5 bg-muted rounded-2xl mb-8 border border-border">
            <button 
              onClick={() => setMode('login')}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'login' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Login
            </button>
            <button 
              onClick={() => setMode('signup')}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'signup' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-500 text-xs font-bold flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Full Name</label>
                <div className="relative group">
                  <input 
                    required
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-muted border border-border rounded-xl p-4 pl-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500 focus:bg-background transition-all font-medium"
                  />
                  <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-600 transition-colors" />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Email Address</label>
              <div className="relative group">
                <input 
                  required
                  type="email"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-muted border border-border rounded-xl p-4 pl-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500 focus:bg-background transition-all font-medium"
                />
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-600 transition-colors" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Password</label>
                 {mode === 'login' && (
                   <a href="#" className="text-[10px] font-black uppercase tracking-[0.1em] text-blue-600 hover:text-blue-500 transition-colors">Forgot?</a>
                 )}
              </div>
              <div className="relative group">
                <input 
                  required
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-muted border border-border rounded-xl p-4 pl-12 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500 focus:bg-background transition-all font-medium"
                />
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-600 transition-colors" />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Confirm Identity</label>
                <div className="relative group">
                  <input 
                    required
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="w-full bg-muted border border-border rounded-xl p-4 pl-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500 focus:bg-background transition-all font-medium"
                  />
                  <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-600 transition-colors" />
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-foreground text-background font-black uppercase tracking-[0.2em] text-[11px] py-4 rounded-xl mt-6 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-foreground/10 hover:shadow-foreground/20"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-background/20 border-t-background rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-border flex flex-col items-center gap-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">
              Secure enterprise-grade access
            </p>
            <div className="flex items-center gap-1.5 text-blue-600/20">
              <div className="w-1.5 h-1.5 rounded-full bg-current" />
              <div className="w-1.5 h-1.5 rounded-full bg-current" />
              <div className="w-1.5 h-1.5 rounded-full bg-current" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
