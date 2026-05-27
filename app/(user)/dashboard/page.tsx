import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  TrendingUp, FileText, CheckCircle, Clock, MessageSquare,
  Plus, ChevronRight, AlertCircle, Upload, Banknote,
  ArrowUpRight, User, PenLine, CreditCard, Send,
  ShieldCheck, Star,
} from 'lucide-react'
import type { ApplicationStatus } from '@/types/database'

// ── Status config ────────────────────────────────────────────────────────────
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
  completed:              'Completed',
  rejected:               'Rejected',
}

const STATUS_PROGRESS: Record<ApplicationStatus, number> = {
  draft: 5, profile_incomplete: 12, documents_pending: 28,
  ready_for_payment: 40, paid: 52, in_review: 65,
  missing_documents: 45, ready_for_submission: 78,
  submitted: 88, completed: 100, rejected: 0,
}

const STATUS_COLOR: Record<ApplicationStatus, string> = {
  draft:                'bg-gray-100 text-gray-500',
  profile_incomplete:   'bg-orange-100 text-orange-700',
  documents_pending:    'bg-amber-100 text-amber-700',
  ready_for_payment:    'bg-blue-100 text-blue-700',
  paid:                 'bg-violet-100 text-violet-700',
  in_review:            'bg-indigo-100 text-indigo-700',
  missing_documents:    'bg-red-100 text-red-600',
  ready_for_submission: 'bg-teal-100 text-teal-700',
  submitted:            'bg-cyan-100 text-cyan-700',
  completed:            'bg-emerald-100 text-emerald-700',
  rejected:             'bg-gray-100 text-gray-500',
}

// ── Next-step config per status ──────────────────────────────────────────────
type NextStep = { label: string; href: string; icon: React.ElementType; accent: string; bg: string; description: string }
const NEXT_STEP: Partial<Record<ApplicationStatus, NextStep>> = {
  profile_incomplete: {
    label: 'Complete your profile',
    href: '/profile',
    icon: User,
    accent: 'text-orange-700',
    bg: 'bg-orange-50 border-orange-200',
    description: 'Fill in your personal details so we can prepare your tax return.',
  },
  documents_pending: {
    label: 'Upload required documents',
    href: '/documents',
    icon: Upload,
    accent: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
    description: 'Upload your salary certificate, passport, bank details and Vollmacht.',
  },
  ready_for_payment: {
    label: 'Pay to proceed',
    href: '/pay',
    icon: CreditCard,
    accent: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
    description: 'Documents verified! Choose a payment plan to continue.',
  },
  missing_documents: {
    label: 'Re-upload flagged documents',
    href: '/documents',
    icon: AlertCircle,
    accent: 'text-red-700',
    bg: 'bg-red-50 border-red-200',
    description: 'Some documents need to be re-uploaded. Check notes from your advisor.',
  },
  paid: {
    label: 'Sign your Vollmacht',
    href: '/documents',
    icon: PenLine,
    accent: 'text-violet-700',
    bg: 'bg-violet-50 border-violet-200',
    description: 'Sign the power of attorney so we can file on your behalf.',
  },
  in_review: {
    label: 'Under review — no action needed',
    href: '/status',
    icon: Clock,
    accent: 'text-indigo-700',
    bg: 'bg-indigo-50 border-indigo-200',
    description: 'Our team is reviewing your application. We\'ll notify you of any updates.',
  },
  ready_for_submission: {
    label: 'Ready for Finanzamt submission',
    href: '/status',
    icon: Send,
    accent: 'text-teal-700',
    bg: 'bg-teal-50 border-teal-200',
    description: 'Everything is verified. Your return will be submitted very soon.',
  },
  submitted: {
    label: 'Submitted — awaiting Finanzamt',
    href: '/status',
    icon: ShieldCheck,
    accent: 'text-cyan-700',
    bg: 'bg-cyan-50 border-cyan-200',
    description: 'Your return is with the German tax office. Processing takes 3–6 months.',
  },
  completed: {
    label: 'Refund processed! 🎉',
    href: '/my-applications',
    icon: Star,
    accent: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
    description: 'Your refund has been processed. Check your bank account.',
  },
}

