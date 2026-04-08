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
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#030507] overflow-hidden relative">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center bg-white/[0.02] border border-white/5 rounded-[40px] sm:rounded-[56px] p-6 sm:p-10 lg:p-16 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] backdrop-blur-2xl relative z-10">
        
        {/* Content Side - Hidden on small mobile, visible on tablet+ */}
        <div className="hidden sm:flex flex-col space-y-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600/10 text-blue-400 text-[11px] font-black uppercase tracking-[0.2em] border border-blue-500/20 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
              Join the future
            </div>
            <h1 className="text-4xl lg:text-7xl font-black tracking-tighter leading-[0.9] text-white">
              {mode === 'login' ? (
                <>Welcome<br/><span className="text-white/40">Back.</span></>
              ) : (
                <>Get<br/><span className="text-white/40">Started.</span></>
              )}
            </h1>
            <p className="text-white/50 text-lg sm:text-xl font-medium max-w-md leading-relaxed">
              {mode === 'login' 
                ? 'Relive your meetings with AI-powered insights and smart summaries.' 
                : 'Experience the next generation of collaborative meetings and workspace management.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-sm">
             <div className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-md group hover:bg-white/10 transition-all duration-300">
                <div className="text-blue-400 font-black mb-1 italic text-2xl group-hover:scale-110 transition-transform origin-left">2k+</div>
                <div className="text-white/30 text-[10px] font-black uppercase tracking-[0.15em]">Active Teams</div>
             </div>
             <div className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-md group hover:bg-white/10 transition-all duration-300">
                <div className="text-violet-400 font-black mb-1 italic text-2xl group-hover:scale-110 transition-transform origin-left">99.9%</div>
                <div className="text-white/30 text-[10px] font-black uppercase tracking-[0.15em]">Uptime SLA</div>
             </div>
          </div>
        </div>

        {/* Form Side */}
        <div className="w-full max-w-md mx-auto relative group">
          {/* Subtle Glow behind the form */}
          <div className="absolute -inset-4 bg-gradient-to-br from-blue-600/20 to-violet-600/20 rounded-[48px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          
          <div className="relative bg-white/5 border border-white/10 rounded-[40px] p-6 sm:p-10 shadow-2xl overflow-hidden backdrop-blur-3xl">
             {/* Header on mobile only */}
             <div className="sm:hidden mb-8">
                <h2 className="text-3xl font-black tracking-tight text-white mb-2">
                  {mode === 'login' ? 'Welcome Back' : 'Get Started'}
                </h2>
                <p className="text-white/40 text-sm">Sign in to continue to IntellMeet.</p>
             </div>

             <div className="flex gap-2 p-1.5 bg-black/40 rounded-2xl mb-8 border border-white/5">
                <button 
                  onClick={() => setMode('login')}
                  className={`flex-1 py-3.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-widest transition-all duration-300 ${mode === 'login' ? 'bg-white text-black shadow-[0_8px_24px_rgba(255,255,255,0.2)]' : 'text-white/30 hover:text-white'}`}
                >
                  Login
                </button>
                <button 
                  onClick={() => setMode('signup')}
                  className={`flex-1 py-3.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-widest transition-all duration-300 ${mode === 'signup' ? 'bg-white text-black shadow-[0_8px_24px_rgba(255,255,255,0.2)]' : 'text-white/30 hover:text-white'}`}
                >
                  Sign Up
                </button>
             </div>

             {error && (
               <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold animate-shake flex items-center gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                 {error}
               </div>
             )}

             <form onSubmit={handleSubmit} className="space-y-5">
               {mode === 'signup' && (
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Full Name</label>
                   <div className="relative group/input">
                     <input 
                       required
                       type="text"
                       placeholder="Enter your name"
                       value={formData.name}
                       onChange={(e) => setFormData({...formData, name: e.target.value})}
                       className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 pl-14 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all"
                     />
                     <UserIcon size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-blue-400 transition-colors" />
                   </div>
                 </div>
               )}

               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Email Address</label>
                 <div className="relative group/input">
                   <input 
                     required
                     type="email"
                     placeholder="name@company.com"
                     value={formData.email}
                     onChange={(e) => setFormData({...formData, email: e.target.value})}
                     className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 pl-14 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all"
                   />
                   <Mail size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-blue-400 transition-colors" />
                 </div>
               </div>

               <div className="space-y-2">
                 <div className="flex justify-between items-center ml-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Password</label>
                    {mode === 'login' && (
                      <a href="#" className="text-[10px] font-black uppercase tracking-[0.1em] text-blue-500/60 hover:text-blue-400 transition-colors">Forgot?</a>
                    )}
                 </div>
                 <div className="relative group/input">
                   <input 
                     required
                     type={showPassword ? 'text' : 'password'}
                     placeholder="••••••••"
                     value={formData.password}
                     onChange={(e) => setFormData({...formData, password: e.target.value})}
                     className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 pl-14 pr-14 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all"
                   />
                   <Lock size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-blue-400 transition-colors" />
                   <button 
                     type="button"
                     onClick={() => setShowPassword(!showPassword)}
                     className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                   >
                     {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                   </button>
                 </div>
               </div>

               {mode === 'signup' && (
                 <div className="space-y-2 pt-1">
                   <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Confirm Identity</label>
                   <div className="relative group/input">
                     <input 
                       required
                       type="password"
                       placeholder="••••••••"
                       value={formData.confirmPassword}
                       onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                       className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 pl-14 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all"
                     />
                     <ShieldCheck size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-blue-400 transition-colors" />
                   </div>
                 </div>
               )}

               <button 
                type="submit"
                disabled={isLoading}
                className="w-full relative overflow-hidden group/btn bg-white text-black font-black uppercase tracking-[0.2em] text-[11px] py-5 rounded-2xl mt-6 flex items-center justify-center gap-3 transition-all shadow-[0_12px_32px_rgba(255,255,255,0.1)] active:scale-95 disabled:opacity-50"
               >
                 {isLoading ? (
                   <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                 ) : (
                   <>
                     <span className="relative z-10">{mode === 'login' ? 'Proceed to Workspace' : 'Initialize Account'}</span>
                     <ChevronRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                     <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-white opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                   </>
                 )}
               </button>
             </form>

             <p className="mt-8 text-center text-[10px] font-bold text-white/20 uppercase tracking-widest leading-loose">
               Secure enterprise-grade access <br/>
               SSL Encrypted & AES-256 Protected
             </p>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}} />
    </div>
  )
}
