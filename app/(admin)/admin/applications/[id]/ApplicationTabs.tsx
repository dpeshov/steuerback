'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft, User, FileText, Clock, MessageSquare, CreditCard,
  Send, FileCheck, Banknote, AlertCircle, Download, Upload,
  Phone, Mail, MapPin, Calendar, Briefcase,
  CheckCircle, XCircle, Plus, Loader2, Building2,
} from 'lucide-react'
import { STATUS_LABELS, formatDate } from '@/lib/utils'
import { updateApplicationStatus } from '@/app/actions/updateApplicationStatus'
import { updateDocumentReview } from '@/app/actions/updateDocumentReview'
import { addNote } from '@/app/actions/addNote'
import { recordManualPayment } from '@/app/actions/recordManualPayment'
import { uploadDocumentAsAdmin } from '@/app/actions/uploadDocumentAsAdmin'
import type { ApplicationStatus, DocumentReviewStatus } from '@/types/database'

// ── Types ──────────────────────────────────────────────────────────────────
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
  refund_amount: number | null
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

type PaymentRecord = {
  id: string
  amount: number
  currency: string
  payment_type: string
  status: string
  stripe_payment_intent_id: string | null
  paid_at: string | null
  created_at: string
}

// ── Constants ───────────────────────────────────────────────────────────────
const ALL_STATUSES: ApplicationStatus[] = [
  'draft', 'profile_incomplete', 'documents_pending', 'ready_for_payment',
  'paid', 'in_review', 'missing_documents', 'ready_for_submission',
  'submitted', 'completed', 'rejected',
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

const DOC_TYPE_LABELS: Record<string, string> = {
  passport:           'Passport / ID',
  lohnsteuer:         'Lohnsteuerbescheinigung',
  payslip:            'Payslip',
  student_proof:      'Student Proof',
  home_tax_statement: 'Home Tax Statement',
  power_of_attorney:  'Power of Attorney',
  bank_proof:         'Bank Details',
  work_contract:      'Work Contract',
}

const DOC_STATUS_STYLE: Record<string, { label: string; className: string }> = {
  pending:        { label: 'Uploaded',       className: 'bg-blue-50 text-blue-600' },
  approved:       { label: 'Approved',       className: 'bg-green-50 text-green-700' },
  rejected:       { label: 'Rejected',       className: 'bg-red-50 text-red-600' },
  needs_reupload: { label: 'Needs Reupload', className: 'bg-orange-50 text-orange-600' },
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function fmtDateTime(iso: string) {
  return `${fmtDate(iso)} at ${new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function ApplicationTabs({
  app, profile, documents, logs, notes, userEmail, payments, initialTab,
}: {
  app: AppData
  profile: ProfileData
  documents: DocData[]
  logs: LogData[]
  notes: NoteData[]
  userEmail: string
  payments: PaymentRecord[]
  initialTab?: string
}) {
  const [activeTab, setActiveTab] = useState(initialTab ?? 'overview')
  const [headerStatus, setHeaderStatus] = useState<ApplicationStatus>(app.status)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const publicNotes   = notes.filter(n => n.is_public)
  const internalNotes = notes.filter(n => !n.is_public)

  const appId       = `TR-${app.tax_year}-${app.id.slice(0, 5).toUpperCase()}`
  const displayName = app.applicant_name
    || [profile?.first_name, profile?.last_name].filter(Boolean).join(' ')
    || userEmail
    || '—'

  const handleSaveStatus = () => {
    if (headerStatus === app.status) return
    startTransition(async () => {
      await updateApplicationStatus(app.id, headerStatus, app.status, null)
      router.refresh()
    })
  }

  const TABS = [
    { id: 'overview',  label: 'Overview',  icon: User },
    { id: 'profile',   label: 'Profile',   icon: User },
    { id: 'documents', label: 'Documents', icon: FileText,      badge: documents.length },
    { id: 'timeline',  label: 'Timeline',  icon: Clock },
    { id: 'messages',  label: 'Messages',  icon: MessageSquare, badge: publicNotes.length },
    { id: 'payments',  label: 'Payments',  icon: CreditCard },
  ]

  const quickActions = [
    { label: 'Request Document',    status: 'missing_documents'    as ApplicationStatus, icon: AlertCircle },
    { label: 'Mark Docs Verified',  status: 'ready_for_submission' as ApplicationStatus, icon: FileCheck },
    { label: 'Submit to Finanzamt', status: 'submitted'            as ApplicationStatus, icon: Send },
    { label: 'Mark Refund Paid',    status: 'completed'            as ApplicationStatus, icon: Banknote },
  ]

  return (
    <div className="space-y-5">
      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Link href="/admin/applications" className="text-gray-400 hover:text-brand-navy transition-colors">
              <ArrowLeft size={16} />
            </Link>
            <h1 className="text-2xl font-black text-brand-navy">{appId}</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${STATUS_COLORS[app.status]}`}>
              {STATUS_LABELS[app.status]}
            </span>
          </div>
          <p className="text-sm text-gray-400 ml-6">
            {displayName} &bull; Created {fmtDate(app.created_at)}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <select
            value={headerStatus}
            onChange={e => setHeaderStatus(e.target.value as ApplicationStatus)}
            className="border border-gray-200 bg-white rounded-xl px-3 py-2 text-sm text-brand-navy font-medium focus:outline-none focus:ring-2 focus:ring-brand-red/20"
          >
            {ALL_STATUSES.map(s => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
          <button
            onClick={handleSaveStatus}
            disabled={isPending || headerStatus === app.status}
            className="bg-brand-red hover:bg-red-500 active:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm px-4 py-2 rounded-xl transition-all"
          >
            {isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* ── Quick actions ── */}
      <div className="flex gap-2 flex-wrap">
        {quickActions.map(({ label, status, icon: Icon }) => (
          <button
            key={status}
            onClick={() => {
              if (!confirm(`Set status to "${STATUS_LABELS[status]}"?`)) return
              startTransition(async () => {
                await updateApplicationStatus(app.id, status, app.status, `Quick action: ${label}`)
                router.refresh()
              })
            }}
            disabled={isPending || app.status === status}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Icon size={12} strokeWidth={2.5} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Tabs panel ── */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-5 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-brand-red text-brand-red'
                  : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon size={14} />
              {label}
              {badge != null && badge > 0 && (
                <span className="ml-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'overview'  && <OverviewTab  app={app} profile={profile} userEmail={userEmail} documents={documents} internalNotes={internalNotes} />}
          {activeTab === 'profile'   && <ProfileTab   profile={profile} userEmail={userEmail} />}
          {activeTab === 'documents' && <DocumentsTab documents={documents} appId={app.id} userId={app.user_id} />}
          {activeTab === 'timeline'  && <TimelineTab  logs={logs} />}
          {activeTab === 'messages'  && <MessagesTab  applicationId={app.id} notes={publicNotes} appUserId={app.user_id} />}
          {activeTab === 'payments'  && <PaymentsTab  app={app} payments={payments} />}
        </div>
      </div>
    </div>
  )
}

// ── Overview Tab ────────────────────────────────────────────────────────────
function OverviewTab({ app, profile, userEmail, documents, internalNotes }: {
  app: AppData
  profile: ProfileData
  userEmail: string
  documents: DocData[]
  internalNotes: NoteData[]
}) {
  const [noteText, setNoteText] = useState('')
  const [sending, setSending] = useState(false)
  const router = useRouter()

  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || app.applicant_name || '—'
  const initials = fullName !== '—'
    ? fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'
  const flag      = NATIONALITY_FLAGS[profile?.nationality ?? ''] ?? ''
  const hasPayslip = documents.some(d => d.document_type === 'payslip')

  const sendNote = async () => {
    if (!noteText.trim()) return
    setSending(true)
    await addNote(app.id, noteText.trim(), false)
    setNoteText('')
    setSending(false)
    router.refresh()
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Applicant */}
        <div className="border border-gray-100 rounded-xl p-5">
          <h3 className="font-bold text-brand-navy mb-4">Applicant</h3>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-brand-red/10 flex items-center justify-center shrink-0">
              <span className="text-brand-red font-black text-sm">{initials}</span>
            </div>
            <div>
              <p className="font-bold text-brand-navy text-sm leading-tight">{fullName}</p>
              {profile?.nationality && (
                <p className="text-xs text-gray-400">{flag} {profile.nationality}</p>
              )}
            </div>
          </div>
          <div className="border-t border-gray-50 pt-3 space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Mail size={11} className="text-gray-400 shrink-0" />
              <span className="truncate">{userEmail}</span>
            </div>
            {profile?.phone && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Phone size={11} className="text-gray-400 shrink-0" />
                <span>{profile.phone}</span>
              </div>
            )}
            {(profile?.city || profile?.country_of_residence) && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <MapPin size={11} className="text-gray-400 shrink-0" />
                <span>{[profile?.city, profile?.country_of_residence].filter(Boolean).join(', ')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Work in Germany */}
        <div className="border border-gray-100 rounded-xl p-5">
          <h3 className="font-bold text-brand-navy mb-4">Work in Germany</h3>
          <div className="space-y-2.5 mb-4">
            {profile?.employer_name && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Briefcase size={13} className="text-gray-400 shrink-0" />
                <span>{profile.employer_name}</span>
              </div>
            )}
            {profile?.work_start && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={13} className="text-gray-400 shrink-0" />
                <span>{profile.work_start}{profile.work_end ? ` - ${profile.work_end}` : ' - present'}</span>
              </div>
            )}
            {profile?.gross_income_eur && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-gray-400 font-bold text-xs shrink-0">€</span>
                <span>~€{Number(profile.gross_income_eur).toLocaleString()} earnings</span>
              </div>
            )}
            {!profile?.employer_name && !profile?.work_start && (
              <p className="text-xs text-gray-400">No employment data yet</p>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
              Tax Year: {app.tax_year}
            </span>
            {profile?.tax_id && (
              <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">Has Tax ID</span>
            )}
            {hasPayslip && (
              <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">Has Payslips</span>
            )}
          </div>
        </div>

        {/* Payment */}
        <div className="border border-gray-100 rounded-xl p-5">
          <h3 className="font-bold text-brand-navy mb-4">Payment</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Service Fee</span>
              <span className="font-semibold text-brand-navy">€70</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Type</span>
              <span className="font-semibold text-brand-navy">Pay Upfront</span>
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-gray-400">Status</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                app.payment_status === 'paid'    ? 'bg-green-100 text-green-700' :
                app.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                   'bg-gray-100 text-gray-500'
              }`}>
                {app.payment_status ?? 'unpaid'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Internal Notes */}
      <div className="border border-gray-100 rounded-xl p-5">
        <h3 className="font-bold text-brand-navy mb-4 flex items-center gap-2">
          <FileText size={14} className="text-gray-400" />
          Internal Notes
        </h3>
        {internalNotes.length > 0 && (
          <div className="space-y-2.5 mb-4 max-h-48 overflow-y-auto">
            {internalNotes.map(note => (
              <div key={note.id} className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{note.text}</p>
                <p className="text-[11px] text-gray-400 mt-1.5">{formatDate(note.created_at)}</p>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-3">
          <textarea
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) sendNote() }}
            placeholder="Add an internal note..."
            rows={3}
            className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red/30 transition-all"
          />
          <button
            onClick={sendNote}
            disabled={sending || !noteText.trim()}
            className="self-end flex items-center gap-1.5 bg-brand-navy hover:bg-opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
          >
            {sending ? 'Saving…' : 'Add Note'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Profile Tab ─────────────────────────────────────────────────────────────
function ProfileTab({ profile, userEmail }: { profile: ProfileData; userEmail: string }) {
  if (!profile) {
    return <div className="text-center py-12 text-gray-400 text-sm">No profile data yet</div>
  }

  const flag = NATIONALITY_FLAGS[profile.nationality ?? ''] ?? ''

  const Field = ({ label, value }: { label: string; value?: string | null }) => (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className={`text-sm font-semibold ${value ? 'text-brand-navy' : 'text-gray-300'}`}>{value ?? '—'}</p>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="border border-gray-100 rounded-xl p-5">
          <h3 className="font-bold text-brand-navy mb-4">Personal Information</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <Field label="First Name"           value={profile.first_name} />
            <Field label="Last Name"            value={profile.last_name} />
            <Field label="Date of Birth"        value={profile.date_of_birth} />
            <Field label="Nationality"          value={profile.nationality ? `${flag} ${profile.nationality}` : null} />
            <Field label="Passport Number"      value={profile.passport_number} />
            <Field label="Country of Residence" value={profile.country_of_residence} />
          </div>
        </div>
        <div className="border border-gray-100 rounded-xl p-5">
          <h3 className="font-bold text-brand-navy mb-4">Contact Information</h3>
          <div className="space-y-4">
            <Field label="Email"   value={userEmail} />
            <Field label="Phone"   value={profile.phone} />
            <Field label="Address" value={[profile.address, profile.city, profile.country_of_residence].filter(Boolean).join(', ') || null} />
          </div>
        </div>
      </div>
      <div className="border border-gray-100 rounded-xl p-5">
        <h3 className="font-bold text-brand-navy mb-4">Bank Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Field label="IBAN"           value={profile.iban} />
          <Field label="Bank Name"      value={profile.bank_name} />
          <Field label="Account Holder" value={profile.bank_account_holder} />
        </div>
      </div>
      {(profile.employer_name || profile.work_start || profile.gross_income_eur) && (
        <div className="border border-gray-100 rounded-xl p-5">
          <h3 className="font-bold text-brand-navy mb-4">Employment</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <Field label="Employer"     value={profile.employer_name} />
            <Field label="Work Period"  value={profile.work_start ? `${profile.work_start} → ${profile.work_end ?? 'present'}` : null} />
            <Field label="Gross Income" value={profile.gross_income_eur ? `€${Number(profile.gross_income_eur).toLocaleString()}` : null} />
            {profile.tax_id          && <Field label="Tax ID"    value={profile.tax_id} />}
            {profile.student_status != null && <Field label="Student" value={profile.student_status ? 'Yes' : 'No'} />}
            {profile.university      && <Field label="University" value={profile.university} />}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Documents Tab ───────────────────────────────────────────────────────────
function DocumentsTab({ documents, appId, userId }: {
  documents: DocData[]
  appId: string
  userId: string
}) {
  const [loadingId,   setLoadingId]   = useState<string | null>(null)
  const [showUpload,  setShowUpload]  = useState(false)
  const [uploadType,  setUploadType]  = useState('')
  const [uploadFile,  setUploadFile]  = useState<File | null>(null)
  const [uploading,   setUploading]   = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router   = useRouter()
  const supabase = createClient()

  const handleReview = async (docId: string, status: DocumentReviewStatus) => {
    setLoadingId(docId)
    await updateDocumentReview(docId, status, null)
    setLoadingId(null)
    router.refresh()
  }

  const openFile = async (filePath: string) => {
    const { data } = await supabase.storage.from('documents').createSignedUrl(filePath, 300)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  const handleAdminUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadFile || !uploadType) return
    setUploadError('')
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', uploadFile)
      fd.append('applicationId', appId)
      fd.append('documentType', uploadType)
      fd.append('userId', userId)
      await uploadDocumentAsAdmin(fd)
      setUploadFile(null)
      setUploadType('')
      setShowUpload(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
      router.refresh()
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* ── Admin Upload Section ── */}
      <div className="border border-dashed border-brand-red/30 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="w-full flex items-center justify-between px-5 py-3.5 bg-brand-red/[0.03] hover:bg-brand-red/[0.06] transition-colors text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-brand-red/10 flex items-center justify-center">
              <Upload size={13} className="text-brand-red" />
            </div>
            <div>
              <p className="text-sm font-bold text-brand-navy">Upload document for applicant</p>
              <p className="text-xs text-gray-400">Admin upload — automatically marked as approved</p>
            </div>
          </div>
          <Plus
            size={16}
            className={`text-brand-red transition-transform duration-200 ${showUpload ? 'rotate-45' : ''}`}
          />
        </button>

        {showUpload && (
          <form onSubmit={handleAdminUpload} className="px-5 py-4 bg-white border-t border-dashed border-brand-red/20 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Document Type</label>
                <select
                  value={uploadType}
                  onChange={e => setUploadType(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red/40 bg-gray-50"
                >
                  <option value="">Select type…</option>
                  {Object.entries(DOC_TYPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">File</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  required
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.heic"
                  onChange={e => setUploadFile(e.target.files?.[0] ?? null)}
                  className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-red/10 file:text-brand-red hover:file:bg-brand-red/15 cursor-pointer border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50"
                />
              </div>
            </div>

            {uploadFile && (
              <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                <FileText size={12} className="text-gray-400 shrink-0" />
                <span className="truncate">{uploadFile.name}</span>
                <span className="text-gray-400 shrink-0">({(uploadFile.size / 1024).toFixed(0)} KB)</span>
              </div>
            )}

            {uploadError && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-xs px-3 py-2 rounded-lg">
                {uploadError}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={uploading || !uploadFile || !uploadType}
                className="flex items-center gap-2 bg-brand-red hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all"
              >
                {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                {uploading ? 'Uploading…' : 'Upload & Approve'}
              </button>
              <button
                type="button"
                onClick={() => { setShowUpload(false); setUploadError('') }}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── Existing Documents Table ── */}
      {documents.length === 0 ? (
        <div className="text-center py-10">
          <FileText size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No documents uploaded yet</p>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <h3 className="font-bold text-brand-navy text-base">Uploaded Documents</h3>
            <p className="text-sm text-gray-400">Review and approve documents submitted by the applicant</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Document', 'Type', 'Status', 'Uploaded', 'Admin Notes', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 pb-3 pr-4 last:pr-0">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {documents.map(doc => {
                  const style     = DOC_STATUS_STYLE[doc.review_status] ?? DOC_STATUS_STYLE.pending
                  const isLoading = loadingId === doc.id
                  return (
                    <tr key={doc.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 pr-4 text-brand-navy font-medium max-w-[160px] truncate">
                        {doc.file_name}
                      </td>
                      <td className="py-3.5 pr-4">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md font-medium whitespace-nowrap">
                          {DOC_TYPE_LABELS[doc.document_type] ?? doc.document_type}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${style.className}`}>
                          {style.label}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 text-gray-400 text-xs whitespace-nowrap">
                        {fmtDate(doc.created_at)}
                      </td>
                      <td className="py-3.5 pr-4 text-gray-400 text-xs max-w-[180px] truncate">
                        {doc.admin_note ?? '—'}
                      </td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openFile(doc.file_path)}
                            title="Download"
                            className="p-1.5 text-gray-400 hover:text-brand-navy hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Download size={13} />
                          </button>
                          {doc.review_status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleReview(doc.id, 'approved')}
                                disabled={isLoading}
                                title="Approve"
                                className="p-1.5 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-40"
                              >
                                <CheckCircle size={13} />
                              </button>
                              <button
                                onClick={() => handleReview(doc.id, 'needs_reupload')}
                                disabled={isLoading}
                                title="Request reupload"
                                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                              >
                                <XCircle size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Timeline Tab ────────────────────────────────────────────────────────────
function TimelineTab({ logs }: { logs: LogData[] }) {
  if (!logs.length) {
    return (
      <div className="text-center py-12">
        <Clock size={32} className="text-gray-200 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">No status changes recorded yet</p>
      </div>
    )
  }

  const STATUS_DESCRIPTIONS: Partial<Record<string, string>> = {
    draft:                'Application created',
    profile_incomplete:   'Profile needs completion',
    documents_pending:    'Awaiting documents',
    ready_for_payment:    'Payment required',
    paid:                 'Payment confirmed',
    in_review:            'Under admin review',
    missing_documents:    'Additional documents requested',
    ready_for_submission: 'Documents received',
    submitted:            'Submitted to Finanzamt',
    completed:            'Refund processed',
    rejected:             'Application rejected',
  }

  return (
    <div>
      <h3 className="font-bold text-brand-navy mb-1">Application Timeline</h3>
      <p className="text-sm text-gray-400 mb-6">Track the progress of this application</p>
      <div className="relative pl-8">
        <div className="absolute left-3 top-3 bottom-3 w-px bg-gray-100" />
        <div className="space-y-5">
          {logs.map((log, i) => (
            <div key={log.id} className="relative flex items-start justify-between gap-4">
              <div className={`absolute -left-8 top-0.5 w-6 h-6 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${
                i === 0 ? 'bg-brand-red' : 'bg-white border-gray-200'
              }`}>
                <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-white' : 'bg-gray-300'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold mb-1 ${
                  STATUS_COLORS[log.new_status as ApplicationStatus] ?? 'bg-gray-100 text-gray-600'
                }`}>
                  {STATUS_LABELS[log.new_status as ApplicationStatus] ?? log.new_status}
                </span>
                <p className="text-xs text-gray-500">
                  {log.reason || STATUS_DESCRIPTIONS[log.new_status] || ''}
                </p>
              </div>
              <p className="text-xs text-gray-400 whitespace-nowrap shrink-0">
                {fmtDateTime(log.created_at)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Messages Tab ────────────────────────────────────────────────────────────
function MessagesTab({ applicationId, notes, appUserId }: {
  applicationId: string
  notes: NoteData[]
  appUserId: string
}) {
  const [text, setText]     = useState('')
  const [sending, setSending] = useState(false)
  const router    = useRouter()
  const bottomRef = useRef<HTMLDivElement>(null)

  const send = async () => {
    if (!text.trim()) return
    setSending(true)
    await addNote(applicationId, text.trim(), true)
    setText('')
    setSending(false)
    router.refresh()
  }

  return (
    <div>
      <h3 className="font-bold text-brand-navy mb-1">Messages</h3>
      <p className="text-sm text-gray-400 mb-5">Communication with the applicant</p>
      <div className="min-h-[200px] max-h-[400px] overflow-y-auto space-y-3 mb-5">
        {notes.length === 0 ? (
          <div className="text-center py-10">
            <MessageSquare size={28} className="text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No messages yet</p>
          </div>
        ) : (
          notes.map(note => {
            const isAdmin = note.created_by !== appUserId
            return (
              <div key={note.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  isAdmin
                    ? 'bg-brand-red text-white rounded-tr-none'
                    : 'bg-gray-100 text-brand-navy rounded-tl-none'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{note.text}</p>
                  <p className={`text-[11px] mt-1 ${isAdmin ? 'text-white/60' : 'text-gray-400'}`}>
                    {fmtDateTime(note.created_at)}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-gray-100 pt-4 flex gap-3">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); send() } }}
          placeholder="Type a message..."
          className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red/30 transition-all"
        />
        <button
          onClick={send}
          disabled={sending || !text.trim()}
          className="flex items-center gap-1.5 bg-brand-red hover:bg-red-500 disabled:opacity-40 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all"
        >
          <Send size={13} />
        </button>
      </div>
    </div>
  )
}

// ── Payments Tab ────────────────────────────────────────────────────────────
function PaymentsTab({ app, payments }: { app: AppData; payments: PaymentRecord[] }) {
  const [amount,         setAmount]         = useState('')
  const [currency,       setCurrency]       = useState('EUR')
  const [method,         setMethod]         = useState<'cash' | 'bank_transfer'>('cash')
  const [advanceStatus,  setAdvanceStatus]  = useState(true)
  const [saving,         setSaving]         = useState(false)
  const [saved,          setSaved]          = useState(false)
  const [paymentError,   setPaymentError]   = useState('')

  const [refundAmount,   setRefundAmount]   = useState(app.refund_amount?.toString() ?? '')
  const [savingRefund,   setSavingRefund]   = useState(false)
  const [savedRefund,    setSavedRefund]    = useState(false)

  const router   = useRouter()
  const supabase = createClient()

  const handleManualPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) return
    setPaymentError('')
    setSaving(true)
    try {
      await recordManualPayment(app.id, parseFloat(amount), currency, method, advanceStatus)
      setAmount('')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      router.refresh()
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : 'Failed to record payment')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateRefund = async () => {
    setSavingRefund(true)
    const amt = refundAmount ? parseFloat(refundAmount) : null
    await supabase.from('applications').update({ refund_amount: amt }).eq('id', app.id)
    setSavingRefund(false)
    setSavedRefund(true)
    setTimeout(() => setSavedRefund(false), 2000)
    router.refresh()
  }

  const methodLabel = (piId: string | null) => {
    if (!piId) return 'Online (Stripe)'
    if (piId.includes('CASH'))         return 'Cash'
    if (piId.includes('BANK'))         return 'Bank Transfer'
    return 'Online (Stripe)'
  }

  const methodIcon = (piId: string | null) => {
    if (!piId || piId.includes('stripe') || !piId.startsWith('MANUAL')) return CreditCard
    if (piId.includes('CASH')) return Banknote
    return Building2
  }

  return (
    <div className="space-y-5">

      {/* ── Record Manual Payment ── */}
      <div className="border border-gray-100 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/60">
          <h3 className="font-bold text-brand-navy text-base flex items-center gap-2">
            <Banknote size={15} className="text-brand-red" />
            Record Manual Payment
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">Cash or bank transfer received outside of Stripe</p>
        </div>

        <form onSubmit={handleManualPayment} className="p-5 space-y-4">
          {/* Amount + Currency row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Amount</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red/40 bg-gray-50/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Currency</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red/40 bg-gray-50/50"
              >
                {['EUR', 'CHF', 'USD', 'GBP', 'MKD', 'RSD', 'BAM'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Method */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">Payment Method</label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { value: 'cash',          label: 'Cash',          icon: Banknote },
                { value: 'bank_transfer', label: 'Bank Transfer',  icon: Building2 },
              ] as const).map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMethod(value)}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                    method === value
                      ? 'border-brand-red bg-brand-red/5 text-brand-red'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Advance status checkbox */}
          <label className="flex items-center gap-3 cursor-pointer group">
            <div
              onClick={() => setAdvanceStatus(!advanceStatus)}
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                advanceStatus
                  ? 'bg-brand-red border-brand-red'
                  : 'border-gray-300 bg-white group-hover:border-gray-400'
              }`}
            >
              {advanceStatus && <CheckCircle size={12} className="text-white" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-brand-navy">Also mark application status as &ldquo;Paid&rdquo;</p>
              <p className="text-xs text-gray-400">Updates the application pipeline status</p>
            </div>
          </label>

          {paymentError && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs px-3 py-2.5 rounded-lg">
              {paymentError}
            </div>
          )}

          <button
            type="submit"
            disabled={saving || !amount}
            className={`flex items-center gap-2 text-white font-bold px-5 py-3 rounded-xl text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
              saved
                ? 'bg-green-500'
                : 'bg-brand-red hover:bg-red-500'
            }`}
          >
            {saving
              ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
              : saved
                ? <><CheckCircle size={14} /> Payment recorded!</>
                : <><Banknote size={14} /> Record Payment</>
            }
          </button>
        </form>
      </div>

      {/* ── Payment History ── */}
      <div className="border border-gray-100 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/60">
          <h3 className="font-bold text-brand-navy text-base flex items-center gap-2">
            <CreditCard size={15} className="text-gray-500" />
            Payment History
          </h3>
        </div>

        {payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <CreditCard size={28} className="text-gray-200" />
            <p className="text-gray-400 text-sm">No payments recorded</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {payments.map(pmt => {
              const MethodIcon = methodIcon(pmt.stripe_payment_intent_id)
              const isManual   = pmt.stripe_payment_intent_id?.startsWith('MANUAL')
              return (
                <div key={pmt.id} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      pmt.status === 'paid' ? 'bg-green-50' : 'bg-gray-100'
                    }`}>
                      <MethodIcon size={15} className={pmt.status === 'paid' ? 'text-green-600' : 'text-gray-400'} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-brand-navy">
                        {methodLabel(pmt.stripe_payment_intent_id)}
                        {isManual && <span className="ml-2 text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-normal">manual</span>}
                      </p>
                      <p className="text-xs text-gray-400">
                        {pmt.paid_at ? fmtDate(pmt.paid_at) : fmtDate(pmt.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-brand-navy">
                      {Number(pmt.amount).toLocaleString('de-DE', { minimumFractionDigits: 2 })} {pmt.currency}
                    </p>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      pmt.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {pmt.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Refund Details ── */}
      <div className="border border-gray-100 rounded-xl p-5 space-y-4">
        <h3 className="font-bold text-brand-navy text-base flex items-center gap-2">
          <Banknote size={15} className="text-green-500" />
          Tax Refund Amount
        </h3>

        {app.refund_amount ? (
          <div className="bg-green-50 border border-green-100 rounded-xl px-5 py-4 text-center">
            <p className="text-xs text-green-600 font-semibold mb-1">Refund Amount</p>
            <p className="text-3xl font-black text-green-700">
              €{Number(app.refund_amount).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-50 rounded-lg px-4 py-3">
            <Banknote size={14} className="text-gray-300 shrink-0" />
            Refund not yet determined
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-2">Set / Update Refund Amount (€)</label>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={refundAmount}
              onChange={e => setRefundAmount(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-red/40 focus:ring-2 focus:ring-brand-red/10"
            />
            <button
              onClick={handleUpdateRefund}
              disabled={savingRefund}
              className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-all disabled:opacity-50 ${
                savedRefund ? 'bg-green-500 text-white' : 'bg-brand-red text-white hover:bg-red-500'
              }`}
            >
              {savingRefund ? '…' : savedRefund ? 'Saved!' : 'Update'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
