'use server'
import { createAdminClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail, newMessageEmail } from '@/lib/email'
import { revalidatePath } from 'next/cache'

export async function addNote(applicationId: string, text: string, isPublic: boolean) {
  const sessionClient = await createClient()
  const { data: { user } } = await sessionClient.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const supabase = createAdminClient()
  await supabase.from('notes').insert({
    application_id: applicationId,
    text,
    created_by: user.id,
    is_public:  isPublic,
  })

  // If an admin sends a public message, email the application owner
  if (isPublic) {
    const { data: adminProfile } = await supabase
      .from('users').select('role').eq('id', user.id).single()

    if (adminProfile?.role === 'admin') {
      const { data: app } = await supabase
        .from('applications')
        .select('tax_year, users(email)')
        .eq('id', applicationId)
        .single()

      if (app) {
        const email = (app.users as { email: string } | null)?.email
        if (email) {
          await sendEmail(newMessageEmail(email, text, app.tax_year))
        }
      }
    }
  }

  revalidatePath(`/admin/applications/${applicationId}`)
  revalidatePath('/messages')
}
