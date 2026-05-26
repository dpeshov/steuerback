'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Upload, CheckCircle, Clock, XCircle, AlertCircle, FileText, ArrowRight,
  RotateCcw, ExternalLink,
} from 'lucide-react'
import type { DocumentType } from '@/types/database'

type AppEntry = { id: string; tax_year: number; status: string }
type DocType  = { type: DocumentType; label: string; description: string; required: boolean }

const DOC_TYPES: DocType[] = [
  { type: 'lohnsteuer',         label: 'Salary Certificate (Lohnsteuerbescheinigung)', description: 'Annual tax statement from your employer showing all earnings and taxes paid',     required: true },
  { type: 'payslip',            label: 'Pay Slips (Lohnabrechnung)',                   description: 'Monthly salary statements for all months worked',                                required: true },
  { type: 'passport',           label: 'Passport Copy',                                description: 'Clear copy of your passport photo page',                                         required: true },
  { type: 'bank_proof',         label: 'Bank Account Details (IBAN)',                  description: 'Bank statement or document showing your IBAN',                                    required: true },
  { type: 'power_of_attorney',  label: 'Power of Attorney',                            description: 'Signed authorization form from SteuerBack',                                      required: true },
  { type: 'student_proof',      label: 'Student Enrollment Certificate',               description: 'Required only if you were studying during the tax year',                          required: false },
  { type: 'home_tax_statement', label: 'Home Country Tax Statement',                   description: 'Tax certificate from your home country if you paid taxes there too',             required: false },
  { type: 'work_contract',      label: 'Work Contract',                                description: 'Employment contract from your German employer',                                   required: false },
]

type UploadedDoc = {
  id: string
  file_name: string
  file_path: string
  review_status: string
  admin_note?: string | null
}

