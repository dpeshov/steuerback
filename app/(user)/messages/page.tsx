import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MessagesClient from './MessagesClient'

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: apps } = await supabase
    .from('applications').select('id, tax_year')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)

  const app   = apps?.[0] ?? null
  const appId = app?.id ?? null

  const notes = appId
    ? (await supabase
        .from('notes')
        .select('id, text, created_by, created_at')
        .eq('application_id', appId)
        .eq('is_public', true)
        .order('created_at', { ascending: true })).data ?? []
    : []

  return (
    <MessagesClient
      applicationId={appId}
      taxYear={app?.tax_year ?? null}
      initialNotes={notes}
      userId={user.id}
    />
  )
}
