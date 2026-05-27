'use client'
import { useState } from 'react'
import Link from 'next/link'
import {
  ChevronDown, ChevronRight, HelpCircle,
  FileText, Euro, Clock, Shield, Users, Globe,
} from 'lucide-react'

// ── Data ─────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    id:    'eligibility',
    icon:  Users,
    label: 'Eligibility',
    color: 'bg-blue-50 text-blue-600',
    faqs: [
      {
        q: 'Who can claim a German tax refund?',
        a: 'Anyone who earned income in Germany as an employee and had Lohnsteuer (wage tax) withheld from their salary. This includes EU workers, non-EU workers on a work permit, seasonal workers, students with part-time jobs, and expats. If the word "Lohnsteuer" appears on your payslip or Lohnsteuerbescheinigung, you likely overpaid tax.',
      },
      {
        q: 'I only worked for a few months — can I still claim?',
        a: 'Yes — and you\'re especially likely to be owed money. The German tax system is designed around a 12-month work year. If you worked fewer months, your employer withheld tax at a full-year rate, meaning you overpaid. The shorter your employment period, the larger your likely refund.',
      },
      {
        q: 'I left Germany years ago. Can I still claim?',
        a: 'Yes. Germany allows you to claim refunds up to 4 years back. In 2025 you can claim for 2021, 2022, 2023 and 2024. After 31 December 2025, the 2021 year expires. Don\'t wait — every year you delay, one year of potential refund is lost.',
      },
      {
        q: 'I had multiple employers in Germany. Does that help?',
        a: 'Yes. Having two or more employers in the same tax year typically leads to a higher refund because each employer withholds tax as if they\'re your only employer, causing over-taxation. We handle multi-employer returns as part of our standard service.',
      },
      {
        q: 'Do I need a German address or bank account?',
        a: 'No German address is needed. You can receive your refund in any bank account in the world — just provide your IBAN during registration. We communicate with you digitally from wherever you are.',
      },
    ],
  },
  {
    id:    'process',
    icon:  FileText,
    label: 'The process',
    color: 'bg-violet-50 text-violet-600',
    faqs: [
      {
        q: 'How does SteuerBack work?',
        a: 'You create a free account, fill in your details, and upload your Lohnsteuerbescheinigung (salary certificate). Our team prepares your German tax return and files it with the Finanzamt (German tax office) using your signed power of attorney (Vollmacht). The Finanzamt processes your return and sends the refund directly to your bank account. We track the status and update you at every step.',
      },
      {
        q: 'What is a Lohnsteuerbescheinigung?',
        a: 'It\'s the annual salary certificate your German employer is legally required to issue by the end of February each year. It shows your gross salary, the Lohnsteuer withheld, and social security contributions. It\'s the key document for filing a tax return. If you no longer have it, your employer can reissue it, or you can retrieve it from your ELSTER account (Germany\'s online tax portal).',
      },
      {
        q: 'What is a Vollmacht (power of attorney)?',
        a: 'The Vollmacht authorises SteuerBack to act on your behalf with the German tax authority (Finanzamt). Without it, we cannot file documents in your name. You sign it digitally through our portal — no printing or post required.',
      },
      {
        q: 'How long does the process take?',
        a: 'After you submit all documents, our team prepares and files your return within 2–3 business days. Once filed, the Finanzamt typically takes 3–6 months to process the return and issue the refund. We have no control over the Finanzamt\'s timeline, but we track your case and notify you when the refund is issued.',
      },
      {
        q: 'Do I need to speak German or deal with the Finanzamt myself?',
        a: 'No. We handle all communication with the Finanzamt in German. You only interact with our English-language portal. If the Finanzamt sends any queries or requests additional documents, we translate and handle that on your behalf.',
      },
      {
        q: 'What happens after I submit my documents?',
        a: 'Our team reviews your documents (usually within 1 business day) and lets you know if anything is missing. Once everything is in order and payment is confirmed, we prepare your Einkommensteuererklärung (income tax return) and submit it electronically to the Finanzamt. You can track the status from your dashboard.',
      },
    ],
  },
  {
    id:    'documents',
    icon:  FileText,
    label: 'Documents',
    color: 'bg-amber-50 text-amber-600',
    faqs: [
      {
        q: 'What documents do I need?',
        a: 'The core documents are: (1) Lohnsteuerbescheinigung — your annual salary certificate from your German employer; (2) Passport or ID card; (3) Signed Vollmacht (power of attorney) — done digitally in our portal. Additional documents may be needed depending on your situation, such as rental receipts if you had work-related relocation costs, or receipts for work equipment.',
      },
      {
        q: 'What if I have more than one Lohnsteuerbescheinigung?',
        a: 'If you worked for multiple employers in Germany, you\'ll have one certificate per employer. Upload all of them. We include all income sources in your return — this often increases your refund.',
      },
      {
        q: 'I can\'t find my Lohnsteuerbescheinigung. What can I do?',
        a: 'Contact your former employer\'s HR or payroll department — they are legally required to provide it. If your employer no longer exists, German tax authorities may still have records via ELSTER. Contact our support team and we can guide you.',
      },
      {
        q: 'How do I upload documents?',
        a: 'You can upload photos taken with your phone or scanned files through our portal. We accept JPG, PNG, and PDF formats up to 20MB each. Photos should be clear, well-lit, and show all four corners of the document.',
      },
      {
        q: 'Is it safe to send my documents digitally?',
        a: 'Yes. All document uploads are encrypted with TLS in transit and stored securely with Supabase Storage. Access is restricted to your account and authorised SteuerBack staff only. We comply with GDPR.',
      },
    ],
  },
  {
    id:    'pricing',
    icon:  Euro,
    label: 'Pricing & payment',
    color: 'bg-red-50 text-red-600',
    faqs: [
      {
        q: 'How much does SteuerBack charge?',
        a: 'We offer two plans: Pay now at €70 per year (upfront, priority processing), or Pay from refund at €150 per year (nothing today — fee deducted from your refund). If you claim multiple years, bundle pricing saves you significantly: e.g. 4 years upfront is €160 total instead of €280.',
      },
      {
        q: 'What if I don\'t get a refund?',
        a: 'With the "Pay from refund" plan, you owe us absolutely nothing if the Finanzamt determines you are not owed a refund. With the upfront "Pay now" plan, we refund our fee in full if you are not eligible. We only make money when you do.',
      },
      {
        q: 'Are there any hidden fees?',
        a: 'None. The prices shown are the total cost. No registration fee, no document handling fee, no success commission on top of the stated price. What you see is what you pay.',
      },
      {
        q: 'How does "Pay from refund" work exactly?',
        a: 'When you choose this option, you sign a deferred payment agreement through our portal. We then file your return at no upfront cost. When the Finanzamt transfers your refund to your bank account, you send us the agreed fee. We trust you to do this once the money arrives.',
      },
      {
        q: 'What is bundle pricing?',
        a: 'If you have unclaimed returns for multiple years (e.g. 2021–2024), you can bundle them into one payment. Upfront bundle: 2 yrs = €110, 3 yrs = €140, 4 yrs = €160. From refund bundle: 2 yrs = €230, 3 yrs = €290, 4 yrs = €340. Compared to paying year-by-year, a 4-year bundle saves you €120 upfront or €260 from refund.',
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We use Stripe for secure payment processing. You can pay with any major credit or debit card (Visa, Mastercard, American Express), as well as Apple Pay and Google Pay where supported.',
      },
    ],
  },
  {
    id:    'refund',
    icon:  Clock,
    label: 'Refund & timeline',
    color: 'bg-teal-50 text-teal-600',
    faqs: [
      {
        q: 'How much can I expect to get back?',
        a: 'The average refund for international workers is €400–€1,200 per year. The exact amount depends on your salary, months worked, tax class, and deductible expenses. Workers in tax class 1 who worked less than 12 months typically receive the highest refunds. Use our free calculator for a personalised estimate.',
      },
      {
        q: 'How long does it take to receive my refund?',
        a: 'Once we submit your return, the Finanzamt typically processes it within 3–6 months. During busy periods (February–April) it can take longer. We cannot speed up the Finanzamt\'s processing, but we monitor your case and notify you when the decision is issued.',
      },
      {
        q: 'Where is the refund sent?',
        a: 'The Finanzamt transfers the refund directly to the bank account you provide during registration. This can be any international IBAN — German, EU, or worldwide. Make sure your IBAN is correct before we file.',
      },
      {
        q: 'What if the Finanzamt sends me a Steuerbescheid (tax assessment)?',
        a: 'A Steuerbescheid is the official tax assessment letter from the Finanzamt. We translate and review it for you. If there\'s an issue, we advise on next steps and file any necessary objections (Einspruch) on your behalf within the 1-month window.',
      },
      {
        q: 'Can I claim refunds for multiple tax years at once?',
        a: 'Yes. You can claim for up to 4 previous years simultaneously. Our portal lets you add multiple tax years, and we process them together. Bundle pricing makes multi-year claims significantly cheaper.',
      },
    ],
  },
  {
    id:    'privacy',
    icon:  Shield,
    label: 'Privacy & security',
    color: 'bg-indigo-50 text-indigo-600',
    faqs: [
      {
        q: 'Is my personal and financial data safe?',
        a: 'Yes. We use industry-standard TLS encryption for all data in transit. Documents are stored securely with access controls. We comply fully with GDPR. We never sell your data or share it with third parties outside of what\'s needed to file your tax return.',
      },
      {
        q: 'Who sees my documents?',
        a: 'Only authorised SteuerBack tax professionals who are processing your return. Documents are used solely for the purpose of preparing and filing your German tax return.',
      },
      {
        q: 'Can I delete my account and data?',
        a: 'Yes. You can request full account and data deletion from the Settings > Danger Zone section of your account at any time. Note: if we\'ve already filed your return, we are legally required to retain certain records for the statutory retention period.',
      },
      {
        q: 'Is SteuerBack a registered tax advisory service?',
        a: 'SteuerBack operates as a tax filing assistance service. We work with qualified German tax professionals to prepare returns. Our service is designed for standard employee tax returns (Arbeitnehmer). For complex tax situations involving business income or investments, we may refer you to a licensed Steuerberater.',
      },
    ],
  },
  {
    id:    'languages',
    icon:  Globe,
    label: 'Languages & support',
    color: 'bg-emerald-50 text-emerald-600',
    faqs: [
      {
        q: 'What languages does SteuerBack support?',
        a: 'Our portal is available in English, German, Macedonian, Serbian, Bosnian, Albanian, Turkish, Hindi, and Nepali. We continuously add more languages. All correspondence with the Finanzamt is handled in German by us.',
      },
      {
        q: 'How can I contact support?',
        a: 'You can message our team directly through the Messages section of your dashboard. For urgent matters, email us at support@steuerback.com. We aim to respond within 1 business day.',
      },
      {
        q: 'I have a complex tax situation. Can you help?',
        a: 'Our service covers standard employee income (Arbeitnehmer) tax returns. If you have self-employment income, rental income, foreign income, or other complex situations, contact us first — we\'ll let you know if it falls within our scope or if you need a licensed Steuerberater.',
      },
    ],
  },
]

