import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatDate, STATUS_LABELS } from '@/lib/utils'
import type { ApplicationStatus } from '@/types/database'
import PrintButton from './PrintButton'

const DOC_LABELS: Record<string, string> = {
  passport:           'Passport / ID Card',
  lohnsteuer:         'Salary Certificate (Lohnsteuerbescheinigung)',
  payslip:            'Pay Slips (Lohnabrechnung)',
  student_proof:      'Student Enrollment Certificate',
  home_tax_statement: 'Home Country Tax Statement',
  power_of_attorney:  'Power of Attorney (Vollmacht)',
  bank_proof:         'Bank Account Details (IBAN)',
  work_contract:      'Work Contract',
}

const STATUS_BADGE: Record<ApplicationStatus, string> = {
  draft:                  '#9CA3AF',
  profile_incomplete:     '#F97316',
  documents_pending:      '#EAB308',
  ready_for_payment:      '#3B82F6',
  paid:                   '#8B5CF6',
  in_review:              '#6366F1',
  missing_documents:      '#EF4444',
  ready_for_submission:   '#14B8A6',
  submitted:              '#06B6D4',
  completed:              '#10B981',
  rejected:               '#6B7280',
}

export default async function PrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: app } = await supabase
    .from('applications')
    .select('*, users(id, email, role, created_at)')
    .eq('id', id).single()

  if (!app) notFound()

  const [
    { data: profile },
    { data: documents },
    { data: logs },
    { data: payments },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', app.user_id).single(),
    supabase.from('documents').select('*').eq('application_id', id).order('document_type'),
    supabase.from('status_logs').select('*').eq('application_id', id).order('created_at', { ascending: true }),
    supabase.from('payments').select('*').eq('application_id', id).order('created_at', { ascending: false }),
  ])

  const userEmail    = (app.users as { email: string } | null)?.email ?? '—'
  const status       = app.status as ApplicationStatus
  const appId        = `TR-${app.tax_year}-${app.id.slice(0, 6).toUpperCase()}`
  const statusColor  = STATUS_BADGE[status] ?? '#9CA3AF'
  const latestPayment = payments?.[0] ?? null
  const paid         = latestPayment?.status === 'paid'
  const generatedAt  = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  const REQUIRED_TYPES = ['passport', 'lohnsteuer', 'payslip', 'bank_proof', 'power_of_attorney']
  const docMap = Object.fromEntries((documents ?? []).map(d => [d.document_type, d]))

  return (
    <>
      {/* Print action bar — hidden when printing */}
      <div className="print:hidden sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <a href={`/admin/applications/${id}`} className="text-sm text-gray-400 hover:text-brand-navy font-semibold flex items-center gap-1.5">
            ← Back to application
          </a>
          <span className="text-gray-200">|</span>
          <span className="text-sm font-bold text-brand-navy">{appId} — {app.tax_year} Report</span>
        </div>
        <PrintButton />
      </div>

      {/* ── PRINT DOCUMENT ───────────────────────────────────────────── */}
      <div className="max-w-[800px] mx-auto p-8 print:p-0 print:max-w-none font-sans">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-gray-900">
          <div>
            <div className="text-2xl font-black text-gray-900 tracking-tight mb-1">
              Steuer<span style={{ color: '#E63946' }}>Back</span>
            </div>
            <div className="text-xs text-gray-400 font-medium">German Tax Refund — Application Report</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400 mb-1">Generated</div>
            <div className="text-sm font-semibold text-gray-700">{generatedAt}</div>
            <div className="text-xs text-gray-400 mt-1">ID: {appId}</div>
          </div>
        </div>

        {/* Status banner */}
        <div className="flex items-center justify-between mb-8 px-5 py-4 rounded-xl" style={{ backgroundColor: `${statusColor}15`, border: `1.5px solid ${statusColor}40` }}>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: statusColor }}>Application Status</div>
            <div className="text-xl font-black text-gray-900">{STATUS_LABELS[status]}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Tax Year</div>
            <div className="text-3xl font-black text-gray-900">{app.tax_year}</div>
          </div>
        </div>

        {/* Two columns: Applicant + Application */}
        <div className="grid grid-cols-2 gap-6 mb-8">

          {/* Applicant */}
          <Section title="Applicant">
            <Row label="Full name"    value={[profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || app.applicant_name || '—'} />
            <Row label="Date of birth" value={profile?.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString('en-GB') : '—'} />
            <Row label="Nationality"  value={profile?.nationality ?? '—'} />
            <Row label="Email"        value={userEmail} />
            <Row label="Phone"        value={profile?.phone ?? '—'} />
          </Section>

          {/* Address */}
          <Section title="Address & Documents">
            <Row label="Country"      value={profile?.country_of_residence ?? '—'} />
            <Row label="City"         value={profile?.city ?? '—'} />
            <Row label="Address"      value={profile?.address ?? '—'} />
            <Row label="Passport/ID"  value={profile?.passport_number ?? '—'} />
            <Row label="Tax ID"       value={profile?.tax_id ?? '—'} />
          </Section>
        </div>

        {/* Employment */}
        <Section title="Employment in Germany" className="mb-8">
          <div className="grid grid-cols-2 gap-x-8">
            <Row label="Employer"       value={profile?.employer_name ?? '—'} />
            <Row label="Gross income"   value={profile?.gross_income_eur ? `€${Number(profile.gross_income_eur).toLocaleString('de-DE')}` : '—'} />
            <Row label="Work period"    value={
              profile?.work_start && profile?.work_end
                ? `${new Date(profile.work_start).toLocaleDateString('en-GB')} – ${new Date(profile.work_end).toLocaleDateString('en-GB')}`
                : '—'
            } />
            <Row label="Student"        value={profile?.student_status ? `Yes — ${profile.university ?? ''}` : 'No'} />
          </div>
        </Section>

        {/* Banking */}
        <Section title="Banking Details" className="mb-8">
          <div className="grid grid-cols-2 gap-x-8">
            <Row label="Account holder" value={profile?.bank_account_holder ?? '—'} />
            <Row label="Bank name"      value={profile?.bank_name ?? '—'} />
            <Row label="IBAN"           value={profile?.iban ?? '—'} mono />
            <Row label="BIC / SWIFT"    value={profile?.swift_bic ?? '—'} mono />
          </div>
        </Section>

        {/* Payment */}
        <Section title="Payment" className="mb-8">
          <div className="flex items-center gap-4 flex-wrap">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm ${paid ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {paid ? '✓ PAID' : '✗ UNPAID'}
            </div>
            {latestPayment && paid && (
              <>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">Amount:</span> €{(latestPayment.amount / 100).toFixed(2)} {latestPayment.currency?.toUpperCase()}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">Date:</span> {formatDate(latestPayment.paid_at)}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">Method:</span> {latestPayment.stripe_payment_intent_id?.startsWith('MANUAL:') ? latestPayment.stripe_payment_intent_id.replace('MANUAL:', '') : 'Stripe'}
                </div>
              </>
            )}
            {app.refund_amount && (
              <div className="ml-auto text-right">
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Estimated Refund</div>
                <div className="text-2xl font-black text-green-600">€{Number(app.refund_amount).toLocaleString('de-DE', { minimumFractionDigits: 2 })}</div>
              </div>
            )}
          </div>
        </Section>

        {/* Documents Checklist */}
        <Section title="Documents Checklist" className="mb-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200">
                <th className="pb-2 font-bold text-gray-500 text-xs uppercase tracking-wider">Document</th>
                <th className="pb-2 font-bold text-gray-500 text-xs uppercase tracking-wider">Required</th>
                <th className="pb-2 font-bold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                <th className="pb-2 font-bold text-gray-500 text-xs uppercase tracking-wider">File</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Object.entries(DOC_LABELS).map(([type, label]) => {
                const doc     = docMap[type]
                const req     = REQUIRED_TYPES.includes(type)
                const st      = doc?.review_status
                const color   = st === 'approved' ? '#10B981' : st === 'rejected' ? '#EF4444' : st === 'needs_reupload' ? '#F97316' : st === 'pending' ? '#EAB308' : '#9CA3AF'
                const stLabel = st === 'approved' ? 'Approved' : st === 'rejected' ? 'Rejected' : st === 'needs_reupload' ? 'Needs Reupload' : st === 'pending' ? 'Under Review' : 'Missing'

                return (
                  <tr key={type} className="py-2">
                    <td className="py-2 font-medium text-gray-800">{label}</td>
                    <td className="py-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${req ? 'bg-gray-100 text-gray-600' : 'bg-gray-50 text-gray-400'}`}>
                        {req ? 'Required' : 'Optional'}
                      </span>
                    </td>
                    <td className="py-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${color}20`, color }}>
                        {stLabel}
                      </span>
                    </td>
                    <td className="py-2 text-xs text-gray-400 truncate max-w-[140px]">
                      {doc?.file_name ?? '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Section>

        {/* Status Timeline */}
        {logs && logs.length > 0 && (
          <Section title="Status Timeline" className="mb-8">
            <div className="space-y-2">
              {logs.map((log, i) => (
                <div key={log.id} className="flex items-start gap-3 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 shrink-0" />
                  <div className="flex-1">
                    <span className="font-semibold text-gray-800">{STATUS_LABELS[log.new_status as ApplicationStatus] ?? log.new_status}</span>
                    {log.reason && <span className="text-gray-500"> — {log.reason}</span>}
                    <span className="text-gray-400 text-xs ml-2">{formatDate(log.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between text-xs text-gray-400">
          <div>SteuerBack · German Tax Refunds · steuerback.com</div>
          <div>Confidential — Internal Use Only</div>
          <div className="print:block hidden">Page 1 of 1</div>
        </div>
      </div>
    </>
  )
}

// ── Helper components ──────────────────────────────────────────────────────────

function Section({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 pb-1 border-b border-gray-200">
        {title}
      </div>
      {children}
    </div>
  )
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline gap-2 py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400 w-32 shrink-0">{label}</span>
      <span className={`text-sm font-semibold text-gray-800 flex-1 ${mono ? 'font-mono text-xs' : ''}`}>
        {value || '—'}
      </span>
    </div>
  )
}
