'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  User, Briefcase, FileText, Clock, MessageSquare, CreditCard,
  Send, FileCheck, Banknote, AlertCircle, Lock,
  Phone, Mail, Building, Calendar, MapPin, Hash, Globe,
} from 'lucide-react'
import { STATUS_LABELS, formatDate } from '@/lib/utils'
import { updateApplicationStatus } from '@/app/actions/updateApplicationStatus'
import { addNote } from '@/app/actions/addNote'
import StatusChanger from './StatusChanger'
import DocumentReviewer from './DocumentReviewer'
import type { ApplicationStatus, DocumentReviewStatus } from '@/types/database'

// ── Types ──────────────────────────────────────────────────────
type AppData = {
  id: string
  tax_year: number
  status: ApplicationStatus
  payment_status: string
  applicant_name: string | null
  created_at: string
  submitted_at: string | null
  completed_at: string | null
  user_id: string
}

type ProfileData = {
  first_name?: string | null
  last_name?: string | null
  date_of_birth?: string | null
  nationality?: string | null
  phone?: string | null
  country_of_residence?: string | null
  city?: string | null
  address?: string | null
  passport_number?: string | null
  employer_name?: string | null
  work_start?: string | null
  work_end?: string | null
  gross_income_eur?: number | null
  iban?: string | null
  bank_name?: string | null
  swift_bic?: string | null
  bank_account_holder?: string | null
  bank_country?: string | null
  tax_id?: string | null
  student_status?: boolean | null
  university?: string | null
} | null

type DocData = {
  id: string
  document_type: string
  file_name: string
  file_path: string
  review_status: DocumentReviewStatus
  admin_note: string | null
  created_at: string
}

type LogData = {
  id: string
  old_status: string | null
  new_status: string
  changed_by: string
  reason: string | null
  created_at: string
}

type NoteData = {
  id: string
  text: string
  created_by: string
  is_public: boolean
  created_at: string
}

// ── Constants ──────────────────────────────────────────────────
const TABS = [
  { id: 'overview',  label: 'Overview',  icon: User },
  { id: 'profile',   label: 'Profile',   icon: Briefcase },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'timeline',  label: 'Timeline',  icon: Clock },
  { id: 'notes',     label: 'Notes',     icon: MessageSquare },
  { id: 'payments',  label: 'Payments',  icon: CreditCard },
]

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

const NATIONALITY_FLAGS: Record<string, string> = {
  Serbian: '🇷🇸', Croatian: '🇭🇷', Bosnian: '🇧🇦',
  Macedonian: '🇲🇰', 'North Macedonian': '🇲🇰', Slovenian: '🇸🇮',
  Bulgarian: '🇧🇬', Romanian: '🇷🇴', Albanian: '🇦🇱', Montenegrin: '🇲🇪',
  German: '🇩🇪', Polish: '🇵🇱', Czech: '🇨🇿', Slovak: '🇸🇰',
  Hungarian: '🇭🇺', Turkish: '🇹🇷', Ukrainian: '🇺🇦', Russian: '🇷🇺',
  Greek: '🇬🇷', Italian: '🇮🇹', Spanish: '🇪🇸', French: '🇫🇷',
  Dutch: '🇳🇱', Austrian: '🇦🇹', Other: '🌍',
}

