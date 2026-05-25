import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  TrendingUp, FileText, CheckCircle, Clock, MessageSquare,
  Plus, ChevronRight, AlertCircle, Upload, Banknote, ArrowUpRight,
} from 'lucide-react'
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

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  draft:                  'Draft',
  profile_incomplete:     'Profile Incomplete',
  documents_pending:      'Docs Pending',
  ready_for_payment:      'Ready to Pay',
  paid:                   'Paid',
  in_review:              'In Review',
  missing_documents:      'Docs Missing',
  ready_for_submission:   'Ready to Submit',
  submitted:              'Submitted',
  completed:              'Completed ✓',
  rejected:               'Rejected',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('user_id', user!.id).single()

  const { data: applications } = await supabase
    .from('applications').select('*').eq('user_id', user!.id)
    .order('tax_year', { ascending: false })

  // ── Stats ──────────────────────────────────────────────────────────────
  const totalApps      = applications?.length ?? 0
  const completedApps  = applications?.filter(a => a.status === 'completed') ?? []
  const activeApps     = applications?.filter(a => !['completed', 'rejected'].includes(a.status)) ?? []
  const totalRefunded  = completedApps.reduce((s, a) => s + (Number(a.refund_amount) || 0), 0)
  const latestActive   = activeApps[0] ?? applications?.[0] ?? null
  const lastSubmission = applications?.find(a => a.submitted_at)?.submitted_at

  // ── Docs + messages for active app ─────────────────────────────────────
  const [{ data: documents }, { data: messages }] = latestActive
    ? await Promise.all([
        supabase.from('documents').select('id, review_status').eq('application_id', latestActive.id),
        supabase.from('notes').select('id, text, created_by, created_at')
          .eq('application_id', latestActive.id).eq('is_public', true)
          .order('created_at', { ascending: false }).limit(3),
      ])
    : [{ data: [] }, { data: [] }]

  const firstName  = profile?.first_name
  const reupload   = documents?.filter(d => d.review_status === 'needs_reupload').length ?? 0
  const pendingDoc = documents?.filter(d => d.review_status === 'pending').length ?? 0

  return (
    <div className="space-y-5">

      {/* ── Hero greeting ────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-brand-navy via-[#1e1e3a] to-[#2a1a2e] rounded-2xl overflow-hidden p-6 text-white shadow-lg">
        {/* decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-red/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">Tax Refund Portal</p>
            <h1 className="text-2xl font-black leading-tight">
              {firstName ? `Hey, ${firstName} 👋` : 'Welcome back 👋'}
            </h1>
            <p className="text-white/50 text-sm mt-1">
              {totalApps === 0
                ? 'Start your first tax refund application'
                : `${totalApps} application${totalApps !== 1 ? 's' : ''} · ${completedApps.length} completed`}
            </p>
          </div>
          <Link
            href="/my-applications"
            className="flex items-center gap-2 bg-brand-red hover:bg-red-500 active:scale-95 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-brand-red/30 shrink-0"
          >
            <Plus size={14} strokeWidth={2.5} />
            New Application
          </Link>
        </div>

        {/* Alert if docs need reupload */}
        {reupload > 0 && (
          <Link
            href="/documents"
            className="relative flex items-center gap-2.5 mt-4 bg-red-500/20 border border-red-400/20 rounded-xl px-4 py-3 hover:bg-red-500/30 transition-colors"
          >
            <AlertCircle size={15} className="text-red-300 shrink-0" />
            <span className="text-red-200 text-sm font-semibold">
              {reupload} document{reupload !== 1 ? 's' : ''} need{reupload === 1 ? 's' : ''} reupload
            </span>
            <ArrowUpRight size={13} className="text-red-300 ml-auto" />
          </Link>
        )}
      </div>

      {/* ── 4 stat cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label:    'Total Applications',
            value:    String(totalApps),
            sub:      totalApps === 0 ? 'None yet' : `${activeApps.length} active`,
            icon:     FileText,
            iconBg:   'bg-blue-50',
            iconColor:'text-blue-500',
          },
          {
            label:    'Completed',
            value:    String(completedApps.length),
            sub:      completedApps.length > 0 ? 'Refunds received' : 'In progress',
            icon:     CheckCircle,
            iconBg:   'bg-emerald-50',
            iconColor:'text-emerald-500',
          },
          {
            label:    'Total Refunded',
            value:    totalRefunded > 0 ? `€${Number(totalRefunded).toLocaleString('de-DE', { minimumFractionDigits: 2 })}` : '€0',
            sub:      completedApps.length > 0 ? `Across ${completedApps.length} year${completedApps.length !== 1 ? 's' : ''}` : 'No refunds yet',
            icon:     Banknote,
            iconBg:   'bg-purple-50',
            iconColor:'text-purple-500',
          },
          {
            label:    'Last Submission',
            value:    lastSubmission
              ? new Date(lastSubmission).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
              : '—',
            sub:      lastSubmission ? 'Sent to Finanzamt' : 'Not submitted yet',
            icon:     TrendingUp,
            iconBg:   'bg-orange-50',
            iconColor:'text-orange-500',
          },
        ].map(({ label, value, sub, icon: Icon, iconBg, iconColor }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
            <div className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={16} className={iconColor} />
            </div>
            <p className="text-2xl font-black text-brand-navy leading-none">{value}</p>
            <p className="text-[11px] font-semibold text-gray-400 mt-1 uppercase tracking-wide">{label}</p>
            <p className="text-xs text-gray-300 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {totalApps === 0 ? (
        /* ── Empty state ─────────────────────────────────────────────── */
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center">
          <div className="w-14 h-14 bg-brand-red/8 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText size={22} className="text-brand-red" />
          </div>
          <h2 className="text-lg font-black text-brand-navy mb-1">No applications yet</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-[240px] mx-auto leading-relaxed">
            Start a German tax refund — takes about 10 minutes.
          </p>
          <Link
            href="/application"
            className="inline-flex items-center gap-2 bg-brand-red text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-red-500 transition-all active:scale-95 shadow-sm shadow-brand-red/20"
          >
            Start first application <ChevronRight size={14} />
          </Link>
        </div>
      ) : (
        <>
          {/* ── Applications by year ───────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h2 className="font-bold text-brand-navy flex items-center gap-2">
                <FileText size={15} className="text-brand-red" />
                Your Applications
              </h2>
              <Link
                href="/my-applications"
                className="flex items-center gap-1 text-xs text-brand-red font-semibold hover:underline"
              >
                View all <ChevronRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {applications?.slice(0, 5).map(app => {
                const st = app.status as ApplicationStatus
                return (
                  <Link
                    key={app.id}
                    href="/my-applications"
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/80 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-navy/5 rounded-xl flex items-center justify-center shrink-0">
                        <span className="text-xs font-black text-brand-navy">{app.tax_year}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${STATUS_COLOR[st]}`}>
                            {STATUS_LABEL[st]}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {app.submitted_at
                            ? `Submitted ${new Date(app.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
                            : `Started ${new Date(app.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {app.refund_amount && (
                        <span className="text-sm font-black text-emerald-600">
                          €{Number(app.refund_amount).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                        </span>
                      )}
                      <ChevronRight size={14} className="text-gray-300 group-hover:text-brand-red transition-colors" />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* ── Docs + Messages row ────────────────────────────────── */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Documents */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-brand-navy text-sm flex items-center gap-2">
                  <FileText size={14} className="text-brand-red" />
                  Documents
                </h2>
                <Link href="/documents" className="flex items-center gap-1 text-xs text-brand-red font-semibold hover:underline">
                  Upload <Upload size={11} />
                </Link>
              </div>
              {documents && documents.length > 0 ? (
                <div className="space-y-2">
                  {[
                    { label: 'Approved',       count: documents.filter(d => d.review_status === 'approved').length,       color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Under review',   count: pendingDoc,                                                          color: 'text-yellow-600',  bg: 'bg-yellow-50' },
                    { label: 'Needs reupload', count: reupload,                                                            color: 'text-brand-red',   bg: 'bg-red-50' },
                  ].filter(r => r.count > 0).map(({ label, count, color, bg }) => (
                    <div key={label} className={`flex items-center justify-between ${bg} rounded-xl px-3.5 py-2.5`}>
                      <span className="text-xs font-semibold text-gray-600">{label}</span>
                      <span className={`text-sm font-black ${color}`}>{count}</span>
                    </div>
                  ))}
                  {documents.length === 0 && (
                    <p className="text-xs text-gray-400">No documents yet</p>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs text-gray-400 mb-2">No documents uploaded</p>
                  <Link href="/documents" className="text-xs text-brand-red font-semibold hover:underline">
                    Upload now →
                  </Link>
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-brand-navy text-sm flex items-center gap-2">
                  <MessageSquare size={14} className="text-brand-red" />
                  Messages
                </h2>
                <Link href="/messages" className="flex items-center gap-1 text-xs text-brand-red font-semibold hover:underline">
                  View all <ChevronRight size={12} />
                </Link>
              </div>
              {messages && messages.length > 0 ? (
                <div className="space-y-2.5">
                  {messages.slice(0, 2).map(note => (
                    <div key={note.id} className="bg-gray-50 rounded-xl px-3.5 py-2.5">
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{note.text}</p>
                      <p className="text-[10px] text-gray-400 mt-1.5">
                        {new Date(note.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <MessageSquare size={24} className="text-gray-200 mx-auto mb-1.5" />
                  <p className="text-xs text-gray-400">No messages yet</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Quick actions ──────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Upload Docs',   href: '/documents',       icon: Upload,       color: 'text-blue-500',    bg: 'bg-blue-50' },
              { label: 'View Status',   href: '/my-applications', icon: Clock,        color: 'text-violet-500',  bg: 'bg-violet-50' },
              { label: 'Send Message',  href: '/messages',        icon: MessageSquare,color: 'text-teal-500',    bg: 'bg-teal-50' },
              { label: 'Edit Profile',  href: '/profile',         icon: FileText,     color: 'text-orange-500',  bg: 'bg-orange-50' },
            ].map(({ label, href, icon: Icon, color, bg }) => (
              <Link
                key={label}
                href={href}
                className="flex flex-col items-center gap-2 bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-sm hover:scale-[1.02] active:scale-[0.97] transition-all duration-150"
              >
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
                  <Icon size={16} className={color} />
                </div>
                <span className="text-xs font-bold text-brand-navy text-center">{label}</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