const STATUS_UI = {
  pending:        { icon: Clock,       color: 'text-yellow-500', bg: 'bg-yellow-50',  label: 'Under Review',    badgeClass: 'bg-yellow-100 text-yellow-700' },
  approved:       { icon: CheckCircle, color: 'text-green-500',  bg: 'bg-green-50',   label: 'Approved',        badgeClass: 'bg-green-100 text-green-700' },
  rejected:       { icon: XCircle,     color: 'text-red-500',    bg: 'bg-red-50',     label: 'Rejected',        badgeClass: 'bg-red-100 text-red-600' },
  needs_reupload: { icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50',  label: 'Needs Reupload',  badgeClass: 'bg-orange-100 text-orange-700' },
}

export default function DocumentsPage() {
  const [apps,      setApps]      = useState<AppEntry[]>([])
  const [appId,     setAppId]     = useState<string | null>(null)
  const [userId,    setUserId]    = useState<string | null>(null)
  const [documents, setDocs]      = useState<Record<string, UploadedDoc>>({})
  const [uploading, setUploading] = useState<DocumentType | null>(null)
  const [error,     setError]     = useState<string | null>(null)
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const supabase = createClient()

  const loadDocs = async (id: string) => {
    const { data: docs } = await supabase.from('documents').select('*').eq('application_id', id)
    if (docs) {
      const map: Record<string, UploadedDoc> = {}
      docs.forEach(d => { map[d.document_type] = d })
      setDocs(map)
    } else {
      setDocs({})
    }
  }

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const { data: appsData } = await supabase
        .from('applications').select('id, tax_year, status')
        .eq('user_id', user.id)
        .order('tax_year', { ascending: false })
      if (appsData?.length) {
        setApps(appsData)
        setAppId(appsData[0].id)
        await loadDocs(appsData[0].id)
      }
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSelectApp = async (id: string) => {
    setAppId(id)
    setDocs({})
    await loadDocs(id)
  }

  const handleUpload = async (docType: DocumentType, file: File) => {
    if (!appId || !userId) return
    setUploading(docType)
    setError(null)
    const ext  = file.name.split('.').pop()
    const path = `${userId}/${appId}/${docType}/${Date.now()}.${ext}`
    const { error: uploadErr } = await supabase.storage.from('documents').upload(path, file, { upsert: true })
    if (uploadErr) { setError(uploadErr.message); setUploading(null); return }
    const existing = documents[docType]
    if (existing) {
      await supabase.from('documents').update({ file_path: path, file_name: file.name, file_size: file.size, mime_type: file.type, review_status: 'pending', admin_note: null }).eq('id', existing.id)
    } else {
      await supabase.from('documents').insert({ application_id: appId, document_type: docType, file_path: path, file_name: file.name, file_size: file.size, mime_type: file.type })
    }
    await loadDocs(appId)
    setUploading(null)
  }

  const openFile = async (filePath: string) => {
    const { data } = await supabase.storage.from('documents').createSignedUrl(filePath, 300)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  const requiredDocs   = DOC_TYPES.filter(d => d.required)
  const optionalDocs   = DOC_TYPES.filter(d => !d.required)
  const approvedCount  = Object.values(documents).filter(d => d.review_status === 'approved').length
  const pendingCount   = Object.values(documents).filter(d => d.review_status === 'pending').length
  const missingCount   = requiredDocs.filter(d => !documents[d.type]).length
    + Object.values(documents).filter(d => d.review_status === 'needs_reupload').length
  const activeApp      = apps.find(a => a.id === appId)

  if (!apps.length) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-black text-brand-navy">Documents</h1>
          <p className="text-gray-400 text-sm mt-0.5">Upload and manage your tax refund documents</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center">
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText size={22} className="text-gray-300" />
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
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-brand-navy">Documents</h1>
          <p className="text-gray-400 text-sm mt-0.5">Upload and manage your tax refund documents</p>
        </div>
        <button
          onClick={() => {
            const firstMissing = requiredDocs.find(d => !documents[d.type])
            if (firstMissing) fileRefs.current[firstMissing.type]?.click()
          }}
          className="flex items-center gap-1.5 bg-brand-red hover:bg-red-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all active:scale-95 shadow-sm shadow-brand-red/20"
        >
          <Upload size={13} /> Upload
        </button>
      </div>

      {/* Application selector — shown only when multiple apps */}
      {apps.length > 1 && (
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Select application year</p>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
            {apps.map(app => (
              <button
                key={app.id}
                onClick={() => handleSelectApp(app.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all shrink-0 active:scale-95 ${
                  appId === app.id
                    ? 'bg-brand-navy text-white shadow-sm'
                    : 'bg-white border border-gray-100 text-gray-600 hover:border-gray-200'
                }`}
              >
                {app.tax_year}
                {appId === app.id && <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Context badge for active app */}
      {activeApp && (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <FileText size={12} className="text-brand-red" />
          <span>Showing documents for <strong className="text-brand-navy">{activeApp.tax_year}</strong> tax year</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard count={missingCount}  label="Missing Required" icon={AlertCircle} className="border-red-100 bg-red-50/50"   iconClass="text-brand-red" />
        <StatCard count={pendingCount}  label="Under Review"     icon={Clock}       className="border-gray-100"                iconClass="text-yellow-500" />
        <StatCard count={approvedCount} label="Approved"         icon={CheckCircle} className="border-gray-100"                iconClass="text-green-500" />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-brand-red">
          Upload failed: {error}
        </div>
      )}

      {/* Required Documents */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="font-bold text-brand-navy">Required Documents</h2>
          <p className="text-sm text-gray-400 mt-0.5">Upload all required documents to proceed with your tax refund</p>
        </div>
        <div className="divide-y divide-gray-50">
          {requiredDocs.map(docType => (
            <DocRow
              key={docType.type}
              docType={docType}
              doc={documents[docType.type]}
              uploading={uploading}
              onUpload={handleUpload}
              onOpen={openFile}
              fileRefs={fileRefs}
            />
          ))}
        </div>
      </div>

      {/* Optional Documents */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="font-bold text-brand-navy">Optional Documents</h2>
          <p className="text-sm text-gray-400 mt-0.5">Upload if applicable to your situation</p>
        </div>
        <div className="divide-y divide-gray-50">
          {optionalDocs.map(docType => (
            <DocRow
              key={docType.type}
              docType={docType}
              doc={documents[docType.type]}
              uploading={uploading}
              onUpload={handleUpload}
              onOpen={openFile}
              fileRefs={fileRefs}
            />
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-gray-300 pb-4">PDF, JPG, PNG — max 10 MB per file</p>
    </div>
  )
}

// ── Stat Card ──
function StatCard({ count, label, icon: Icon, className, iconClass }: {
  count: number; label: string; icon: React.ElementType; className: string; iconClass: string
}) {
  return (
    <div className={`bg-white border rounded-xl p-4 flex items-center gap-3 ${className}`}>
      <div className="w-9 h-9 rounded-full bg-white border border-gray-100 flex items-center justify-center shrink-0">
        <Icon size={16} className={iconClass} />
      </div>
      <div>
        <p className="text-2xl font-black text-brand-navy leading-none">{count}</p>
        <p className="text-xs text-gray-400 mt-0.5">{label}</p>
      </div>
    </div>
  )
}

// ── Doc Row ──
function DocRow({
  docType, doc, uploading, onUpload, onOpen, fileRefs,
}: {
  docType: DocType
  doc?: UploadedDoc
  uploading: DocumentType | null
  onUpload: (type: DocumentType, file: File) => void
  onOpen: (path: string) => void
  fileRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>
}) {
  const isUploading = uploading === docType.type
  const statusInfo  = doc ? STATUS_UI[doc.review_status as keyof typeof STATUS_UI] : null
  const StatusIcon  = statusInfo?.icon ?? FileText
  const circleClass = !doc
    ? 'bg-gray-100 text-gray-300'
    : statusInfo ? `${statusInfo.bg} ${statusInfo.color}` : 'bg-gray-100 text-gray-300'

  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${circleClass}`}>
        <StatusIcon size={16} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-brand-navy">{docType.label}</p>
          {docType.required && (
            <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Required</span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{docType.description}</p>
        {doc && <p className="text-[11px] text-gray-500 mt-1 truncate">📎 {doc.file_name}</p>}
        {doc?.admin_note && (
          <p className="text-xs text-orange-700 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2 mt-2 leading-relaxed">
            <strong>Note from admin:</strong> {doc.admin_note}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {doc && statusInfo && (
          <span className={`hidden sm:inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusInfo.badgeClass}`}>
            {statusInfo.label}
          </span>
        )}
        {!doc && (
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-brand-red">Missing</span>
        )}
        {doc && (
          <button onClick={() => onOpen(doc.file_path)} className="p-1.5 text-gray-400 hover:text-brand-navy hover:bg-gray-100 rounded-lg transition-colors" title="View file">
            <ExternalLink size={13} />
          </button>
        )}
        <input
          type="file" accept=".pdf,.jpg,.jpeg,.png"
          ref={el => { fileRefs.current[docType.type] = el }}
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(docType.type, f) }}
        />
        <button
          onClick={() => fileRefs.current[docType.type]?.click()}
          disabled={isUploading}
          className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-all disabled:opacity-50 ${
            doc
              ? 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:shadow-sm'
              : 'bg-brand-red text-white hover:bg-red-500 shadow-sm shadow-brand-red/20'
          }`}
        >
          {isUploading ? 'Uploading…' : doc ? <><RotateCcw size={11} /> Replace</> : <><Upload size={11} /> Upload</>}
        </button>
      </div>
    </div>
  )
}
