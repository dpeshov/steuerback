'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard, Clock, CheckCircle, ArrowRight, Shield } from 'lucide-react'

export default function PayOptions({ applicationId, taxYear }: { applicationId: string; taxYear: number }) {
  const [loading, setLoading] = useState<'upfront' | 'deferred' | null>(null)
  const [error, setError] = useState('')
  const router = useRouter()

  const payUpfront = async () => {
    setLoading('upfront')
    setError('')
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId }),
    })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      setError(data.error ?? 'Something went wrong')
      setLoading(null)
    }
  }

  const payDeferred = async () => {
    setLoading('deferred')
    setError('')
    const res = await fetch('/api/stripe/deferred', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId }),
    })
    const data = await res.json()
    if (data.success) {
      router.push('/dashboard')
    } else {
      setError(data.error ?? 'Something went wrong')
      setLoading(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="pt-1">
        <p className="text-[11px] font-bold text-brand-red uppercase tracking-widest mb-0.5">Payment</p>
        <h1 className="text-2xl sm:text-3xl font-black text-brand-navy tracking-tight">Choose payment</h1>
        <p className="text-gray-400 text-sm mt-0.5">Tax year {taxYear}</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-brand-red text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {/* Upfront */}
        <div className="bg-white border border-black/[0.07] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 bg-brand-navy/6 rounded-lg flex items-center justify-center">
                    <CreditCard size={13} className="text-brand-navy" />
                  </div>
                  <span className="font-bold text-brand-navy text-sm">Pay now</span>
                </div>
                <p className="text-gray-400 text-xs">Faster processing, one-time card payment</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-3xl font-black text-brand-navy">€70</p>
                <p className="text-xs text-gray-400">one-time</p>
              </div>
            </div>
            <ul className="space-y-1.5 mb-4">
              {['Priority processing', 'Full refund to your account', 'Secure via Stripe'].map(f => (
                <li key={f} className="flex items-center gap-2 text-xs text-gray-500">
                  <CheckCircle size={11} className="text-brand-success shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={payUpfront}
              disabled={loading !== null}
              className="w-full bg-brand-navy hover:bg-opacity-90 active:scale-[0.98] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
            >
              {loading === 'upfront' ? 'Redirecting…' : <>Pay €70 now <ArrowRight size={14} /></>}
            </button>
          </div>
        </div>

        {/* Deferred */}
        <div className="bg-brand-navy rounded-2xl overflow-hidden shadow-sm relative">
          <div className="absolute top-3 right-3">
            <span className="bg-brand-red text-white text-[10px] font-bold px-2.5 py-1 rounded-full">Most popular</span>
          </div>
          <div className="p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
                    <Clock size={13} className="text-white" />
                  </div>
                  <span className="font-bold text-white text-sm">Pay from refund</span>
                </div>
                <p className="text-white/40 text-xs">Deducted when you receive your money</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-3xl font-black text-white">€150</p>
                <p className="text-xs text-white/35">from refund</p>
              </div>
            </div>
            <ul className="space-y-1.5 mb-4">
              {['Zero upfront cost', 'We only get paid when you do', 'Sign agreement now'].map(f => (
                <li key={f} className="flex items-center gap-2 text-xs text-white/60">
                  <CheckCircle size={11} className="text-brand-success shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={payDeferred}
              disabled={loading !== null}
              className="w-full bg-brand-red hover:bg-red-500 active:scale-[0.98] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-red/30"
            >
              {loading === 'deferred' ? 'Confirming…' : <>Confirm agreement <ArrowRight size={14} /></>}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-gray-300 pb-2">
        <Shield size={12} />
        <span>SSL encrypted · GDPR compliant</span>
      </div>
    </div>
  )
}
