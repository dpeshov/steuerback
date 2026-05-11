'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowRight, Eye, EyeOff, Shield, User } from 'lucide-react'

type Role = 'user' | 'admin'

export default function LoginPage() {
  const [role, setRole] = useState<Role>('user')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Incorrect email or password.')
      setLoading(false)
    } else {
      router.push(role === 'admin' ? '/admin' : '/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-[#0D0D1A] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-brand-red/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/4 rounded-full blur-[120px] pointer-events-none" />

      <Link href="/" className="relative font-black text-2xl text-white tracking-tight mb-8">
        Steuer<span className="text-brand-red">Back</span>
      </Link>

      <div className="relative w-full max-w-md">
        <div className="bg-white/[0.04] border border-white/8 backdrop-blur-sm rounded-3xl p-8">

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-1.5 mb-8 p-1.5 bg-white/5 rounded-2xl">
            <button
              onClick={() => { setRole('user'); setError('') }}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                role === 'user'
                  ? 'bg-brand-red text-white shadow-lg shadow-brand-red/30'
                  : 'text-white/35 hover:text-white/60'
              }`}
            >
              <User size={14} />
              User Portal
            </button>
            <button
              onClick={() => { setRole('admin'); setError('') }}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                role === 'admin'
                  ? 'bg-white/10 border border-white/15 text-white'
                  : 'text-white/35 hover:text-white/60'
              }`}
            >
              <Shield size={14} />
              Admin
            </button>
          </div>

          <div className="mb-7">
            <h1 className="text-2xl font-black text-white tracking-tight">
              {role === 'admin' ? 'Admin access' : 'Welcome back'}
            </h1>
            <p className="text-white/35 text-sm mt-1">
              {role === 'admin' ? 'Sign in with your admin credentials' : 'Sign in to continue your application'}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-white/30 uppercase tracking-wide mb-2">Email</label>
              <input
                type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/8 hover:border-white/15 focus:border-brand-red/60 rounded-2xl px-4 py-3.5 text-sm text-white outline-none transition-all placeholder:text-white/15"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/30 uppercase tracking-wide mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} required value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/8 hover:border-white/15 focus:border-brand-red/60 rounded-2xl px-4 py-3.5 pr-12 text-sm text-white outline-none transition-all placeholder:text-white/15"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-brand-red/10 border border-brand-red/20 text-brand-red text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="flex justify-end pt-1">
              <Link href="/forgot-password" className="text-xs text-white/25 hover:text-brand-red transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full bg-brand-red hover:bg-red-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all hover:shadow-2xl hover:shadow-brand-red/25 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? 'Signing in...' : 'Sign in'}
              {!loading && <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />}
            </button>
          </form>

          {role === 'user' && (
            <p className="text-center text-sm text-white/25 mt-6">
              No account?{' '}
              <Link href="/register" className="text-brand-red font-bold hover:underline">
                Create one free
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
