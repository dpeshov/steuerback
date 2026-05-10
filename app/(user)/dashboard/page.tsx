import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowRight, FileText, CheckCircle, Clock } from 'lucide-react'
import { STATUS_MESSAGES, STATUS_LABELS } from '@/lib/utils'
import type { ApplicationStatus } from '@/types/database'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user!.id)
    .single()

  const { data: applications } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const latestApp = applications?.[0]
  const status = latestApp?.status as ApplicationStatus | undefined
  const statusInfo = status ? STATUS_MESSAGES[status] : null

  const profileFields = profile ? [
    profile.first_name, profile.last_name, profile.date_of_birth,
    profile.nationality, profile.phone, profile.country_of_residence,
    profile.iban, profile.employer_name,
  ] : []
  const filledFields = profileFields.filter(Boolean).length
  const profilePct = profile ? Math.round((filledFields / profileFields.length) * 100) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">
          Welcome back{profile?.first_name ? `, ${profile.first_name}` : ''}
        </h1>
        <p className="text-gray-500 text-sm mt-1">Here&apos;s where your application stands</p>
      </div>

      {/* Status card */}
      {latestApp ? (
        <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-brand-red">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Application {latestApp.tax_year}</p>
              <h2 className="text-lg font-semibold text-brand-navy">{statusInfo?.message}</h2>
              <p className="text-sm text-gray-500 mt-1">{statusInfo?.next}</p>
            </div>
            <span className="bg-brand-surface text-brand-navy text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
              {STATUS_LABELS[status!]}
            </span>
          </div>
          <Link href="/status" className="mt-4 inline-flex items-center gap-1 text-brand-red text-sm font-medium hover:underline">
            View full timeline <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
          <div className="text-4xl mb-3">📋</div>
          <h2 className="text-lg font-semibold text-brand-navy mb-1">No application yet</h2>
          <p className="text-gray-500 text-sm mb-4">Start your German tax refund application now.</p>
          <Link href="/application" className="bg-brand-red text-white font-semibold px-6 py-3 rounded-xl text-sm hover:bg-red-600 transition-colors inline-block">
            Start application
          </Link>
        </div>
      )}

      {/* Profile progress */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-brand-navy">Profile completion</h3>
          <span className="text-sm font-bold text-brand-navy">{profilePct}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
          <div
            className="bg-brand-red h-2 rounded-full transition-all"
            style={{ width: `${profilePct}%` }}
          />
        </div>
        {profilePct < 100 && (
          <Link href="/profile" className="text-brand-red text-sm font-medium hover:underline inline-flex items-center gap-1">
            Complete your profile <ArrowRight size={14} />
          </Link>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { href: '/documents', icon: FileText, label: 'Documents' },
          { href: '/status', icon: Clock, label: 'Status' },
          { href: '/profile', icon: CheckCircle, label: 'Profile' },
        ].map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href} className="bg-white rounded-2xl p-4 shadow-sm flex flex-col items-center gap-2 text-sm font-medium text-brand-navy hover:border-brand-red hover:border transition-colors">
            <Icon size={22} className="text-brand-red" />
            {label}
          </Link>
        ))}
      </div>
    </div>
  )
}
