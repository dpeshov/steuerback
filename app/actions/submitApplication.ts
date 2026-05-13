'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitApplication(applicationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: app } = await supabase
    .from('applications')
    .select('status')
    .eq('id', applicationId)
    .eq('user_id', user.id)
    .single()

  if (!app) throw new Error('Application not found')

  const submittableStatuses = ['draft', 'profile_incomplete', 'documents_pending', 'paid', 'missing_documents']
  if (!submittableStatuses.includes(app.status)) return

  await supabase.from('applications').update({
    status: 'in_review',
    updated_at: new Date().toISOString(),
  }).eq('id', applicationId).eq('user_id', user.id)

  await supabase.from('status_logs').insert({
    application_id: applicationId,
    old_status: app.status,
    new_status: 'in_review',
    changed_by: user.id,
    reason: 'Submitted by applicant',
  })

  revalidatePath('/dashboard')
}
