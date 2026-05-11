'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowRight, Eye, EyeOff, CheckCircle } from 'lucide-react'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) return setError('Password must be at least 8 characters.')
    if (!/[0-9]/.test(password) || !/[a-zA-Z]/.test(password)) return setError('Password must contain at least one letter and one number.')
    if (password !== confirm) return setError('Passwords do not match.')
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) { setError(error.message); setLoading(false) }
    else setSuccess(true)
  }

  const inp = 'w-full bg-white/5 border border-white/8 hover:border-white/15 focus:border-brand-red/60 rounded-2xl px-4 py-3.5 text-sm text-white outline-none transition-all placeholder:text-white/15'

  if (success) {
    return (
      <div className="min-h-screen bg-[#0D0D1A] flex flex-col items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-brand-success/6 rounded-full blur-[140px] pointer-events-none" />
        <div className="relative bg-white/[0.04] border border-white/8 backdrop-blur-sm rounded-3xl p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-brand-success/15 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={28} className="text-brand-success" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mb-2">Check your email</h1>
          <p className="text-white/40 text-sm leading-relaxed mb-6">
            We sent a confirmation link to <span className="text-white/70 font-semibold">{email}</span>. Click it to activate your account.
          </p>
          <Link href="/login" className="inline-flex items-center gap-2 bg-brand-red hover:bg-red-500 text-white font-bold px-6 py-3.5 rounded-2xl transition-all text-sm">
            Back to sign in <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0D0D1A] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-brand-red/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/4 rounded-full blur-[120px] pointer-events-none" />

      <Link href="/" className="relative font-black text-2xl text-white tracking-tight mb-8">
        Steuer<span className="text-brand-red">Back</span>
      </Link>

      <div className="relative bg-white/[0.04] border border-white/8 backdrop-blur-sm rounded-3xl p-8 w-full max-w-md">
        <div className="mb-7">
          <h1 className="text-2xl font-black text-white tracking-tight">Create your account</h1>
          <p className="text-white/35 text-sm mt-1">Free to start. No commitment required.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-white/30 uppercase tracking-wide mb-2">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={inp} placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-xs font-bold text-white/30 uppercase tracking-wide mb-2">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'} required value={password}
                onChange={e => setPassword(e.target.value)}
                className={`${inp} pr-12`} placeholder="Min. 8 characters"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-white/30 uppercase tracking-wide mb-2">Confirm password</label>
            <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} className={inp} placeholder="••••••••" />
          </div>

          {error && (
            <div className="bg-brand-red/10 border border-brand-red/20 text-brand-red text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group w-full bg-brand-red hover:bg-red-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all hover:shadow-2xl hover:shadow-brand-red/25 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? 'Creating account...' : 'Create account'}
            {!loading && <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />}
          </button>
        </form>

        <p className="text-center text-sm text-white/25 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-red font-bold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
