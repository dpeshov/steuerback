import type { Resend } from 'resend'
import type { ApplicationStatus, DocumentReviewStatus } from '@/types/database'

const FROM = 'SteuerBack <no-reply@steuerback.com>'
function getResend() {
  if (!process.env.RESEND_API_KEY) return null
  const { Resend: R } = require('resend')
  return new R(process.env.RESEND_API_KEY) as InstanceType<typeof Resend>
}

// ─── Templates ───────────────────────────────────────────────────────────────

function base(title: string, body: string) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#F8F9FA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F9FA;padding:40px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:540px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06)">
        <tr><td style="background:#1A1A2E;padding:24px 32px">
          <span style="font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.5px">
            Steuer<span style="color:#E63946">Back</span>
          </span>
        </td></tr>
        <tr><td style="padding:32px">${body}</td></tr>
        <tr><td style="padding:16px 32px 24px;border-top:1px solid #F0F0F0">
          <p style="margin:0;font-size:12px;color:#aaa;line-height:1.5">
            SteuerBack · German tax refunds for international workers<br>
            Questions? Reply to this email or contact support.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

function btn(text: string, href: string) {
  return `<a href="${href}" style="display:inline-block;background:#E63946;color:#fff;font-weight:700;font-size:14px;padding:12px 24px;border-radius:10px;text-decoration:none;margin-top:20px">${text}</a>`
}

function h1(text: string) {
  return `<h1 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#1A1A2E;letter-spacing:-0.3px">${text}</h1>`
}

function p(text: string) {
  return `<p style="margin:8px 0;font-size:15px;color:#555;line-height:1.6">${text}</p>`
}

function badge(text: string, color = '#E63946') {
  return `<span style="display:inline-block;background:${color}15;color:${color};font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;letter-spacing:0.5px;text-transform:uppercase">${text}</span>`
}

// ─── Email builders ───────────────────────────────────────────────────────────

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://steuerback.com'

export function welcomeEmail(email: string) {
  return {
    from: FROM,
    to: email,
    subject: 'Welcome to SteuerBack — let\'s get your refund',
    html: base('Welcome to SteuerBack', `
      ${h1('Welcome to SteuerBack!')}
      ${p('Your account is confirmed. You\'re one step closer to getting your German tax refund.')}
      ${p('Most international workers get <strong style="color:#1A1A2E">€300–€2,000 back</strong>. The process takes about 10 minutes.')}
      ${btn('Start your application', `${APP_URL}/application`)}
    `),
  }
}

const STATUS_EMAILS: Partial<Record<ApplicationStatus, (taxYear: number) => { subject: string; title: string; body: string; cta?: { text: string; href: string } }>> = {
  ready_for_payment: (taxYear) => ({
    subject: `Action required: Choose your payment option — ${taxYear}`,
    title: 'Your documents are approved',
    body: `We've reviewed all your documents for your <strong>${taxYear}</strong> tax return and everything looks good. Choose your payment option to move forward.`,
    cta: { text: 'Choose payment option', href: `${APP_URL}/pay` },
  }),
  paid: (taxYear) => ({
    subject: `Payment confirmed — ${taxYear} refund in progress`,
    title: 'Payment confirmed!',
    body: `We've received your payment for the <strong>${taxYear}</strong> tax return. Our team has started processing your refund. We'll keep you updated at every step.`,
  }),
  in_review: (taxYear) => ({
    subject: `Your ${taxYear} application is under review`,
    title: 'Application under review',
    body: `Our team is currently reviewing your <strong>${taxYear}</strong> tax return application. No action needed from your side. We'll update you once the review is complete.`,
    cta: { text: 'View status', href: `${APP_URL}/status` },
  }),
  missing_documents: (taxYear) => ({
    subject: `Action required: Missing documents — ${taxYear}`,
    title: 'Additional documents needed',
    body: `We need some additional documents for your <strong>${taxYear}</strong> application. Please log in to see exactly which documents are required and upload them as soon as possible.`,
    cta: { text: 'Upload documents', href: `${APP_URL}/documents` },
  }),
  ready_for_submission: (taxYear) => ({
    subject: `Your ${taxYear} return is ready to submit`,
    title: 'Ready for submission!',
    body: `Great news — your <strong>${taxYear}</strong> tax return is complete and ready to be submitted to the German Finanzamt. We'll submit it on your behalf within the next 24 hours.`,
    cta: { text: 'View status', href: `${APP_URL}/status` },
  }),
  submitted: (taxYear) => ({
    subject: `Submitted to Finanzamt — ${taxYear}`,
    title: 'Submitted to Finanzamt!',
    body: `Your <strong>${taxYear}</strong> tax return has been officially submitted to the German tax office (Finanzamt). Processing typically takes <strong>3–6 months</strong>. We'll notify you when the refund arrives.`,
    cta: { text: 'Track your application', href: `${APP_URL}/status` },
  }),
  completed: (taxYear) => ({
    subject: `Your ${taxYear} refund is on its way! 🎉`,
    title: 'Refund processed!',
    body: `Excellent news! Your <strong>${taxYear}</strong> German tax refund has been processed and is on its way to your bank account. Thank you for trusting SteuerBack.`,
    cta: { text: 'View your application', href: `${APP_URL}/status` },
  }),
  rejected: () => ({
    subject: 'Update on your application',
    title: 'Application update',
    body: 'We regret to inform you that we were unable to process your tax refund application. Please contact our support team for more information and next steps.',
    cta: { text: 'Contact support', href: `${APP_URL}/dashboard` },
  }),
}

