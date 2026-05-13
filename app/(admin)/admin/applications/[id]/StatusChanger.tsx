'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { STATUS_LABELS } from '@/lib/utils'
import type { ApplicationStatus } from '@/types/database'

const ALL_STATUSES: ApplicationStatus[] = [
  'draft', 'profile_incomplete', 'documents_pending', 'ready_for_payment',
  'paid', 'in_review', 'missing_documents', 'ready_for_submission',
  'submitted', 'completed', 'rejected',
]

export default function StatusChanger({
  applicationId,
  currentStatus,
}: {
  applicationId: string
  currentStatus: ApplicationStatus
}) {
  const [status, setStatus] = useState<ApplicationStatus>(currentStatus)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const save = async () => {
    if (status === currentStatus) return
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('applications').update({ status, updated_at: new Date().toISOString() }).eq('id', applicationId)

    await supabase.from('status_logs').insert({
      application_id: applicationId,
      old_status: currentStatus,
      new_status: status,
      changed_by: user?.id ?? 'admin',
      reason: note || null,
    })

    setSaving(false)
    router.refresh()
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="font-semibold text-brand-navy mb-4">Change status</h2>
      <div className="space-y-3">
        <select
          value={status}
          onChange={e => setStatus(e.target.value as ApplicationStatus)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red"
        >
          {ALL_STATUSES.map(s => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Optional note (shown in status history)"
          rows={2}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red"
        />
        <button
          onClick={save}
          disabled={saving || status === currentStatus}
          className="w-full bg-brand-navy hover:bg-navy-800 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
        >
          {saving ? 'Saving...' : 'Update status'}
        </button>
      </div>
    </div>
  )
}
