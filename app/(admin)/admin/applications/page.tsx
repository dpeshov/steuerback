import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { ApplicationStatus } from '@/types/database'
import { getTranslations } from 'next-intl/server'
import AdminApplicationsList from './AdminApplicationsList'

const ALL_STATUSES: ApplicationStatus[] = [
  'in_review', 'documents_pending', 'ready_for_payment', 'paid',
  'missing_documents', 'ready_for_submission', 'submitted', 'completed',
  'profile_incomplete', 'draft', 'rejected',
]

const STATUS_LABEL_MAP: Record<ApplicationStatus, string> = {
  draft: 'Draft', profile_incomplete: 'Profile Incomplete',
  documents_pending: 'Docs Pending', ready_for_payment: 'Ready to Pay',
  paid: 'Paid', in_review: 'In Review', missing_documents: 'Docs Missing',
  ready_for_submission: 'Ready to Submit', submitted: 'Submitted',
  completed: 'Completed', rejected: 'Rejected',
}

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  draft:                  'bg-gray-100 text-gray-600',
  profile_incomplete:     'bg-orange-100 text-orange-700',
  documents_pending:      'bg-yellow-100 text-yellow-700',
  ready_for_payment:      'bg-blue-100 text-blue-700',
  paid:                   'bg-purple-100 text-purple-700',
  in_review:              'bg-indigo-100 text-indigo-700',
  missing_documents:      'bg-red-100 text-red-700',
  ready_for_submission:   'bg-teal-100 text-teal-700',
  submitted:              'bg-cyan-100 text-cyan-700',
  completed:              'bg-green-100 text-green-700',
  rejected:               'bg-gray-200 text-gray-500',
}

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status: statusFilter } = await searchParams
  const supabase = createAdminClient()
  const t = await getTranslations('admin.applications')

  let query = supabase
    .from('applications')
    .select('id, tax_year, status, payment_status, created_at, applicant_name, users(email, id)')
    .order('created_at', { ascending: false })

  if (statusFilter && ALL_STATUSES.includes(statusFilter as ApplicationStatus)) {
    query = query.eq('status', statusFilter as ApplicationStatus)
  }

  const { data: applications } = await query

  // Count per status for filter tabs
  const { data: allApps } = await supabase
    .from('applications').select('status')
  const countMap: Partial<Record<ApplicationStatus, number>> = {}
  allApps?.forEach(a => {
    const s = a.status as ApplicationStatus
    countMap[s] = (countMap[s] ?? 0) + 1
  })

  const rows = (applications ?? []).map(app => ({
    ...app,
    users: app.users as { email: string; id: string } | null,
    status: app.status as ApplicationStatus,
  }))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">
            {statusFilter ? `${STATUS_LABEL_MAP[statusFilter as ApplicationStatus]} — applications` : t('title')}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{t('results', { count: rows.length })}</p>
        </div>
        {statusFilter && (
          <Link href="/admin/applications" className="text-sm text-brand-red hover:underline">
            {t('allStatuses')}
          </Link>
        )}
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <Link
          href="/admin/applications"
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            !statusFilter ? 'bg-brand-navy text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
          }`}
        >
          All ({allApps?.length ?? 0})
        </Link>
        {ALL_STATUSES.map(s => {
          const count = countMap[s] ?? 0
          if (count === 0) return null
          return (
            <Link
              key={s}
              href={`/admin/applications?status=${s}`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === s
                  ? 'bg-brand-navy text-white'
                  : `${STATUS_COLORS[s]} border border-transparent hover:border-current/20`
              }`}
            >
              {STATUS_LABEL_MAP[s]}
              <span className={`text-[10px] font-black px-1 py-0.5 rounded ${
                statusFilter === s ? 'bg-white/20' : 'bg-black/10'
              }`}>
                {count}
              </span>
            </Link>
          )
        })}
      </div>

      <AdminApplicationsList applications={rows} />
    </div>
  )
}
