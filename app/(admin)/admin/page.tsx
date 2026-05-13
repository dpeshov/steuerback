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
      .select('id, tax_year, status, created_at, applicant_name, users(email)')
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  const stats = [
    { label: 'Total applications', value: totalApps ?? 0,    icon: FileText,    color: 'text-brand-red',     href: '/admin/applications' },
    { label: 'Registered users',   value: totalUsers ?? 0,   icon: Users,       color: 'text-blue-500',      href: '/admin/users' },
    { label: 'Completed',          value: completedApps ?? 0,icon: CheckCircle, color: 'text-brand-success', href: '/admin/applications?status=completed' },
    { label: 'In review',          value: inReviewApps ?? 0, icon: Clock,       color: 'text-yellow-500',    href: '/admin/applications?status=in_review' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of SteuerBack operations</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 group"
          >
            <Icon size={22} className={`${color} mb-3 group-hover:scale-110 transition-transform`} />
            <p className="text-3xl font-bold text-brand-navy">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </Link>
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
            const applicantName = (app as { applicant_name?: string | null }).applicant_name
            return (
              <Link
                key={app.id}
                href={`/admin/applications/${app.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-brand-navy">
                    {applicantName ?? userRecord?.email ?? '—'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {applicantName ? userRecord?.email + ' · ' : ''}Tax year {app.tax_year}
                  </p>
                </div>
                <span className="text-xs font-semibold bg-gray-100 text-brand-navy px-3 py-1 rounded-full">
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
