import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service — SteuerBack',
  description: 'SteuerBack Terms of Service. Read our terms before using the platform.',
}

const LAST_UPDATED = '1 May 2025'

export default function TermsPage() {
  const h2 = 'text-lg font-black text-brand-navy mt-10 mb-3'
  const p  = 'text-gray-500 text-sm leading-relaxed mb-3'
  const li = 'text-gray-500 text-sm leading-relaxed'

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-brand-navy pt-24 pb-14 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-bold text-brand-red uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Terms of Service</h1>
          <p className="text-white/40 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-3xl mx-auto px-4 py-14 pb-20">

        <div className={p}>
          Welcome to SteuerBack (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;), a service operated by Posrednik24. By creating an account
          or using our platform at <strong>steuerback.com</strong>, you agree to these Terms of Service. Please read them carefully.
        </div>

        <h2 className={h2}>1. The service</h2>
        <div className={p}>
          SteuerBack provides tax refund assistance for international workers who earned employment income in Germany.
          We help you prepare and submit an Einkommensteuererklärung (German income tax return) to the Finanzamt
          (German tax authority) on your behalf, using a signed Vollmacht (power of attorney) you provide.
        </div>
        <div className={p}>
          We are a tax filing <em>assistance</em> service. We are not a licensed Steuerberater (tax advisor) firm.
          Our service is designed for standard employee income situations. For complex tax matters (self-employment,
          business income, international tax treaties), we may refer you to a licensed professional.
        </div>

        <h2 className={h2}>2. Account registration</h2>
        <div className={p}>
          You must be at least 18 years old to create an account. You agree to provide accurate, complete
          information during registration and to keep your account credentials confidential. You are responsible
          for all activity that occurs under your account.
        </div>

        <h2 className={h2}>3. Your responsibilities</h2>
        <ul className="list-disc pl-5 space-y-2 mb-4">
          {[
            'You must provide truthful, accurate documents and information.',
            'You are responsible for ensuring your Lohnsteuerbescheinigung and other documents are genuine.',
            'You must provide a valid IBAN for receiving your refund.',
            'If you choose the "Pay from refund" option, you are legally obligated to pay our fee once your refund is received.',
            'You must not use the platform for fraudulent purposes.',
          ].map(item => (
            <li key={item} className={li}>{item}</li>
          ))}
        </ul>

        <h2 className={h2}>4. Fees and payment</h2>
        <div className={p}>
          Our fees are stated clearly on the Pricing page. We offer two plans:
        </div>
        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li className={li}><strong>Pay now (€70/year):</strong> a one-time upfront payment per tax year, charged via Stripe before we file.</li>
          <li className={li}><strong>Pay from refund (€150/year):</strong> no upfront cost; you agree to pay our fee from your refund once received. This constitutes a binding deferred payment agreement.</li>
        </ul>
        <div className={p}>
          If the Finanzamt determines you have no refund due, we will not charge our fee under the "Pay from
          refund" option, and we will refund the upfront fee if you paid upfront.
        </div>
        <div className={p}>
          Bundle discounts apply when claiming multiple tax years simultaneously, as shown on the Pricing page.
        </div>

        <h2 className={h2}>5. Refund timeline and outcome</h2>
        <div className={p}>
          We submit your tax return to the Finanzamt within 2–3 business days of receiving all required documents.
          The Finanzamt typically processes returns within 3–6 months. We have no control over the Finanzamt&apos;s
          processing time or outcome. We cannot guarantee a specific refund amount or timeline.
        </div>

        <h2 className={h2}>6. Intellectual property</h2>
        <div className={p}>
          All content on this platform — including text, design, software, and branding — is owned by Posrednik24 / SteuerBack.
          You may not reproduce, copy, or redistribute any part of the platform without prior written consent.
        </div>

        <h2 className={h2}>7. Limitation of liability</h2>
        <div className={p}>
          To the maximum extent permitted by law, SteuerBack shall not be liable for any indirect, incidental,
          or consequential damages arising from your use of the service, including delays by the Finanzamt,
          incorrect information you provide, or errors resulting from inaccurate documents submitted by you.
          Our total liability shall not exceed the fees you paid for the relevant service.
        </div>

        <h2 className={h2}>8. Termination</h2>
        <div className={p}>
          You may delete your account at any time via Settings. We reserve the right to suspend or terminate
          accounts that violate these terms, provide fraudulent information, or fail to pay fees owed under
          a deferred payment agreement.
        </div>

        <h2 className={h2}>9. Governing law</h2>
        <div className={p}>
          These Terms are governed by the laws of the Republic of North Macedonia, where Posrednik24 is registered.
          For matters involving German tax law, applicable German legislation applies.
        </div>

        <h2 className={h2}>10. Changes to these terms</h2>
        <div className={p}>
          We may update these Terms from time to time. We will notify registered users by email of material
          changes at least 14 days before they take effect. Continued use of the platform after changes
          constitutes acceptance of the updated Terms.
        </div>

        <h2 className={h2}>11. Contact</h2>
        <div className={p}>
          Questions about these Terms? Contact us at{' '}
          <a href="mailto:legal@steuerback.com" className="text-brand-red hover:underline font-semibold">
            legal@steuerback.com
          </a>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-4 text-sm">
          <Link href="/privacy" className="text-brand-red hover:underline font-semibold">Privacy Policy →</Link>
          <Link href="/faq" className="text-gray-400 hover:text-brand-navy font-semibold">FAQ →</Link>
        </div>
      </section>
    </div>
  )
}
