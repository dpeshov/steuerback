import { createAdminClient } from '@/lib/supabase/server'
import { FileText, Users, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import { STATUS_LABELS } from '@/lib/utils'

export default async function AdminDashboard() {
  const supabase = createAdminClient()

  const [
    { count: totalApps },
    { count: totalUsers },
    { count: completedApps },
    { count: inReviewApps },
    { data: recentApps },
  ] = await Promise.all([
    supabase.from('applications').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'in_review'),
    supabase.from('applications')
      .select('id, tax_year, status, created_at, users(email)')
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  const stats = [
    { label: 'Total applications', value: totalApps ?? 0, icon: FileText, color: 'text-brand-red' },
    { label: 'Registered users', value: totalUsers ?? 0, icon: Users, color: 'text-blue-500' },
    { label: 'Completed', value: completedApps ?? 0, icon: CheckCircle, color: 'text-brand-success' },
    { label: 'In review', value: inReviewApps ?? 0, icon: Clock, color: 'text-yellow-500' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of SteuerBack operations</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm">
            <Icon size={22} className={`${color} mb-3`} />
            <p className="text-3xl font-bold text-brand-navy">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-brand-navy">Recent applications</h2>
          <Link href="/admin/applications" className="text-sm text-brand-red hover:underline">View all</Link>
        </div>
        <div className="divide-y divide-gray-50">
          {recentApps?.map(app => {
            const userRecord = app.users as { email: string } | null
            return (
              <Link
                key={app.id}
                href={`/admin/applications/${app.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-brand-navy">{userRecord?.email ?? '—'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Tax year {app.tax_year}</p>
                </div>
                <span className="text-xs font-semibold bg-brand-surface text-brand-navy px-3 py-1 rounded-full">
                  {STATUS_LABELS[app.status as keyof typeof STATUS_LABELS] ?? app.status}
                </span>
              </Link>
            )
          })}
          {!recentApps?.length && (
            <p className="px-6 py-8 text-center text-gray-400 text-sm">No applications yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
