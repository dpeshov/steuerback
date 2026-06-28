import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { ApplicationStatus } from '@/types/database'
import ApplicationTabs from './ApplicationTabs'

export default async function ApplicationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ tab?: string }>
}) {
  const { id } = await params
  const sp = searchParams ? await searchParams : {}
  const initialTab = sp.tab ?? 'overview'

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
    { data: payments },
    { data: employments },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', app.user_id).single(),
    supabase.from('documents').select('*').eq('application_id', id).order('created_at', { ascending: false }),
    supabase.from('status_logs').select('*').eq('application_id', id).order('created_at', { ascending: false }),
    supabase.from('notes').select('id, text, created_by, is_public, created_at').eq('application_id', id).order('created_at', { ascending: true }),
    supabase.from('payments').select('*').eq('application_id', id).order('created_at', { ascending: false }),
    supabase.from('employments').select('*').eq('user_id', app.user_id).order('tax_year', { ascending: false }),
  ])

  const user   = app.users as { id: string; email: string; role: string; created_at: string } | null
  const status = app.status as ApplicationStatus

  return (
    <ApplicationTabs
      app={{ ...app, status }}
      profile={profile ?? null}
      documents={documents ?? []}
      logs={logs ?? []}
      notes={notes ?? []}
      userEmail={user?.email ?? '—'}
      payments={payments ?? []}
      employments={employments ?? []}
      initialTab={initialTab}
    />
  )
}
