import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, FileText, CheckCircle, Clock, UserX, ChevronRight, MessageSquare, Phone } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

const STATUS_BADGE: Record<string, string> = {
  completed:            'bg-green-100 text-green-700',
  submitted:            'bg-cyan-100 text-cyan-700',
  in_review:            'bg-indigo-100 text-indigo-700',
  ready_for_submission: 'bg-teal-100 text-teal-700',
  ready_for_payment:    'bg-blue-100 text-blue-700',
  paid:                 'bg-purple-100 text-purple-700',
  missing_documents:    'bg-red-100 text-red-700',
  documents_pending:    'bg-yellow-100 text-yellow-700',
  profile_incomplete:   'bg-orange-100 text-orange-700',
  draft:                'bg-gray-100 text-gray-500',
  rejected:             'bg-gray-200 text-gray-500',
}

export default async function AdminUsersPage() {
  const supabase = createAdminClient()
  const t = await getTranslations('admin.users')
  const tStatus = await getTranslations('admin.statuses')

  const { data: users } = await supabase
    .from('users')
    .select(`
      id, email, role, created_at, is_active,
      profiles (first_name, last_name, nationality, city, country_of_residence, profile_complete, gross_income_eur, employer_name, phone),
      applications (id, tax_year, status, payment_status, created_at)
    `)
    .order('created_at', { ascending: false })

  const total     = users?.length ?? 0
  const active    = users?.filter(u => u.is_active).length ?? 0
  const withApp   = users?.filter(u => (u.applications as unknown[]).length > 0).length ?? 0
  const completed = users?.filter(u =>
    (u.applications as { status: string }[]).some(a => a.status === 'completed')
  ).length ?? 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">{t('title')}</h1>
        <p className="text-gray-500 text-sm mt-1">{t('registeredAccounts', { count: total })}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t('totalUsers'),      value: total,     icon: Users,        color: 'text-brand-red' },
          { label: t('active'),          value: active,    icon: Clock,        color: 'text-blue-500' },
          { label: t('haveApplication'), value: withApp,   icon: FileText,     color: 'text-indigo-500' },
          { label: t('completedRefund'), value: completed, icon: CheckCircle,  color: 'text-brand-success' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm">
            <Icon size={20} className={`${color} mb-3`} />
            <p className="text-3xl font-bold text-brand-navy">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-6 py-4 font-semibold text-gray-500">{t('user')}</th>
                <th className="px-6 py-4 font-semibold text-gray-500">{t('location')}</th>
                <th className="px-6 py-4 font-semibold text-gray-500">{t('lastEmployer')}</th>
                <th className="px-6 py-4 font-semibold text-gray-500">{t('applications')}</th>
                <th className="px-6 py-4 font-semibold text-gray-500">{t('joined')}</th>
                <th className="px-6 py-4 font-semibold text-gray-500 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users?.map(user => {
                const profile = user.profiles as {
                  first_name?: string; last_name?: string; nationality?: string;
                  city?: string; country_of_residence?: string; profile_complete?: boolean;
                  gross_income_eur?: number; employer_name?: string; phone?: string
                } | null
                const apps      = user.applications as { id: string; tax_year: number; status: string; payment_status: string }[]
                const latestApp = apps?.[0]
                const fullName  = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ')

                return (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    {/* User */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-navy/8 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-brand-navy uppercase">
                            {(profile?.first_name?.[0] ?? user.email[0]).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-brand-navy leading-tight">
                            {fullName || <span className="text-gray-400 font-normal italic">{t('noName')}</span>}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
                          {profile?.phone && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <Phone size={10} className="text-gray-300 shrink-0" />
                              <span className="text-xs text-gray-400">{profile.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-6 py-4">
                      <p className="text-gray-700">{profile?.city ?? '—'}</p>
                      <p className="text-xs text-gray-400">{profile?.nationality ?? ''}</p>
                    </td>

                    {/* Last Employer */}
                    <td className="px-6 py-4">
                      <p className="text-gray-700 truncate max-w-[180px]">{profile?.employer_name ?? '—'}</p>
                      {profile?.gross_income_eur && (
                        <p className="text-xs text-gray-400">€{Number(profile.gross_income_eur).toLocaleString()}</p>
                      )}
                    </td>

                    {/* Applications */}
                    <td className="px-6 py-4">
                      {apps.length === 0 ? (
                        <span className="text-gray-400 text-xs">{t('none')}</span>
                      ) : (
                        <div className="flex flex-col gap-1">
                          {apps.slice(0, 2).map(app => (
                            <div key={app.id} className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 w-8">{app.tax_year}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_BADGE[app.status] ?? 'bg-gray-100 text-gray-500'}`}>
                                {tStatus(app.status as never) ?? app.status}
                              </span>
                            </div>
                          ))}
                          {apps.length > 2 && (
                            <span className="text-xs text-gray-400">+{apps.length - 2} more</span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Joined */}
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {new Date(user.created_at).toLocaleDateString('en-GB')}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {latestApp && (
                          <Link
                            href={`/admin/applications/${latestApp.id}?tab=messages`}
                            title={t('openMessages')}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-brand-red hover:bg-brand-red/8 transition-colors"
                          >
                            <MessageSquare size={15} />
                          </Link>
                        )}
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="flex items-center gap-1 text-brand-red text-sm font-medium hover:underline"
                        >
                          {t('view')} <ChevronRight size={13} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile card list */}
        <div className="md:hidden divide-y divide-gray-100">
          {users?.map(user => {
            const profile   = user.profiles as { first_name?: string; last_name?: string; nationality?: string; city?: string; employer_name?: string; gross_income_eur?: number; phone?: string } | null
            const apps      = user.applications as { id: string; tax_year: number; status: string }[]
            const latestApp = apps?.[0]
            const fullName  = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ')

            return (
              <div key={user.id} className="px-4 py-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-navy/8 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-brand-navy uppercase">
                    {(profile?.first_name?.[0] ?? user.email[0]).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-brand-navy text-sm truncate">
                    {fullName || user.email}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  {profile?.phone && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Phone size={10} className="text-gray-300 shrink-0" />
                      <span className="text-xs text-gray-400">{profile.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {latestApp && (
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_BADGE[latestApp.status] ?? 'bg-gray-100 text-gray-500'}`}>
                        {tStatus(latestApp.status as never) ?? latestApp.status}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">{profile?.city ?? ''}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {latestApp && (
                    <Link
                      href={`/admin/applications/${latestApp.id}?tab=messages`}
                      title={t('openMessages')}
                      className="p-1.5 text-gray-400 hover:text-brand-red transition-colors"
                    >
                      <MessageSquare size={15} />
                    </Link>
                  )}
                  <Link href={`/admin/users/${user.id}`}>
                    <ChevronRight size={18} className="text-gray-400" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {!users?.length && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <UserX size={32} className="text-gray-300" />
            <p className="text-gray-400 text-sm">{t('noUsersYet')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
