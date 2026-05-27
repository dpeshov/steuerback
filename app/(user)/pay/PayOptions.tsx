'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CreditCard, Clock, CheckCircle, ArrowRight,
  Shield, Layers, Tag, Sparkles,
} from 'lucide-react'

type AppEntry = { id: string; taxYear: number }

// ── Bundle pricing ────────────────────────────────────────────────────────────
const UPFRONT_PRICES  = [0, 70, 110, 140, 160]
const DEFERRED_PRICES = [0, 150, 230, 290, 340]

function bundlePrice(count: number, type: 'upfront' | 'deferred'): number {
  const table = type === 'upfront' ? UPFRONT_PRICES : DEFERRED_PRICES
  if (count <= 0) return 0
  if (count < table.length) return table[count]!
  const extra = count - (table.length - 1)
  return table[table.length - 1]! + extra * (type === 'upfront' ? 60 : 90)
}

function bundleSavings(count: number, type: 'upfront' | 'deferred'): number {
  const single = type === 'upfront' ? 70 : 150
  return single * count - bundlePrice(count, type)
}

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner() {
  return <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
}

// ── Main component ────────────────────────────────────────────────────────────
export default function PayOptions({
  applicationId,
  taxYear,
  allApps = [],
}: {
  applicationId: string
  taxYear:       number
  allApps?:      AppEntry[]
}) {
  const hasBundle = allApps.length >= 2
  const [mode,    setMode]    = useState<'individual' | 'bundle'>(hasBundle ? 'bundle' : 'individual')
  const [loading, setLoading] = useState<'upfront' | 'deferred' | null>(null)
  const [error,   setError]   = useState('')
  const router = useRouter()

  // ── Individual pay ─────────────────────────────────────────────────────────
  const payUpfront = async () => {
    setLoading('upfront')
    setError('')
    try {
      const res  = await fetch('/api/stripe/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ applicationId }),
      })
      const data = await res.json()
      if (data.url) { window.location.href = data.url }
      else { setError(data.error ?? 'Something went wrong'); setLoading(null) }
    } catch { setError('Network error — please try again'); setLoading(null) }
  }

  const payDeferred = async () => {
    setLoading('deferred')
    setError('')
    try {
      const res  = await fetch('/api/stripe/deferred', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ applicationId }),
      })
      const data = await res.json()
      if (data.success) { router.push('/pay/success?deferred=1') }
      else { setError(data.error ?? 'Something went wrong'); setLoading(null) }
    } catch { setError('Network error — please try again'); setLoading(null) }
  }

  // ── Bundle pay ─────────────────────────────────────────────────────────────
  const payBundle = async (type: 'upfront' | 'deferred') => {
    setLoading(type)
    setError('')
    try {
      const res  = await fetch('/api/stripe/bundle', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          applicationIds: allApps.map(a => a.id),
          paymentType:    type,
        }),
      })
      const data = await res.json()
      if (data.url) { window.location.href = data.url }
      else { setError(data.error ?? 'Something went wrong'); setLoading(null) }
    } catch { setError('Network error — please try again'); setLoading(null) }
  }

  const count           = allApps.length
  const bUpfront        = bundlePrice(count, 'upfront')
  const bDeferred       = bundlePrice(count, 'deferred')
  const saveUpfront     = bundleSavings(count, 'upfront')
  const saveDeferred    = bundleSavings(count, 'deferred')
  const sortedYears     = [...allApps].sort((a, b) => a.taxYear - b.taxYear)

  return (
    <div className="space-y-4">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="pt-1">
        <p className="text-[11px] font-bold text-brand-red uppercase tracking-widest mb-0.5">Payment</p>
        <h1 className="text-2xl sm:text-3xl font-black text-brand-navy tracking-tight">Choose payment</h1>
        <p className="text-gray-400 text-sm mt-0.5">
          {hasBundle
            ? `${count} tax years ready to pay`
            : `Tax year ${taxYear}`
          }
        </p>
      </div>

      {/* ── Mode tabs (only when 2+ apps) ───────────────────────────────── */}
      {hasBundle && (
        <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-2xl">
          <button
            onClick={() => setMode('bundle')}
            className={`relative flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
              mode === 'bundle'
                ? 'bg-white text-brand-navy shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Layers size={14} />
            Bundle {count} years
            {saveUpfront > 0 && (
              <span className="absolute -top-1.5 -right-1 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none">
                SAVE €{saveUpfront}
              </span>
            )}
          </button>
          <button
            onClick={() => setMode('individual')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
              mode === 'individual'
                ? 'bg-white text-brand-navy shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <CreditCard size={14} />
            Per year
          </button>
        </div>
      )}

      {/* ── Error ───────────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-100 text-brand-red text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* BUNDLE MODE                                                        */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {mode === 'bundle' && (
        <div className="space-y-3">

          {/* Years included */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-brand-red" />
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Years included in bundle</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {sortedYears.map(a => (
                <div key={a.id} className="flex items-center gap-1.5 bg-brand-navy/5 rounded-xl px-3 py-1.5">
                  <CheckCircle size={12} className="text-emerald-500" />
                  <span className="text-sm font-bold text-brand-navy">{a.taxYear}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bundle upfront */}
          <div className="bg-white border-2 border-brand-red/20 rounded-2xl overflow-hidden shadow-sm relative">
            {saveUpfront > 0 && (
              <div className="bg-emerald-500 text-white text-xs font-black text-center py-1.5 flex items-center justify-center gap-1.5">
                <Tag size={11} />
                Bundle deal — save €{saveUpfront} vs paying year by year
              </div>
            )}
            <div className="p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 bg-brand-navy/6 rounded-lg flex items-center justify-center">
                      <CreditCard size={13} className="text-brand-navy" />
                    </div>
                    <span className="font-bold text-brand-navy text-sm">Pay bundle now</span>
                  </div>
                  <p className="text-gray-400 text-xs">One payment covering all {count} years</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-3xl font-black text-brand-navy">€{bUpfront}</p>
                  {saveUpfront > 0 && (
                    <p className="text-xs text-emerald-600 font-bold">
                      vs €{70 * count} individually
                    </p>
                  )}
                </div>
              </div>
              <ul className="space-y-1.5 mb-4">
                {[
                  `All ${count} years processed together — faster`,
                  'One receipt, one transaction',
                  'Secure checkout via Stripe',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-gray-500">
                    <CheckCircle size={11} className="text-emerald-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => payBundle('upfront')}
                disabled={loading !== null}
                className="w-full bg-brand-navy hover:bg-opacity-90 active:scale-[0.98] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
              >
                {loading === 'upfront'
                  ? <><Spinner /> Redirecting…</>
                  : <>Pay €{bUpfront} for {count} years <ArrowRight size={14} /></>
                }
              </button>
            </div>
          </div>

          {/* Bundle deferred */}
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
                    <span className="font-bold text-white text-sm">Bundle from refund</span>
                  </div>
                  <p className="text-white/40 text-xs">Deducted across all {count} refunds when received</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-3xl font-black text-white">€{bDeferred}</p>
                  {saveDeferred > 0 && (
                    <p className="text-xs text-emerald-400 font-bold">
                      save €{saveDeferred}
                    </p>
                  )}
                </div>
              </div>
              <ul className="space-y-1.5 mb-4">
                {[
                  'Zero upfront — pay from all your refunds',
                  `Cover all ${count} years in one agreement`,
                  'We only get paid when you do',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-white/60">
                    <CheckCircle size={11} className="text-emerald-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => payBundle('deferred')}
                disabled={loading !== null}
                className="w-full bg-brand-red hover:bg-red-500 active:scale-[0.98] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-red/30"
              >
                {loading === 'deferred'
                  ? <><Spinner /> Confirming…</>
                  : <>Confirm bundle agreement <ArrowRight size={14} /></>
                }
              </button>
            </div>
          </div>

          {/* Savings breakdown */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
            <p className="text-xs font-bold text-emerald-700 mb-1.5">Bundle savings breakdown</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-emerald-600/70 font-semibold">Pay now</p>
                <p className="text-sm font-black text-emerald-700">
                  €{bUpfront} <span className="text-xs font-semibold text-emerald-600/70">vs €{70 * count}</span>
                </p>
              </div>
              <div>
                <p className="text-[10px] text-emerald-600/70 font-semibold">From refund</p>
                <p className="text-sm font-black text-emerald-700">
                  €{bDeferred} <span className="text-xs font-semibold text-emerald-600/70">vs €{150 * count}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* INDIVIDUAL MODE                                                    */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {mode === 'individual' && (
        <div className="space-y-3">

          {/* Year picker */}
          {allApps.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-semibold shrink-0">Tax year:</span>
              <div className="flex gap-1.5 flex-wrap">
                {allApps.map(a => (
                  <button
                    key={a.id}
                    onClick={() => router.push(`/pay?app=${a.id}`)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      a.id === applicationId
                        ? 'bg-brand-navy text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {a.taxYear}
                  </button>
                ))}
              </div>
            </div>
          )}

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
                  <p className="text-gray-400 text-xs">Tax year {taxYear} · secure card payment</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-3xl font-black text-brand-navy">€70</p>
                  <p className="text-xs text-gray-400">one-time</p>
                </div>
              </div>
              <ul className="space-y-1.5 mb-4">
                {['Priority processing', 'Full refund to your account', 'Secure via Stripe'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-gray-500">
                    <CheckCircle size={11} className="text-emerald-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={payUpfront}
                disabled={loading !== null}
                className="w-full bg-brand-navy hover:bg-opacity-90 active:scale-[0.98] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
              >
                {loading === 'upfront'
                  ? <><Spinner /> Redirecting…</>
                  : <>Pay €70 now <ArrowRight size={14} /></>
                }
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
                    <CheckCircle size={11} className="text-emerald-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={payDeferred}
                disabled={loading !== null}
                className="w-full bg-brand-red hover:bg-red-500 active:scale-[0.98] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-red/30"
              >
                {loading === 'deferred'
                  ? <><Spinner /> Confirming…</>
                  : <>Confirm agreement <ArrowRight size={14} /></>
                }
              </button>
            </div>
          </div>

          {/* Bundle nudge */}
          {hasBundle && (
            <button
              onClick={() => setMode('bundle')}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-700 text-sm font-bold py-3 rounded-2xl transition-all"
            >
              <Layers size={14} />
              Switch to bundle — save €{saveUpfront} on {count} years
            </button>
          )}
        </div>
      )}

      <div className="flex items-center justify-center gap-2 text-xs text-gray-300 pb-2">
        <Shield size={12} />
        <span>SSL encrypted · GDPR compliant · Stripe Checkout</span>
      </div>
    </div>
  )
}
