import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy — SteuerBack',
  description: 'How SteuerBack collects, uses, and protects your personal data. GDPR compliant.',
}

const LAST_UPDATED = '1 May 2025'

export default function PrivacyPage() {
  const h2 = 'text-lg font-black text-brand-navy mt-10 mb-3'
  const p  = 'text-gray-500 text-sm leading-relaxed mb-3'
  const li = 'text-gray-500 text-sm leading-relaxed'

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-brand-navy pt-24 pb-14 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-bold text-brand-red uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Privacy Policy</h1>
          <p className="text-white/40 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-3xl mx-auto px-4 py-14 pb-20">

        <div className={p}>
          SteuerBack (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;), operated by Posrednik24, is committed to protecting your privacy.
          This Privacy Policy explains what personal data we collect, why we collect it, how we use it,
          and your rights under the General Data Protection Regulation (GDPR).
        </div>

        <h2 className={h2}>1. Data controller</h2>
        <div className={p}>
          The data controller responsible for your personal data is Posrednik24, operating the SteuerBack service
          at steuerback.com. Contact: <a href="mailto:privacy@steuerback.com" className="text-brand-red hover:underline">privacy@steuerback.com</a>
        </div>

        <h2 className={h2}>2. What data we collect</h2>
        <div className={p}>We collect the following categories of personal data:</div>
        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li className={li}><strong>Account data:</strong> email address, name, phone number, password (hashed).</li>
          <li className={li}><strong>Profile data:</strong> date of birth, nationality, address, tax ID (Steuer-ID), employer details, bank IBAN.</li>
          <li className={li}><strong>Documents:</strong> Lohnsteuerbescheinigung, passport / ID copy, Vollmacht (power of attorney).</li>
          <li className={li}><strong>Financial data:</strong> Stripe payment tokens, payment history. We do not store full card numbers — payment data is handled by Stripe.</li>
          <li className={li}><strong>Communication data:</strong> messages you send through our portal, email correspondence.</li>
          <li className={li}><strong>Usage data:</strong> page views, login timestamps, IP address (collected automatically).</li>
          <li className={li}><strong>Referral data:</strong> referral codes if you use or share a referral link.</li>
        </ul>

        <h2 className={h2}>3. Legal basis for processing</h2>
        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li className={li}><strong>Contract performance (Art. 6(1)(b) GDPR):</strong> we process your data to provide the tax filing service you contracted us for.</li>
          <li className={li}><strong>Legal obligation (Art. 6(1)(c) GDPR):</strong> we retain certain records as required by applicable law.</li>
          <li className={li}><strong>Legitimate interests (Art. 6(1)(f) GDPR):</strong> fraud prevention, security, improving our service.</li>
          <li className={li}><strong>Consent (Art. 6(1)(a) GDPR):</strong> for optional marketing communications. You may withdraw consent at any time.</li>
        </ul>

        <h2 className={h2}>4. How we use your data</h2>
        <ul className="list-disc pl-5 space-y-2 mb-4">
          {[
            'To prepare and submit your German income tax return (Einkommensteuererklärung).',
            'To communicate with the Finanzamt on your behalf using the Vollmacht you sign.',
            'To process payments via Stripe.',
            'To send you status updates and notifications about your application.',
            'To verify your identity and prevent fraud.',
            'To comply with tax record-keeping obligations.',
          ].map(item => (
            <li key={item} className={li}>{item}</li>
          ))}
        </ul>

        <h2 className={h2}>5. Data sharing</h2>
        <div className={p}>
          We share your data only where necessary:
        </div>
        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li className={li}><strong>Finanzamt (German Tax Authority):</strong> we submit your tax return data to the German tax authority as part of the service.</li>
          <li className={li}><strong>Stripe Inc.:</strong> payment processing. Stripe is PCI-DSS compliant. See <a href="https://stripe.com/privacy" className="text-brand-red hover:underline" target="_blank" rel="noopener">Stripe&apos;s Privacy Policy</a>.</li>
          <li className={li}><strong>Supabase:</strong> secure database and file storage infrastructure. Data is stored in EU-region servers.</li>
          <li className={li}><strong>Resend:</strong> transactional email delivery.</li>
        </ul>
        <div className={p}>
          We do <strong>not</strong> sell your data or share it with advertisers.
        </div>

        <h2 className={h2}>6. Data retention</h2>
        <div className={p}>
          We retain your personal data for as long as your account is active plus a maximum of 7 years,
          in compliance with German tax record-keeping requirements (§ 147 AO). After this period, your
          data is securely deleted. You may request early deletion (see Your Rights below) — note that
          data directly tied to a filed tax return may need to be retained for the statutory period.
        </div>

        <h2 className={h2}>7. Security</h2>
        <div className={p}>
          We apply industry-standard security measures:
        </div>
        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li className={li}>All data is encrypted in transit using TLS 1.2+.</li>
          <li className={li}>Documents are stored with access control — only authorised staff can view them.</li>
          <li className={li}>Passwords are hashed (never stored in plain text).</li>
          <li className={li}>Row-Level Security (RLS) ensures users can only access their own data.</li>
        </ul>

        <h2 className={h2}>8. Your rights (GDPR)</h2>
        <div className={p}>Under GDPR, you have the following rights:</div>
        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li className={li}><strong>Access:</strong> request a copy of all personal data we hold about you.</li>
          <li className={li}><strong>Rectification:</strong> correct inaccurate data.</li>
          <li className={li}><strong>Erasure:</strong> request deletion of your data (&quot;right to be forgotten&quot;), subject to legal retention requirements.</li>
          <li className={li}><strong>Portability:</strong> receive your data in a structured, machine-readable format.</li>
          <li className={li}><strong>Objection:</strong> object to processing based on legitimate interests.</li>
          <li className={li}><strong>Restriction:</strong> request that we restrict processing of your data.</li>
          <li className={li}><strong>Withdraw consent:</strong> withdraw marketing consent at any time via Settings &gt; Notifications.</li>
        </ul>
        <div className={p}>
          To exercise any right, email{' '}
          <a href="mailto:privacy@steuerback.com" className="text-brand-red hover:underline font-semibold">
            privacy@steuerback.com
          </a>.
          We will respond within 30 days. You also have the right to lodge a complaint with your national
          data protection authority.
        </div>

        <h2 className={h2}>9. Cookies</h2>
        <div className={p}>
          We use strictly necessary cookies for authentication (Supabase session cookies). We do not use
          advertising or tracking cookies. No cookie consent banner is required for strictly necessary cookies.
        </div>

        <h2 className={h2}>10. Changes to this policy</h2>
        <div className={p}>
          We may update this Privacy Policy from time to time. We will notify registered users by email
          of material changes. Continued use of the platform after changes constitutes acceptance.
        </div>

        <h2 className={h2}>11. Contact</h2>
        <div className={p}>
          For privacy inquiries:{' '}
          <a href="mailto:privacy@steuerback.com" className="text-brand-red hover:underline font-semibold">
            privacy@steuerback.com
          </a>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-4 text-sm">
          <Link href="/terms" className="text-brand-red hover:underline font-semibold">Terms of Service →</Link>
          <Link href="/faq" className="text-gray-400 hover:text-brand-navy font-semibold">FAQ →</Link>
        </div>
      </section>
    </div>
  )
}
