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

  const visibleSteps = STATUS_ORDER.filter(s => s !== 'rejected' && s !== 'missing_documents')
  const totalDone = visibleSteps.filter((s, i) => i < currentIndex).length
  const progressPct = Math.round((totalDone / (visibleSteps.length - 1)) * 100)

  return (
    <div className="space-y-5">
      <div className="pt-2">
        <p className="text-xs font-bold text-brand-red uppercase tracking-widest mb-1">Status</p>
        <h1 className="text-3xl font-black text-brand-navy tracking-tight">Application status</h1>
        <p className="text-gray-400 text-sm mt-1">Tax year {app.tax_year}</p>
      </div>

      {/* Current status hero */}
      <div className="relative overflow-hidden bg-brand-navy rounded-3xl p-6 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-red/12 rounded-full blur-[60px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/8 rounded-full blur-[50px] pointer-events-none" />
        <div className="relative">
          <p className="text-xs text-white/35 font-bold uppercase tracking-widest mb-2">Current status</p>
          <h2 className="text-xl font-black leading-snug mb-1">{STATUS_MESSAGES[currentStatus].message}</h2>
          <p className="text-white/45 text-sm mb-5 leading-relaxed">{STATUS_MESSAGES[currentStatus].next}</p>

          {/* Mini progress bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white/10 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full bg-brand-success transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-xs text-white/35 font-bold shrink-0">{progressPct}%</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h3 className="font-bold text-brand-navy text-sm">Progress timeline</h3>
        </div>
        <div className="px-6 py-5">
          <div className="space-y-0">
            {STATUS_ORDER.filter(s => s !== 'rejected').map((s, i) => {
              const isDone = i < currentIndex
              const isCurrent = s === currentStatus
              const log = logs?.find(l => l.new_status === s)
              const isLast = i === STATUS_ORDER.filter(x => x !== 'rejected').length - 1

              return (
                <div key={s} className="flex gap-4">
                  {/* Icon + connector */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isDone
                        ? 'bg-brand-success shadow-sm shadow-brand-success/30'
                        : isCurrent
                          ? 'bg-brand-red ring-4 ring-brand-red/15 shadow-sm shadow-brand-red/30'
                          : 'bg-gray-100'
                    }`}>
                      {isDone
                        ? <CheckCircle size={14} className="text-white" />
                        : isCurrent
                          ? <Clock size={14} className="text-white" />
                          : <Circle size={14} className="text-gray-300" />
                      }
                    </div>
                    {!isLast && (
                      <div className={`w-0.5 h-8 my-1 rounded-full ${isDone ? 'bg-brand-success/40' : 'bg-gray-100'}`} />
                    )}
                  </div>

                  {/* Label */}
                  <div className="pb-4 pt-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-bold ${
                        isCurrent ? 'text-brand-navy' : isDone ? 'text-gray-500' : 'text-gray-200'
                      }`}>
                        {STATUS_LABELS[s]}
                      </p>
                      {isCurrent && (
                        <span className="text-[10px] bg-brand-red/10 text-brand-red font-bold px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                      {isDone && (
                        <span className="text-[10px] bg-brand-success/10 text-brand-success font-bold px-2 py-0.5 rounded-full">
                          Done
                        </span>
                      )}
                    </div>
                    {log && (
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(log.created_at)}</p>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Rejected special case */}
            {currentStatus === 'rejected' && (
              <div className="flex gap-4 mt-1">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <XCircle size={14} className="text-gray-400" />
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
    </div>
  )
}
