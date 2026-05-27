import type { Metadata } from 'next'
import Link from 'next/link'
import {
  UserPlus, FileText, CreditCard, Send, Banknote,
  ChevronRight, Clock, ShieldCheck, Star, CheckCircle2,
  Smartphone, Globe, Building2,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'How It Works — SteuerBack',
  description: 'Get your German tax refund in 5 simple steps. Create an account, upload your documents, and we handle everything with the Finanzamt.',
}

const STEPS = [
  {
    num:   '01',
    icon:  UserPlus,
    title: 'Create your free account',
    body:  'Sign up in under a minute. No credit card needed. Choose which tax year(s) you want to claim — you can go back up to 4 years.',
    color: 'bg-blue-500',
    light: 'bg-blue-50 text-blue-600',
    time:  '2 min',
  },
  {
    num:   '02',
    icon:  FileText,
    title: 'Complete your profile',
    body:  'Fill in your personal details, employer information, and bank IBAN. This takes about 5 minutes and unlocks your document checklist.',
    color: 'bg-violet-500',
    light: 'bg-violet-50 text-violet-600',
    time:  '5 min',
  },
  {
    num:   '03',
    icon:  FileText,
    title: 'Upload your documents',
    body:  'Upload your Lohnsteuerbescheinigung (salary certificate), passport, and sign the Vollmacht (power of attorney). Everything is done via your phone or computer.',
    color: 'bg-amber-500',
    light: 'bg-amber-50 text-amber-600',
    time:  '5 min',
  },
  {
    num:   '04',
    icon:  CreditCard,
    title: 'Choose your payment plan',
    body:  'Pay €70 upfront for priority processing, or choose our "pay from refund" option (€150) — no money needed today. We only get paid when you do.',
    color: 'bg-brand-red',
    light: 'bg-red-50 text-red-600',
    time:  '1 min',
  },
  {
    num:   '05',
    icon:  Send,
    title: 'We file with the Finanzamt',
    body:  'Our tax experts prepare and submit your return to the German tax office. We handle all the German bureaucracy on your behalf.',
    color: 'bg-teal-500',
    light: 'bg-teal-50 text-teal-600',
    time:  '2–3 days',
  },
  {
    num:   '06',
    icon:  Banknote,
    title: 'Receive your refund',
    body:  'The Finanzamt processes your return and transfers the refund directly to your bank account. We track the status and keep you updated throughout.',
    color: 'bg-emerald-500',
    light: 'bg-emerald-50 text-emerald-600',
    time:  '3–6 months',
  },
]

const WHY_US = [
  {
    icon:  ShieldCheck,
    title: 'German tax experts',
    body:  'Our team understands the Finanzamt process inside out. We\'ve helped workers from 40+ nationalities.',
    color: 'bg-indigo-50 text-indigo-600',
  },
  {
    icon:  Smartphone,
    title: '100% digital',
    body:  'No printing, no post, no office visits. Everything is done through our portal — from your phone or laptop.',
    color: 'bg-violet-50 text-violet-600',
  },
  {
    icon:  Globe,
    title: 'For international workers',
    body:  'Seasonal workers, expats, students, EU workers — if you earned income in Germany, you likely have a refund waiting.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon:  Clock,
    title: 'Fast & tracked',
    body:  'We submit within 2–3 business days of receiving your documents. You get a status update at every step.',
    color: 'bg-teal-50 text-teal-600',
  },
  {
    icon:  Building2,
    title: 'Multi-year claims',
    body:  'You can claim for up to 4 previous tax years. Our bundle pricing rewards you for claiming all years at once.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon:  Star,
    title: 'No refund, no fee',
    body:  'With our "pay from refund" option you pay absolutely nothing unless we successfully get money back for you.',
    color: 'bg-emerald-50 text-emerald-600',
  },
]

