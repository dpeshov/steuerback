import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { STATUS_LABELS } from '@/lib/utils'
import type { ApplicationStatus } from '@/types/database'

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

export default async function AdminApplicationsPage() {
  const supabase = await createAdminClient()

  const { data: applications } = await supabase
    .from('applications')
    .select('id, tax_year, status, payment_status, created_at, users(email, id)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">All Applications</h1>
        <p className="text-gray-500 text-sm mt-1">{applications?.length ?? 0} total</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-6 py-4 font-semibold text-gray-500">User</th>
                <th className="px-6 py-4 font-semibold text-gray-500">Year</th>
                <th className="px-6 py-4 font-semibold text-gray-500">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-500">Payment</th>
                <th className="px-6 py-4 font-semibold text-gray-500">Created</th>
                <th className="px-6 py-4 font-semibold text-gray-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {applications?.map(app => {
                const user = app.users as { email: string; id: string } | null
                const status = app.status as ApplicationStatus
                return (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-brand-navy font-medium truncate max-w-[200px]">{user?.email ?? '—'}</td>
                    <td className="px-6 py-4 text-gray-600">{app.tax_year}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABELS[status] ?? status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        app.payment_status === 'paid'    ? 'bg-green-100 text-green-700' :
                        app.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {app.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {new Date(app.created_at).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/applications/${app.id}`} className="text-brand-red font-medium hover:underline text-sm">
                        View →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile card list */}
        <div className="md:hidden divide-y divide-gray-100">
          {applications?.map(app => {
            const user = app.users as { email: string; id: string } | null
            const status = app.status as ApplicationStatus
            return (
              <Link
                key={app.id}
                href={`/admin/applications/${app.id}`}
                className="flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-brand-navy truncate">{user?.email ?? '—'}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs text-gray-400">Tax {app.tax_year}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABELS[status] ?? status}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      app.payment_status === 'paid'    ? 'bg-green-100 text-green-700' :
                      app.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {app.payment_status}
                    </span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-400 shrink-0" />
              </Link>
            )
          })}
        </div>

        {!applications?.length && (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">No applications yet</div>
        )}
      </div>
    </div>
  )
}
