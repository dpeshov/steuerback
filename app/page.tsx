import Link from 'next/link'
import { CheckCircle, Shield, Globe, ArrowRight, Star, Zap, Clock, Users } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import RefundCalculator from '@/components/landing/RefundCalculator'
import AnnouncementBanner from '@/components/landing/AnnouncementBanner'

const steps = [
  { n: '01', title: 'Create your free account', desc: 'Register in 60 seconds. No commitment required.' },
  { n: '02', title: 'Fill in your profile', desc: 'Personal details, employer and bank account. Fully guided.' },
  { n: '03', title: 'Upload documents', desc: 'Salary certificate, payslips, ID. We tell you exactly what\'s needed.' },
  { n: '04', title: 'Pay & we file it', desc: '€70 upfront or €150 from your refund. We submit to the Finanzamt.' },
  { n: '05', title: 'Receive your refund', desc: 'Money lands in your bank account. Worldwide. Average: €800.' },
]

const faqs = [
  { q: 'Who can apply?', a: 'Anyone who worked in Germany and paid Lohnsteuer — students, seasonal workers, Work & Travel participants, international employees from any country.' },
  { q: 'How much can I get back?', a: 'Most international workers receive €300–€2,000. The exact amount depends on your income, tax class, whether you were a student, and your deductible expenses.' },
  { q: 'How long does it take?', a: 'We submit your return within 1–2 weeks after all documents are in. The Finanzamt typically processes it in 3–6 months.' },
  { q: "What if I'm already back home?", a: 'No problem — everything is 100% online. We transfer the refund to any bank account worldwide, in any currency.' },
  { q: 'What documents do I need?', a: 'Your Lohnsteuerbescheinigung (salary certificate), payslips, passport or ID, and IBAN for the bank transfer. We guide you through every document.' },
  { q: 'Can I claim for past years?', a: 'Yes! In Germany you can claim refunds going back 4 years. If you worked in 2021, 2022, 2023 or 2024 — you can still get money back.' },
]

const trust = [
  { icon: Shield, label: 'GDPR compliant', sub: 'Your data is encrypted & protected' },
  { icon: Globe,  label: '30+ nationalities', sub: 'Workers from all over the world' },
  { icon: Star,   label: '4.9 / 5 rating', sub: 'Rated by verified clients' },
  { icon: Zap,    label: 'No refund = no fee', sub: 'We only win when you win' },
]

const testimonials = [
  {
    name: 'Marko D.',
    country: '🇷🇸 Serbia',
    text: 'I worked in Berlin for 8 months and got back €1,240. The whole process was done in 2 weeks. Absolutely seamless.',
    amount: '€1,240',
  },
  {
    name: 'Ana P.',
    country: '🇭🇷 Croatia',
    text: 'As a student on Work & Travel I wasn\'t sure I qualified. SteuerBack sorted everything and I got €680 back. Highly recommend!',
    amount: '€680',
  },
  {
    name: 'Murat K.',
    country: '🇹🇷 Turkey',
    text: 'Had no idea about German taxes. They explained everything and handled all the paperwork. Got €1,580 for 2022 and 2023 combined.',
    amount: '€1,580',
  },
  {
    name: 'Ioana M.',
    country: '🇷🇴 Romania',
    text: 'Uploaded my documents from my phone in 20 minutes. Three months later the money arrived. Couldn\'t be simpler.',
    amount: '€920',
  },
]

const nationalities = [
  '🇷🇸 Serbian', '🇭🇷 Croatian', '🇧🇦 Bosnian', '🇲🇰 Macedonian',
  '🇷🇴 Romanian', '🇧🇬 Bulgarian', '🇦🇱 Albanian', '🇲🇪 Montenegrin',
  '🇹🇷 Turkish', '🇺🇦 Ukrainian', '🇵🇱 Polish', '🇸🇰 Slovak',
  '🇨🇿 Czech', '🇭🇺 Hungarian', '🇮🇳 Indian', '🇳🇵 Nepali',
]

// Deadline: Dec 31 of current year + 4 (last claimable year)
const currentYear = new Date().getFullYear()
const lastClaimYear = currentYear - 4

