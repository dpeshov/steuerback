'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, CheckCircle, Clock, XCircle, AlertCircle, FileText } from 'lucide-react'

type DocType = {
  type: string
  label: string
  description: string
  required: boolean
}

const DOC_TYPES: DocType[] = [
  { type: 'lohnsteuer', label: 'Lohnsteuerbescheinigung', description: 'Tax certificate from your German employer (required)', required: true },
  { type: 'payslip', label: 'Payslips', description: 'Monthly payslips from your time in Germany (required)', required: true },
  { type: 'passport', label: 'Passport / National ID', description: 'Clear photo of your travel document (required)', required: true },
  { type: 'power_of_attorney', label: 'Power of Attorney', description: 'Signed authorization form (required — download below)', required: true },
  { type: 'bank_proof', label: 'Bank statement / IBAN proof', description: 'Document showing your IBAN and name', required: false },
  { type: 'student_proof', label: 'Student enrollment proof', description: 'Required if you were a student while working', required: false },
  { type: 'home_tax_statement', label: 'Home country tax statement', description: 'If you also paid tax in your home country', required: false },
  { type: 'work_contract', label: 'Work contract', description: 'Employment contract from your German employer', required: false },
]

const STATUS_UI: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  pending:        { icon: Clock,        color: 'text-yellow-500', label: 'Under review' },
  approved:       { icon: CheckCircle,  color: 'text-brand-success', label: 'Approved' },
  rejected:       { icon: XCircle,      color: 'text-brand-red', label: 'Rejected' },
  needs_reupload: { icon: AlertCircle,  color: 'text-orange-500', label: 'Needs reupload' },
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
        .from('applications')
        .select('id')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(1)
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
    if (uploadErr) {
      setError(uploadErr.message)
      setUploading(null)
      return
    }

    const existing = documents[docType]
    if (existing) {
      await supabase.from('documents').update({
        file_path: path,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        review_status: 'pending',
        admin_note: null,
      }).eq('id', existing.id)
    } else {
      await supabase.from('documents').insert({
        application_id: appId,
        document_type: docType,
        file_path: path,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
      })
    }

    const { data: docs } = await supabase.from('documents').select('*').eq('application_id', appId)
    if (docs) {
      const map: typeof documents = {}
      docs.forEach(d => { map[d.document_type] = d })
      setDocuments(map)
    }

    setUploading(null)
  }

  if (!appId) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-brand-navy">Documents</h1>
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
          <FileText size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No active application found.</p>
          <a href="/application" className="mt-4 inline-block text-brand-red font-medium text-sm hover:underline">Start an application first</a>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">Documents</h1>
        <p className="text-gray-500 text-sm mt-1">Upload the required files for your tax return</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-brand-red">
          {error} — Make sure the &quot;documents&quot; storage bucket exists in Supabase.
        </div>
      )}

      <div className="space-y-4">
        {DOC_TYPES.map(({ type, label, description, required }) => {
          const doc = documents[type]
          const isUploading = uploading === type
          const statusInfo = doc ? STATUS_UI[doc.review_status] : null

          return (
            <div key={type} className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-brand-navy text-sm">{label}</p>
                    {required && <span className="text-xs bg-red-100 text-brand-red px-2 py-0.5 rounded-full font-medium">Required</span>}
                  </div>
                  <p className="text-xs text-gray-400">{description}</p>
                  {doc && (
                    <p className="text-xs text-gray-500 mt-1 truncate">📎 {doc.file_name}</p>
                  )}
                  {doc?.admin_note && (
                    <p className="text-xs text-orange-600 mt-1 bg-orange-50 px-2 py-1 rounded">Note: {doc.admin_note}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {statusInfo && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${statusInfo.color}`}>
                      <statusInfo.icon size={14} />
                      {statusInfo.label}
                    </div>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    ref={el => { fileRefs.current[type] = el }}
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) handleUpload(type, file)
                    }}
                  />
                  <button
                    onClick={() => fileRefs.current[type]?.click()}
                    disabled={isUploading}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${
                      doc
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        : 'bg-brand-red text-white hover:bg-red-600'
                    } disabled:opacity-50`}
                  >
                    <Upload size={13} />
                    {isUploading ? 'Uploading...' : doc ? 'Replace' : 'Upload'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-brand-surface rounded-2xl p-4 text-sm text-gray-500">
        <strong className="text-brand-navy">Accepted formats:</strong> PDF, JPG, PNG — max 10MB per file.
        Once all required documents are uploaded, our team will review them and update your status.
      </div>
    </div>
  )
}