// ── Accordion item ────────────────────────────────────────────────────────────

function Accordion({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`border rounded-2xl overflow-hidden transition-all duration-200 ${open ? 'border-brand-red/20 bg-white shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start gap-3 px-5 py-4 text-left"
      >
        <span className="flex-1 text-sm font-bold text-brand-navy leading-relaxed">{q}</span>
        <span className={`mt-0.5 shrink-0 transition-transform duration-200 ${open ? 'rotate-180 text-brand-red' : 'text-gray-300'}`}>
          <ChevronDown size={16} />
        </span>
      </button>
      {open && (
        <div className="px-5 pb-5">
          <div className="w-full h-px bg-gray-100 mb-4" />
          <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('eligibility')
  const active = CATEGORIES.find(c => c.id === activeCategory) ?? CATEGORIES[0]!

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-brand-navy pt-24 pb-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(230,57,70,0.12),transparent_60%)] pointer-events-none" />
        <div className="relative max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/8 border border-white/10 text-white/60 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            <HelpCircle size={11} />
            Frequently asked questions
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-4">
            Got questions?<br />
            <span className="text-brand-red">We have answers.</span>
          </h1>
          <p className="text-white/50 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Everything you need to know about claiming your German tax refund.
          </p>
        </div>
      </section>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-[240px_1fr] gap-8 items-start">

          {/* ── Category sidebar ──────────────────────────────────────── */}
          <nav className="md:sticky md:top-24 bg-gray-50 rounded-2xl p-2 border border-gray-100">
            {CATEGORIES.map(({ id, icon: Icon, label, color }) => {
              const isActive = id === activeCategory
              return (
                <button
                  key={id}
                  onClick={() => setActiveCategory(id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all mb-0.5 ${
                    isActive
                      ? 'bg-white shadow-sm border border-gray-100'
                      : 'hover:bg-white/60'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                    <Icon size={13} />
                  </div>
                  <span className={`text-sm font-bold ${isActive ? 'text-brand-navy' : 'text-gray-500'}`}>
                    {label}
                  </span>
                </button>
              )
            })}
          </nav>

          {/* ── Questions ─────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${active.color}`}>
                <active.icon size={16} />
              </div>
              <h2 className="text-xl font-black text-brand-navy">{active.label}</h2>
            </div>
            <div className="space-y-2">
              {active.faqs.map(({ q, a }) => (
                <Accordion key={q} q={q} a={a} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Still have questions ─────────────────────────────────────────── */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-xl mx-auto text-center">
          <div className="w-14 h-14 bg-white border border-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
            <HelpCircle size={22} className="text-brand-red" />
          </div>
          <h2 className="text-xl font-black text-brand-navy mb-2">Still have questions?</h2>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            Our team is happy to help. Send us a message through the portal or email us directly.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-brand-red hover:bg-red-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-brand-red/20"
            >
              Get started free <ChevronRight size={14} />
            </Link>
            <a
              href="mailto:support@steuerback.com"
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-brand-navy font-semibold px-6 py-3 rounded-xl text-sm transition-all border border-gray-200"
            >
              Email support
            </a>
          </div>
        </div>
      </section>

    </div>
  )
}
