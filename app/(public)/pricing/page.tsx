import type { Metadata } from 'next'
import Link from 'next/link'
import {
  CheckCircle2, X, ChevronRight, Layers,
  CreditCard, Clock, Zap, Shield,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Pricing — SteuerBack',
  description: 'Transparent pricing for your German tax refund. Pay €70 upfront or €150 from your refund. Bundle multiple years and save.',
}

const UPFRONT_BUNDLE = [
  { years: 1, price: 70,  perYear: 70,  saving: 0   },
  { years: 2, price: 110, perYear: 55,  saving: 30  },
  { years: 3, price: 140, perYear: 47,  saving: 70  },
  { years: 4, price: 160, perYear: 40,  saving: 120 },
]

const DEFERRED_BUNDLE = [
  { years: 1, price: 150, perYear: 150, saving: 0   },
  { years: 2, price: 230, perYear: 115, saving: 70  },
  { years: 3, price: 290, perYear: 97,  saving: 160 },
  { years: 4, price: 340, perYear: 85,  saving: 260 },
]

const COMPARE = [
  { feature: 'Eligible years (2021–2024)',   upfront: true,  deferred: true  },
  { feature: 'Document review',              upfront: true,  deferred: true  },
  { feature: 'Expert tax preparation',       upfront: true,  deferred: true  },
  { feature: 'Finanzamt submission',         upfront: true,  deferred: true  },
  { feature: 'Status tracking',             upfront: true,  deferred: true  },
  { feature: 'Priority processing',         upfront: true,  deferred: false },
  { feature: 'Faster refund timeline',      upfront: true,  deferred: false },
  { feature: 'No upfront cost',             upfront: false, deferred: true  },
  { feature: 'Pay only when you get paid',  upfront: false, deferred: true  },
]

