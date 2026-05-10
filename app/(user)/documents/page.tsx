'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, CheckCircle, Clock, XCircle, AlertCircle, FileText, ArrowRight } from 'lucide-react'

type DocType = { type: string; label: string; description: string; required: boolean }

const DOC_TYPES: DocType[] = [
  { type: 'lohnsteuer',        label: 'Lohnsteuerbescheinigung', description: 'Tax certificate from your German employer',     required: true },
  { type: 'payslip',           label: 'Payslips',                description: 'Monthly payslips from your time in Germany',   required: true },
  { type: 'passport',          label: 'Passport / National ID',  description: 'Clear scan or photo of your travel document',  required: true },
  { type: 'power_of_attorney', label: 'Power of Attorney',       description: 'Signed authorization form from SteuerBack',   required: true },
  { type: 'bank_proof',        label: 'Bank / IBAN proof',       description: 'Document showing your IBAN and full name',     required: false },
  { type: 'student_proof',     label: 'Student enrollment',      description: 'Required only if you were studying',           required: false },
  { type: 'home_tax_statement',label: 'Home tax statement',      description: 'If you paid tax in your home country too',     required: false },
  { type: 'work_contract',     label: 'Work contract',           description: 'Employment contract from German employer',     required: false },
]

const STATUS_UI = {
  pending:        { icon: Clock,       color: 'text-yellow-500',      bg: 'bg-yellow-50 border-yellow-100',   label: 'Under review' },
  approved:       { icon: CheckCircle, color: 'text-brand-success',   bg: 'bg-green-50 border-green-100',     label: 'Approved' },
  rejected:       { icon: XCircle,     color: 'text-brand-red',       bg: 'bg-red-50 border-red-100',         label: 'Rejected' },
  needs_reupload: { icon: AlertCircle, color: 'text-orange-500',      bg: 'bg-orange-50 border-orange-100',   label: 'Needs reupload' },
}

