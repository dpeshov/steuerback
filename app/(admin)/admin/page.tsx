import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  FileText, Users, CheckCircle, Clock, Banknote,
  TrendingUp, AlertCircle, ChevronRight, ArrowUpRight, Activity,
} from 'lucide-react'

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  draft:                'bg-gray-100 text-gray-600',
  profile_incomplete:   'bg-orange-100 text-orange-700',
  documents_pending:    'bg-yellow-100 text-yellow-700',
  ready_for_payment:    'bg-blue-100 text-blue-700',
  paid:                 'bg-violet-100 text-violet-700',
  in_review:            'bg-indigo-100 text-indigo-700',
  missing_documents:    'bg-red-100 text-red-700',
  ready_for_submission: 'bg-teal-100 text-teal-700',
  submitted:            'bg-cyan-100 text-cyan-700',
  completed:            'bg-emerald-100 text-emerald-700',
  rejected:             'bg-gray-200 text-gray-500',
}

const STATUS_BAR_COLORS: Record<string, string> = {
  draft:                'bg-gray-300',
  profile_incomplete:   'bg-orange-400',
  documents_pending:    'bg-yellow-400',
  ready_for_payment:    'bg-blue-500',
  paid:                 'bg-violet-500',
  in_review:            'bg-indigo-500',
  missing_documents:    'bg-red-500',
  ready_for_submission: 'bg-teal-500',
  submitted:            'bg-cyan-500',
  completed:            'bg-emerald-500',
  rejected:             'bg-gray-400',
}

const STATUS_LABELS: Record<string, string> = {
  draft:                'Draft',
  profile_incomplete:   'Profile Incomplete',
  documents_pending:    'Docs Pending',
  ready_for_payment:    'Ready to Pay',
  paid:                 'Paid',
  in_review:            'In Review',
  missing_documents:    'Docs Missing',
  ready_for_submission: 'Ready to Submit',
  submitted:            'Submitted',
  completed:            'Completed',
  rejected:             'Rejected',
}

