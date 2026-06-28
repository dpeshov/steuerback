'use client'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ChevronRight, CheckSquare, Square, Download,
  RefreshCw, ChevronDown, X, Loader2,
} from 'lucide-react'
import { bulkUpdateStatus } from '@/app/actions/bulkUpdateStatus'
import type { ApplicationStatus } from '@/types/database'

type AppRow = {
  id: string
  tax_year: number
  status: ApplicationStatus
  payment_status: string
  created_at: string
  applicant_name: string | null
  users: { email: string; id: string } | null
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

const ALL_STATUSES: ApplicationStatus[] = [
  'draft', 'profile_incomplete', 'documents_pending', 'ready_for_payment',
  'paid', 'in_review', 'missing_documents', 'ready_for_submission',
  'submitted', 'completed', 'rejected',
]

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  draft: 'Draft', profile_incomplete: 'Profile Incomplete',
  documents_pending: 'Docs Pending', ready_for_payment: 'Ready to Pay',
  paid: 'Paid', in_review: 'In Review', missing_documents: 'Docs Missing',
  ready_for_submission: 'Ready to Submit', submitted: 'Submitted',
  completed: 'Completed', rejected: 'Rejected',
}

// ── CSV export ────────────────────────────────────────────────────────────────
function exportCSV(apps: AppRow[], selected: Set<string>) {
  const rows = selected.size > 0
    ? apps.filter(a => selected.has(a.id))
    : apps

  const headers = ['ID', 'Applicant', 'Email', 'Tax Year', 'Status', 'Payment', 'Created']
  const csvRows = rows.map(app => [
    app.id,
    app.applicant_name ?? app.users?.email ?? '',
    app.users?.email ?? '',
    app.tax_year,
    app.status,
    app.payment_status,
    new Date(app.created_at).toLocaleDateString('en-GB'),
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))

  const csv = [headers.join(','), ...csvRows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `steuerback_applications_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function AdminApplicationsList({ applications }: { applications: AppRow[] }) {
  const [selected,   setSelected]   = useState<Set<string>>(new Set())
  const [bulkStatus, setBulkStatus] = useState<ApplicationStatus | ''>('')
  const [showBulk,   setShowBulk]   = useState(false)
  const [toast,      setToast]      = useState<string | null>(null)
  const [isPending,  startTransition] = useTransition()
  const router = useRouter()

  const allChecked = applications.length > 0 && selected.size === applications.length
  const anyChecked = selected.size > 0

  const toggleAll = () => {
    if (allChecked) setSelected(new Set())
    else setSelected(new Set(applications.map(a => a.id)))
  }

  const toggle = (id: string) => {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelected(next)
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleBulkApply = () => {
    if (!bulkStatus || !anyChecked) return
    if (!confirm(`Set ${selected.size} application(s) to "${STATUS_LABELS[bulkStatus]}"?`)) return
    startTransition(async () => {
      const { updated } = await bulkUpdateStatus(Array.from(selected), bulkStatus)
      setSelected(new Set())
      setBulkStatus('')
      setShowBulk(false)
      showToast(`✓ Updated ${updated} application${updated !== 1 ? 's' : ''}`)
      router.refresh()
    })
  }

  return (
    <div className="relative">
      {/* ── Bulk action bar ───────────────────────────────────────────── */}
      <div className={`flex items-center gap-3 flex-wrap mb-4 transition-all duration-200 ${
        anyChecked ? 'opacity-100' : 'opacity-0 pointer-events-none h-0 mb-0 overflow-hidden'
      }`}>
        <div className="flex items-center gap-2 bg-brand-navy text-white text-sm font-semibold px-4 py-2 rounded-xl">
          <CheckSquare size={14} />
          {selected.size} selected
          <button onClick={() => setSelected(new Set())} className="ml-1 hover:text-white/70 transition-colors">
            <X size={12} />
          </button>
        </div>

        {/* Status picker */}
        <div className="relative">
          <button
            onClick={() => setShowBulk(!showBulk)}
            className="flex items-center gap-2 bg-white border border-gray-200 text-sm font-semibold text-gray-700 px-4 py-2 rounded-xl hover:border-gray-300 transition-colors"
          >
            <RefreshCw size={13} />
            {bulkStatus ? STATUS_LABELS[bulkStatus] : 'Change status'}
            <ChevronDown size={13} />
          </button>

          {showBulk && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowBulk(false)} />
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden min-w-[180px]">
                {ALL_STATUSES.map(s => (
                  <button
                    key={s}
                    onClick={() => { setBulkStatus(s); setShowBulk(false) }}
                    className={`flex items-center gap-2.5 w-full px-3.5 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors ${
                      bulkStatus === s ? 'font-bold text-brand-navy' : 'text-gray-700'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[s].split(' ')[0]}`} />
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <button
          onClick={handleBulkApply}
          disabled={!bulkStatus || isPending}
          className="flex items-center gap-2 bg-brand-red hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold px-4 py-2 rounded-xl transition-all"
        >
          {isPending ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
          Apply
        </button>

        <button
          onClick={() => exportCSV(applications, selected)}
          className="flex items-center gap-2 bg-white border border-gray-200 text-sm font-semibold text-gray-700 px-4 py-2 rounded-xl hover:border-gray-300 transition-colors ml-auto"
        >
          <Download size={13} />
          Export CSV ({selected.size})
        </button>
      </div>

      {/* Export all (when nothing selected) */}
      {!anyChecked && applications.length > 0 && (
        <div className="flex justify-end mb-3">
          <button
            onClick={() => exportCSV(applications, new Set())}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 font-semibold transition-colors"
          >
            <Download size={12} />
            Export all ({applications.length})
          </button>
        </div>
      )}

      {/* ── Table ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-4 py-4 w-10">
                  <button onClick={toggleAll} className="text-gray-400 hover:text-brand-navy transition-colors">
                    {allChecked
                      ? <CheckSquare size={16} className="text-brand-red" />
                      : <Square size={16} />
                    }
                  </button>
                </th>
                <th className="px-4 py-4 font-semibold text-gray-500">Applicant</th>
                <th className="px-4 py-4 font-semibold text-gray-500">Year</th>
                <th className="px-4 py-4 font-semibold text-gray-500">Status</th>
                <th className="px-4 py-4 font-semibold text-gray-500">Payment</th>
                <th className="px-4 py-4 font-semibold text-gray-500">Created</th>
                <th className="px-4 py-4 font-semibold text-gray-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {applications.map(app => {
                const isSelected = selected.has(app.id)
                return (
                  <tr
                    key={app.id}
                    className={`transition-colors ${isSelected ? 'bg-brand-red/3' : 'hover:bg-gray-50'}`}
                  >
                    <td className="px-4 py-3.5">
                      <button onClick={() => toggle(app.id)} className="text-gray-300 hover:text-brand-red transition-colors">
                        {isSelected
                          ? <CheckSquare size={16} className="text-brand-red" />
                          : <Square size={16} />
                        }
                      </button>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <p className="font-medium text-brand-navy">{app.applicant_name ?? app.users?.email ?? '—'}</p>
                        {(app as AppRow & { is_test?: boolean }).is_test && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-600">TEST</span>
                        )}
                      </div>
                      {app.applicant_name && <p className="text-xs text-gray-400 mt-0.5">{app.users?.email}</p>}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 font-semibold">{app.tax_year}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[app.status]}`}>
                        {STATUS_LABELS[app.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        app.payment_status === 'paid'    ? 'bg-green-100 text-green-700' :
                        app.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {app.payment_status ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-400 text-xs">
                      {new Date(app.created_at).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-4 py-3.5">
                      <Link
                        href={`/admin/applications/${app.id}`}
                        className="text-brand-red font-medium hover:underline text-sm"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="md:hidden divide-y divide-gray-100">
          {applications.map(app => {
            const isSelected = selected.has(app.id)
            return (
              <div
                key={app.id}
                className={`flex items-center gap-3 px-4 py-4 transition-colors ${isSelected ? 'bg-brand-red/5' : ''}`}
              >
                <button onClick={() => toggle(app.id)} className="text-gray-300 hover:text-brand-red transition-colors shrink-0">
                  {isSelected
                    ? <CheckSquare size={18} className="text-brand-red" />
                    : <Square size={18} />
                  }
                </button>
                <Link href={`/admin/applications/${app.id}`} className="flex-1 min-w-0 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-brand-navy truncate">
                        {app.applicant_name ?? app.users?.email ?? '—'}
                      </p>
                      {(app as AppRow & { is_test?: boolean }).is_test && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-600 shrink-0">TEST</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-gray-400">Tax {app.tax_year}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_COLORS[app.status]}`}>
                        {STATUS_LABELS[app.status]}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-400 shrink-0" />
                </Link>
              </div>
            )
          })}
        </div>

        {!applications.length && (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">No applications found.</div>
        )}
      </div>

      {/* ── Toast notification ─────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-brand-navy text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-xl animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  )
}
