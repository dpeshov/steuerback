import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { STATUS_LABELS } from '@/lib/utils'
import type { ApplicationStatus } from '@/types/database'
import ApplicationTabs from './ApplicationTabs'

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  draft:                  'bg-gray-100 text-gray-600',
  profile_incomplete:     'bg-orange-100 text-orange-700',
  documents_pending:      'bg-yellow-100 text-yellow-700',
  ready_for_payment:      'bg-blue-100 text-blue-700',
  paid:                   'bg-purple-100 text-purple-700',
  in_review:              'bg-indigo-100 text-indigo-700',
  missing_documents:      'bg-red-100 text-red-700',
  ready_for_submission:   'bg-teal-100 text-teal-700',
  submitted:              'bg-cyan-100 text-cyan-700',
  completed:              'bg-green-100 text-green-700',
  rejected:               'bg-gray-200 text-gray-500',
}

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: app } = await supabase
    .from('applications')
    .select('*, users(id, email, role, created_at)')
    .eq('id', id)
    .single()

  if (!app) notFound()

  const [
    { data: profile },
    { data: documents },
    { data: logs },
    { data: notes },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', app.user_id).single(),
    supabase.from('documents').select('*').eq('application_id', id).order('created_at', { ascending: false }),
    supabase.from('status_logs').select('*').eq('application_id', id).order('created_at', { ascending: false }),
    supabase.from('notes').select('id, text, created_by, is_public, created_at').eq('application_id', id).order('created_at', { ascending: true }),
  ])

  const user = app.users as { id: string; email: string; role: string; created_at: string } | null
  const status = app.status as ApplicationStatus
  const appId = `TR-${app.tax_year}-${id.slice(0, 5).toUpperCase()}`
  const displayName = app.applicant_name
    || [profile?.first_name, profile?.last_name].filter(Boolean).join(' ')
    || user?.email
    || '—'

  return (
    <div className="space-y-4">
      <Link
        href="/admin/applications"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand-navy transition-colors"
      >
        <ArrowLeft size={14} /> All applications
      </Link>

      {/* Application header card */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold text-gray-400 tracking-widest uppercase font-mono">{appId}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${STATUS_COLORS[status]}`}>
                {STATUS_LABELS[status]}
              </span>
            </div>
            <h1 className="text-xl font-bold text-brand-navy">{displayName}</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {user?.email ?? '—'} · Tax year {app.tax_year}
            </p>
          </div>
          <div className="text-right text-xs text-gray-400 shrink-0">
            <p>Created {new Date(app.created_at).toLocaleDateString('en-GB')}</p>
            {app.submitted_at && (
              <p>Submitted {new Date(app.submitted_at).toLocaleDateString('en-GB')}</p>
            )}
            {app.completed_at && (
              <p className="text-green-600 font-medium">Completed {new Date(app.completed_at).toLocaleDateString('en-GB')}</p>
            )}
          </div>
        </div>
      </div>

      <ApplicationTabs
        app={{ ...app, status }}
        profile={profile ?? null}
        documents={documents ?? []}
        logs={logs ?? []}
        notes={notes ?? []}
        userEmail={user?.email ?? '—'}
      />
    </div>
  )
}
