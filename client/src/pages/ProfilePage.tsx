import React, { useState, useRef, useEffect } from 'react'
import { 
  User, Mail, Camera, Save, CheckCircle, AlertCircle, Loader2, Key, LogOut
} from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import api from '../utils/api'

export default function ProfilePage() {
  const { user, setUser, logout } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    confirmPassword: ''
  })

  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const data = new FormData()
      data.append('name', formData.name)
      data.append('email', formData.email)
      
      if (formData.password) {
        data.append('password', formData.password)
      }
      
      if (avatarFile) {
        data.append('avatar', avatarFile)
      }

      const response = await api.put('/auth/profile', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      setUser({
        ...user!,
        id: response.data._id,
        name: response.data.name,
        email: response.data.email,
        avatar: response.data.avatar,
        bio: response.data.bio,
        jobTitle: response.data.jobTitle,
        location: response.data.location,
        phoneNumber: response.data.phoneNumber
      })

      setMessage({ type: 'success', text: 'Profile updated' })
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }))
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Update failed' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    window.location.hash = '#/login'
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 font-sans transition-colors duration-300">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 sm:pt-10">
        
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Profile</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>

        {message && (
          <div className={`mb-6 p-3 rounded-xl border flex items-center gap-3 animate-in fade-in duration-300 ${
            message.type === 'success' 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400' 
              : 'bg-rose-50 border-rose-100 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400'
          }`}>
            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* Avatar Section - Centered on Mobile */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden ring-4 ring-muted shadow-lg">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                    <User size={40} />
                  </div>
                )}
              </div>
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 active:scale-95 ring-4 ring-background transition-all"
              >
                <Camera size={16} />
              </button>
              <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold">{formData.name}</h2>
              <p className="text-sm text-muted-foreground">{user?.role || 'Member'}</p>
            </div>
          </div>

          {/* Form Content - List style on mobile, grid on desktop */}
          <div className="space-y-8 bg-card sm:border border-border rounded-2xl sm:p-8 sm:shadow-sm">
            
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input 
                    required
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-background sm:bg-muted/30 border border-border rounded-xl py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input 
                    required
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-background sm:bg-muted/30 border border-border rounded-xl py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-border space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Password & Security</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground ml-1">New Password</label>
                  <input 
                    type="password" 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-background sm:bg-muted/30 border border-border rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground ml-1">Confirm Password</label>
                  <input 
                    type="password" 
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-background sm:bg-muted/30 border border-border rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground ml-1 italic">Keep empty to maintain current password.</p>
            </div>

            <div className="pt-8 flex flex-col sm:flex-row gap-4">
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all active:scale-[0.98] shadow-md shadow-blue-600/10 flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {isLoading ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Account Details Footer */}
          <div className="flex flex-col items-center gap-2 pt-4">
             <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
               <span>User ID:</span>
               <span className="font-mono text-foreground">{user?.id?.slice(-8).toUpperCase()}</span>
             </div>
             <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
               Secure Account &bull; Protected by SSL
             </p>
          </div>

        </form>
      </main>
    </div>
  )
}
