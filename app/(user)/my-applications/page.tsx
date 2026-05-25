import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  Plus, ChevronRight, CheckCircle, Clock, FileText,
  Banknote, AlertCircle, ArrowRight, Calendar,
} from 'lucide-react'
import type { ApplicationStatus } from '@/types/database'

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; dotColor: string }> = {
  draft:                  { label: 'Draft',              color: 'bg-gray-100 text-gray-500',     dotColor: 'bg-gray-400' },
  profile_incomplete:     { label: 'Profile Incomplete', color: 'bg-orange-100 text-orange-700', dotColor: 'bg-orange-400' },
  documents_pending:      { label: 'Docs Pending',       color: 'bg-amber-100 text-amber-700',   dotColor: 'bg-amber-400' },
  ready_for_payment:      { label: 'Ready to Pay',       color: 'bg-blue-100 text-blue-700',     dotColor: 'bg-blue-500' },
  paid:                   { label: 'Paid',               color: 'bg-violet-100 text-violet-700', dotColor: 'bg-violet-500' },
  in_review:              { label: 'In Review',          color: 'bg-indigo-100 text-indigo-700', dotColor: 'bg-indigo-500' },
  missing_documents:      { label: 'Docs Missing',       color: 'bg-red-100 text-red-600',       dotColor: 'bg-red-500' },
  ready_for_submission:   { label: 'Ready to Submit',    color: 'bg-teal-100 text-teal-700',     dotColor: 'bg-teal-500' },
  submitted:              { label: 'Submitted',          color: 'bg-cyan-100 text-cyan-700',     dotColor: 'bg-cyan-500' },
  completed:              { label: 'Completed',          color: 'bg-emerald-100 text-emerald-700',dotColor: 'bg-emerald-500' },
  rejected:               { label: 'Rejected',           color: 'bg-gray-100 text-gray-500',     dotColor: 'bg-gray-400' },
}

const PROGRESS_MAP: Record<ApplicationStatus, number> = {
  draft: 5, profile_incomplete: 10, documents_pending: 25,
  ready_for_payment: 35, paid: 45, in_review: 55,
  missing_documents: 50, ready_for_submission: 70,
  submitted: 85, completed: 100, rejected: 0,
}

