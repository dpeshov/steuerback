'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle, XCircle, AlertCircle, Clock,
  ExternalLink, FileText, Download, ChevronDown,
  Maximize2, X, Loader2, ZoomIn, ZoomOut,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { updateDocumentReview } from '@/app/actions/updateDocumentReview'
import type { DocumentReviewStatus } from '@/types/database'

type Doc = {
  id:            string
  document_type: string
  file_name:     string
  file_path:     string
  mime_type:     string
  file_size:     number
  review_status: DocumentReviewStatus
  admin_note:    string | null
  reviewed_at:   string | null
  created_at:    string
}

const STATUS_CFG: Record<DocumentReviewStatus, { label: string; icon: React.ElementType; color: string; ring: string }> = {
  pending:        { label: 'Pending',       icon: Clock,        color: 'text-yellow-500',  ring: 'border-yellow-200' },
  approved:       { label: 'Approved',      icon: CheckCircle,  color: 'text-emerald-500', ring: 'border-emerald-200' },
  rejected:       { label: 'Rejected',      icon: XCircle,      color: 'text-red-500',     ring: 'border-red-200' },
  needs_reupload: { label: 'Needs Reupload',icon: AlertCircle,  color: 'text-orange-500',  ring: 'border-orange-200' },
}

const ACTION_CFG: Record<DocumentReviewStatus, { label: string; active: string; idle: string }> = {
  approved:       { label: 'Approve',        active: 'bg-emerald-500 text-white', idle: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
  rejected:       { label: 'Reject',         active: 'bg-red-500 text-white',     idle: 'bg-red-50 text-red-700 hover:bg-red-100' },
  needs_reupload: { label: 'Req. Reupload',  active: 'bg-orange-500 text-white',  idle: 'bg-orange-50 text-orange-700 hover:bg-orange-100' },
  pending:        { label: 'Reset',          active: 'bg-gray-400 text-white',    idle: 'bg-gray-100 text-gray-600 hover:bg-gray-200' },
}

const DOC_LABELS: Record<string, string> = {
  passport:                'Passport / ID',
  lohnsteuerbescheinigung: 'Lohnsteuerbescheinigung',
  lohnsteuer:              'Lohnsteuerbescheinigung',
  payslip:                 'Payslips',
  student_proof:           'Student Proof',
  home_tax_statement:      'Home Tax Statement',
  power_of_attorney:       'Vollmacht',
  bank_proof:              'Bank Proof',
  bank_statement:          'Bank Statement',
  work_contract:           'Work Contract',
  residence_permit:        'Residence Permit',
  other:                   'Other Document',
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ── Inline document viewer ────────────────────────────────────────────────────
function DocPreview({ url, mimeType, fileName }: { url: string; mimeType: string; fileName: string }) {
  const [imgZoom, setImgZoom] = useState(false)
  const isImage = mimeType.startsWith('image/')
  const isPdf   = mimeType === 'application/pdf'

  if (isImage) {
    return (
      <div className="relative group">
        <img
          src={url}
          alt={fileName}
          className={`w-full rounded-xl border border-gray-100 cursor-zoom-in transition-all object-contain bg-gray-50 ${
            imgZoom ? 'max-h-none' : 'max-h-64'
          }`}
          onClick={() => setImgZoom(!imgZoom)}
        />
        <button
          onClick={() => setImgZoom(!imgZoom)}
          className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          title={imgZoom ? 'Collapse' : 'Expand'}
        >
          {imgZoom ? <ZoomOut size={12} /> : <ZoomIn size={12} />}
        </button>
      </div>
    )
  }

  if (isPdf) {
    return (
      <div className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
        {/* PDF viewer — iframe with height */}
        <iframe
          src={`${url}#toolbar=1&navpanes=0&scrollbar=1`}
          className="w-full h-[480px] bg-white"
          title={fileName}
        />
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-t border-gray-100">
          <span className="text-xs text-gray-400 truncate">{fileName}</span>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-semibold text-brand-red hover:text-red-500 transition-colors shrink-0"
          >
            <ExternalLink size={11} /> Open in new tab
          </a>
        </div>
      </div>
    )
  }

  // Fallback for other file types
  return (
    <div className="flex items-center gap-3 bg-gray-50 rounded-xl border border-gray-100 px-4 py-4">
      <FileText size={24} className="text-gray-300 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-brand-navy truncate">{fileName}</p>
        <p className="text-xs text-gray-400 mt-0.5">Preview not available for this file type</p>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 flex items-center gap-1 text-xs font-semibold text-brand-red hover:text-red-500 transition-colors"
      >
        <ExternalLink size={12} /> Open
      </a>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function DocumentReviewer({ doc }: { doc: Doc }) {
  const [expanded,  setExpanded]  = useState(false)
  const [status,    setStatus]    = useState<DocumentReviewStatus>(doc.review_status)
  const [note,      setNote]      = useState(doc.admin_note ?? '')
  const [saving,    setSaving]    = useState(false)
  const [noteError, setNoteError] = useState(false)
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [loadingUrl,setLoadingUrl]= useState(false)
  const router  = useRouter()
  const supabase = createClient()

  const requiresNote = status === 'rejected' || status === 'needs_reupload'
  const canSave      = !requiresNote || note.trim().length > 0
  const cfg          = STATUS_CFG[status]

  // Load signed URL on first expand
  const fetchUrl = useCallback(async () => {
    if (signedUrl) return
    setLoadingUrl(true)
    const { data } = await supabase.storage.from('documents').createSignedUrl(doc.file_path, 3600)
    setSignedUrl(data?.signedUrl ?? null)
    setLoadingUrl(false)
  }, [doc.file_path, signedUrl, supabase.storage])

  const handleExpand = () => {
    const next = !expanded
    setExpanded(next)
    if (next) fetchUrl()
  }

  const save = async () => {
    if (requiresNote && !note.trim()) { setNoteError(true); return }
    setNoteError(false)
    setSaving(true)
    await updateDocumentReview(doc.id, status, note || null)
    setSaving(false)
    router.refresh()
  }

  const openRaw = () => {
    if (signedUrl) window.open(signedUrl, '_blank')
  }

  const download = () => {
    if (!signedUrl) return
    const a = document.createElement('a')
    a.href = signedUrl
    a.download = doc.file_name
    a.click()
  }

  return (
    <div className={`rounded-2xl overflow-hidden border transition-all duration-200 ${cfg.ring}`}>

      {/* ── Row header ──────────────────────────────────────────────────── */}
      <button
        onClick={handleExpand}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left"
      >
        {/* Status icon */}
        <cfg.icon size={17} className={`${cfg.color} shrink-0`} />

        {/* Doc info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-brand-navy leading-snug">
            {DOC_LABELS[doc.document_type] ?? doc.document_type}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <p className="text-xs text-gray-400 truncate max-w-[200px]">{doc.file_name}</p>
            <span className="text-[10px] text-gray-300">·</span>
            <span className="text-[10px] text-gray-400">{formatBytes(doc.file_size)}</span>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            status === 'approved'       ? 'bg-emerald-100 text-emerald-700' :
            status === 'rejected'       ? 'bg-red-100 text-red-700' :
            status === 'needs_reupload' ? 'bg-orange-100 text-orange-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            {cfg.label}
          </span>
          {doc.admin_note && (
            <span className="text-[10px] font-semibold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">Note</span>
          )}
          <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* ── Expanded content ─────────────────────────────────────────────── */}
      {expanded && (
        <div className="border-t border-gray-100">

          {/* Preview section */}
          <div className="p-4 bg-gray-50/50 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Document Preview</p>
              <div className="flex items-center gap-2">
                {signedUrl && (
                  <>
                    <button
                      onClick={download}
                      className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-brand-navy transition-colors"
                      title="Download"
                    >
                      <Download size={12} /> Download
                    </button>
                    <span className="text-gray-200">|</span>
                    <button
                      onClick={openRaw}
                      className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-brand-red transition-colors"
                    >
                      <ExternalLink size={12} /> Open
                    </button>
                  </>
                )}
              </div>
            </div>

            {loadingUrl && (
              <div className="flex items-center justify-center h-32 bg-gray-100 rounded-xl">
                <Loader2 size={20} className="text-gray-300 animate-spin" />
              </div>
            )}

            {!loadingUrl && signedUrl && (
              <DocPreview url={signedUrl} mimeType={doc.mime_type} fileName={doc.file_name} />
            )}

            {!loadingUrl && !signedUrl && (
              <div className="flex items-center justify-center h-24 bg-gray-100 rounded-xl">
                <p className="text-xs text-gray-400">Unable to load preview</p>
              </div>
            )}
          </div>

          {/* Review actions */}
          <div className="p-4 space-y-4">

            {/* Quick action buttons */}
            <div>
              <p className="text-xs font-bold text-gray-500 mb-2.5">Set review status</p>
              <div className="flex gap-2 flex-wrap">
                {(Object.keys(ACTION_CFG) as DocumentReviewStatus[]).map(s => {
                  const a = ACTION_CFG[s]
                  const CfgIcon = STATUS_CFG[s].icon
                  return (
                    <button
                      key={s}
                      onClick={() => { setStatus(s); setNoteError(false) }}
                      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all ${
                        status === s ? a.active : a.idle
                      }`}
                    >
                      <CfgIcon size={12} />
                      {a.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Note field */}
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${
                requiresNote ? 'text-red-600' : 'text-gray-500'
              }`}>
                {requiresNote
                  ? `Reason for ${status === 'rejected' ? 'rejection' : 'reupload'} — required`
                  : 'Note to applicant (optional)'}
              </label>
              {requiresNote && (
                <p className="text-[11px] text-orange-600 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2 mb-2 leading-snug">
                  The applicant will see this message. Be specific about what needs to be corrected.
                </p>
              )}
              <textarea
                value={note}
                onChange={e => { setNote(e.target.value); if (e.target.value.trim()) setNoteError(false) }}
                rows={requiresNote ? 3 : 2}
                placeholder={
                  status === 'rejected'       ? 'e.g. Document appears invalid. Please contact support.' :
                  status === 'needs_reupload' ? 'e.g. Document is blurry / IBAN not visible.' :
                  'Optional note visible to the applicant…'
                }
                className={`w-full border rounded-xl px-3 py-2.5 text-sm resize-none outline-none transition-all ${
                  noteError
                    ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
                    : requiresNote
                      ? 'border-orange-300 focus:ring-2 focus:ring-orange-200'
                      : 'border-gray-200 focus:ring-2 focus:ring-brand-red/20'
                }`}
              />
              {noteError && (
                <p className="text-xs text-red-500 mt-1 font-medium">A reason is required when declining a document.</p>
              )}
            </div>

            {/* Save button */}
            <button
              onClick={save}
              disabled={saving || !canSave}
              className={`w-full font-bold px-4 py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed ${
                status === 'approved'
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                  : status === 'rejected'
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-sm shadow-red-500/20'
                    : status === 'needs_reupload'
                      ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-500/20'
                      : 'bg-brand-navy hover:bg-opacity-90 text-white'
              }`}
            >
              {saving
                ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
                : status === 'approved'       ? '✓ Approve document'
                : status === 'rejected'       ? '✗ Reject document'
                : status === 'needs_reupload' ? '⚠ Request re-upload'
                : 'Save — Mark pending'
              }
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
