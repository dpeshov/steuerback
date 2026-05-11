import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowRight, FileText, Clock, User, Plus, ChevronRight, TrendingUp } from 'lucide-react'
import { STATUS_MESSAGES, STATUS_LABELS } from '@/lib/utils'
import type { ApplicationStatus } from '@/types/database'

const STATUS_COLOR: Record<ApplicationStatus, string> = {
  draft:                  'bg-gray-100 text-gray-500',
  profile_incomplete:     'bg-orange-100 text-orange-700',
  documents_pending:      'bg-amber-100 text-amber-700',
  ready_for_payment:      'bg-blue-100 text-blue-700',
  paid:                   'bg-violet-100 text-violet-700',
  in_review:              'bg-indigo-100 text-indigo-700',
  missing_documents:      'bg-red-100 text-red-600',
  ready_for_submission:   'bg-teal-100 text-teal-700',
  submitted:              'bg-cyan-100 text-cyan-700',
  completed:              'bg-emerald-100 text-emerald-700',
  rejected:               'bg-gray-100 text-gray-500',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('user_id', user!.id).single()

  const { data: applications } = await supabase
    .from('applications').select('*').eq('user_id', user!.id)
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
  const profilePct = profileFields.length ? Math.round((filledFields / profileFields.length) * 100) : 0
  const firstName = profile?.first_name

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex items-start justify-between gap-3 pt-1">
        <div>
          <p className="text-[11px] font-bold text-brand-red uppercase tracking-widest mb-0.5">Dashboard</p>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-navy tracking-tight leading-tight">
            {firstName ? `Hey, ${firstName}` : 'Welcome back'}
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">Your application overview</p>
        </div>
        {!latestApp && (
          <Link
            href="/application"
            className="flex items-center gap-1.5 bg-brand-red text-white font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-red-500 active:bg-red-600 active:scale-95 transition-all shrink-0 shadow-sm shadow-brand-red/20"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span className="hidden sm:inline">New</span> application
          </Link>
        )}
      </div>

      {/* Status card or empty state */}
      {latestApp ? (
        <div className="relative overflow-hidden bg-brand-navy rounded-2xl p-5 text-white shadow-lg shadow-brand-navy/15">
          <div className="absolute -top-8 -right-8 w-48 h-48 bg-brand-red/15 rounded-full blur-[50px] pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-blue-500/8 rounded-full blur-[40px] pointer-events-none" />
          <div className="relative">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-white/35 font-bold uppercase tracking-widest mb-1.5">
                  Tax year {latestApp.tax_year}
                </p>
                <h2 className="text-lg font-black leading-snug">{statusInfo?.message}</h2>
                <p className="text-white/45 text-xs mt-1 leading-relaxed">{statusInfo?.next}</p>
              </div>
              {status && (
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap ${STATUS_COLOR[status]}`}>
                  {STATUS_LABELS[status]}
                </span>
              )}
            </div>
            <Link
              href="/status"
              className="inline-flex items-center gap-1.5 bg-white/8 hover:bg-white/12 active:bg-white/5 border border-white/10 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-95"
            >
              View timeline <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-12 h-12 bg-brand-red/8 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <FileText size={20} className="text-brand-red" />
          </div>
          <h2 className="text-base font-black text-brand-navy mb-1">No application yet</h2>
          <p className="text-gray-400 text-sm mb-4 max-w-[220px] mx-auto leading-relaxed">Start your German tax refund. Takes about 10 minutes.</p>
          <Link
            href="/application"
            className="inline-flex items-center gap-2 bg-brand-red text-white font-bold px-5 py-3 rounded-xl text-sm hover:bg-red-500 active:bg-red-600 active:scale-95 transition-all shadow-sm shadow-brand-red/20"
          >
            Start application <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Profile completion */}
      <div className="bg-white border border-black/[0.06] rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-navy/6 rounded-xl flex items-center justify-center">
              <User size={14} className="text-brand-navy" strokeWidth={2} />
            </div>
            <span className="font-bold text-brand-navy text-sm">Profile completion</span>
          </div>
          <span className={`text-sm font-black ${profilePct === 100 ? 'text-brand-success' : 'text-brand-navy'}`}>
            {profilePct}%
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2.5">
          <div
            className={`h-1.5 rounded-full transition-all duration-700 ${profilePct === 100 ? 'bg-brand-success' : 'bg-brand-red'}`}
            style={{ width: `${profilePct}%` }}
          />
        </div>
        {profilePct < 100 ? (
          <Link href="/profile" className="text-xs text-brand-red font-semibold inline-flex items-center gap-1 py-0.5 active:opacity-70">
            Complete your profile <ChevronRight size={12} />
          </Link>
        ) : (
          <p className="text-xs text-brand-success font-semibold">Profile complete ✓</p>
        )}
      </div>

      {/* Quick links grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { href: '/documents', icon: FileText, label: 'Documents', sub: 'Upload files', iconBg: 'bg-brand-red/8', iconColor: 'text-brand-red' },
          { href: '/status', icon: Clock, label: 'Status', sub: 'Track progress', iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
        ].map(({ href, icon: Icon, label, sub, iconBg, iconColor }) => (
          <Link
            key={href}
            href={href}
            className="group bg-white border border-black/[0.06] rounded-2xl p-4 shadow-sm hover:shadow-md active:scale-[0.97] transition-all duration-150"
          >
            <div className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={16} className={iconColor} strokeWidth={2} />
            </div>
            <p className="font-bold text-brand-navy text-sm">{label}</p>
            <p className="text-gray-400 text-xs mt-0.5">{sub}</p>
          </Link>
        ))}
      </div>

      {/* Refund nudge */}
      {latestApp && status !== 'completed' && (
        <div className="bg-white border border-black/[0.06] rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-success/10 rounded-xl flex items-center justify-center shrink-0">
            <TrendingUp size={16} className="text-brand-success" strokeWidth={2} />
          </div>
          <div>
            <p className="text-sm font-bold text-brand-navy">Average refund: <span className="text-brand-success">€800</span></p>
            <p className="text-xs text-gray-400 mt-0.5">Most workers get €300–€2,000 back</p>
          </div>
        </div>
      )}

      {/* All applications */}
      {applications && applications.length > 1 && (
        <div className="bg-white border border-black/[0.06] rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold text-brand-navy text-sm mb-3">All applications</h3>
          <div className="space-y-2">
            {applications.map(app => (
              <Link
                key={app.id}
                href="/status"
                className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 rounded-xl transition-colors active:scale-[0.99]"
              >
                <span className="text-sm font-semibold text-brand-navy">Tax year {app.tax_year}</span>
                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[app.status as ApplicationStatus] ?? 'bg-gray-100 text-gray-500'}`}>
                  {STATUS_LABELS[app.status as ApplicationStatus] ?? app.status}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