export default async function MyApplicationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: applications } = await supabase
    .from('applications').select('*').eq('user_id', user!.id)
    .order('tax_year', { ascending: false })

  const completed  = applications?.filter(a => a.status === 'completed').length ?? 0
  const active     = applications?.filter(a => !['completed', 'rejected'].includes(a.status)).length ?? 0
  const totalRef   = (applications ?? [])
    .filter(a => a.status === 'completed')
    .reduce((s, a) => s + (Number(a.refund_amount) || 0), 0)

  const existingYears = new Set(applications?.map(a => a.tax_year) ?? [])
  const currentYear   = new Date().getFullYear()
  const availableYears = [currentYear - 1, currentYear - 2, currentYear - 3, currentYear - 4, currentYear - 5]
    .filter(y => !existingYears.has(y))

  return (
    <div className="space-y-5">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] font-bold text-brand-red uppercase tracking-widest mb-0.5">Applications</p>
          <h1 className="text-2xl font-black text-brand-navy">My Applications</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {(applications?.length ?? 0) === 0
              ? 'Start your first German tax refund'
              : `${applications?.length} total · ${completed} completed · ${active} in progress`}
          </p>
        </div>
        <Link
          href="/application"
          className="flex items-center gap-2 bg-brand-red hover:bg-red-500 active:scale-95 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-brand-red/20 shrink-0"
        >
          <Plus size={14} strokeWidth={2.5} />
          New Application
        </Link>
      </div>

      {/* ── Summary bar ─────────────────────────────────────────────── */}
      {(applications?.length ?? 0) > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total', value: String(applications?.length ?? 0), icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'Completed', value: String(completed), icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { label: 'Refunded', value: totalRef > 0 ? `€${Math.round(totalRef).toLocaleString()}` : '—', icon: Banknote, color: 'text-purple-500', bg: 'bg-purple-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
              <div className={`w-8 h-8 ${bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                <Icon size={14} className={color} />
              </div>
              <p className="text-lg font-black text-brand-navy">{value}</p>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Applications list ────────────────────────────────────────── */}
      {applications && applications.length > 0 ? (
        <div className="space-y-3">
          {applications.map(app => {
            const st      = app.status as ApplicationStatus
            const cfg     = STATUS_CONFIG[st]
            const pct     = PROGRESS_MAP[st]
            const appId   = `TR-${app.tax_year}-${app.id.slice(0, 5).toUpperCase()}`
            const isDone  = st === 'completed'
            const isBad   = st === 'rejected' || st === 'missing_documents'

            return (
              <div
                key={app.id}
                className={`bg-white rounded-2xl border overflow-hidden hover:shadow-md transition-all duration-200 ${
                  isDone ? 'border-emerald-100' : isBad ? 'border-red-100' : 'border-gray-100'
                }`}
              >
                {/* Top accent bar */}
                {isDone && <div className="h-1 bg-gradient-to-r from-emerald-400 to-teal-400" />}
                {isBad  && <div className="h-1 bg-gradient-to-r from-red-400 to-orange-400" />}

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      {/* Year badge */}
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        isDone ? 'bg-emerald-50' : 'bg-brand-navy/5'
                      }`}>
                        <span className={`text-sm font-black ${isDone ? 'text-emerald-600' : 'text-brand-navy'}`}>
                          {String(app.tax_year).slice(-2)}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-black text-brand-navy text-base">{app.tax_year}</h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 ${cfg.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
                            {cfg.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{appId}</p>
                      </div>
                    </div>

                    {/* Refund amount */}
                    {app.refund_amount ? (
                      <div className="text-right shrink-0">
                        <p className="text-xs text-gray-400 mb-0.5">Refund</p>
                        <p className="text-xl font-black text-emerald-600">
                          €{Number(app.refund_amount).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    ) : null}
                  </div>

                  {/* Progress bar */}
                  {st !== 'rejected' && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Progress</span>
                        <span className="text-[10px] font-bold text-gray-500">{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${isDone ? 'bg-emerald-400' : 'bg-brand-red'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Meta info row */}
                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      Started {new Date(app.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    {app.submitted_at && (
                      <span className="flex items-center gap-1">
                        <CheckCircle size={11} className="text-teal-500" />
                        Submitted {new Date(app.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </div>

                  {/* Action row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {st === 'missing_documents' && (
                      <Link
                        href="/documents"
                        className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs px-3.5 py-2 rounded-xl transition-colors active:scale-95"
                      >
                        <AlertCircle size={12} />
                        Upload missing docs
                      </Link>
                    )}
                    {(st === 'ready_for_payment') && (
                      <Link
                        href="/pay"
                        className="flex items-center gap-1.5 bg-brand-red hover:bg-red-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors active:scale-95"
                      >
                        <Banknote size={12} />
                        Pay now
                      </Link>
                    )}
                    {['draft', 'profile_incomplete'].includes(st) && (
                      <Link
                        href="/profile"
                        className="flex items-center gap-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold text-xs px-3.5 py-2 rounded-xl transition-colors active:scale-95"
                      >
                        <ArrowRight size={12} />
                        Complete profile
                      </Link>
                    )}
                    {['documents_pending'].includes(st) && (
                      <Link
                        href="/documents"
                        className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-xs px-3.5 py-2 rounded-xl transition-colors active:scale-95"
                      >
                        <FileText size={12} />
                        Upload documents
                      </Link>
                    )}
                    <Link
                      href="/messages"
                      className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs px-3.5 py-2 rounded-xl transition-colors active:scale-95 ml-auto"
                    >
                      Messages <ChevronRight size={11} />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Empty state */
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center">
          <div className="w-14 h-14 bg-brand-red/8 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText size={22} className="text-brand-red" />
          </div>
          <h2 className="text-lg font-black text-brand-navy mb-2">No applications yet</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-[240px] mx-auto leading-relaxed">
            Start your first German tax refund application. Takes about 10 minutes.
          </p>
          <Link
            href="/application"
            className="inline-flex items-center gap-2 bg-brand-red text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-red-500 transition-all active:scale-95 shadow-sm shadow-brand-red/20"
          >
            <Plus size={14} />
            Start first application
          </Link>
        </div>
      )}

      {/* ── Available years to apply ────────────────────────────── */}
      {availableYears.length > 0 && (applications?.length ?? 0) > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-brand-navy mb-1 text-sm">Add another tax year</h3>
          <p className="text-xs text-gray-400 mb-4">You can claim refunds for up to 4 years back</p>
          <div className="flex flex-wrap gap-2">
            {availableYears.slice(0, 4).map(year => (
              <Link
                key={year}
                href={`/application?year=${year}`}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-brand-red/5 border border-gray-200 hover:border-brand-red/20 rounded-xl text-sm font-bold text-gray-700 hover:text-brand-red transition-all active:scale-95"
              >
                <Plus size={13} />
                {year}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