const ELIGIBLE = [
  'Worked in Germany as an employee for any period',
  'Paid Lohnsteuer (wage tax) — shown on your payslip',
  'Worked less than 12 months in a tax year',
  'Had multiple employers in Germany',
  'Were a student working part-time',
  'Commuted to work or worked from home',
  'Paid into a pension or insurance scheme',
]

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-brand-navy pt-24 pb-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(230,57,70,0.12),transparent_60%)] pointer-events-none" />
        <div className="relative max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/8 border border-white/10 text-white/60 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
            Simple · Transparent · Fully digital
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-4">
            Your refund in<br />
            <span className="text-brand-red">6 simple steps</span>
          </h1>
          <p className="text-white/50 text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-8">
            From sign-up to refund — we handle the German tax system so you don't have to.
            Takes about <strong className="text-white">15 minutes</strong> of your time.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-brand-red hover:bg-red-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-brand-red/30 active:scale-[0.98]"
            >
              Start for free <ChevronRight size={14} />
            </Link>
            <Link
              href="/calculate"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all border border-white/10"
            >
              Calculate my refund
            </Link>
          </div>
        </div>
      </section>

      {/* ── Steps ────────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <div className="space-y-0">
          {STEPS.map((step, i) => {
            const Icon = step.icon
            const isLast = i === STEPS.length - 1
            return (
              <div key={step.num} className="flex gap-6 md:gap-10">
                {/* Left: number + connector line */}
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 ${step.color} rounded-2xl flex items-center justify-center shrink-0 shadow-md`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  {!isLast && <div className="w-0.5 flex-1 bg-gray-100 my-2" style={{ minHeight: '3rem' }} />}
                </div>

                {/* Right: content */}
                <div className={`flex-1 ${isLast ? 'pb-0' : 'pb-10'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-black text-gray-300">{step.num}</span>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${step.light}`}>
                      {step.time}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-brand-navy mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-lg">{step.body}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Who is eligible ──────────────────────────────────────────────── */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-xs font-bold text-brand-red uppercase tracking-widest mb-3">Eligibility</p>
              <h2 className="text-2xl sm:text-3xl font-black text-brand-navy mb-4">
                You likely qualify if…
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Most international employees in Germany are owed a refund and don't even know it.
                The Finanzamt won't chase you — you have to claim it yourself.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-brand-red hover:bg-red-500 text-white font-bold px-5 py-3 rounded-xl text-sm transition-all"
              >
                Check if I qualify <ChevronRight size={14} />
              </Link>
            </div>
            <ul className="space-y-3">
              {ELIGIBLE.map(item => (
                <li key={item} className="flex items-start gap-3 bg-white rounded-xl px-4 py-3 border border-gray-100">
                  <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Why SteuerBack ───────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-brand-red uppercase tracking-widest mb-2">Why us</p>
            <h2 className="text-2xl sm:text-3xl font-black text-brand-navy">
              Why choose SteuerBack?
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {WHY_US.map(({ icon: Icon, title, body, color }) => (
              <div key={title} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon size={18} />
                </div>
                <h3 className="font-bold text-brand-navy mb-1.5 text-sm">{title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline visual ──────────────────────────────────────────────── */}
      <section className="bg-brand-navy py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold text-brand-red uppercase tracking-widest mb-3">Timeline</p>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-10">
            How long does it take?
          </h2>
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { label: 'Your time',       value: '~15 min', sub: 'To complete the application', color: 'text-blue-400' },
              { label: 'Our processing',  value: '2–3 days', sub: 'To prepare and submit to Finanzamt', color: 'text-violet-400' },
              { label: 'Tax refund',      value: '3–6 mo',  sub: 'Until money arrives in your account', color: 'text-emerald-400' },
            ].map(({ label, value, sub, color }) => (
              <div key={label} className="bg-white/8 rounded-2xl px-4 py-5 border border-white/10">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">{label}</p>
                <p className={`text-2xl font-black ${color} mb-1`}>{value}</p>
                <p className="text-[11px] text-white/40 leading-snug">{sub}</p>
              </div>
            ))}
          </div>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-brand-red hover:bg-red-500 active:scale-[0.98] text-white font-bold px-8 py-4 rounded-2xl text-base transition-all shadow-xl shadow-brand-red/30"
          >
            Get started now <ChevronRight size={16} />
          </Link>
          <p className="text-white/30 text-xs mt-3">Free to start · No upfront payment required</p>
        </div>
      </section>

    </div>
  )
}