export function statusChangeEmail(email: string, status: ApplicationStatus, taxYear: number) {
  const builder = STATUS_EMAILS[status]
  if (!builder) return null

  const { subject, title, body, cta } = builder(taxYear)

  return {
    from: FROM,
    to: email,
    subject,
    html: base(subject, `
      ${badge(status.replace(/_/g, ' '))}
      <br><br>
      ${h1(title)}
      ${p(body)}
      ${cta ? btn(cta.text, cta.href) : ''}
    `),
  }
}

export function documentNeedsReuploadEmail(email: string, docLabel: string, adminNote: string | null) {
  const subject = `Action required: Re-upload ${docLabel}`
  return {
    from: FROM,
    to: email,
    subject,
    html: base(subject, `
      ${badge('Document update', '#F4A261')}
      <br><br>
      ${h1(`Please re-upload: ${docLabel}`)}
      ${p('Our team reviewed your document and it needs to be re-uploaded.')}
      ${adminNote ? `<div style="background:#FFF7ED;border-left:3px solid #F4A261;padding:12px 16px;border-radius:4px;margin:12px 0">
        <p style="margin:0;font-size:13px;color:#92400E"><strong>Note from our team:</strong> ${adminNote}</p>
      </div>` : ''}
      ${btn('Upload document', `${APP_URL}/documents`)}
    `),
  }
}

export function documentDeclinedEmail(
  email: string,
  docLabel: string,
  status: DocumentReviewStatus,
  adminNote: string | null,
) {
  const isRejected = status === 'rejected'
  const accentColor = isRejected ? '#E63946' : '#F4A261'
  const badgeText   = isRejected ? 'Document Rejected' : 'Reupload Required'
  const subject     = isRejected
    ? `Your ${docLabel} has been rejected`
    : `Action required: Re-upload your ${docLabel}`
  const title       = isRejected
    ? `${docLabel} — rejected`
    : `Please re-upload: ${docLabel}`
  const intro       = isRejected
    ? 'Unfortunately, our team was unable to accept the document you uploaded. Please see the reason below and contact support if you have questions.'
    : 'Our team reviewed your document and it needs to be re-uploaded. Please see the reason below and upload a corrected version as soon as possible.'
  const ctaText     = isRejected ? 'View Documents' : 'Upload document'

  return {
    from: FROM,
    to: email,
    subject,
    html: base(subject, `
      ${badge(badgeText, accentColor)}
      <br><br>
      ${h1(title)}
      ${p(intro)}
      ${adminNote ? `
        <div style="background:${accentColor}08;border-left:3px solid ${accentColor};padding:14px 16px;border-radius:6px;margin:16px 0">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:${accentColor};text-transform:uppercase;letter-spacing:0.5px">Reason from our team</p>
          <p style="margin:0;font-size:14px;color:#333;line-height:1.6">${adminNote}</p>
        </div>` : ''}
      ${btn(ctaText, `${APP_URL}/documents`)}
      ${p('<span style="font-size:13px;color:#888">Questions? Simply reply to this email and our team will get back to you.</span>')}
    `),
  }
}

export function newMessageEmail(email: string, preview: string, taxYear: number) {
  const subject = `New message about your ${taxYear} tax return`
  const short   = preview.length > 120 ? preview.slice(0, 120) + '…' : preview
  return {
    from: FROM,
    to: email,
    subject,
    html: base(subject, `
      ${badge('New message', '#1A1A2E')}
      <br><br>
      ${h1('Your advisor sent you a message')}
      ${p(`You have a new message regarding your <strong>${taxYear}</strong> German tax return:`)}
      <div style="background:#F8F9FA;border-left:3px solid #1A1A2E;padding:14px 16px;border-radius:6px;margin:16px 0">
        <p style="margin:0;font-size:14px;color:#333;line-height:1.6;font-style:italic">${short}</p>
      </div>
      ${btn('View message', `${APP_URL}/messages`)}
    `),
  }
}

// ─── Sender ───────────────────────────────────────────────────────────────────

export async function sendEmail(payload: { from: string; to: string; subject: string; html: string } | null) {
  if (!payload) return
  const resend = getResend()
  if (!resend) return
  try {
    await resend.emails.send(payload)
  } catch (e) {
    console.error('[email] send failed:', e)
  }
}
