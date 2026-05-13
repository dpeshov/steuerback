import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { STATUS_LABELS, formatDate } from '@/lib/utils'
import type { ApplicationStatus } from '@/types/database'
import StatusChanger from './StatusChanger'
import DocumentReviewer from './DocumentReviewer'

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createAdminClient()

  const { data: app } = await supabase
    .from('applications')
    .select('*, users(email, role, created_at)')
    .eq('id', id)
    .single()

  if (!app) notFound()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', app.user_id)
    .single()

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('application_id', id)
    .order('created_at', { ascending: false })

  const { data: logs } = await supabase
    .from('status_logs')
    .select('*')
    .eq('application_id', id)
    .order('created_at', { ascending: false })

  const user = app.users as { email: string; role: string; created_at: string } | null

  const profileRows = [
    ['Name', `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || '—'],
    ['Date of birth', profile?.date_of_birth ?? '—'],
    ['Nationality', profile?.nationality ?? '—'],
    ['Phone', profile?.phone ?? '—'],
    ['Country', profile?.country_of_residence ?? '—'],
    ['City', profile?.city ?? '—'],
    ['Employer', profile?.employer_name ?? '—'],
    ['Work period', profile?.work_start ? `${profile.work_start} → ${profile.work_end ?? 'present'}` : '—'],
    ['Gross income', profile?.gross_income_eur ? `€${Number(profile.gross_income_eur).toLocaleString()}` : '—'],
    ['IBAN', profile?.iban ?? '—'],
    ['Bank', profile?.bank_name ?? '—'],
    ['Tax ID', profile?.tax_id ?? '—'],
  ]

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/applications" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand-navy transition-colors mb-4">
          <ArrowLeft size={14} /> All applications
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-brand-navy break-all">{user?.email ?? '—'}</h1>
            <p className="text-gray-500 text-sm mt-1">Tax year {app.tax_year} · {id.slice(0, 8)}…</p>
          </div>
          <span className="bg-brand-surface text-brand-navy text-sm font-semibold px-3 py-1.5 rounded-xl shrink-0">
            {STATUS_LABELS[app.status as ApplicationStatus] ?? app.status}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Profile info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-brand-navy mb-4">Applicant details</h2>
          <dl className="space-y-2">
            {profileRows.map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm gap-4">
                <dt className="text-gray-400 shrink-0">{label}</dt>
                <dd className="text-brand-navy font-medium text-right">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Status changer */}
        <div className="space-y-4">
          <StatusChanger applicationId={id} currentStatus={app.status as ApplicationStatus} />

          {/* Status log */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-brand-navy mb-4">Status history</h2>
            {logs?.length ? (
              <div className="space-y-3">
                {logs.map(log => (
                  <div key={log.id} className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-brand-red shrink-0" />
                    <div className="flex-1">
                      <span className="text-brand-navy font-medium">{STATUS_LABELS[log.new_status as ApplicationStatus] ?? log.new_status}</span>
                      {log.old_status && <span className="text-gray-400"> ← {STATUS_LABELS[log.old_status as ApplicationStatus] ?? log.old_status}</span>}
                    </div>
                    <span className="text-gray-400 text-xs">{formatDate(log.created_at)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No status changes yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="font-semibold text-brand-navy mb-4">Documents ({documents?.length ?? 0})</h2>
        {documents?.length ? (
          <div className="space-y-3">
            {documents.map(doc => (
              <DocumentReviewer key={doc.id} doc={doc} />
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No documents uploaded yet</p>
        )}
      </div>
    </div>
  )
}
