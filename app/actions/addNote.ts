'use server'
import { createAdminClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
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
    is_public: isPublic,
  })

  revalidatePath(`/admin/applications/${applicationId}`)
}
