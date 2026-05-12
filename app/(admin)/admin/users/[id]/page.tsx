import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { ApplicationStatus } from '@/types/database'

const STATUS_BADGE: Record<string, string> = {
  completed:           'bg-green-100 text-green-700',
  submitted:           'bg-cyan-100 text-cyan-700',
  in_review:           'bg-indigo-100 text-indigo-700',
  ready_for_submission:'bg-teal-100 text-teal-700',
  ready_for_payment:   'bg-blue-100 text-blue-700',
  paid:                'bg-purple-100 text-purple-700',
  missing_documents:   'bg-red-100 text-red-700',
  documents_pending:   'bg-yellow-100 text-yellow-700',
  profile_incomplete:  'bg-orange-100 text-orange-700',
  draft:               'bg-gray-100 text-gray-500',
  rejected:            'bg-gray-200 text-gray-500',
}

const STATUS_LABELS: Record<string, string> = {
  completed:           'Completed',
  submitted:           'Submitted',
  in_review:           'In review',
  ready_for_submission:'Ready to submit',
  ready_for_payment:   'Awaiting payment',
  paid:                'Paid',
  missing_documents:   'Docs missing',
  documents_pending:   'Docs pending',
  profile_incomplete:  'Profile incomplete',
  draft:               'Draft',
  rejected:            'Rejected',
}

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createAdminClient()

  const { data: user } = await supabase
    .from('users')
    .select('id, email, role, created_at, is_active')
    .eq('id', id)
    .single()

  if (!user) notFound()

  const [{ data: profile }, { data: applications }] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', id).single(),
    supabase.from('applications').select('id, tax_year, status, payment_status, created_at, submitted_at, completed_at').eq('user_id', id).order('tax_year', { ascending: false }),
  ])

  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ')

  const profileRows = [
    ['Full name',   fullName || '—'],
    ['Email',       user.email],
    ['Date of birth', profile?.date_of_birth ?? '—'],
    ['Nationality', profile?.nationality ?? '—'],
    ['Phone',       profile?.phone ?? '—'],
    ['Country',     profile?.country_of_residence ?? '—'],
    ['City',        profile?.city ?? '—'],
    ['Address',     profile?.address ?? '—'],
  ]

  const workRows = [
    ['Employer',    profile?.employer_name ?? '—'],
    ['Work period', profile?.work_start ? `${profile.work_start} → ${profile.work_end ?? 'present'}` : '—'],
    ['Gross income',profile?.gross_income_eur ? `€${Number(profile.gross_income_eur).toLocaleString()}` : '—'],
    ['Tax ID',      profile?.tax_id ?? '—'],
    ['Student',     profile?.student_status ? `Yes — ${profile.university ?? ''}` : 'No'],
  ]

  const bankRows = [
    ['Account holder', profile?.bank_account_holder ?? '—'],
    ['IBAN',        profile?.iban ?? '—'],
    ['BIC/SWIFT',   profile?.swift_bic ?? '—'],
    ['Bank',        profile?.bank_name ?? '—'],
    ['Bank country',profile?.bank_country ?? '—'],
  ]

  const docRows = [
    ['Document type', profile?.document_type ?? '—'],
    ['Number',      profile?.passport_number ?? '—'],
    ['Issued by',   profile?.issuing_country ?? '—'],
    ['Expiry',      profile?.document_expiry ?? '—'],
  ]

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div>
        <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand-navy mb-4 transition-colors">
          <ArrowLeft size={14} />
          All users
        </Link>
        <div className="flex items-start gap-4 justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-navy/8 flex items-center justify-center text-xl font-black text-brand-navy uppercase">
              {(profile?.first_name?.[0] ?? user.email[0]).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-brand-navy">{fullName || user.email}</h1>
              <p className="text-gray-400 text-sm mt-0.5">{user.email} · Joined {formatDate(user.created_at)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wide ${user.role === 'admin' ? 'bg-brand-red/10 text-brand-red' : 'bg-gray-100 text-gray-500'}`}>
              {user.role}
            </span>
            <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
              {user.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Personal info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-brand-navy mb-4 text-sm uppercase tracking-wide text-gray-400">Personal</h2>
          <dl className="space-y-2.5">
            {profileRows.map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm gap-4">
                <dt className="text-gray-400 shrink-0">{label}</dt>
                <dd className="text-brand-navy font-medium text-right break-all">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Work info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-brand-navy mb-4 text-sm uppercase tracking-wide text-gray-400">Employment</h2>
          <dl className="space-y-2.5">
            {workRows.map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm gap-4">
                <dt className="text-gray-400 shrink-0">{label}</dt>
                <dd className="text-brand-navy font-medium text-right">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Bank info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-brand-navy mb-4 text-sm uppercase tracking-wide text-gray-400">Bank details</h2>
          <dl className="space-y-2.5">
            {bankRows.map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm gap-4">
                <dt className="text-gray-400 shrink-0">{label}</dt>
                <dd className="text-brand-navy font-medium text-right break-all">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Document info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-brand-navy mb-4 text-sm uppercase tracking-wide text-gray-400">Identity document</h2>
          <dl className="space-y-2.5">
            {docRows.map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm gap-4">
                <dt className="text-gray-400 shrink-0">{label}</dt>
                <dd className="text-brand-navy font-medium text-right">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Profile complete</span>
              <span className={`font-semibold ${profile?.profile_complete ? 'text-brand-success' : 'text-orange-500'}`}>
                {profile?.profile_complete ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Applications */}
      <div className="bg-white rounded-2xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-brand-navy">Applications ({applications?.length ?? 0})</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {applications?.map(app => (
            <Link
              key={app.id}
              href={`/admin/applications/${app.id}`}
              className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div>
                <p className="font-semibold text-brand-navy text-sm">Tax year {app.tax_year}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Created {formatDate(app.created_at)}
                  {app.submitted_at && ` · Submitted ${formatDate(app.submitted_at)}`}
                  {app.completed_at && ` · Completed ${formatDate(app.completed_at)}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE[app.status as ApplicationStatus] ?? 'bg-gray-100 text-gray-500'}`}>
                    {STATUS_LABELS[app.status] ?? app.status}
                  </span>
                  <span className={`text-[11px] font-semibold ${app.payment_status === 'paid' ? 'text-green-600' : 'text-gray-400'}`}>
                    {app.payment_status}
                  </span>
                </div>
                <ChevronRight size={16} className="text-gray-300" />
              </div>
            </Link>
          ))}
          {!applications?.length && (
            <p className="px-6 py-8 text-center text-gray-400 text-sm">No applications yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
