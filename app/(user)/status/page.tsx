import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { STATUS_LABELS, STATUS_MESSAGES, formatDate } from '@/lib/utils'
import { CheckCircle, Circle, Clock, XCircle } from 'lucide-react'
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
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-brand-navy tracking-tight">Application status</h1>
        <p className="text-gray-400 text-sm mt-0.5">Tax year {app.tax_year}</p>
      </div>

      {/* Current status hero */}
      <div className="relative overflow-hidden bg-brand-navy rounded-3xl p-6 text-white">
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-red/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <p className="text-xs text-white/40 font-bold uppercase tracking-widest mb-2">Current status</p>
          <h2 className="text-xl font-black mb-1">{STATUS_MESSAGES[currentStatus].message}</h2>
          <p className="text-white/50 text-sm">{STATUS_MESSAGES[currentStatus].next}</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
        <h3 className="font-bold text-brand-navy text-sm mb-6">Progress timeline</h3>
        <div className="space-y-0">
          {STATUS_ORDER.filter(s => s !== 'rejected').map((s, i) => {
            const isDone = i < currentIndex
            const isCurrent = s === currentStatus
            const log = logs?.find(l => l.new_status === s)
            const isLast = i === STATUS_ORDER.filter(x => x !== 'rejected').length - 1

            return (
              <div key={s} className="flex gap-4">
                {/* Icon + connector */}
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isDone ? 'bg-brand-success' :
                    isCurrent ? 'bg-brand-red ring-4 ring-brand-red/20' :
                    'bg-gray-100'
                  }`}>
                    {isDone
                      ? <CheckCircle size={15} className="text-white" />
                      : isCurrent
                        ? <Clock size={15} className="text-white" />
                        : <Circle size={15} className="text-gray-300" />
                    }
                  </div>
                  {!isLast && (
                    <div className={`w-0.5 h-8 my-1 rounded-full ${isDone ? 'bg-brand-success' : 'bg-gray-100'}`} />
                  )}
                </div>

                {/* Label */}
                <div className="pb-6 pt-1 flex-1">
                  <p className={`text-sm font-bold ${
                    isCurrent ? 'text-brand-red' :
                    isDone ? 'text-brand-navy' :
                    'text-gray-300'
                  }`}>
                    {STATUS_LABELS[s]}
                  </p>
                  {log && (
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(log.created_at)}</p>
                  )}
                  {isCurrent && (
                    <span className="inline-block mt-1 text-xs bg-brand-red/10 text-brand-red font-semibold px-2 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                </div>
              </div>
            )
          })}

          {/* Rejected special case */}
          {currentStatus === 'rejected' && (
            <div className="flex gap-4 mt-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                <XCircle size={15} className="text-gray-500" />
              </div>
              <div className="pt-1">
                <p className="text-sm font-bold text-gray-500">{STATUS_LABELS.rejected}</p>
                <p className="text-xs text-gray-400 mt-1">Please contact support for assistance.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
