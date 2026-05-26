'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Upload, CheckCircle, Clock, XCircle, AlertCircle, FileText, ArrowRight,
  RotateCcw, ExternalLink, Camera, FolderOpen, X, PenLine,
} from 'lucide-react'
import type { DocumentType } from '@/types/database'

type AppEntry = { id: string; tax_year: number; status: string }
type DocType  = { type: DocumentType; label: string; description: string; required: boolean }

const DOC_TYPES: DocType[] = [
  { type: 'lohnsteuer',         label: 'Salary Certificate (Lohnsteuerbescheinigung)', description: 'Annual tax statement from your employer — ask HR for this', required: true },
  { type: 'payslip',            label: 'Pay Slips (Lohnabrechnung)',                   description: 'All monthly payslips for the months you worked in Germany',  required: true },
  { type: 'passport',           label: 'Passport / ID Card',                           description: 'Photo page clearly visible — camera works great here',        required: true },
  { type: 'bank_proof',         label: 'Bank Account (IBAN proof)',                    description: 'Bank statement or app screenshot showing your IBAN',           required: true },
  { type: 'power_of_attorney',  label: 'Power of Attorney (Vollmacht)',                description: 'Signed authorisation for SteuerBack to file on your behalf',   required: true },
  { type: 'student_proof',      label: 'Student Enrollment Certificate',               description: 'Only if you were studying during this tax year',               required: false },
  { type: 'home_tax_statement', label: 'Home Country Tax Statement',                   description: 'If you paid taxes in your home country the same year',         required: false },
  { type: 'work_contract',      label: 'Work Contract',                                description: 'Employment contract from your German employer',                 required: false },
]

type UploadedDoc = {
  id: string
  file_name: string
  file_path: string
  review_status: string
  admin_note?: string | null
}

