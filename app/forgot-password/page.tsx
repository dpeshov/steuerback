'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowRight, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    setSent(true)
    setLoading(false)
  }

  const inp = 'w-full bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-brand-red focus:bg-white rounded-2xl px-4 py-3.5 text-sm text-brand-navy outline-none transition-all placeholder:text-gray-300'

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center px-4">
      <Link href="/" className="font-black text-2xl text-brand-navy tracking-tight mb-8">
        Steuer<span className="text-brand-red">Back</span>
      </Link>

      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 w-full max-w-md">
        {sent ? (
          <div className="text-center py-4">
            <div className="text-5xl mb-5">📧</div>
            <h1 className="text-2xl font-black text-brand-navy tracking-tight mb-2">Check your inbox</h1>
            <p className="text-gray-400 text-sm leading-relaxed">
              If an account exists for <strong className="text-brand-navy">{email}</strong>, you will receive a reset link shortly.
            </p>
            <Link href="/login" className="inline-flex items-center gap-2 mt-6 text-sm text-brand-red font-bold hover:underline">
              <ArrowLeft size={14} /> Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-7">
              <h1 className="text-2xl font-black text-brand-navy tracking-tight">Reset password</h1>
              <p className="text-gray-400 text-sm mt-1">Enter your email and we will send a reset link</p>
            </div>
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={inp} placeholder="you@example.com" />
              </div>
              <button type="submit" disabled={loading} className="group w-full bg-brand-red hover:bg-red-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl transition-all hover:shadow-xl hover:shadow-brand-red/20 flex items-center justify-center gap-2">
                {loading ? 'Sending...' : 'Send reset link'}
                {!loading && <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />}
              </button>
            </form>
            <div className="mt-5 text-center">
              <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand-red transition-colors">
                <ArrowLeft size={14} /> Back to sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
