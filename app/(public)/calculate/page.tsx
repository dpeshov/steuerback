import type { Metadata } from 'next'
import CalculatorWidget from './CalculatorWidget'
import Link from 'next/link'
import { ChevronRight, CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'German Tax Refund Calculator 2024 — SteuerBack',
  description:
    'Find out how much German tax you can reclaim. Free online calculator for international workers and students. Instant estimate — no registration needed.',
  openGraph: {
    title: 'How much German tax can you get back?',
    description: 'Free refund calculator for international workers in Germany. Most get €300–€2,000 back.',
    type: 'website',
  },
}

const DEDUCTION_ITEMS = [
  {
    title: 'Werbungskosten-Pauschbetrag',
    amount: '€1,230',
    desc: 'Standard work-expense lump sum — every employee gets this automatically.',
  },
  {
    title: 'Homeoffice-Pauschale',
    amount: 'up to €1,260',
    desc: '€6 per home-office day (max 210 days). Introduced post-COVID.',
  },
  {
    title: 'Doppelte Haushaltsführung',
    amount: 'up to €1,000/mo',
    desc: 'If you maintain a home abroad and rent in Germany, both costs can be deducted.',
  },
  {
    title: 'Commute (Pendlerpauschale)',
    amount: '€0.30/km',
    desc: 'One-way distance from home to workplace, every working day.',
  },
  {
    title: 'Student / part-time bonus',
    amount: '+€800',
    desc: 'Students and mini-jobbers often have additional deductible expenses.',
  },
  {
    title: 'Partial year adjustment',
    amount: 'biggest factor',
    desc: 'If you worked fewer than 12 months, the Finanzamt refunds overpaid monthly taxes.',
  },
]

const FAQS = [
  {
    q: 'Who can claim a German tax refund?',
    a: 'Anyone who was employed and paid Lohnsteuer in Germany — regardless of nationality. This includes seasonal workers, students, expats, and people who worked for only part of the year.',
  },
  {
    q: 'How many years back can I claim?',
    a: 'You can file for the last 4 tax years. In 2025, you can still claim for 2021, 2022, 2023 and 2024.',
  },
  {
    q: 'How long does the refund take?',
    a: 'The Finanzamt typically processes returns in 3–6 months. Returns filed earlier in the year tend to be processed faster.',
  },
  {
    q: 'Do I need to be living in Germany?',
    a: 'No. You can claim a refund even after you\'ve left Germany, as long as you have a German bank account or are willing to provide one for the transfer.',
  },
  {
    q: 'What documents do I need?',
    a: 'Your Lohnsteuerbescheinigung (employer salary certificate), passport or ID, bank IBAN, and a signed power of attorney authorising SteuerBack to file on your behalf.',
  },
  {
    q: 'Is the calculator estimate accurate?',
    a: 'It\'s a good-faith estimate using real German tax tables (Grundtarif 2024). The actual amount depends on your exact deductions, which we calculate precisely once you apply.',
  },
]

export default function CalculatePage() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-brand-navy pt-16 pb-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(230,57,70,0.15),transparent_60%)] pointer-events-none" />
        <div className="relative max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/8 border border-white/10 text-white/60 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-brand-red rounded-full animate-pulse" />
            Free · No login required · Instant result
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-4">
            How much German tax<br />
            can <span className="text-brand-red">you</span> get back?
          </h1>
          <p className="text-white/50 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            International workers in Germany overpay an average of <strong className="text-white">€600–€1,200</strong> in tax every year.
            Calculate your refund in 30 seconds.
          </p>
        </div>
      </section>

      {/* ── Calculator + results ──────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 -mt-8 pb-16">
        <CalculatorWidget />
      </section>

      {/* ── What can I deduct ─────────────────────────────────────────────── */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-brand-red uppercase tracking-widest mb-2">Deductions</p>
            <h2 className="text-2xl sm:text-3xl font-black text-brand-navy">What counts in your favour</h2>
            <p className="text-gray-400 text-sm mt-2 max-w-lg mx-auto">
              German tax law offers dozens of deductions. Our calculator applies the most common ones automatically.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEDUCTION_ITEMS.map(item => (
              <div key={item.title} className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <div className="flex items-start gap-3 mb-2">
                  <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-brand-navy leading-tight">{item.title}</p>
                    <p className="text-xs font-black text-brand-red mt-0.5">{item.amount}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed pl-7">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-brand-red uppercase tracking-widest mb-2">FAQ</p>
            <h2 className="text-2xl sm:text-3xl font-black text-brand-navy">Common questions</h2>
          </div>
          <div className="space-y-4">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="bg-white rounded-2xl border border-gray-100 px-6 py-5">
                <p className="text-sm font-bold text-brand-navy mb-1.5">{q}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="bg-brand-navy py-16 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
            Ready to claim your refund?
          </h2>
          <p className="text-white/50 text-sm mb-8 leading-relaxed">
            Create a free account, upload your documents, and we'll handle everything with the Finanzamt.
            Takes about 10 minutes.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-brand-red hover:bg-red-500 active:scale-[0.98] text-white font-bold px-8 py-4 rounded-2xl text-base transition-all shadow-xl shadow-brand-red/30"
          >
            Start my application <ChevronRight size={16} />
          </Link>
          <p className="text-white/30 text-xs mt-4">No upfront payment · 4-year back-claim available</p>
        </div>
      </section>

    </div>
  )
}