export default function HomePage() {
  return (
    <>
      <AnnouncementBanner />
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0D0D1A] min-h-screen flex items-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[700px] h-[700px] bg-brand-red/8 rounded-full blur-[140px]" />
          <div className="absolute bottom-[-5%] left-[-10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-red/3 rounded-full blur-[180px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 pt-28 pb-24 text-center w-full">
          <div className="inline-flex items-center gap-2.5 bg-white/5 border border-white/8 rounded-full px-5 py-2.5 text-sm text-white/60 mb-10 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 bg-brand-success rounded-full animate-pulse shrink-0" />
            Over 2,000 workers have already claimed their refund
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-white leading-[0.88] tracking-tighter mb-8">
            Your German<br />
            tax refund.<br />
            <span className="text-brand-red">Simple.</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/40 max-w-xl mx-auto mb-12 leading-relaxed">
            Worked in Germany? You likely paid too much tax. We get it back — fast, 100% online, and trusted by workers from 30+ countries.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <Link
              href="/register"
              className="group bg-brand-red hover:bg-red-500 text-white font-bold px-8 py-4 rounded-2xl text-base transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-brand-red/25 flex items-center justify-center gap-2"
            >
              Check my eligibility — free
              <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a
              href="#calculator"
              className="bg-white/5 hover:bg-white/8 border border-white/8 text-white font-semibold px-8 py-4 rounded-2xl text-base transition-all hover:border-white/15"
            >
              Calculate my refund
            </a>
          </div>

          <div className="flex justify-center mb-20">
            <Link
              href="/apply"
              className="group inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-brand-red/30 hover:border-brand-red/60 text-white font-semibold px-8 py-4 rounded-2xl text-base transition-all hover:shadow-lg hover:shadow-brand-red/10"
            >
              Interested in your tax refund? Apply here
              <ArrowRight size={18} className="text-brand-red group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
            {[
              { value: '€800', label: 'Average refund' },
              { value: '14 days', label: 'To submission' },
              { value: '4 years', label: 'Back-claim window' },
            ].map(({ value, label }) => (
              <div key={label} className="bg-white/4 border border-white/8 rounded-2xl p-4 backdrop-blur-sm">
                <p className="text-2xl font-black text-white tracking-tight">{value}</p>
                <p className="text-xs text-white/35 mt-0.5 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      </section>

      {/* ── TRUST BAR ────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100 py-10 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {trust.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="w-9 h-9 bg-brand-success/10 rounded-xl flex items-center justify-center shrink-0">
                <Icon size={16} className="text-brand-success" />
              </div>
              <div>
                <p className="text-sm font-semibold text-brand-navy">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── REFUND CALCULATOR ──────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#F8F9FA]" id="calculator">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-brand-red text-sm font-bold uppercase tracking-widest mb-3">Free estimate</p>
            <h2 className="text-4xl md:text-5xl font-black text-brand-navy tracking-tight">How much could you get?</h2>
            <p className="text-gray-400 mt-4">No account needed. Get a personalized estimate in seconds.</p>
          </div>

          <div className="max-w-lg mx-auto">
            <RefundCalculator />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="py-28 px-6 bg-white" id="how-it-works">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-brand-red text-sm font-bold uppercase tracking-widest mb-3">The process</p>
            <h2 className="text-4xl md:text-5xl font-black text-brand-navy tracking-tight">Five steps to your refund</h2>
            <p className="text-gray-400 mt-4 text-lg">We handle the German bureaucracy. You just upload documents.</p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 top-8 bottom-8 w-px bg-gradient-to-b from-brand-red via-brand-red/30 to-transparent hidden md:block" />
            <div className="space-y-4 md:space-y-0">
              {steps.map((s, i) => (
                <div key={s.n} className={`md:flex md:items-center md:gap-8 ${i % 2 === 0 ? '' : 'md:flex-row-reverse'}`}>
                  <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <div className={`group bg-gray-50 hover:bg-white border border-gray-100 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-100 rounded-3xl p-7 transition-all duration-300 ${i % 2 === 0 ? 'md:ml-8' : 'md:mr-8'}`}>
                      <p className="text-xs font-bold text-brand-red uppercase tracking-widest mb-2">{s.n}</p>
                      <h3 className="text-xl font-bold text-brand-navy mb-2">{s.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                  <div className="hidden md:flex w-10 h-10 rounded-full bg-brand-red text-white font-black items-center justify-center text-sm shrink-0 shadow-lg shadow-brand-red/30 z-10">
                    {i + 1}
                  </div>
                  <div className="flex-1 hidden md:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#F8F9FA]" id="testimonials">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-brand-red text-sm font-bold uppercase tracking-widest mb-3">Real clients</p>
            <h2 className="text-4xl md:text-5xl font-black text-brand-navy tracking-tight">What workers say</h2>
            <div className="flex items-center justify-center gap-1 mt-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} fill="#E63946" className="text-brand-red" />
              ))}
              <span className="text-gray-500 text-sm font-semibold ml-2">4.9 / 5 — 2,000+ reviews</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:shadow-gray-100 transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={13} fill="#E63946" className="text-brand-red" />
                    ))}
                  </div>
                  <span className="text-2xl font-black text-emerald-600">{t.amount}</span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-5 italic">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-gradient-to-br from-brand-red to-red-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-black">{t.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-brand-navy">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.country}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────────── */}
      <section className="py-28 px-6 bg-white" id="pricing">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-brand-red text-sm font-bold uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-4xl md:text-5xl font-black text-brand-navy tracking-tight">No hidden fees</h2>
            <p className="text-gray-400 mt-4">Choose what suits you. Pay nothing if there is no refund.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Upfront */}
            <div className="bg-white rounded-3xl p-8 border border-gray-200 hover:border-gray-300 hover:shadow-xl hover:shadow-gray-100 transition-all duration-300">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Standard</p>
              <div className="flex items-end gap-2 mb-1">
                <p className="text-6xl font-black text-brand-navy">€70</p>
              </div>
              <p className="text-gray-400 mb-8 text-sm">Pay upfront, processed within 7 days</p>
              <ul className="space-y-3 mb-8">
                {['Priority processing', 'Full refund to your bank', 'Pay via card or bank transfer'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm text-gray-600">
                    <CheckCircle size={16} className="text-brand-success shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="block w-full border-2 border-brand-navy text-brand-navy font-bold py-3.5 rounded-2xl text-center hover:bg-brand-navy hover:text-white transition-all text-sm">
                Get started
              </Link>
            </div>

            {/* Deferred */}
            <div className="bg-brand-navy rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-brand-red/20 rounded-full blur-3xl pointer-events-none" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-bold text-white/40 uppercase tracking-widest">No upfront cost</p>
                  <span className="bg-brand-red text-white text-xs font-bold px-3 py-1 rounded-full">Most popular</span>
                </div>
                <div className="flex items-end gap-2 mb-1">
                  <p className="text-6xl font-black text-white">€150</p>
                </div>
                <p className="text-white/40 mb-8 text-sm">Deducted from your refund when it arrives</p>
                <ul className="space-y-3 mb-8">
                  {['Zero upfront cost', 'We only get paid when you do', 'If no refund — you pay nothing'].map(item => (
                    <li key={item} className="flex items-center gap-3 text-sm text-white/70">
                      <CheckCircle size={16} className="text-brand-success shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="block w-full bg-brand-red hover:bg-red-500 text-white font-bold py-3.5 rounded-2xl text-center transition-all text-sm hover:shadow-lg hover:shadow-brand-red/30">
                  Get started free
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── NATIONALITIES ─────────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-[#F8F9FA] border-t border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Users size={18} className="text-brand-red" />
            <h2 className="text-lg font-black text-brand-navy">We serve workers from all over the world</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {nationalities.map(n => (
              <span key={n} className="bg-white border border-gray-200 text-gray-600 text-sm font-medium px-3.5 py-1.5 rounded-full hover:border-brand-red/30 hover:text-brand-navy transition-colors">
                {n}
              </span>
            ))}
            <span className="bg-white border border-gray-200 text-gray-400 text-sm font-medium px-3.5 py-1.5 rounded-full">
              +20 more
            </span>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="py-28 px-6 bg-white" id="faq">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-brand-red text-sm font-bold uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="text-4xl md:text-5xl font-black text-brand-navy tracking-tight">Common questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={faq.q} className="group bg-gray-50 hover:bg-white border border-gray-100 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100 rounded-2xl p-6 transition-all duration-200">
                <div className="flex items-start gap-4">
                  <span className="text-xs font-black text-brand-red/40 mt-0.5 w-5 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="font-bold text-brand-navy mb-2">{faq.q}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section className="bg-[#0D0D1A] py-28 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-red/10 rounded-full blur-[100px]" />
        </div>
        <div className="relative max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/8 rounded-full px-4 py-2 text-xs text-white/50 font-medium mb-8">
            <Clock size={12} />
            Most applications submitted within 14 days
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
            Ready to get your money back?
          </h2>
          <p className="text-white/40 mb-4 text-lg">
            Thousands of workers already received their German tax refund.
          </p>
          <p className="text-white/30 text-sm mb-10">
            ⏰ File for {lastClaimYear}–{currentYear - 1} before December 31, {currentYear}
          </p>
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 bg-brand-red hover:bg-red-500 text-white font-bold px-10 py-5 rounded-2xl text-lg transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-brand-red/30"
          >
            Start your application — free
            <ArrowRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <p className="text-white/25 text-sm mt-5">No upfront cost option available. No refund = no fee.</p>
        </div>
      </section>

      <Footer />
    </>
  )
}
