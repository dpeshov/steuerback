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
    .from('applications').select('*').eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const app = applications?.[0]
  if (!app) redirect('/dashboard')

  const currentStatus = app.status as ApplicationStatus
  const currentIndex = STATUS_ORDER.indexOf(currentStatus)

  const { data: logs } = await supabase
    .from('status_logs').select('*').eq('application_id', app.id)
    .order('created_at', { ascending: false })

  const visibleSteps = STATUS_ORDER.filter(s => s !== 'rejected')
  const progressPct = Math.round((Math.max(0, currentIndex) / (visibleSteps.length - 1)) * 100)

  return (
    <div className="space-y-4">
      <div className="pt-1">
        <p className="text-[11px] font-bold text-brand-red uppercase tracking-widest mb-0.5">Status</p>
        <h1 className="text-2xl sm:text-3xl font-black text-brand-navy tracking-tight">Application status</h1>
        <p className="text-gray-400 text-sm mt-0.5">Tax year {app.tax_year}</p>
      </div>

      {/* Hero status card */}
      <div className="relative overflow-hidden bg-brand-navy rounded-2xl p-5 text-white shadow-lg shadow-brand-navy/15">
        <div className="absolute -top-8 -right-8 w-48 h-48 bg-brand-red/12 rounded-full blur-[50px] pointer-events-none" />
        <div className="absolute -bottom-6 -left-6 w-36 h-36 bg-blue-500/8 rounded-full blur-[40px] pointer-events-none" />
        <div className="relative">
          <p className="text-[10px] text-white/35 font-bold uppercase tracking-widest mb-1.5">Current status</p>
          <h2 className="text-lg font-black leading-snug mb-1">{STATUS_MESSAGES[currentStatus].message}</h2>
          <p className="text-white/45 text-xs mb-4 leading-relaxed">{STATUS_MESSAGES[currentStatus].next}</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white/10 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full bg-brand-success transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-[11px] text-white/40 font-bold shrink-0">{progressPct}%</span>
          </div>
        </div>
      </div>

      {/* Timeline card */}
      <div className="bg-white border border-black/[0.06] rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-50 bg-gray-50/50">
          <h3 className="font-bold text-brand-navy text-sm">Progress timeline</h3>
        </div>
        <div className="px-5 py-4">
          {STATUS_ORDER.filter(s => s !== 'rejected').map((s, i) => {
            const isDone = i < currentIndex
            const isCurrent = s === currentStatus
            const log = logs?.find(l => l.new_status === s)
            const isLast = i === STATUS_ORDER.filter(x => x !== 'rejected').length - 1

            return (
              <div key={s} className="flex gap-3.5">
                <div className="flex flex-col items-center shrink-0">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    isDone
                      ? 'bg-brand-success shadow-sm'
                      : isCurrent
                        ? 'bg-brand-red ring-4 ring-brand-red/12'
                        : 'bg-gray-100'
                  }`}>
                    {isDone
                      ? <CheckCircle size={13} className="text-white" />
                      : isCurrent
                        ? <Clock size={13} className="text-white" />
                        : <Circle size={13} className="text-gray-300" />
                    }
                  </div>
                  {!isLast && (
                    <div className={`w-0.5 h-7 my-1 rounded-full ${isDone ? 'bg-brand-success/30' : 'bg-gray-100'}`} />
                  )}
                </div>
                <div className="pb-3.5 pt-0.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-sm font-semibold leading-snug ${
                      isCurrent ? 'text-brand-navy' : isDone ? 'text-gray-400' : 'text-gray-200'
                    }`}>
                      {STATUS_LABELS[s]}
                    </p>
                    {isCurrent && (
                      <span className="text-[10px] bg-brand-red/10 text-brand-red font-bold px-2 py-0.5 rounded-full">Now</span>
                    )}
                  </div>
                  {log && (
                    <p className="text-[11px] text-gray-400 mt-0.5">{formatDate(log.created_at)}</p>
                  )}
                </div>
              </div>
            )
          })}

          {currentStatus === 'rejected' && (
            <div className="flex gap-3.5 mt-1">
              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <XCircle size={13} className="text-gray-400" />
              </div>
              <div className="pt-0.5">
                <p className="text-sm font-semibold text-gray-400">{STATUS_LABELS.rejected}</p>
                <p className="text-xs text-gray-400 mt-0.5">Please contact support.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
