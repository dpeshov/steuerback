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

  const inp = 'w-full bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-brand-red focus:bg-white rounded-2xl px-4 py-3.5 text-sm text-brand-navy outline-none transition-all placeholder:text-gray-300'

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center px-4">
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-10 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-brand-success/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={28} className="text-brand-success" />
          </div>
          <h1 className="text-2xl font-black text-brand-navy tracking-tight mb-2">Check your email</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            We sent a verification link to <strong className="text-brand-navy">{email}</strong>.
            Click it to activate your account and start your application.
          </p>
          <Link href="/login" className="inline-block mt-6 text-sm text-brand-red font-bold hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center px-4">
      <Link href="/" className="font-black text-2xl text-brand-navy tracking-tight mb-8">
        Steuer<span className="text-brand-red">Back</span>
      </Link>

      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 w-full max-w-md">
        <div className="mb-7">
          <h1 className="text-2xl font-black text-brand-navy tracking-tight">Create your account</h1>
          <p className="text-gray-400 text-sm mt-1">Free to start — no credit card required</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-3">
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
                className={`${inp} pr-12`} placeholder="Min. 8 chars with a number"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Confirm password</label>
            <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} className={inp} placeholder="••••••••" />
          </div>

          {error && <div className="bg-red-50 border border-red-100 text-brand-red text-sm px-4 py-3 rounded-xl">{error}</div>}

          <button type="submit" disabled={loading} className="group w-full bg-brand-red hover:bg-red-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl transition-all hover:shadow-xl hover:shadow-brand-red/20 flex items-center justify-center gap-2 mt-2">
            {loading ? 'Creating account...' : 'Create account'}
            {!loading && <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />}
          </button>

          <p className="text-xs text-gray-400 text-center pt-1">
            By registering you agree to our{' '}
            <Link href="/terms" className="underline hover:text-gray-600">Terms</Link> and{' '}
            <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>.
          </p>
        </form>

        <p className="text-center text-sm text-gray-400 mt-5">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-red font-bold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
