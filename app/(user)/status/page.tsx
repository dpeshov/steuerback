import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { STATUS_LABELS, STATUS_MESSAGES, formatDate } from '@/lib/utils'
import { CheckCircle, Circle, Clock } from 'lucide-react'
import type { ApplicationStatus } from '@/types/database'

const STATUS_ORDER: ApplicationStatus[] = [
  'draft', 'profile_incomplete', 'documents_pending', 'ready_for_payment',
  'paid', 'in_review', 'missing_documents', 'ready_for_submission',
  'submitted', 'completed',
]

export default async function StatusPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: applications } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const app = applications?.[0]
  if (!app) redirect('/dashboard')

  const currentStatus = app.status as ApplicationStatus
  const currentIndex = STATUS_ORDER.indexOf(currentStatus)

  const { data: logs } = await supabase
    .from('status_logs')
    .select('*')
    .eq('application_id', app.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">Application Status</h1>
        <p className="text-gray-500 text-sm mt-1">Tax year {app.tax_year}</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="mb-4 p-4 bg-brand-surface rounded-xl">
          <p className="font-semibold text-brand-navy">{STATUS_MESSAGES[currentStatus].message}</p>
          <p className="text-sm text-gray-500 mt-1">{STATUS_MESSAGES[currentStatus].next}</p>
        </div>

        <div className="space-y-0">
          {STATUS_ORDER.filter(s => s !== 'rejected').map((s, i) => {
            const isDone = i < currentIndex
            const isCurrent = s === currentStatus
            const log = logs?.find(l => l.new_status === s)

            return (
              <div key={s} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isDone ? 'bg-brand-success' : isCurrent ? 'bg-brand-red' : 'bg-gray-100'}`}>
                    {isDone ? <CheckCircle size={16} className="text-white" /> : isCurrent ? <Clock size={16} className="text-white" /> : <Circle size={16} className="text-gray-400" />}
                  </div>
                  {i < STATUS_ORDER.length - 2 && <div className="w-0.5 h-8 bg-gray-100 my-1" />}
                </div>
                <div className="pb-6">
                  <p className={`text-sm font-semibold ${isCurrent ? 'text-brand-red' : isDone ? 'text-brand-navy' : 'text-gray-400'}`}>
                    {STATUS_LABELS[s]}
                  </p>
                  {log && <p className="text-xs text-gray-400 mt-0.5">{formatDate(log.created_at)}</p>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
