'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, CheckCircle, AlertCircle, Loader2, Lock } from 'lucide-react'

export default function ResetPasswordPage() {
  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [showPw,    setShowPw]    = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [done,      setDone]      = useState(false)
  const [error,     setError]     = useState('')
  const [ready,     setReady]     = useState(false)   // session exchanged?

  const router  = useRouter()
  const supabase = createClient()

  // Supabase sends an implicit PKCE flow — the token is in the URL hash.
  // We listen for the PASSWORD_RECOVERY event and mark the session as ready.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'PASSWORD_RECOVERY') setReady(true)
      }
    )
    return () => subscription.unsubscribe()
  }, [supabase])

  const strength = (() => {
    if (!password) return 0
    let s = 0
    if (password.length >= 8)               s++
    if (/[A-Z]/.test(password))             s++
    if (/[0-9]/.test(password))             s++
    if (/[^A-Za-z0-9]/.test(password))      s++
    return s
  })()

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength]
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-emerald-500'][strength]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const { error: err } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (err) {
      setError(err.message)
    } else {
      setDone(true)
      setTimeout(() => router.push('/dashboard'), 3000)
    }
  }

  const inp = 'w-full bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-brand-red focus:bg-white rounded-2xl px-4 py-3.5 text-sm text-brand-navy outline-none transition-all placeholder:text-gray-300'

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center px-4">
      <Link href="/" className="font-black text-2xl text-brand-navy tracking-tight mb-8">
        Steuer<span className="text-brand-red">Back</span>
      </Link>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-black/5 border border-gray-100 p-8">

        {done ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-emerald-500" />
            </div>
            <h1 className="text-xl font-black text-brand-navy mb-2">Password updated!</h1>
            <p className="text-gray-400 text-sm">Redirecting you to the dashboard…</p>
          </div>
        ) : !ready ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 bg-brand-navy/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock size={22} className="text-brand-navy" />
            </div>
            <h1 className="text-xl font-black text-brand-navy mb-2">Verifying link…</h1>
            <p className="text-gray-400 text-sm mb-4">
              Please wait while we verify your reset link.
            </p>
            <div className="flex justify-center">
              <Loader2 size={20} className="animate-spin text-brand-red" />
            </div>
            <p className="text-xs text-gray-300 mt-6">
              Link not working?{' '}
              <Link href="/forgot-password" className="text-brand-red hover:underline font-semibold">
                Request a new one
              </Link>
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="w-12 h-12 bg-brand-red/8 rounded-2xl flex items-center justify-center mb-4">
                <Lock size={20} className="text-brand-red" />
              </div>
              <h1 className="text-2xl font-black text-brand-navy tracking-tight mb-1">
                Set new password
              </h1>
              <p className="text-gray-400 text-sm">
                Choose a strong password for your account.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-2xl mb-4">
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                  New password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                    minLength={8}
                    className={`${inp} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {/* Strength bar */}
                {password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1,2,3,4].map(i => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i <= strength ? strengthColor : 'bg-gray-100'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-[10px] font-bold ${
                      strength <= 1 ? 'text-red-400' : strength === 2 ? 'text-amber-500' : strength === 3 ? 'text-blue-500' : 'text-emerald-500'
                    }`}>{strengthLabel}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                  Confirm password
                </label>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repeat your password"
                  required
                  className={`${inp} ${
                    confirm && confirm !== password ? 'border-red-200 focus:border-red-400' : ''
                  }`}
                />
                {confirm && confirm !== password && (
                  <p className="text-[11px] text-red-400 font-semibold mt-1">Passwords don&apos;t match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || password !== confirm || password.length < 8}
                className="w-full bg-brand-red hover:bg-red-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-2xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-red/20 mt-2"
              >
                {loading
                  ? <><Loader2 size={14} className="animate-spin" /> Updating…</>
                  : 'Update password'
                }
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
