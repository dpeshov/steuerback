'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowRight, Eye, EyeOff, CheckCircle, Mail, Gift } from 'lucide-react'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const searchParams = useSearchParams()
  const refCode = searchParams.get('ref') ?? ''

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) return setError('Password must be at least 8 characters.')
    if (!/[0-9]/.test(password) || !/[a-zA-Z]/.test(password)) return setError('Password must contain a letter and a number.')
    if (password !== confirm) return setError('Passwords do not match.')
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: refCode ? { referred_by: refCode } : undefined,
      },
    })
    if (error) { setError(error.message); setLoading(false) }
    else setSuccess(true)
  }

  const inp = 'w-full bg-white/[0.06] border border-white/[0.08] hover:border-white/[0.14] focus:border-brand-red/50 focus:bg-white/[0.09] rounded-2xl px-4 py-3.5 text-sm text-white outline-none transition-all duration-150 placeholder:text-white/15'

  if (success) {
    return (
      <div
        className="min-h-screen bg-[#0A0A15] flex flex-col items-center justify-center px-5 relative overflow-hidden"
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-brand-success/8 rounded-full blur-[130px] pointer-events-none" />
        <div className="relative bg-white/[0.045] border border-white/[0.08] backdrop-blur-xl rounded-3xl p-8 w-full max-w-sm text-center">
          <div className="w-14 h-14 bg-brand-success/15 border border-brand-success/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={26} className="text-brand-success" />
          </div>
          <h1 className="text-xl font-black text-white tracking-tight mb-2">Check your email</h1>
          <p className="text-white/40 text-sm leading-relaxed mb-6">
            We sent a confirmation link to{' '}
            <span className="text-white/70 font-semibold">{email}</span>
          </p>
          <div className="flex items-center gap-2 justify-center bg-white/5 border border-white/8 rounded-2xl px-4 py-3 mb-6">
            <Mail size={14} className="text-white/30" />
            <span className="text-xs text-white/35">Click the link in the email to activate</span>
          </div>
          <Link href="/login" className="inline-flex items-center gap-2 bg-brand-red hover:bg-red-500 active:bg-red-600 text-white font-bold px-6 py-3.5 rounded-2xl transition-all text-sm w-full justify-center active:scale-[0.98]">
            Back to sign in <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen bg-[#0A0A15] flex flex-col items-center justify-center px-5 relative overflow-hidden"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
    >
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-red/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 left-[-10%] w-[300px] h-[300px] bg-blue-600/6 rounded-full blur-[100px] pointer-events-none" />

      <Link href="/" className="relative font-black text-[1.6rem] text-white tracking-tight mb-8 select-none">
        Steuer<span className="text-brand-red">Back</span>
      </Link>

      <div className="relative bg-white/[0.045] border border-white/[0.08] backdrop-blur-xl rounded-3xl p-6 sm:p-8 w-full max-w-sm">
        <div className="mb-6">
          <h1 className="text-xl font-black text-white tracking-tight">Create your account</h1>
          <p className="text-white/35 text-sm mt-1">Free to start. No commitment required.</p>
          {refCode && (
            <div className="flex items-center gap-2 mt-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
              <Gift size={13} className="text-emerald-400 shrink-0" />
              <p className="text-xs text-emerald-300 font-medium">You were invited by a friend!</p>
            </div>
          )}
        </div>

        <form onSubmit={handleRegister} className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-white/30 uppercase tracking-widest mb-2">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={inp} placeholder="you@example.com" autoComplete="email" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-white/30 uppercase tracking-widest mb-2">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'} required value={password}
                onChange={e => setPassword(e.target.value)}
                className={`${inp} pr-12`} placeholder="Min. 8 characters" autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-white/25 hover:text-white/50 transition-colors rounded-lg">
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-white/30 uppercase tracking-widest mb-2">Confirm password</label>
            <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} className={inp} placeholder="••••••••" autoComplete="new-password" />
          </div>

          {error && (
            <div className="bg-brand-red/10 border border-brand-red/20 text-brand-red text-sm px-4 py-3 rounded-xl font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group w-full bg-brand-red hover:bg-red-500 active:bg-red-600 active:scale-[0.98] disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all duration-150 hover:shadow-2xl hover:shadow-brand-red/20 flex items-center justify-center gap-2 mt-1"
          >
            {loading ? 'Creating account…' : 'Create account'}
            {!loading && <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />}
          </button>
        </form>

        <p className="text-center text-sm text-white/22 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-red font-bold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
