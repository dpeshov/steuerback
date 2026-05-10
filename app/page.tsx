import Link from 'next/link'
import { CheckCircle, Shield, Globe, ArrowRight, Star } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const steps = [
  { n: '01', title: 'Check Eligibility', desc: 'Answer 4 quick questions to see if you qualify. Takes 60 seconds.' },
  { n: '02', title: 'Create Account', desc: 'Register free. Fill in your personal and work information.' },
  { n: '03', title: 'Upload Documents', desc: 'Upload your tax certificate, payslips, and ID. We guide you through each one.' },
  { n: '04', title: 'Pay & Submit', desc: '70€ upfront or 150€ deducted from your refund. No refund = no fee.' },
  { n: '05', title: 'Receive Refund', desc: 'We file with the Finanzamt. You receive the refund directly to your bank.' },
]

const faqs = [
  { q: 'Who can apply?', a: 'Anyone who worked in Germany and paid Lohnsteuer — students, seasonal workers, Work & Travel participants.' },
  { q: 'How much can I get back?', a: 'Most international workers get €300–€2,000 back. The exact amount depends on your income and tax class.' },
  { q: 'How long does it take?', a: 'We submit within 1–2 weeks after receiving your documents. Finanzamt typically processes in 3–6 months.' },
  { q: "What if I'm already back home?", a: "No problem. Everything is done online. We just need your bank account details to send the refund." },
  { q: 'What documents do I need?', a: 'Your Lohnsteuerbescheinigung (tax certificate from employer), payslips, passport, and bank details.' },
]

export default function HomePage() {
  return (
    <>
      <Navbar />
      <div>
        {/* Hero */}
        <section className="bg-brand-navy text-white py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Your German tax refund.<br />
              <span className="text-brand-red">Simple.</span>
            </h1>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Work in Germany? You likely paid too much tax. We get it back for you — fast, clear, and trusted.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/eligibility" className="bg-brand-red hover:bg-red-600 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors flex items-center justify-center gap-2">
                Check my eligibility <ArrowRight size={20} />
              </Link>
              <Link href="/how-it-works" className="border border-white/30 hover:border-white text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors">
                How it works
              </Link>
            </div>
          </div>
        </section>

        {/* Trust bar */}
        <section className="bg-white border-b border-gray-100 py-6 px-4">
          <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2"><Shield size={18} className="text-brand-success" /><span>Secure & GDPR compliant</span></div>
            <div className="flex items-center gap-2"><Globe size={18} className="text-brand-success" /><span>9 languages supported</span></div>
            <div className="flex items-center gap-2"><Star size={18} className="text-brand-success" /><span>Trusted by workers from 30+ countries</span></div>
            <div className="flex items-center gap-2"><CheckCircle size={18} className="text-brand-success" /><span>No refund = no fee</span></div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 px-4 bg-brand-surface" id="how-it-works">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-brand-navy text-center mb-4">How it works</h2>
            <p className="text-gray-500 text-center mb-12">Five steps. We handle the hard parts.</p>
            <div className="space-y-6">
              {steps.map((s) => (
                <div key={s.n} className="flex gap-6 bg-white rounded-2xl p-6 shadow-sm">
                  <div className="text-3xl font-bold text-brand-red font-mono w-12 shrink-0">{s.n}</div>
                  <div>
                    <h3 className="font-semibold text-brand-navy text-lg mb-1">{s.title}</h3>
                    <p className="text-gray-500">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-brand-navy mb-4">Simple pricing</h2>
            <p className="text-gray-500 mb-12">Choose what works for you. No hidden fees.</p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border-2 border-gray-200 rounded-2xl p-8 text-left">
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Upfront</p>
                <p className="text-5xl font-bold text-brand-navy mb-2">€70</p>
                <p className="text-gray-500 mb-6">Pay now, get processed faster</p>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex gap-2"><CheckCircle size={16} className="text-brand-success shrink-0 mt-0.5" />Priority processing</li>
                  <li className="flex gap-2"><CheckCircle size={16} className="text-brand-success shrink-0 mt-0.5" />Full refund goes to your account</li>
                  <li className="flex gap-2"><CheckCircle size={16} className="text-brand-success shrink-0 mt-0.5" />Pay via card (Stripe)</li>
                </ul>
              </div>
              <div className="border-2 border-brand-red rounded-2xl p-8 text-left relative">
                <span className="absolute top-4 right-4 bg-brand-red text-white text-xs font-semibold px-3 py-1 rounded-full">Popular</span>
                <p className="text-sm font-semibold text-brand-red uppercase tracking-wide mb-2">From Refund</p>
                <p className="text-5xl font-bold text-brand-navy mb-2">€150</p>
                <p className="text-gray-500 mb-6">Deducted from your refund</p>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex gap-2"><CheckCircle size={16} className="text-brand-success shrink-0 mt-0.5" />Zero upfront cost</li>
                  <li className="flex gap-2"><CheckCircle size={16} className="text-brand-success shrink-0 mt-0.5" />We only get paid when you do</li>
                  <li className="flex gap-2"><CheckCircle size={16} className="text-brand-success shrink-0 mt-0.5" />Sign agreement online</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-4 bg-brand-surface">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-brand-navy text-center mb-12">Frequently asked questions</h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.q} className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="font-semibold text-brand-navy mb-2">{faq.q}</h3>
                  <p className="text-gray-500 text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-brand-red text-white py-20 px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Ready to get your money back?</h2>
            <p className="text-white/80 mb-8">Thousands of workers already got their German tax refund. You&apos;re next.</p>
            <Link href="/register" className="bg-white text-brand-red font-bold px-10 py-4 rounded-xl text-lg hover:bg-gray-50 transition-colors inline-flex items-center gap-2">
              Start your application <ArrowRight size={20} />
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}