// ── Refund estimate ───────────────────────────────────────────────────────────
function estimateRefund(gross: number | null): number | null {
  if (!gross || gross <= 0) return null
  // ~15-20% average for international workers in Germany
  const rate = gross < 20000 ? 0.18 : gross < 35000 ? 0.16 : 0.14
  return Math.round(gross * rate)
}

// ── Profile completeness ──────────────────────────────────────────────────────
function profileScore(p: Record<string, unknown> | null): { score: number; total: number; missing: string[] } {
  if (!p) return { score: 0, total: 10, missing: ['Complete your profile'] }
  const checks: [unknown, string][] = [
    [p.first_name,   'First name'],
    [p.last_name,    'Last name'],
    [p.date_of_birth,'Date of birth'],
    [p.nationality,  'Nationality'],
    [p.phone,        'Phone number'],
    [p.address,      'Home address'],
    [p.passport_number, 'Passport/ID'],
    [p.employer_name,'Employer name'],
    [p.gross_income_eur, 'Gross income'],
    [p.iban,         'IBAN'],
  ]
  const missing = checks.filter(([v]) => !v).map(([, label]) => label)
  return { score: checks.length - missing.length, total: checks.length, missing }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { data: profile },
    { data: applications },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', user!.id).single(),
    supabase.from('applications').select('*').eq('user_id', user!.id)
      .order('tax_year', { ascending: false }),
  ])

  // Stats
  const completedApps  = applications?.filter(a => a.status === 'completed') ?? []
  const activeApps     = applications?.filter(a => !['completed', 'rejected'].includes(a.status)) ?? []
  const totalRefunded  = completedApps.reduce((s, a) => s + (Number(a.refund_amount) || 0), 0)
  const latestActive   = activeApps[0] ?? applications?.[0] ?? null

  // Docs + messages for active app
  const [{ data: documents }, { data: messages }] = latestActive
    ? await Promise.all([
        supabase.from('documents').select('id, review_status, document_type').eq('application_id', latestActive.id),
        supabase.from('notes').select('id, text, created_by, created_at')
          .eq('application_id', latestActive.id).eq('is_public', true)
          .order('created_at', { ascending: false }).limit(2),
      ])
    : [{ data: [] }, { data: [] }]

  const firstName  = profile?.first_name
  const reupload   = documents?.filter(d => d.review_status === 'needs_reupload').length ?? 0
  const approved   = documents?.filter(d => d.review_status === 'approved').length ?? 0
  const pending    = documents?.filter(d => d.review_status === 'pending').length ?? 0
  const hasVollmacht = documents?.some(d => d.document_type === 'power_of_attorney') ?? false

  const activeStatus = latestActive?.status as ApplicationStatus | undefined
  const nextStep     = activeStatus ? NEXT_STEP[activeStatus] : null
  const progressPct  = activeStatus ? STATUS_PROGRESS[activeStatus] : 0
  const refundEst    = estimateRefund(profile?.gross_income_eur ?? null)
  const prof         = profileScore(profile as Record<string, unknown> | null)
  const profPct      = Math.round((prof.score / prof.total) * 100)

  const appId = latestActive
    ? `TR-${latestActive.tax_year}-${latestActive.id.slice(0, 5).toUpperCase()}`
    : null

  return (
    <div className="space-y-4">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-brand-navy via-[#1e1e3a] to-[#1a1a30] rounded-2xl overflow-hidden p-5 text-white shadow-lg">
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-brand-red/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 left-1/3 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative">
          {/* Greeting row */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">German Tax Refund Portal</p>
              <h1 className="text-xl font-black leading-tight">
                {firstName ? `Hey, ${firstName} 👋` : 'Welcome back 👋'}
              </h1>
            </div>
            <Link
              href="/application"
              className="flex items-center gap-1.5 bg-brand-red hover:bg-red-500 active:scale-95 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shrink-0 shadow-sm"
            >
              <Plus size={12} strokeWidth={2.5} />
              New Year
            </Link>
          </div>

          {/* Active app status block */}
          {latestActive ? (
            <div className="bg-white/8 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-black text-base">{latestActive.tax_year} Return</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLOR[activeStatus!]}`}>
                      {STATUS_LABEL[activeStatus!]}
                    </span>
                  </div>
                  {appId && <p className="text-white/35 text-[10px] mt-0.5">{appId}</p>}
                </div>
                {latestActive.refund_amount ? (
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-white/40 mb-0.5">Refund</p>
                    <p className="text-lg font-black text-emerald-400">
                      €{Number(latestActive.refund_amount).toLocaleString('de-DE', { minimumFractionDigits: 0 })}
                    </p>
                  </div>
                ) : refundEst ? (
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-white/40 mb-0.5">Est. refund</p>
                    <p className="text-lg font-black text-white/70">~€{refundEst.toLocaleString()}</p>
                  </div>
                ) : null}
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-white/40 font-semibold uppercase tracking-wide">Progress</span>
                  <span className="text-[10px] text-white/50 font-bold">{progressPct}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${progressPct}%`,
                      background: progressPct === 100
                        ? 'linear-gradient(90deg, #10B981, #34D399)'
                        : 'linear-gradient(90deg, #E63946, #f87171)',
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* No app yet */
            <div className="bg-white/8 rounded-xl p-4 text-center">
              <p className="text-white/50 text-sm mb-3">Start your first German tax refund</p>
              <Link
                href="/application"
                className="inline-flex items-center gap-2 bg-brand-red hover:bg-red-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all active:scale-95"
              >
                <Plus size={14} />
                Start application
              </Link>
            </div>
          )}

          {/* Reupload alert */}
          {reupload > 0 && (
            <Link
              href="/documents"
              className="flex items-center gap-2.5 mt-3 bg-red-500/20 border border-red-400/20 rounded-xl px-4 py-2.5 hover:bg-red-500/30 transition-colors"
            >
              <AlertCircle size={14} className="text-red-300 shrink-0" />
              <span className="text-red-200 text-sm font-semibold flex-1">
                {reupload} document{reupload !== 1 ? 's' : ''} need{reupload === 1 ? 's' : ''} reupload
              </span>
              <ArrowUpRight size={12} className="text-red-300" />
            </Link>
          )}
        </div>
      </div>

      {/* ── Next step banner ──────────────────────────────────────────────── */}
      {nextStep && latestActive && activeStatus !== 'rejected' && (
        <Link
          href={nextStep.href}
          className={`flex items-center gap-4 border rounded-2xl px-5 py-4 hover:opacity-90 transition-all active:scale-[0.99] ${nextStep.bg}`}
        >
          <div className={`w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm`}>
            <nextStep.icon size={18} className={nextStep.accent} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-black ${nextStep.accent}`}>{nextStep.label}</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-snug">{nextStep.description}</p>
          </div>
          <ChevronRight size={16} className="text-gray-400 shrink-0" />
        </Link>
      )}

      {/* ── Profile completion bar (shown when < 80%) ─────────────────────── */}
      {profPct < 80 && (
        <Link
          href="/profile"
          className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl px-5 py-4 hover:shadow-sm transition-all active:scale-[0.99]"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-sm font-bold text-brand-navy">Profile {profPct}% complete</p>
              <span className="text-xs font-semibold text-brand-red">{prof.score}/{prof.total} fields</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-red rounded-full transition-all duration-500"
                style={{ width: `${profPct}%` }}
              />
            </div>
            {prof.missing.length > 0 && (
              <p className="text-[11px] text-gray-400 mt-1.5">
                Missing: {prof.missing.slice(0, 3).join(', ')}{prof.missing.length > 3 ? ` +${prof.missing.length - 3} more` : ''}
              </p>
            )}
          </div>
          <ChevronRight size={16} className="text-gray-300 shrink-0" />
        </Link>
      )}

      {/* ── Stats row ────────────────────────────────────────────────────── */}
      {(applications?.length ?? 0) > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: 'Years Filed',
              value: String(applications?.length ?? 0),
              icon: FileText,
              iconBg: 'bg-blue-50',
              iconColor: 'text-blue-500',
            },
            {
              label: 'Completed',
              value: String(completedApps.length),
              icon: CheckCircle,
              iconBg: 'bg-emerald-50',
              iconColor: 'text-emerald-500',
            },
            {
              label: 'Total Refund',
              value: totalRefunded > 0
                ? `€${Math.round(totalRefunded).toLocaleString()}`
                : '€0',
              icon: Banknote,
              iconBg: 'bg-purple-50',
              iconColor: 'text-purple-500',
            },
          ].map(({ label, value, icon: Icon, iconBg, iconColor }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className={`w-8 h-8 ${iconBg} rounded-xl flex items-center justify-center mb-2`}>
                <Icon size={14} className={iconColor} />
              </div>
              <p className="text-xl font-black text-brand-navy leading-none">{value}</p>
              <p className="text-[10px] font-semibold text-gray-400 mt-1 leading-snug">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Status-aware quick actions ───────────────────────────────────── */}
      {latestActive && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-50">
            <h2 className="font-bold text-brand-navy text-sm">Quick actions</h2>
          </div>
          <div className="grid grid-cols-2 gap-px bg-gray-100">
            {buildQuickActions(activeStatus, hasVollmacht).map(({ label, href, icon: Icon, color, bg }) => (
              <Link
                key={label}
                href={href}
                className="flex flex-col items-center gap-2.5 bg-white py-5 px-4 hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <div className={`w-11 h-11 ${bg} rounded-2xl flex items-center justify-center`}>
                  <Icon size={18} className={color} />
                </div>
                <span className="text-xs font-bold text-brand-navy text-center leading-snug">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Docs + Messages ───────────────────────────────────────────────── */}
      {latestActive && (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Docs summary */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-brand-navy text-sm flex items-center gap-2">
                <FileText size={14} className="text-brand-red" />
                Documents
              </h2>
              <Link href="/documents" className="text-xs text-brand-red font-semibold hover:underline flex items-center gap-0.5">
                Manage <ChevronRight size={11} />
              </Link>
            </div>
            {(documents?.length ?? 0) > 0 ? (
              <div className="space-y-2">
                {([
                  { label: 'Approved',       count: approved,  color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { label: 'Under review',   count: pending,   color: 'text-yellow-700',  bg: 'bg-yellow-50' },
                  { label: 'Needs reupload', count: reupload,  color: 'text-red-600',     bg: 'bg-red-50' },
                ] as const).filter(r => r.count > 0).map(({ label, count, color, bg }) => (
                  <div key={label} className={`flex items-center justify-between ${bg} rounded-xl px-3.5 py-2.5`}>
                    <span className="text-xs font-semibold text-gray-700">{label}</span>
                    <span className={`text-sm font-black ${color}`}>{count}</span>
                  </div>
                ))}
                {approved === 0 && pending === 0 && reupload === 0 && (
                  <Link href="/documents" className="block text-center text-xs text-brand-red font-semibold py-2 hover:underline">
                    Start uploading →
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-3">
                <Upload size={22} className="text-gray-200 mx-auto mb-2" />
                <p className="text-xs text-gray-400 mb-2">No documents yet</p>
                <Link href="/documents" className="text-xs text-brand-red font-semibold hover:underline">Upload now →</Link>
              </div>
            )}
          </div>

          {/* Recent messages */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-brand-navy text-sm flex items-center gap-2">
                <MessageSquare size={14} className="text-brand-red" />
                Messages
              </h2>
              <Link href="/messages" className="text-xs text-brand-red font-semibold hover:underline flex items-center gap-0.5">
                Open chat <ChevronRight size={11} />
              </Link>
            </div>
            {messages && messages.length > 0 ? (
              <div className="space-y-2.5">
                {messages.map(note => (
                  <div key={note.id} className="bg-gray-50 rounded-xl px-3.5 py-2.5">
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{note.text}</p>
                    <p className="text-[10px] text-gray-400 mt-1.5">
                      {new Date(note.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-3">
                <MessageSquare size={22} className="text-gray-200 mx-auto mb-2" />
                <p className="text-xs text-gray-400">No messages yet</p>
                <p className="text-[11px] text-gray-300 mt-0.5">Your advisor will reach out with updates.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────────────────────── */}
      {(applications?.length ?? 0) === 0 && (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center">
          <div className="w-14 h-14 bg-brand-red/8 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText size={22} className="text-brand-red" />
          </div>
          <h2 className="text-lg font-black text-brand-navy mb-2">Ready to get your refund?</h2>
          <p className="text-gray-400 text-sm mb-2 max-w-[240px] mx-auto leading-relaxed">
            Most international workers in Germany get <strong className="text-brand-navy">€300–€2,000 back</strong>.
          </p>
          <p className="text-gray-300 text-xs mb-6">Takes about 10 minutes to start.</p>
          <Link
            href="/application"
            className="inline-flex items-center gap-2 bg-brand-red text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-red-500 transition-all active:scale-95 shadow-sm shadow-brand-red/20"
          >
            <Plus size={14} />
            Start first application
          </Link>
        </div>
      )}
    </div>
  )
}

// ── Status-aware quick actions builder ───────────────────────────────────────
function buildQuickActions(
  status: ApplicationStatus | undefined,
  hasVollmacht: boolean,
): { label: string; href: string; icon: React.ElementType; color: string; bg: string }[] {
  const all = [
    { label: 'Upload Docs',     href: '/documents',       icon: Upload,        color: 'text-blue-500',   bg: 'bg-blue-50',   statuses: ['documents_pending', 'missing_documents', 'paid'] },
    { label: 'Pay Now',         href: '/pay',              icon: CreditCard,    color: 'text-brand-red',  bg: 'bg-red-50',    statuses: ['ready_for_payment'] },
    { label: 'Sign Vollmacht',  href: '/documents',        icon: PenLine,       color: 'text-violet-600', bg: 'bg-violet-50', statuses: ['documents_pending', 'paid', 'missing_documents'] },
    { label: 'View Status',     href: '/status',           icon: TrendingUp,    color: 'text-indigo-500', bg: 'bg-indigo-50', statuses: ['in_review', 'submitted', 'ready_for_submission', 'completed'] },
    { label: 'Messages',        href: '/messages',         icon: MessageSquare, color: 'text-teal-500',   bg: 'bg-teal-50',   statuses: ['*'] },
    { label: 'Edit Profile',    href: '/profile',          icon: User,          color: 'text-orange-500', bg: 'bg-orange-50', statuses: ['draft', 'profile_incomplete', '*'] },
    { label: 'My Applications', href: '/my-applications',  icon: FileText,      color: 'text-gray-500',   bg: 'bg-gray-100',  statuses: ['*'] },
    { label: 'New Tax Year',    href: '/application',      icon: Plus,          color: 'text-emerald-600',bg: 'bg-emerald-50',statuses: ['completed'] },
  ]

  // Filter relevant + always-show, take first 4
  const relevant = all.filter(a =>
    a.statuses.includes('*') || (status && a.statuses.includes(status))
  )

  // Exclude "Sign Vollmacht" if already signed
  const filtered = hasVollmacht
    ? relevant.filter(a => a.label !== 'Sign Vollmacht')
    : relevant

  return filtered.slice(0, 4)
}
