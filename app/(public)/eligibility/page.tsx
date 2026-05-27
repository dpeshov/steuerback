import type { Metadata } from 'next'
import Link from 'next/link'
import {
  CheckCircle2, XCircle, ChevronRight, Calculator,
  Calendar, Briefcase, GraduationCap, Globe, Users, Home,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Check Your Eligibility — SteuerBack',
  description: 'Find out if you qualify for a German tax refund. International workers, seasonal workers, students, and expats.',
}

const YES = [
  { icon: Briefcase,      text: 'Worked as an employee in Germany for any period' },
  { icon: Calendar,       text: 'Worked less than 12 months in a tax year' },
  { icon: Users,          text: 'Had multiple employers in Germany' },
  { icon: GraduationCap,  text: 'Were a student with a part-time job in Germany' },
  { icon: Globe,          text: 'Are a non-German national (EU or non-EU)' },
  { icon: Home,           text: 'Commuted long distances or relocated for work' },
]

const NO = [
  'You were self-employed — your income is freelance only',
  'You earned no income in Germany',
  'You did not pay Lohnsteuer (no tax was withheld from your salary)',
]

const YEARS = [2021, 2022, 2023, 2024]

export default function EligibilityPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section className="bg-brand-navy pt-24 pb-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(230,57,70,0.12),transparent_60%)] pointer-events-none" />
        <div className="relative max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/8 border border-white/10 text-white/60 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            <CheckCircle2 size={11} className="text-emerald-400" />
            Do you qualify?
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-4">
            Check your<br />
            <span className="text-brand-red">eligibility</span>
          </h1>
          <p className="text-white/50 text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-8">
            Most international workers who earned wages in Germany are owed a refund —
            and many don't even know it.
          </p>
          <Link
            href="/calculate"
            className="inline-flex items-center gap-2 bg-brand-red hover:bg-red-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-brand-red/30"
          >
            <Calculator size={14} />
            Calculate my refund
          </Link>
        </div>
      </section>

      {/* Claimable years banner */}
      <section className="bg-emerald-600 py-5 px-4">
        <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-3 text-white">
          <p className="font-bold text-sm">Years you can still claim in 2025:</p>
          <div className="flex gap-2">
            {YEARS.map(y => (
              <span key={y} className="bg-white/15 border border-white/20 text-white font-black text-sm px-3 py-1 rounded-lg">
                {y}
              </span>
            ))}
          </div>
          <p className="text-emerald-100 text-xs font-semibold">· 2021 expires 31 Dec 2025</p>
        </div>
      </section>

      {/* Yes / No grid */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8">

          {/* You likely qualify */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 size={16} className="text-emerald-600" />
              </div>
              <h2 className="text-lg font-black text-brand-navy">You likely qualify if…</h2>
            </div>
            <div className="space-y-3">
              {YES.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3.5">
                  <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                    <Icon size={14} className="text-emerald-600" />
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed pt-1">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* You may not qualify */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center">
                <XCircle size={16} className="text-red-500" />
              </div>
              <h2 className="text-lg font-black text-brand-navy">You may not qualify if…</h2>
            </div>
            <div className="space-y-3 mb-8">
              {NO.map(text => (
                <div key={text} className="flex items-start gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5">
                  <XCircle size={15} className="text-red-300 mt-0.5 shrink-0" />
                  <p className="text-sm text-gray-500 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>

            {/* Not sure? */}
            <div className="bg-brand-navy rounded-2xl p-5 text-white">
              <p className="font-black text-base mb-1">Not 100% sure?</p>
              <p className="text-white/50 text-sm mb-4 leading-relaxed">
                Use our free refund calculator — enter your salary and months worked
                and we&apos;ll give you an instant estimate.
              </p>
              <Link
                href="/calculate"
                className="inline-flex items-center gap-2 bg-brand-red hover:bg-red-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all"
              >
                Try the calculator <ChevronRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why you overpaid explainer */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-brand-red uppercase tracking-widest mb-2">Why it happens</p>
            <h2 className="text-2xl sm:text-3xl font-black text-brand-navy">
              Why do international workers overpay tax?
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                num: '01',
                title: 'Taxed as full-year worker',
                body: 'Your employer withholds tax assuming you work all 12 months. If you worked less, you were overtaxed.',
                color: 'bg-blue-50 text-blue-600 border-blue-100',
              },
              {
                num: '02',
                title: 'Basic allowance not applied',
                body: 'Every person in Germany has a tax-free allowance (Grundfreibetrag). Short-term workers often don\'t benefit from it through payroll.',
                color: 'bg-violet-50 text-violet-600 border-violet-100',
              },
              {
                num: '03',
                title: 'Deductions not claimed',
                body: 'Commuting costs, work equipment, relocation costs, and union fees are all deductible — but only if you file a return.',
                color: 'bg-amber-50 text-amber-600 border-amber-100',
              },
            ].map(({ num, title, body, color }) => (
              <div key={num} className={`rounded-2xl border p-5 ${color}`}>
                <p className="text-3xl font-black opacity-20 mb-3">{num}</p>
                <h3 className="font-black text-brand-navy text-sm mb-2">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-navy py-16 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
            Ready to claim what&apos;s yours?
          </h2>
          <p className="text-white/50 text-sm mb-8 leading-relaxed">
            Create a free account — it takes 2 minutes and costs nothing until you choose a plan.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-brand-red hover:bg-red-500 active:scale-[0.98] text-white font-bold px-7 py-3.5 rounded-2xl text-sm transition-all shadow-xl shadow-brand-red/30"
            >
              Start for free <ChevronRight size={14} />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white font-semibold px-6 py-3.5 rounded-2xl text-sm transition-all border border-white/10"
            >
              How it works
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
