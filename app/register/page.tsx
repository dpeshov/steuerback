'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) return setError('Password must be at least 8 characters.')
    if (!/[0-9]/.test(password) || !/[a-zA-Z]/.test(password)) return setError('Password must contain at least one letter and one number.')
    if (password !== confirm) return setError('Passwords do not match.')

    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-brand-surface flex flex-col items-center justify-center px-4 text-center">
        <Link href="/" className="font-bold text-2xl text-brand-navy mb-8">
          Steuer<span className="text-brand-red">Back</span>
        </Link>
        <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-md">
          <div className="text-4xl mb-4">📧</div>
          <h1 className="text-2xl font-bold text-brand-navy mb-2">Check your email</h1>
          <p className="text-gray-500 text-sm">
            We sent a verification link to <strong>{email}</strong>. Click it to activate your account.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-surface flex flex-col items-center justify-center px-4">
      <Link href="/" className="font-bold text-2xl text-brand-navy mb-8">
        Steuer<span className="text-brand-red">Back</span>
      </Link>

      <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-brand-navy mb-2">Create your free account</h1>
        <p className="text-gray-500 text-sm mb-6">Start your German tax refund application</p>

        <form onSubmit={handleRegister} className="space-y-4">
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
          <div>
            <label className="block text-sm font-medium text-brand-navy mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red"
              placeholder="Min. 8 chars with a number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-navy mb-1">Confirm password</label>
            <input
              type="password"
              required
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-brand-red text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-red hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          <p className="text-xs text-gray-400 text-center">
            By registering you agree to our{' '}
            <Link href="/terms" className="underline">Terms of Service</Link> and{' '}
            <Link href="/privacy" className="underline">Privacy Policy</Link>.
          </p>
        </form>

        <div className="mt-4 text-center text-sm text-gray-500">
          Already have an account? <Link href="/login" className="text-brand-red hover:underline font-medium">Sign in</Link>
        </div>
      </div>
    </div>
  )
}