const STATUS_UI = {
  pending:        { icon: Clock,       color: 'text-yellow-500', bg: 'bg-yellow-50',  label: 'Under Review',   badgeClass: 'bg-yellow-100 text-yellow-700' },
  approved:       { icon: CheckCircle, color: 'text-green-500',  bg: 'bg-green-50',   label: 'Approved',       badgeClass: 'bg-green-100 text-green-700' },
  rejected:       { icon: XCircle,     color: 'text-red-500',    bg: 'bg-red-50',     label: 'Rejected',       badgeClass: 'bg-red-100 text-red-600' },
  needs_reupload: { icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50',  label: 'Needs Reupload', badgeClass: 'bg-orange-100 text-orange-700' },
}

export default function DocumentsPage() {
  const [apps,        setApps]        = useState<AppEntry[]>([])
  const [appId,       setAppId]       = useState<string | null>(null)
  const [userId,      setUserId]      = useState<string | null>(null)
  const [documents,   setDocs]        = useState<Record<string, UploadedDoc>>({})
  const [uploading,   setUploading]   = useState<DocumentType | null>(null)
  const [error,       setError]       = useState<string | null>(null)
  // bottom sheet state
  const [sheet,       setSheet]       = useState<{ docType: DocType; doc?: UploadedDoc } | null>(null)
  const router = useRouter()

  const fileRef   = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const supabase  = createClient()

  const loadDocs = async (id: string) => {
    const { data } = await supabase.from('documents').select('*').eq('application_id', id)
    const map: Record<string, UploadedDoc> = {}
    ;(data ?? []).forEach(d => { map[d.document_type] = d })
    setDocs(map)
  }

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const { data: appsData } = await supabase
        .from('applications').select('id, tax_year, status')
        .eq('user_id', user.id).order('tax_year', { ascending: false })
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
    setAppId(id); setDocs({})
    await loadDocs(id)
  }

  const handleUpload = async (file: File) => {
    const docType = sheet?.docType.type
    if (!docType || !appId || !userId) return
    setSheet(null)           // close sheet immediately — good UX
    setUploading(docType)
    setError(null)
    const ext  = file.name.split('.').pop()
    const path = `${userId}/${appId}/${docType}/${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage.from('documents').upload(path, file, { upsert: true })
    if (upErr) { setError(upErr.message); setUploading(null); return }
    const existing = documents[docType]
    if (existing) {
      await supabase.from('documents').update({
        file_path: path, file_name: file.name, file_size: file.size,
        mime_type: file.type, review_status: 'pending', admin_note: null,
      }).eq('id', existing.id)
    } else {
      await supabase.from('documents').insert({
        application_id: appId, document_type: docType,
        file_path: path, file_name: file.name, file_size: file.size, mime_type: file.type,
      })
    }
    await loadDocs(appId)
    setUploading(null)
  }

  const openFile = async (filePath: string) => {
    const { data } = await supabase.storage.from('documents').createSignedUrl(filePath, 300)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  const requiredDocs  = DOC_TYPES.filter(d => d.required)
  const optionalDocs  = DOC_TYPES.filter(d => !d.required)
  const approvedCount = Object.values(documents).filter(d => d.review_status === 'approved').length
  const pendingCount  = Object.values(documents).filter(d => d.review_status === 'pending').length
  const missingCount  = requiredDocs.filter(d => !documents[d.type]).length
    + Object.values(documents).filter(d => d.review_status === 'needs_reupload').length
  const activeApp     = apps.find(a => a.id === appId)

  if (!apps.length) {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-black text-brand-navy">Documents</h1>
        <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center">
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText size={22} className="text-gray-300" />
          </div>
          <p className="font-bold text-brand-navy mb-1">No active application</p>
          <p className="text-gray-400 text-sm mb-5">Start an application first, then upload documents here.</p>
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
      <div>
        <p className="text-[11px] font-bold text-brand-red uppercase tracking-widest mb-0.5">Documents</p>
        <h1 className="text-2xl font-black text-brand-navy">Your Documents</h1>
        <p className="text-gray-400 text-sm mt-0.5">Upload or photograph each required document</p>
      </div>

      {/* Multi-app selector */}
      {apps.length > 1 && (
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Tax year</p>
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

      {/* Context + progress bar */}
      {activeApp && (
        <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 bg-brand-navy/5 rounded-xl flex items-center justify-center shrink-0">
              <FileText size={13} className="text-brand-red" />
            </div>
            <div>
              <p className="text-sm font-bold text-brand-navy">{activeApp.tax_year} Tax Return</p>
              <p className="text-[11px] text-gray-400">
                {approvedCount} approved · {missingCount} missing
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs font-black text-brand-navy">
              {approvedCount}/{requiredDocs.length}
            </p>
            <p className="text-[10px] text-gray-400">required</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { count: missingCount,  label: 'Missing',     Icon: AlertCircle, cls: 'border-red-100 bg-red-50/50',  ico: 'text-brand-red' },
          { count: pendingCount,  label: 'In Review',   Icon: Clock,       cls: 'border-gray-100',               ico: 'text-yellow-500' },
          { count: approvedCount, label: 'Approved',    Icon: CheckCircle, cls: 'border-gray-100',               ico: 'text-green-500' },
        ].map(({ count, label, Icon, cls, ico }) => (
          <div key={label} className={`bg-white border rounded-xl p-3.5 flex items-center gap-2.5 ${cls}`}>
            <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center shrink-0">
              <Icon size={14} className={ico} />
            </div>
            <div>
              <p className="text-xl font-black text-brand-navy leading-none">{count}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-brand-red flex items-center gap-2">
          <AlertCircle size={14} className="shrink-0" />
          Upload failed: {error}
        </div>
      )}

      {/* Required docs */}
      <DocSection
        title="Required Documents"
        subtitle="Upload all 5 to proceed with your tax return"
        docs={requiredDocs}
        documents={documents}
        uploading={uploading}
        onRowClick={(docType, doc) => {
          if (docType.type === 'power_of_attorney' && appId) {
            router.push(`/sign/${appId}`)
            return
          }
          setSheet({ docType, doc })
        }}
        onOpen={openFile}
      />

      {/* Optional docs */}
      <DocSection
        title="Optional Documents"
        subtitle="Upload only if applicable to your situation"
        docs={optionalDocs}
        documents={documents}
        uploading={uploading}
        onRowClick={(docType, doc) => setSheet({ docType, doc })}
        onOpen={openFile}
      />

      <p className="text-center text-xs text-gray-300 pb-4">PDF, JPG, PNG · Max 10 MB per file</p>

      {/* ── Bottom Sheet ──────────────────────────────────────────── */}
      {sheet && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setSheet(null)}
          />
          {/* Sheet */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl animate-slide-up"
            style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>

            <div className="px-5 pb-2 pt-3">
              {/* Header */}
              <div className="flex items-start justify-between mb-1">
                <div className="flex-1 min-w-0 pr-4">
                  <p className="font-black text-brand-navy text-base leading-snug">{sheet.docType.label}</p>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">{sheet.docType.description}</p>
                </div>
                <button
                  onClick={() => setSheet(null)}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center shrink-0 transition-colors"
                >
                  <X size={14} className="text-gray-500" />
                </button>
              </div>

              {/* Status if exists */}
              {sheet.doc && (() => {
                const si = STATUS_UI[sheet.doc.review_status as keyof typeof STATUS_UI]
                return si ? (
                  <div className={`flex items-center gap-2 mt-3 px-3 py-2 rounded-xl ${si.bg}`}>
                    <si.icon size={13} className={si.color} />
                    <span className={`text-xs font-semibold ${si.color}`}>{si.label}</span>
                    <span className="text-xs text-gray-400 ml-auto truncate max-w-[140px]">
                      {sheet.doc.file_name}
                    </span>
                  </div>
                ) : null
              })()}

              {/* Admin note */}
              {sheet.doc?.admin_note && (
                <div className="mt-2 bg-orange-50 border border-orange-100 rounded-xl px-3 py-2.5">
                  <p className="text-xs text-orange-700 leading-relaxed">
                    <strong>Note:</strong> {sheet.doc.admin_note}
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3 mt-5">
                {/* Take Photo — native camera on mobile */}
                <button
                  onClick={() => cameraRef.current?.click()}
                  className="flex flex-col items-center gap-2.5 bg-brand-navy text-white font-bold py-5 rounded-2xl transition-all active:scale-[0.97] hover:bg-[#252545] shadow-sm shadow-brand-navy/20"
                >
                  <Camera size={22} strokeWidth={1.8} />
                  <span className="text-sm">Take Photo</span>
                </button>

                {/* Choose File */}
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex flex-col items-center gap-2.5 bg-gray-100 hover:bg-gray-200 text-brand-navy font-bold py-5 rounded-2xl transition-all active:scale-[0.97]"
                >
                  <FolderOpen size={22} strokeWidth={1.8} className="text-gray-600" />
                  <span className="text-sm text-gray-700">Choose File</span>
                </button>
              </div>

              {/* View existing */}
              {sheet.doc && (
                <button
                  onClick={() => { openFile(sheet.doc!.file_path); setSheet(null) }}
                  className="flex items-center justify-center gap-2 w-full mt-3 py-3 text-sm text-brand-red font-semibold hover:bg-red-50 rounded-xl transition-colors"
                >
                  <ExternalLink size={13} />
                  View current file
                </button>
              )}

              {/* Hidden inputs */}
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.heic"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = '' }}
              />
              <input
                ref={cameraRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = '' }}
              />
            </div>
          </div>
        </>
      )}

      {/* Upload progress overlay */}
      {uploading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl px-8 py-6 flex flex-col items-center gap-3 shadow-xl mx-4">
            <div className="w-12 h-12 border-3 border-brand-red/20 border-t-brand-red rounded-full animate-spin" />
            <p className="font-bold text-brand-navy text-sm">Uploading…</p>
            <p className="text-xs text-gray-400">Please wait, don&apos;t close the app</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Doc Section ────────────────────────────────────────────────────────────────
function DocSection({
  title, subtitle, docs, documents, uploading, onRowClick, onOpen,
}: {
  title: string
  subtitle: string
  docs: DocType[]
  documents: Record<string, UploadedDoc>
  uploading: DocumentType | null
  onRowClick: (docType: DocType, doc?: UploadedDoc) => void
  onOpen: (path: string) => void
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50">
        <h2 className="font-bold text-brand-navy">{title}</h2>
        <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
      </div>
      <div className="divide-y divide-gray-50">
        {docs.map(docType => {
          const doc        = documents[docType.type]
          const statusInfo = doc ? STATUS_UI[doc.review_status as keyof typeof STATUS_UI] : null
          const isLoading  = uploading === docType.type
          const isVollmacht = docType.type === 'power_of_attorney'

          const StatusIcon = isVollmacht && !doc ? PenLine : (statusInfo?.icon ?? FileText)

          const circleClass = !doc
            ? isVollmacht ? 'bg-brand-red/10 text-brand-red' : 'bg-gray-100 text-gray-300'
            : statusInfo ? `${statusInfo.bg} ${statusInfo.color}` : 'bg-gray-100 text-gray-300'

          return (
            <button
              key={docType.type}
              onClick={() => onRowClick(docType, doc)}
              disabled={isLoading}
              className="flex items-center gap-4 px-5 py-4 w-full text-left hover:bg-gray-50/80 active:bg-gray-100 transition-colors disabled:opacity-60"
            >
              {/* Status circle */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${circleClass}`}>
                {isLoading
                  ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  : <StatusIcon size={16} strokeWidth={2} />
                }
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-brand-navy leading-snug">{docType.label}</p>
                {doc
                  ? <p className="text-[11px] text-gray-400 mt-0.5 truncate">📎 {doc.file_name}</p>
                  : isVollmacht
                    ? <p className="text-[11px] text-brand-red/70 mt-0.5 font-medium">Tap to sign digitally — no upload needed</p>
                    : <p className="text-[11px] text-gray-400 mt-0.5">Tap to upload or photograph</p>
                }
                {doc?.admin_note && (
                  <p className="text-[11px] text-orange-600 mt-0.5 line-clamp-1">⚠ {doc.admin_note}</p>
                )}
              </div>

              {/* Right badge */}
              <div className="flex items-center gap-2 shrink-0">
                {statusInfo
                  ? <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${statusInfo.badgeClass}`}>{statusInfo.label}</span>
                  : isVollmacht
                    ? <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-brand-red/10 text-brand-red">Sign Now</span>
                    : <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-50 text-brand-red">Missing</span>
                }
                <div className="w-6 h-6 flex items-center justify-center text-gray-300">
                  <svg width="6" height="10" viewBox="0 0 6 10" fill="none"><path d="M1 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