// ── Month helpers ─────────────────────────────────────────────────────────────
function getLastNMonths(n: number): { key: string; label: string }[] {
  const months: { key: string; label: string }[] = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      key:   `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleString('en', { month: 'short' }),
    })
  }
  return months
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins < 2)   return 'just now'
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export default async function AdminDashboard() {
  const supabase = createAdminClient()

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const [
    { count: totalApps },
    { count: totalUsers },
    { count: pendingDocs },
    { data: payments },
    { data: allApps },
    { data: recentActivity },
    { data: docsNeedingReview },
  ] = await Promise.all([
    supabase.from('applications').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('documents').select('*', { count: 'exact', head: true }).eq('review_status', 'pending'),
    supabase.from('payments').select('amount, status, created_at').eq('status', 'paid'),
    // All apps for status funnel + monthly chart
    supabase.from('applications').select('id, status, created_at, tax_year, applicant_name, users(email)')
      .order('created_at', { ascending: false }),
    // Recent status logs (activity feed)
    supabase
      .from('status_logs')
      .select('id, new_status, old_status, created_at, reason, applications(id, tax_year, applicant_name, users(email))')
      .order('created_at', { ascending: false })
      .limit(12),
    // Documents needing attention
    supabase
      .from('documents')
      .select('id, document_type, review_status, application_id, applications(id, applicant_name, tax_year, users(email))')
      .eq('review_status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  // ── Computed metrics ────────────────────────────────────────────────────────
  const totalRevenue   = payments?.reduce((s, p) => s + (p.amount ?? 0), 0) ?? 0
  const paidCount      = allApps?.filter(a => a.status !== 'draft' && a.status !== 'profile_incomplete').length ?? 0
  const completedCount = allApps?.filter(a => a.status === 'completed').length ?? 0
  const activeCount    = allApps?.filter(a =>
    ['documents_pending', 'ready_for_payment', 'paid', 'in_review', 'ready_for_submission', 'submitted']
      .includes(a.status)
  ).length ?? 0

  // Status funnel data
  const statusMap: Record<string, number> = {}
  for (const a of allApps ?? []) {
    statusMap[a.status] = (statusMap[a.status] ?? 0) + 1
  }
  const maxStatusCount = Math.max(1, ...Object.values(statusMap))

  // Monthly chart (last 6 months)
  const months6 = getLastNMonths(6)
  const monthlyMap: Record<string, number> = {}
  for (const a of allApps ?? []) {
    const key = a.created_at.slice(0, 7)
    monthlyMap[key] = (monthlyMap[key] ?? 0) + 1
  }
  const monthlyCounts = months6.map(m => ({ ...m, count: monthlyMap[m.key] ?? 0 }))
  const maxMonthly    = Math.max(1, ...monthlyCounts.map(m => m.count))

  // Conversion (draft → paid or beyond)
  const conversionRate = totalApps ? Math.round((paidCount / totalApps) * 100) : 0

  const stats = [
    {
      label:    'Total Applications',
      value:    totalApps ?? 0,
      icon:     FileText,
      color:    'text-brand-red',
      bg:       'bg-red-50',
      href:     '/admin/applications',
      trend:    null,
    },
    {
      label:    'Registered Users',
      value:    totalUsers ?? 0,
      icon:     Users,
      color:    'text-blue-500',
      bg:       'bg-blue-50',
      href:     '/admin/users',
      trend:    null,
    },
    {
      label:    'Total Revenue',
      value:    `€${totalRevenue.toLocaleString()}`,
      icon:     Banknote,
      color:    'text-emerald-600',
      bg:       'bg-emerald-50',
      href:     '/admin/applications?status=paid',
      trend:    null,
    },
    {
      label:    'Active Cases',
      value:    activeCount,
      icon:     Activity,
      color:    'text-violet-600',
      bg:       'bg-violet-50',
      href:     '/admin/applications',
      trend:    null,
    },
    {
      label:    'Completed',
      value:    completedCount,
      icon:     CheckCircle,
      color:    'text-teal-600',
      bg:       'bg-teal-50',
      href:     '/admin/applications?status=completed',
      trend:    null,
    },
    {
      label:    'Docs Pending Review',
      value:    pendingDocs ?? 0,
      icon:     AlertCircle,
      color:    (pendingDocs ?? 0) > 0 ? 'text-amber-600' : 'text-gray-400',
      bg:       (pendingDocs ?? 0) > 0 ? 'bg-amber-50'   : 'bg-gray-50',
      href:     '/admin/applications',
      trend:    null,
    },
    {
      label:    'Conversion Rate',
      value:    `${conversionRate}%`,
      icon:     TrendingUp,
      color:    'text-indigo-600',
      bg:       'bg-indigo-50',
      href:     '/admin/applications',
      trend:    null,
    },
    {
      label:    'In Review',
      value:    statusMap['in_review'] ?? 0,
      icon:     Clock,
      color:    'text-yellow-600',
      bg:       'bg-yellow-50',
      href:     '/admin/applications?status=in_review',
      trend:    null,
    },
  ]

  const DOC_TYPE_LABELS: Record<string, string> = {
    passport:                'Passport / ID',
    lohnsteuerbescheinigung: 'Lohnsteuerbescheinigung',
    bank_statement:          'Bank Statement',
    power_of_attorney:       'Vollmacht',
    residence_permit:        'Residence Permit',
    other:                   'Other',
  }

  return (
    <div className="space-y-6">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">Admin Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Overview of SteuerBack operations</p>
      </div>

      {/* ── Stat grid ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(({ label, value, icon: Icon, color, bg, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all group"
          >
            <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={16} className={color} />
            </div>
            <p className="text-2xl font-black text-brand-navy leading-none">{value}</p>
            <p className="text-xs font-semibold text-gray-400 mt-1.5 leading-snug">{label}</p>
            <ArrowUpRight size={12} className="text-gray-200 group-hover:text-brand-red mt-1 transition-colors" />
          </Link>
        ))}
      </div>

      {/* ── Charts row ────────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-5">

        {/* Monthly applications bar chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-brand-navy text-sm">Applications per month</h2>
              <p className="text-xs text-gray-400 mt-0.5">Last 6 months</p>
            </div>
            <TrendingUp size={16} className="text-brand-red" />
          </div>
          <div className="flex items-end gap-2 h-32">
            {monthlyCounts.map(({ label, count }) => {
              const heightPct = Math.round((count / maxMonthly) * 100)
              return (
                <div key={label} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-bold text-gray-500">{count > 0 ? count : ''}</span>
                  <div className="w-full rounded-t-lg bg-brand-red/10 relative overflow-hidden" style={{ height: '96px' }}>
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-brand-red rounded-t-lg transition-all duration-700"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-400">{label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Status funnel */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-brand-navy text-sm">Applications by status</h2>
              <p className="text-xs text-gray-400 mt-0.5">Current distribution</p>
            </div>
            <Link href="/admin/applications" className="text-xs font-semibold text-brand-red hover:underline">
              View all →
            </Link>
          </div>
          <div className="space-y-2">
            {Object.entries(statusMap)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 8)
              .map(([status, count]) => {
                const barPct = Math.round((count / maxStatusCount) * 100)
                return (
                  <Link
                    key={status}
                    href={`/admin/applications?status=${status}`}
                    className="flex items-center gap-3 group"
                  >
                    <div className="w-28 shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABELS[status] ?? status}
                      </span>
                    </div>
                    <div className="flex-1 h-5 bg-gray-50 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${STATUS_BAR_COLORS[status] ?? 'bg-gray-300'}`}
                        style={{ width: `${Math.max(barPct, 4)}%` }}
                      />
                    </div>
                    <span className="w-7 text-right text-xs font-black text-brand-navy">{count}</span>
                  </Link>
                )
              })}
            {Object.keys(statusMap).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No applications yet</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom row: Pending docs + Activity feed ──────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-5">

        {/* Pending document reviews */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-brand-navy text-sm">Pending document reviews</h2>
              {(pendingDocs ?? 0) > 0 && (
                <span className="text-[10px] font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                  {pendingDocs}
                </span>
              )}
            </div>
            <Link href="/admin/applications" className="text-xs font-semibold text-brand-red hover:underline">
              View all →
            </Link>
          </div>

          {docsNeedingReview && docsNeedingReview.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {docsNeedingReview.map(doc => {
                const app = Array.isArray(doc.applications) ? doc.applications[0] : doc.applications
                const appData = app as { id: string; tax_year: number; applicant_name: string | null; users: { email: string } | null } | null
                const name = appData?.applicant_name ?? (appData?.users as { email: string } | null)?.email ?? '—'
                return (
                  <Link
                    key={doc.id}
                    href={`/admin/applications/${doc.application_id}`}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                      <FileText size={14} className="text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-brand-navy truncate">{name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {DOC_TYPE_LABELS[doc.document_type] ?? doc.document_type}
                        {appData?.tax_year ? ` · ${appData.tax_year}` : ''}
                      </p>
                    </div>
                    <ChevronRight size={14} className="text-gray-300 shrink-0" />
                  </Link>
                )
              })}
              {(pendingDocs ?? 0) > 5 && (
                <Link href="/admin/applications" className="flex items-center justify-center px-5 py-3 text-xs font-semibold text-brand-red hover:text-red-500 transition-colors">
                  +{(pendingDocs ?? 0) - 5} more pending →
                </Link>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-center px-4">
              <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center">
                <CheckCircle size={18} className="text-emerald-500" />
              </div>
              <p className="text-sm font-bold text-gray-500">All caught up!</p>
              <p className="text-xs text-gray-400">No documents pending review.</p>
            </div>
          )}
        </div>

        {/* Recent activity feed */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="font-bold text-brand-navy text-sm">Recent activity</h2>
            <Activity size={14} className="text-gray-400" />
          </div>

          {recentActivity && recentActivity.length > 0 ? (
            <div className="divide-y divide-gray-50 max-h-[340px] overflow-y-auto">
              {recentActivity.map(log => {
                const appRaw = Array.isArray(log.applications) ? log.applications[0] : log.applications
                const app = appRaw as {
                  id: string
                  tax_year: number
                  applicant_name: string | null
                  users: { email: string } | null
                } | null
                const name = app?.applicant_name ?? (app?.users as { email: string } | null)?.email ?? '—'
                const newS  = log.new_status as string
                const oldS  = log.old_status as string | null

                return (
                  <Link
                    key={log.id}
                    href={app ? `/admin/applications/${app.id}` : '/admin/applications'}
                    className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors"
                  >
                    {/* Status dot */}
                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                      STATUS_BAR_COLORS[newS] ?? 'bg-gray-300'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-brand-navy leading-snug truncate">{name}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
                        {oldS ? (
                          <><span className="line-through">{STATUS_LABELS[oldS] ?? oldS}</span> → <strong className="text-gray-600">{STATUS_LABELS[newS] ?? newS}</strong></>
                        ) : (
                          <strong className="text-gray-600">{STATUS_LABELS[newS] ?? newS}</strong>
                        )}
                        {app?.tax_year ? ` · ${app.tax_year}` : ''}
                      </p>
                    </div>
                    <span className="text-[10px] text-gray-300 shrink-0 mt-0.5">{relativeTime(log.created_at)}</span>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-center px-4">
              <div className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center">
                <Activity size={18} className="text-gray-300" />
              </div>
              <p className="text-sm font-bold text-gray-400">No activity yet</p>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