const FAQS = [
  {
    q: 'What if I don\'t get a refund?',
    a: 'With the "Pay from refund" option, you owe us nothing if the Finanzamt doesn\'t send you money. With the upfront plan, we\'ll refund our fee if you\'re not eligible.',
  },
  {
    q: 'What does the bundle cover?',
    a: 'The bundle covers all selected tax years in one payment. If you have 4 years of unclaimed refunds, we process them all at once and you pay one bundle price instead of 4 × the single-year fee.',
  },
  {
    q: 'Are there any hidden fees?',
    a: 'No. The prices shown are the total cost. No registration fee, no document fee, no success commission on top.',
  },
  {
    q: 'How is "Pay from refund" deducted?',
    a: 'We send you a signed agreement before filing. When the Finanzamt transfers your refund to your bank account, you send us our agreed fee. We trust you to do this — if you need a payment arrangement, contact us.',
  },
  {
    q: 'Can I upgrade from deferred to upfront?',
    a: 'Yes, you can switch to the upfront plan at any time before we submit to the Finanzamt. Contact our support team.',
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-brand-navy pt-24 pb-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(230,57,70,0.12),transparent_60%)] pointer-events-none" />
        <div className="relative max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/8 border border-white/10 text-white/60 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            <Shield size={11} />
            No hidden fees · No surprise charges
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-4">
            Simple, transparent<br />
            <span className="text-brand-red">pricing</span>
          </h1>
          <p className="text-white/50 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Two plans. No hidden fees. You choose when to pay.
          </p>
        </div>
      </section>

      {/* ── Main pricing cards ────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 -mt-8 pb-16">
        <div className="grid md:grid-cols-2 gap-5">

          {/* Upfront */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-50">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-brand-navy/8 rounded-xl flex items-center justify-center">
                  <CreditCard size={15} className="text-brand-navy" />
                </div>
                <span className="font-bold text-brand-navy text-sm">Pay now</span>
              </div>
              <div className="flex items-end gap-2 mb-1">
                <p className="text-5xl font-black text-brand-navy">€70</p>
                <p className="text-gray-400 text-sm mb-2">per year</p>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">
                One-time upfront payment per tax year. Priority processing and faster refund timeline.
              </p>
            </div>
            <div className="p-6 space-y-3">
              {[
                'Priority processing',
                'Expert German tax preparation',
                'Finanzamt submission',
                'Status tracking & notifications',
                'Faster refund timeline',
              ].map(f => (
                <div key={f} className="flex items-center gap-3 text-sm text-gray-600">
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                  {f}
                </div>
              ))}
              <div className="pt-3">
                <Link
                  href="/register"
                  className="flex items-center justify-center gap-2 w-full bg-brand-navy hover:bg-opacity-90 active:scale-[0.98] text-white font-bold py-3.5 rounded-xl text-sm transition-all"
                >
                  Start with Pay now <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>

          {/* Deferred */}
          <div className="bg-brand-navy rounded-3xl shadow-xl overflow-hidden relative">
            <div className="absolute top-4 right-4">
              <span className="bg-brand-red text-white text-[10px] font-bold px-2.5 py-1 rounded-full">Most popular</span>
            </div>
            <div className="p-6 border-b border-white/8">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
                  <Clock size={15} className="text-white" />
                </div>
                <span className="font-bold text-white text-sm">Pay from refund</span>
              </div>
              <div className="flex items-end gap-2 mb-1">
                <p className="text-5xl font-black text-white">€150</p>
                <p className="text-white/40 text-sm mb-2">per year</p>
              </div>
              <p className="text-white/50 text-xs leading-relaxed">
                Nothing to pay today. Our fee is deducted once your refund arrives from the Finanzamt.
              </p>
            </div>
            <div className="p-6 space-y-3">
              {[
                'Zero cost today',
                'Expert German tax preparation',
                'Finanzamt submission',
                'Status tracking & notifications',
                'Pay only when you get money back',
              ].map(f => (
                <div key={f} className="flex items-center gap-3 text-sm text-white/70">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                  {f}
                </div>
              ))}
              <div className="pt-3">
                <Link
                  href="/register"
                  className="flex items-center justify-center gap-2 w-full bg-brand-red hover:bg-red-500 active:scale-[0.98] text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-brand-red/30"
                >
                  Start for free <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bundle pricing ────────────────────────────────────────────────── */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-xs font-bold px-4 py-1.5 rounded-full mb-4">
              <Layers size={12} />
              Multi-year bundles available
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-brand-navy">
              Claim multiple years — save more
            </h2>
            <p className="text-gray-400 text-sm mt-2 max-w-lg mx-auto">
              You can claim for 2021, 2022, 2023 and 2024. Bundle them and pay significantly less than year by year.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Upfront bundles */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CreditCard size={15} className="text-brand-navy" />
                <p className="font-bold text-brand-navy text-sm">Pay now — bundle pricing</p>
              </div>
              <div className="space-y-2">
                {UPFRONT_BUNDLE.map(({ years, price, perYear, saving }) => (
                  <div
                    key={years}
                    className={`flex items-center gap-4 rounded-2xl px-4 py-3.5 border transition-all ${
                      years === 2 ? 'bg-brand-navy text-white border-brand-navy' : 'bg-gray-50 border-gray-100'
                    }`}
                  >
                    <div className={`text-sm font-bold shrink-0 ${years === 2 ? 'text-white/60' : 'text-gray-400'}`}>
                      {years} yr{years > 1 ? 's' : ''}
                    </div>
                    <div className="flex-1">
                      <p className={`font-black text-lg leading-none ${years === 2 ? 'text-white' : 'text-brand-navy'}`}>
                        €{price}
                      </p>
                      <p className={`text-[11px] mt-0.5 ${years === 2 ? 'text-white/50' : 'text-gray-400'}`}>
                        €{perYear}/year
                      </p>
                    </div>
                    {saving > 0 && (
                      <span className={`text-[10px] font-black px-2 py-1 rounded-full shrink-0 ${
                        years === 2 ? 'bg-emerald-400/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        SAVE €{saving}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Deferred bundles */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Clock size={15} className="text-brand-navy" />
                <p className="font-bold text-brand-navy text-sm">Pay from refund — bundle pricing</p>
              </div>
              <div className="space-y-2">
                {DEFERRED_BUNDLE.map(({ years, price, perYear, saving }) => (
                  <div
                    key={years}
                    className={`flex items-center gap-4 rounded-2xl px-4 py-3.5 border transition-all ${
                      years === 2 ? 'bg-brand-navy text-white border-brand-navy' : 'bg-gray-50 border-gray-100'
                    }`}
                  >
                    <div className={`text-sm font-bold shrink-0 ${years === 2 ? 'text-white/60' : 'text-gray-400'}`}>
                      {years} yr{years > 1 ? 's' : ''}
                    </div>
                    <div className="flex-1">
                      <p className={`font-black text-lg leading-none ${years === 2 ? 'text-white' : 'text-brand-navy'}`}>
                        €{price}
                      </p>
                      <p className={`text-[11px] mt-0.5 ${years === 2 ? 'text-white/50' : 'text-gray-400'}`}>
                        €{perYear}/year
                      </p>
                    </div>
                    {saving > 0 && (
                      <span className={`text-[10px] font-black px-2 py-1 rounded-full shrink-0 ${
                        years === 2 ? 'bg-emerald-400/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        SAVE €{saving}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature comparison ────────────────────────────────────────────── */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-brand-navy">Plan comparison</h2>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-3 border-b border-gray-100 bg-gray-50/50">
              <div className="px-5 py-3.5" />
              <div className="px-4 py-3.5 text-center">
                <p className="text-xs font-black text-brand-navy">Pay now</p>
                <p className="text-[10px] text-gray-400 font-semibold">€70/yr</p>
              </div>
              <div className="px-4 py-3.5 text-center bg-brand-navy/3">
                <p className="text-xs font-black text-brand-navy">From refund</p>
                <p className="text-[10px] text-gray-400 font-semibold">€150/yr</p>
              </div>
            </div>
            {COMPARE.map(({ feature, upfront, deferred }, i) => (
              <div
                key={feature}
                className={`grid grid-cols-3 ${i < COMPARE.length - 1 ? 'border-b border-gray-50' : ''}`}
              >
                <div className="px-5 py-3.5 text-sm text-gray-600">{feature}</div>
                <div className="px-4 py-3.5 flex items-center justify-center">
                  {upfront
                    ? <CheckCircle2 size={16} className="text-emerald-500" />
                    : <X size={14} className="text-gray-300" />
                  }
                </div>
                <div className="px-4 py-3.5 flex items-center justify-center bg-brand-navy/[0.02]">
                  {deferred
                    ? <CheckCircle2 size={16} className="text-emerald-500" />
                    : <X size={14} className="text-gray-300" />
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black text-brand-navy">Pricing FAQ</h2>
          </div>
          <div className="space-y-4">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="bg-gray-50 rounded-2xl border border-gray-100 px-6 py-5">
                <p className="text-sm font-bold text-brand-navy mb-1.5">{q}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="bg-brand-navy py-16 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/8 border border-white/10 text-white/60 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            <Zap size={11} className="text-brand-red" />
            Average refund: €400–€1,200
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
            Either way, you come out ahead
          </h2>
          <p className="text-white/50 text-sm mb-8 leading-relaxed">
            Even the deferred plan at €150 leaves you with hundreds of euros in net refund.
            Most of our customers get back 4–10× our fee.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-brand-red hover:bg-red-500 active:scale-[0.98] text-white font-bold px-8 py-4 rounded-2xl text-base transition-all shadow-xl shadow-brand-red/30"
          >
            Start for free <ChevronRight size={16} />
          </Link>
          <p className="text-white/30 text-xs mt-4">No payment until you choose a plan</p>
        </div>
      </section>

    </div>
  )
}
