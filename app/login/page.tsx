'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const router   = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError('Incorrect email or password.')
      setLoading(false)
      return
    }

    // Determine redirect based on role
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      router.push(profile?.role === 'admin' ? '/admin' : '/dashboard')
      router.refresh()
    }
  }

  const inp = 'w-full bg-white/[0.06] border border-white/[0.08] hover:border-white/[0.14] focus:border-brand-red/50 focus:bg-white/[0.09] rounded-2xl px-4 py-3.5 text-sm text-white outline-none transition-all duration-150 placeholder:text-white/15'
  const lbl = 'block text-[11px] font-bold text-white/30 uppercase tracking-widest mb-2'

  return (
    <div
      className="min-h-screen bg-[#0A0A15] flex flex-col items-center justify-center px-5 relative overflow-hidden"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
    >
      {/* Background glows */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-red/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[-10%] w-[300px] h-[300px] bg-blue-600/6 rounded-full blur-[100px] pointer-events-none" />

      {/* Logo */}
      <Link href="/" className="relative font-black text-[1.6rem] text-white tracking-tight mb-8 select-none">
        Steuer<span className="text-brand-red">Back</span>
      </Link>

      <div className="relative w-full max-w-sm">
        <div className="bg-white/[0.045] border border-white/[0.08] backdrop-blur-xl rounded-3xl p-6 sm:p-8">

          <div className="mb-7">
            <h1 className="text-xl font-black text-white tracking-tight">Welcome back</h1>
            <p className="text-white/35 text-sm mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className={lbl}>Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={inp}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className={lbl}>Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={`${inp} pr-12`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-white/25 hover:text-white/50 transition-colors rounded-lg"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-brand-red/10 border border-brand-red/20 text-brand-red text-sm px-4 py-3 rounded-xl font-medium">
                {error}
              </div>
            )}

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-xs text-white/25 hover:text-brand-red/80 transition-colors py-1">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full bg-brand-red hover:bg-red-500 active:bg-red-600 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all duration-150 hover:shadow-2xl hover:shadow-brand-red/20 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? 'Signing in…' : 'Sign in'}
              {!loading && <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />}
            </button>
          </form>

          <p className="text-center text-sm text-white/22 mt-6">
            No account?{' '}
            <Link href="/register" className="text-brand-red font-bold hover:underline">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
