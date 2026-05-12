'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, AlertCircle, Clock, ExternalLink } from 'lucide-react'
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
  const router = useRouter()
  const supabase = createClient()

  const save = async () => {
    setSaving(true)
    await supabase.from('documents').update({
      review_status: status,
      admin_note: note || null,
      reviewed_at: new Date().toISOString(),
    }).eq('id', doc.id)
    setSaving(false)
    router.refresh()
  }

  const getSignedUrl = async () => {
    const { data } = await supabase.storage.from('documents').createSignedUrl(doc.file_path, 300)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  const ui = STATUS_UI[status] ?? STATUS_UI.pending

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
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
        <span className="text-xs text-gray-400">{expanded ? '▲' : '▼'}</span>
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

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Review status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as DocumentReviewStatus)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/30"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="needs_reupload">Needs reupload</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Note to applicant (optional)</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={2}
              placeholder="e.g. Document is blurry, please reupload"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-red/30"
            />
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="bg-brand-navy text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-opacity-90 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Save review'}
          </button>
        </div>
      )}
    </div>
  )
}
