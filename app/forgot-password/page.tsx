'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

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

  return (
    <div className="min-h-screen bg-brand-surface flex flex-col items-center justify-center px-4">
      <Link href="/" className="font-bold text-2xl text-brand-navy mb-8">
        Steuer<span className="text-brand-red">Back</span>
      </Link>

      <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-md">
        {sent ? (
          <div className="text-center">
            <div className="text-4xl mb-4">📧</div>
            <h1 className="text-2xl font-bold text-brand-navy mb-2">Check your email</h1>
            <p className="text-gray-500 text-sm">If an account exists for <strong>{email}</strong>, you will receive a reset link.</p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-brand-navy mb-2">Reset password</h1>
            <p className="text-gray-500 text-sm mb-6">Enter your email and we will send you a reset link.</p>
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-navy mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red"
                  placeholder="you@example.com"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-red hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
              >
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>
          </>
        )}
        <div className="mt-6 text-center text-sm text-gray-500">
          <Link href="/login" className="text-brand-red hover:underline">Back to login</Link>
        </div>
      </div>
    </div>
  )
}
