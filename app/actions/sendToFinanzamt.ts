'use server'
import { createAdminClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail, statusChangeEmail } from '@/lib/email'
import { revalidatePath } from 'next/cache'

export async function sendToFinanzamt(applicationId: string, oldStatus: string) {
  const sessionClient = await createClient()
  const { data: { user: admin } } = await sessionClient.auth.getUser()
  if (!admin) throw new Error('Unauthorized')

  const supabase = createAdminClient()

  const { data: adminProfile } = await supabase
    .from('users').select('role').eq('id', admin.id).single()
  if (adminProfile?.role !== 'admin') throw new Error('Forbidden')

  const now = new Date().toISOString()

  // Mark submitted + stamp submitted_at
  await supabase.from('applications').update({
    status: 'submitted',
    submitted_at: now,
    updated_at: now,
  }).eq('id', applicationId)

  // Log status change
  await supabase.from('status_logs').insert({
    application_id: applicationId,
    old_status: oldStatus,
    new_status: 'submitted',
    changed_by: admin.id,
    reason: 'Submitted to Finanzamt by admin',
  })

  // Notify user by email
  const { data: app } = await supabase
    .from('applications')
    .select('tax_year, users(email)')
    .eq('id', applicationId)
    .single()

  if (app) {
    const email = (app.users as { email: string } | null)?.email
    if (email) {
      await sendEmail(statusChangeEmail(email, 'submitted', app.tax_year))
    }
  }

  revalidatePath(`/admin/applications/${applicationId}`)
}
