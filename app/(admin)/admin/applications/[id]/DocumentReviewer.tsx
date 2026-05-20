'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, AlertCircle, Clock, ExternalLink } from 'lucide-react'
import { updateDocumentReview } from '@/app/actions/updateDocumentReview'
import type { DocumentReviewStatus } from '@/types/database'

type Doc = {
  id: string
  document_type: string
  file_name: string
  file_path: string
  review_status: DocumentReviewStatus
  admin_note: string | null
  created_at: string
}

const STATUS_UI: Record<string, { icon: React.ElementType; color: string }> = {
  pending:        { icon: Clock,        color: 'text-yellow-500' },
  approved:       { icon: CheckCircle,  color: 'text-green-500' },
  rejected:       { icon: XCircle,      color: 'text-red-500' },
  needs_reupload: { icon: AlertCircle,  color: 'text-orange-500' },
}

const DOC_LABELS: Record<string, string> = {
  passport: 'Passport / ID',
  lohnsteuer: 'Lohnsteuerbescheinigung',
  payslip: 'Payslips',
  student_proof: 'Student Proof',
  home_tax_statement: 'Home Tax Statement',
  power_of_attorney: 'Power of Attorney',
  bank_proof: 'Bank Proof',
  work_contract: 'Work Contract',
}

export default function DocumentReviewer({ doc }: { doc: Doc }) {
  const [status, setStatus] = useState<DocumentReviewStatus>(doc.review_status)
  const [note, setNote] = useState(doc.admin_note ?? '')
  const [expanded, setExpanded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [noteError, setNoteError] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const requiresNote = status === 'rejected' || status === 'needs_reupload'
  const canSave = !requiresNote || note.trim().length > 0

  const save = async () => {
    if (requiresNote && !note.trim()) {
      setNoteError(true)
      return
    }
    setNoteError(false)
    setSaving(true)
    await updateDocumentReview(doc.id, status, note || null)
    setSaving(false)
    router.refresh()
  }

  const getSignedUrl = async () => {
    const { data } = await supabase.storage.from('documents').createSignedUrl(doc.file_path, 300)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  const ui = STATUS_UI[status] ?? STATUS_UI.pending

  return (
    <div className={`rounded-xl overflow-hidden border transition-colors ${
      status === 'rejected' ? 'border-red-200' :
      status === 'needs_reupload' ? 'border-orange-200' :
      status === 'approved' ? 'border-green-200' :
      'border-gray-100'
    }`}>
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <ui.icon size={16} className={ui.color} />
          <div>
            <p className="text-sm font-medium text-brand-navy">{DOC_LABELS[doc.document_type] ?? doc.document_type}</p>
            <p className="text-xs text-gray-400">{doc.file_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {doc.admin_note && (
            <span className="text-xs bg-orange-100 text-orange-600 font-medium px-2 py-0.5 rounded-full">Has note</span>
          )}
          <span className="text-xs text-gray-400">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-2 bg-gray-50 space-y-3 border-t border-gray-100">
          <button
            onClick={getSignedUrl}
            className="flex items-center gap-1.5 text-sm text-brand-red hover:underline font-medium"
          >
            <ExternalLink size={14} />
            Open file
          </button>

          {/* Quick action buttons */}
          <div className="flex gap-2">
            {(['approved', 'rejected', 'needs_reupload', 'pending'] as DocumentReviewStatus[]).map(s => {
              const icons = { approved: CheckCircle, rejected: XCircle, needs_reupload: AlertCircle, pending: Clock }
              const Icon = icons[s]
              const colors = {
                approved:       status === s ? 'bg-green-500 text-white'  : 'bg-green-50 text-green-700 hover:bg-green-100',
                rejected:       status === s ? 'bg-red-500 text-white'    : 'bg-red-50 text-red-700 hover:bg-red-100',
                needs_reupload: status === s ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-700 hover:bg-orange-100',
                pending:        status === s ? 'bg-gray-400 text-white'   : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              }
              const labels = { approved: 'Approve', rejected: 'Reject', needs_reupload: 'Reupload', pending: 'Pending' }
              return (
                <button
                  key={s}
                  onClick={() => { setStatus(s); setNoteError(false) }}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${colors[s]}`}
                >
                  <Icon size={12} />
                  {labels[s]}
                </button>
              )
            })}
          </div>

          {/* Note field — required for reject/reupload */}
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${requiresNote ? 'text-red-600' : 'text-gray-500'}`}>
              {requiresNote
                ? `Reason for ${status === 'rejected' ? 'rejection' : 'reupload'} — required`
                : 'Note to applicant (optional)'}
            </label>

            {requiresNote && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-2 text-xs text-red-600">
                <XCircle size={13} className="shrink-0 mt-0.5" />
                <span>The applicant will see this message explaining why their document was {status === 'rejected' ? 'rejected' : 'flagged for reupload'}. Be specific.</span>
              </div>
            )}

            <textarea
              value={note}
              onChange={e => { setNote(e.target.value); if (e.target.value.trim()) setNoteError(false) }}
              rows={requiresNote ? 3 : 2}
              placeholder={
                status === 'rejected'       ? 'e.g. Document appears invalid or does not match the application. Please contact support.' :
                status === 'needs_reupload' ? 'e.g. Document is blurry / IBAN not visible / wrong document type uploaded.' :
                'Optional note visible to the applicant…'
              }
              className={`w-full border rounded-lg px-3 py-2 text-sm resize-none outline-none transition-all ${
                noteError
                  ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
                  : requiresNote
                    ? 'border-orange-300 focus:ring-2 focus:ring-orange-200 focus:border-orange-400'
                    : 'border-gray-200 focus:ring-2 focus:ring-brand-red/30'
              }`}
            />
            {noteError && (
              <p className="text-xs text-red-500 mt-1 font-medium">A reason is required when declining a document.</p>
            )}
          </div>

          <button
            onClick={save}
            disabled={saving || !canSave}
            className={`font-semibold px-4 py-2 rounded-lg text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
              status === 'approved'
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : status === 'rejected'
                  ? 'bg-brand-red hover:bg-red-600 text-white'
                  : status === 'needs_reupload'
                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                    : 'bg-brand-navy hover:bg-opacity-90 text-white'
            }`}
          >
            {saving ? 'Saving...' : `Save — ${
              status === 'approved' ? '✓ Approve' :
              status === 'rejected' ? '✗ Reject' :
              status === 'needs_reupload' ? '⚠ Request reupload' :
              'Mark pending'
            }`}
          </button>
        </div>
      )}
    </div>
  )
}