// ── Main Component ─────────────────────────────────────────────
export default function ApplicationTabs({
  app,
  profile,
  documents,
  logs,
  notes,
  userEmail,
}: {
  app: AppData
  profile: ProfileData
  documents: DocData[]
  logs: LogData[]
  notes: NoteData[]
  userEmail: string
}) {
  const [activeTab, setActiveTab] = useState('overview')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const quickActions = [
    {
      label: 'Request Docs',
      status: 'missing_documents' as ApplicationStatus,
      color: 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200',
      icon: AlertCircle,
    },
    {
      label: 'Verify Docs',
      status: 'ready_for_submission' as ApplicationStatus,
      color: 'bg-teal-50 text-teal-700 hover:bg-teal-100 border-teal-200',
      icon: FileCheck,
    },
    {
      label: 'Submit to Finanzamt',
      status: 'submitted' as ApplicationStatus,
      color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200',
      icon: Send,
    },
    {
      label: 'Mark Refund Paid',
      status: 'completed' as ApplicationStatus,
      color: 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200',
      icon: Banknote,
    },
  ]

  const handleQuickAction = (newStatus: ApplicationStatus, label: string) => {
    if (!confirm(`Set status to "${STATUS_LABELS[newStatus]}"?`)) return
    startTransition(async () => {
      await updateApplicationStatus(app.id, newStatus, app.status, `Quick action: ${label}`)
      router.refresh()
    })
  }

  return (
    <div className="space-y-3">
      {/* Quick action buttons */}
      <div className="flex gap-2 flex-wrap">
        {quickActions.map(({ label, status, color, icon: Icon }) => (
          <button
            key={status}
            onClick={() => handleQuickAction(status, label)}
            disabled={isPending || app.status === status}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${color}`}
          >
            <Icon size={12} strokeWidth={2.5} />
            {label}
          </button>
        ))}
      </div>

      {/* Tabs panel */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Tab nav */}
        <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-hide">
          {TABS.map(({ id, label, icon: Icon }) => {
            const badge = id === 'documents' ? documents.length : id === 'notes' ? notes.length : 0
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-4 py-4 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === id
                    ? 'border-brand-red text-brand-red bg-red-50/40'
                    : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={13} />
                {label}
                {badge > 0 && (
                  <span className="ml-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        <div className="p-5 sm:p-6">
          {activeTab === 'overview'  && <OverviewTab  app={app} profile={profile} userEmail={userEmail} />}
          {activeTab === 'profile'   && <ProfileTab   profile={profile} userEmail={userEmail} />}
          {activeTab === 'documents' && <DocumentsTab documents={documents} />}
          {activeTab === 'timeline'  && <TimelineTab  logs={logs} />}
          {activeTab === 'notes'     && <NotesTab     applicationId={app.id} notes={notes} />}
          {activeTab === 'payments'  && <PaymentsTab  app={app} />}
        </div>
      </div>
    </div>
  )
}

// ── Overview Tab ───────────────────────────────────────────────
function OverviewTab({ app, profile, userEmail }: { app: AppData; profile: ProfileData; userEmail: string }) {
  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ')
    || app.applicant_name || '—'
  const initials = fullName !== '—'
    ? fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'
  const flag = NATIONALITY_FLAGS[profile?.nationality ?? ''] ?? ''

  const employmentRows = [
    { icon: Building, label: 'Employer',     value: profile?.employer_name },
    { icon: Calendar, label: 'Period',       value: profile?.work_start ? `${profile.work_start} → ${profile.work_end ?? 'present'}` : null },
    { icon: Hash,     label: 'Gross income', value: profile?.gross_income_eur ? `€${Number(profile.gross_income_eur).toLocaleString()}` : null },
    { icon: Globe,    label: 'Tax ID',       value: profile?.tax_id },
  ].filter(r => r.value)

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Applicant card */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-full bg-brand-navy flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">{initials}</span>
            </div>
            <div>
              <p className="font-bold text-brand-navy leading-tight">
                {fullName} {flag}
              </p>
              <p className="text-xs text-gray-400">{profile?.nationality ?? 'Unknown nationality'}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail size={12} className="text-gray-400 shrink-0" />
              <span className="truncate text-xs">{userEmail}</span>
            </div>
            {profile?.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone size={12} className="text-gray-400 shrink-0" />
                <span className="text-xs">{profile.phone}</span>
              </div>
            )}
            {profile?.country_of_residence && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin size={12} className="text-gray-400 shrink-0" />
                <span className="text-xs">
                  {profile.country_of_residence}{profile.city ? `, ${profile.city}` : ''}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Employment summary */}
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Employment</p>
          {employmentRows.length > 0 ? (
            <div className="space-y-2.5">
              {employmentRows.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon size={12} className="text-gray-400 shrink-0" />
                  <span className="text-xs text-gray-400 w-20 shrink-0">{label}</span>
                  <span className="text-xs text-brand-navy font-medium truncate">{value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">No employment data filled yet</p>
          )}
        </div>
      </div>

      {/* Status changer */}
      <StatusChanger applicationId={app.id} currentStatus={app.status} />
    </div>
  )
}

// ── Profile Tab ────────────────────────────────────────────────
function ProfileTab({ profile, userEmail }: { profile: ProfileData; userEmail: string }) {
  if (!profile) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm">
        No profile data yet
      </div>
    )
  }

  const sections = [
    {
      title: 'Personal',
      rows: [
        ['First name', profile.first_name],
        ['Last name', profile.last_name],
        ['Date of birth', profile.date_of_birth],
        ['Nationality', profile.nationality],
        ['Passport / ID', profile.passport_number],
        ['Phone', profile.phone],
        ['Email', userEmail],
        ['Address', profile.address],
        ['City', profile.city],
        ['Country', profile.country_of_residence],
      ],
    },
    {
      title: 'Employment',
      rows: [
        ['Employer', profile.employer_name],
        ['Work start', profile.work_start],
        ['Work end', profile.work_end ?? (profile.work_start ? 'Still employed' : null)],
        ['Gross income', profile.gross_income_eur ? `€${Number(profile.gross_income_eur).toLocaleString()}` : null],
        ['Student', profile.student_status === true ? 'Yes' : profile.student_status === false ? 'No' : null],
        ['University', profile.university],
      ],
    },
    {
      title: 'Banking',
      rows: [
        ['IBAN', profile.iban],
        ['Bank name', profile.bank_name],
        ['SWIFT / BIC', profile.swift_bic],
        ['Account holder', profile.bank_account_holder],
        ['Bank country', profile.bank_country],
      ],
    },
    {
      title: 'Tax',
      rows: [
        ['Tax ID', profile.tax_id],
      ],
    },
  ]

  return (
    <div className="space-y-7">
      {sections.map(({ title, rows }) => (
        <div key={title}>
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{title}</h3>
          <div className="divide-y divide-gray-50">
            {rows.map(([label, value]) => (
              <div key={label as string} className="flex justify-between items-center py-2.5 text-sm gap-4">
                <span className="text-gray-400 shrink-0">{label as string}</span>
                <span className={`font-medium text-right ${value ? 'text-brand-navy' : 'text-gray-300'}`}>
                  {(value as string) ?? '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Documents Tab ──────────────────────────────────────────────
function DocumentsTab({ documents }: { documents: DocData[] }) {
  if (!documents.length) {
    return (
      <div className="text-center py-12">
        <FileText size={32} className="text-gray-200 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">No documents uploaded yet</p>
      </div>
    )
  }
  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400">{documents.length} document{documents.length !== 1 ? 's' : ''}</p>
      {documents.map(doc => (
        <DocumentReviewer key={doc.id} doc={doc} />
      ))}
    </div>
  )
}

// ── Timeline Tab ───────────────────────────────────────────────
function TimelineTab({ logs }: { logs: LogData[] }) {
  if (!logs.length) {
    return (
      <div className="text-center py-12">
        <Clock size={32} className="text-gray-200 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">No status changes recorded yet</p>
      </div>
    )
  }

  return (
    <div className="relative pl-7">
      <div className="absolute left-3 top-3 bottom-3 w-px bg-gray-100" />
      <div className="space-y-4">
        {logs.map((log, i) => (
          <div key={log.id} className="relative">
            <div className={`absolute -left-7 top-2 w-4 h-4 rounded-full border-2 border-white shadow ${
              i === 0 ? 'bg-brand-red' : 'bg-gray-300'
            }`} />
            <div className="bg-gray-50 rounded-xl p-3.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  STATUS_COLORS[log.new_status as ApplicationStatus] ?? 'bg-gray-100 text-gray-600'
                }`}>
                  {STATUS_LABELS[log.new_status as ApplicationStatus] ?? log.new_status}
                </span>
                {log.old_status && (
                  <>
                    <span className="text-gray-300 text-xs">←</span>
                    <span className="text-xs text-gray-400">
                      {STATUS_LABELS[log.old_status as ApplicationStatus] ?? log.old_status}
                    </span>
                  </>
                )}
              </div>
              {log.reason && (
                <p className="text-xs text-gray-500 mt-1.5 italic">"{log.reason}"</p>
              )}
              <p className="text-[11px] text-gray-400 mt-1.5">{formatDate(log.created_at)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Notes Tab ─────────────────────────────────────────────────
function NotesTab({ applicationId, notes }: { applicationId: string; notes: NoteData[] }) {
  const [text, setText] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [sending, setSending] = useState(false)
  const router = useRouter()

  const send = async () => {
    if (!text.trim()) return
    setSending(true)
    await addNote(applicationId, text.trim(), isPublic)
    setText('')
    setSending(false)
    router.refresh()
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send()
  }

  return (
    <div className="space-y-4">
      {/* Notes list */}
      {notes.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare size={28} className="text-gray-200 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">No notes yet</p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {notes.map(note => (
            <div key={note.id} className="bg-gray-50 rounded-xl p-3.5">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-semibold text-brand-navy">Admin</span>
                <div className="flex items-center gap-2">
                  {note.is_public ? (
                    <span className="text-[10px] bg-blue-50 text-blue-600 font-semibold px-1.5 py-0.5 rounded-full">
                      Visible to applicant
                    </span>
                  ) : (
                    <Lock size={10} className="text-gray-300" />
                  )}
                  <span className="text-[11px] text-gray-400">{formatDate(note.created_at)}</span>
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{note.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add note form */}
      <div className="border-t border-gray-100 pt-4 space-y-3">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Add a note… (Ctrl+Enter to send)"
          rows={3}
          className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red/30 transition-all"
        />
        <div className="flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={e => setIsPublic(e.target.checked)}
              className="w-4 h-4 accent-brand-red rounded"
            />
            <span className="text-xs text-gray-500">Visible to applicant</span>
          </label>
          <button
            onClick={send}
            disabled={sending || !text.trim()}
            className="flex items-center gap-1.5 bg-brand-navy hover:bg-opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all"
          >
            <Send size={11} />
            {sending ? 'Saving...' : 'Add note'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Payments Tab ───────────────────────────────────────────────
function PaymentsTab({ app }: { app: AppData }) {
  const paymentColors: Record<string, string> = {
    paid:     'bg-green-100 text-green-700',
    pending:  'bg-yellow-100 text-yellow-700',
    unpaid:   'bg-gray-100 text-gray-500',
    failed:   'bg-red-100 text-red-700',
    refunded: 'bg-orange-100 text-orange-700',
  }

  return (
    <div className="space-y-4 max-w-sm">
      <div className="bg-gray-50 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payment Status</span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${paymentColors[app.payment_status] ?? 'bg-gray-100 text-gray-500'}`}>
            {app.payment_status ?? '—'}
          </span>
        </div>
        <div className="space-y-3 divide-y divide-gray-100">
          {[
            ['Service fee',  '€70.00'],
            ['Tax year',     String(app.tax_year)],
            ['Payment type', 'Upfront'],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between pt-3 text-sm first:pt-0">
              <span className="text-gray-400">{label}</span>
              <span className="font-semibold text-brand-navy">{value}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="text-xs text-gray-300 text-center">Full payment history coming soon</p>
    </div>
  )
}
