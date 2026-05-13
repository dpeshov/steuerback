import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowRight, FileText, Clock, User, Plus, ChevronRight, Send, CreditCard } from 'lucide-react'
import { STATUS_LABELS } from '@/lib/utils'
import { submitApplication } from '@/app/actions/submitApplication'
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

const SUBMITTABLE: ApplicationStatus[] = ['draft', 'profile_incomplete', 'documents_pending', 'paid', 'missing_documents']

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('user_id', user!.id).single()

  const { data: applications } = await supabase
    .from('applications').select('*').eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const firstName = profile?.first_name

  const profileFields = profile ? [
    profile.first_name, profile.last_name, profile.date_of_birth,
    profile.nationality, profile.phone, profile.country_of_residence,
    profile.iban, profile.employer_name,
  ] : []
  const filledFields = profileFields.filter(Boolean).length
  const profilePct = profileFields.length ? Math.round((filledFields / profileFields.length) * 100) : 0

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pt-1">
        <div>
          <p className="text-[11px] font-bold text-brand-red uppercase tracking-widest mb-0.5">Dashboard</p>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-navy tracking-tight leading-tight">
            {firstName ? `Hey, ${firstName}` : 'Welcome back'}
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">Your applications overview</p>
        </div>
        <Link
          href="/application"
          className="flex items-center gap-1.5 bg-brand-red text-white font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-red-500 active:bg-red-600 active:scale-95 transition-all shrink-0 shadow-sm shadow-brand-red/20"
        >
          <Plus size={15} strokeWidth={2.5} />
          New
        </Link>
      </div>

      {/* Applications list */}
      {applications && applications.length > 0 ? (
        <div className="space-y-3">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-1">
            {applications.length} application{applications.length !== 1 ? 's' : ''}
          </p>
          {applications.map(app => {
            const status = app.status as ApplicationStatus
            const canSubmit = SUBMITTABLE.includes(status)
            const applicantName = (app as { applicant_name?: string | null }).applicant_name

            return (
              <div key={app.id} className="bg-white border border-black/[0.06] rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-black text-brand-navy text-base">
                          {applicantName || 'Tax year'} {app.tax_year}
                        </span>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${STATUS_COLOR[status]}`}>
                          {STATUS_LABELS[status]}
                        </span>
                      </div>
                      {applicantName && (
                        <p className="text-xs text-gray-400">Tax year {app.tax_year}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5">
                        Created {new Date(app.created_at).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Submit button */}
                    {canSubmit && (
                      <form action={submitApplication.bind(null, app.id)}>
                        <button
                          type="submit"
                          className="flex items-center gap-1.5 bg-brand-red hover:bg-red-500 active:bg-red-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all active:scale-95 shadow-sm shadow-brand-red/20"
                        >
                          <Send size={11} />
                          Submit to admin
                        </button>
                      </form>
                    )}

                    {/* Pay button */}
                    {status === 'ready_for_payment' && (
                      <Link
                        href="/pay"
                        className="flex items-center gap-1.5 bg-brand-navy hover:bg-opacity-90 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all active:scale-95"
                      >
                        <CreditCard size={11} />
                        Pay now
                      </Link>
                    )}

                    <Link
                      href="/status"
                      className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 border border-black/[0.06] text-brand-navy text-xs font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-95"
                    >
                      View status <ChevronRight size={12} />
                    </Link>

                    <Link
                      href="/documents"
                      className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 border border-black/[0.06] text-brand-navy text-xs font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-95"
                    >
                      <FileText size={11} />
                      Documents
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-12 h-12 bg-brand-red/8 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <FileText size={20} className="text-brand-red" />
          </div>
          <h2 className="text-base font-black text-brand-navy mb-1">No applications yet</h2>
          <p className="text-gray-400 text-sm mb-4 max-w-[220px] mx-auto leading-relaxed">
            Start a German tax refund application. Takes about 10 minutes.
          </p>
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

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { href: '/documents', icon: FileText, label: 'Documents', sub: 'Upload files', iconBg: 'bg-brand-red/8', iconColor: 'text-brand-red' },
          { href: '/status',    icon: Clock,    label: 'Status',    sub: 'Track progress', iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
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
    </div>
  )
}