export default function DocumentsPage() {
  const [appId, setAppId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [documents, setDocuments] = useState<Record<string, { id: string; file_name: string; review_status: string; admin_note?: string }>>({})
  const [uploading, setUploading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user!.id)
      const { data: apps } = await supabase
        .from('applications').select('id').eq('user_id', user!.id)
        .order('created_at', { ascending: false }).limit(1)
      if (!apps?.length) return
      const id = apps[0].id
      setAppId(id)
      const { data: docs } = await supabase.from('documents').select('*').eq('application_id', id)
      if (docs) {
        const map: typeof documents = {}
        docs.forEach(d => { map[d.document_type] = d })
        setDocuments(map)
      }
    }
    load()
  }, [supabase])

  const handleUpload = async (docType: string, file: File) => {
    if (!appId || !userId) return
    setUploading(docType)
    setError(null)
    const ext = file.name.split('.').pop()
    const path = `${userId}/${appId}/${docType}/${Date.now()}.${ext}`
    const { error: uploadErr } = await supabase.storage.from('documents').upload(path, file, { upsert: true })
    if (uploadErr) { setError(uploadErr.message); setUploading(null); return }
    const existing = documents[docType]
    if (existing) {
      await supabase.from('documents').update({ file_path: path, file_name: file.name, file_size: file.size, mime_type: file.type, review_status: 'pending', admin_note: null }).eq('id', existing.id)
    } else {
      await supabase.from('documents').insert({ application_id: appId, document_type: docType, file_path: path, file_name: file.name, file_size: file.size, mime_type: file.type })
    }
    const { data: docs } = await supabase.from('documents').select('*').eq('application_id', appId)
    if (docs) { const map: typeof documents = {}; docs.forEach(d => { map[d.document_type] = d }); setDocuments(map) }
    setUploading(null)
  }

  const requiredDocs = DOC_TYPES.filter(d => d.required)
  const optionalDocs = DOC_TYPES.filter(d => !d.required)
  const uploadedRequired = requiredDocs.filter(d => documents[d.type]).length
  const progress = Math.round((uploadedRequired / requiredDocs.length) * 100)

  if (!appId) {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-black text-brand-navy tracking-tight">Documents</h1>
        <div className="bg-white border border-gray-100 rounded-3xl p-10 shadow-sm text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText size={24} className="text-gray-400" />
          </div>
          <p className="font-bold text-brand-navy mb-1">No active application</p>
          <p className="text-gray-400 text-sm mb-5">Start an application first, then upload your documents here.</p>
          <a href="/application" className="inline-flex items-center gap-2 bg-brand-red text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-red-500 transition-colors">
            Start application <ArrowRight size={14} />
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-brand-navy tracking-tight">Documents</h1>
        <p className="text-gray-400 text-sm mt-0.5">Upload required files for your tax return</p>
      </div>

      {/* Progress */}
      <div className="bg-brand-navy rounded-3xl p-5 text-white">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold">Required documents</span>
          <span className="text-sm font-black text-white">{uploadedRequired}/{requiredDocs.length}</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2 mb-1">
          <div
            className="h-2 rounded-full bg-brand-success transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-white/40 mt-2">
          {progress === 100 ? '✓ All required documents uploaded — our team will review them.' : `${requiredDocs.length - uploadedRequired} more required document${requiredDocs.length - uploadedRequired !== 1 ? 's' : ''} to upload`}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-sm text-brand-red">
          Upload failed: {error}. Make sure the &quot;documents&quot; storage bucket is created in Supabase.
        </div>
      )}

      {/* Required docs */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Required</p>
        <div className="space-y-3">
          {requiredDocs.map(docType => <DocCard key={docType.type} docType={docType} doc={documents[docType.type]} uploading={uploading} onUpload={handleUpload} fileRefs={fileRefs} />)}
        </div>
      </div>

      {/* Optional docs */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Optional (if applicable)</p>
        <div className="space-y-3">
          {optionalDocs.map(docType => <DocCard key={docType.type} docType={docType} doc={documents[docType.type]} uploading={uploading} onUpload={handleUpload} fileRefs={fileRefs} />)}
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 pb-4">PDF, JPG, PNG — max 10 MB per file</p>
    </div>
  )
}

function DocCard({
  docType, doc, uploading, onUpload, fileRefs,
}: {
  docType: DocType
  doc?: { id: string; file_name: string; review_status: string; admin_note?: string }
  uploading: string | null
  onUpload: (type: string, file: File) => void
  fileRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>
}) {
  const isUploading = uploading === docType.type
  const statusInfo = doc ? STATUS_UI[doc.review_status as keyof typeof STATUS_UI] : null
  const StatusIcon = statusInfo?.icon

  return (
    <div className={`bg-white border rounded-2xl p-4 transition-all ${statusInfo ? `${statusInfo.bg} border` : 'border-gray-100'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <p className="text-sm font-bold text-brand-navy">{docType.label}</p>
            {doc && statusInfo && StatusIcon && (
              <div className={`flex items-center gap-1 text-xs font-semibold ${statusInfo.color}`}>
                <StatusIcon size={12} />
                {statusInfo.label}
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400">{docType.description}</p>
          {doc && <p className="text-xs text-gray-500 mt-1.5 truncate font-medium">📎 {doc.file_name}</p>}
          {doc?.admin_note && (
            <p className="text-xs text-orange-700 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2 mt-2">
              <strong>Note:</strong> {doc.admin_note}
            </p>
          )}
        </div>

        <div className="shrink-0">
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            ref={el => { fileRefs.current[docType.type] = el }}
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(docType.type, f) }}
          />
          <button
            onClick={() => fileRefs.current[docType.type]?.click()}
            disabled={isUploading}
            className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all disabled:opacity-50 ${
              doc
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                : 'bg-brand-red text-white hover:bg-red-500 hover:shadow-md hover:shadow-brand-red/20'
            }`}
          >
            <Upload size={12} />
            {isUploading ? 'Uploading...' : doc ? 'Replace' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  )
}
