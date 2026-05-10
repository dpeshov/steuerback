'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
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
      router.push('/dashboard')
      router.refresh()
    }
  }

  const inp = 'w-full bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-brand-red focus:bg-white rounded-2xl px-4 py-3.5 text-sm text-brand-navy outline-none transition-all placeholder:text-gray-300'

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center px-4">
      <Link href="/" className="font-black text-2xl text-brand-navy tracking-tight mb-8">
        Steuer<span className="text-brand-red">Back</span>
      </Link>

      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 w-full max-w-md">
        <div className="mb-7">
          <h1 className="text-2xl font-black text-brand-navy tracking-tight">Welcome back</h1>
          <p className="text-gray-400 text-sm mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={inp} placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'} required value={password}
                onChange={e => setPassword(e.target.value)}
                className={`${inp} pr-12`} placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <div className="bg-red-50 border border-red-100 text-brand-red text-sm px-4 py-3 rounded-xl">{error}</div>}

          <div className="flex justify-end pt-1">
            <Link href="/forgot-password" className="text-xs text-gray-400 hover:text-brand-red transition-colors">Forgot password?</Link>
          </div>

          <button type="submit" disabled={loading} className="group w-full bg-brand-red hover:bg-red-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl transition-all hover:shadow-xl hover:shadow-brand-red/20 flex items-center justify-center gap-2">
            {loading ? 'Signing in...' : 'Sign in'}
            {!loading && <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          No account?{' '}
          <Link href="/register" className="text-brand-red font-bold hover:underline">Create one free</Link>
        </p>
      </div>
    </div>
  )
}
