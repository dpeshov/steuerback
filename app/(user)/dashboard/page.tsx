import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { FileText, Clock, MessageSquare, AlertCircle, Upload, ChevronRight, Plus } from 'lucide-react'
import { STATUS_LABELS } from '@/lib/utils'
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

const PROGRESS_STAGES = [
  { label: 'Information Submitted',  desc: 'Your application has been received' },
  { label: 'Eligibility Checked',    desc: 'Your case has been reviewed for eligibility' },
  { label: 'Documents Uploaded',     desc: 'All required documents have been submitted' },
  { label: 'Submitted to Finanzamt', desc: 'Your application has been sent to German tax authorities' },
  { label: 'Refund Approved',        desc: 'Your tax refund has been approved' },
  { label: 'Refund Paid',            desc: 'The refund has been transferred to your account' },
]

function getStageIndex(status: ApplicationStatus): number {
  const map: Partial<Record<ApplicationStatus, number>> = {
    draft: 0, profile_incomplete: 0,
    documents_pending: 1, ready_for_payment: 1,
    paid: 2, in_review: 2, missing_documents: 2,
    ready_for_submission: 3,
    submitted: 4,
    completed: 6, rejected: 6,
  }
  return map[status] ?? 0
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('user_id', user!.id).single()

  const { data: applications } = await supabase
    .from('applications').select('*').eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const app = applications?.[0] ?? null
  const firstName = profile?.first_name
  const status = app?.status as ApplicationStatus | undefined
  const appId = app ? `TR-${app.tax_year}-${app.id.slice(0, 5).toUpperCase()}` : null

  const [{ data: documents }, { data: publicNotes }] = app
    ? await Promise.all([
        supabase.from('documents').select('id, review_status').eq('application_id', app.id),
        supabase.from('notes').select('id, text, created_by, created_at')
          .eq('application_id', app.id).eq('is_public', true)
          .order('created_at', { ascending: false }).limit(3),
      ])
    : [{ data: [] }, { data: [] }]

  const approvedDocs  = documents?.filter(d => d.review_status === 'approved').length ?? 0
  const pendingDocs   = documents?.filter(d => d.review_status === 'pending').length ?? 0
  const reuploadDocs  = documents?.filter(d => d.review_status === 'needs_reupload').length ?? 0
  const stageIndex    = status ? getStageIndex(status) : 0

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-brand-navy">
            Welcome back{firstName ? `, ${firstName}` : ''}!
          </h1>
          {appId && (
            <p className="text-sm text-gray-400 mt-0.5">Application ID: {appId}</p>
          )}
        </div>
        <div className="flex items-center gap-2.5">
          {status && (
            <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${STATUS_COLOR[status]}`}>
              {STATUS_LABELS[status]}
            </span>
          )}
          <Link
            href="/application"
            className="flex items-center gap-1.5 bg-brand-red text-white font-bold text-sm px-3.5 py-1.5 rounded-xl hover:bg-red-500 active:scale-95 transition-all shadow-sm shadow-brand-red/20"
          >
            <Plus size={13} strokeWidth={2.5} />
            New
          </Link>
        </div>
      </div>

      {app ? (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                label: 'Work Period',
                value: profile?.work_start
                  ? `${profile.work_start}${profile.work_end ? ` – ${profile.work_end}` : ' – present'}`
                  : 'Not set',
              },
              {
                label: 'Estimated Income',
                value: profile?.gross_income_eur
                  ? `${Number(profile.gross_income_eur).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €`
                  : 'Not set',
              },
              { label: 'Tax Year',       value: String(app.tax_year) },
              { label: 'Payment Option', value: 'Pay Upfront (€70)' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 p-4">
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                <p className="font-bold text-brand-navy text-sm leading-snug">{value}</p>
              </div>
            ))}
          </div>

          {/* Application Progress */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="font-bold text-brand-navy mb-5 flex items-center gap-2">
              <Clock size={15} className="text-brand-red" />
              Application Progress
            </h2>
            <div className="space-y-4">
              {PROGRESS_STAGES.map((stage, i) => {
                const isDone    = i < stageIndex
                const isCurrent = i === stageIndex && stageIndex < PROGRESS_STAGES.length
                return (
                  <div key={stage.label} className="flex items-start gap-3.5">
                    {/* Connector line + circle */}
                    <div className="flex flex-col items-center shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isDone || isCurrent ? 'bg-brand-red/10' : 'bg-gray-100'
                      } ${isCurrent ? 'ring-4 ring-brand-red/10' : ''}`}>
                        <div className={`w-3 h-3 rounded-full ${
                          isDone || isCurrent ? 'bg-brand-red' : 'bg-gray-300'
                        }`} />
                      </div>
                      {i < PROGRESS_STAGES.length - 1 && (
                        <div className={`w-0.5 h-4 my-0.5 ${isDone ? 'bg-brand-red/20' : 'bg-gray-100'}`} />
                      )}
                    </div>
                    <div className="pb-1">
                      <p className={`text-sm font-semibold ${isDone || isCurrent ? 'text-brand-navy' : 'text-gray-300'}`}>
                        {stage.label}
                      </p>
                      <p className={`text-xs mt-0.5 leading-relaxed ${isDone || isCurrent ? 'text-gray-400' : 'text-gray-200'}`}>
                        {stage.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Documents + Messages row */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Documents */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-brand-navy flex items-center gap-2">
                  <FileText size={15} className="text-brand-red" />
                  Required Documents
                </h2>
                <Link
                  href="/documents"
                  className="flex items-center gap-1 text-xs text-brand-red font-semibold hover:underline"
                >
                  Upload <Upload size={11} />
                </Link>
              </div>

              {documents && documents.length > 0 ? (
                <div className="space-y-2.5">
                  {approvedDocs > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Approved</span>
                      <span className="font-bold text-green-600">{approvedDocs}</span>
                    </div>
                  )}
                  {pendingDocs > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Under review</span>
                      <span className="font-bold text-yellow-600">{pendingDocs}</span>
                    </div>
                  )}
                  {reuploadDocs > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-1">
                        <AlertCircle size={11} className="text-red-400" /> Needs reupload
                      </span>
                      <span className="font-bold text-brand-red">{reuploadDocs}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-400">No documents uploaded yet.</p>
              )}
            </div>

            {/* Messages */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-brand-navy flex items-center gap-2">
                  <MessageSquare size={15} className="text-brand-red" />
                  Messages
                </h2>
                <Link
                  href="/messages"
                  className="flex items-center gap-1 text-xs text-brand-red font-semibold hover:underline"
                >
                  View all <ChevronRight size={11} />
                </Link>
              </div>

              {publicNotes && publicNotes.length > 0 ? (
                <div className="space-y-2.5">
                  {publicNotes.slice(0, 2).map(note => (
                    <div key={note.id} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{note.text}</p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {new Date(note.created_at).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">No messages yet.</p>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center">
          <div className="w-12 h-12 bg-brand-red/8 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText size={20} className="text-brand-red" />
          </div>
          <h2 className="text-lg font-black text-brand-navy mb-1">No applications yet</h2>
          <p className="text-gray-400 text-sm mb-5 max-w-[240px] mx-auto leading-relaxed">
            Start a German tax refund application. Takes about 10 minutes.
          </p>
          <Link
            href="/application"
            className="inline-flex items-center gap-2 bg-brand-red text-white font-bold px-5 py-3 rounded-xl text-sm hover:bg-red-500 transition-all shadow-sm shadow-brand-red/20"
          >
            Start application <ChevronRight size={14} />
          </Link>
        </div>
      )}
    </div>
  )
}
