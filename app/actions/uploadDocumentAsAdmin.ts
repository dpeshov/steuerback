'use server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function uploadDocumentAsAdmin(formData: FormData) {
  const sessionClient = await createClient()
  const { data: { user: admin } } = await sessionClient.auth.getUser()
  if (!admin) throw new Error('Unauthorized')

  const supabase = createAdminClient()
  const { data: adminProfile } = await supabase
    .from('users').select('role').eq('id', admin.id).single()
  if (adminProfile?.role !== 'admin') throw new Error('Forbidden')

  const file           = formData.get('file')           as File
  const applicationId  = formData.get('applicationId')  as string
  const documentType   = formData.get('documentType')   as string
  const userId         = formData.get('userId')         as string

  if (!file || !applicationId || !documentType || !userId) {
    throw new Error('Missing required fields')
  }

  const ext      = file.name.split('.').pop() ?? 'bin'
  const filePath = `${userId}/${applicationId}/${documentType}/admin_${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, await file.arrayBuffer(), {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    })

  if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`)

  await supabase.from('documents').insert({
    application_id: applicationId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document_type:  documentType as any,
    file_path:      filePath,
    file_name:      file.name,
    file_size:      file.size,
    mime_type:      file.type || 'application/octet-stream',
    review_status:  'approved',
    reviewed_by:    admin.id,
    reviewed_at:    new Date().toISOString(),
  })

  revalidatePath(`/admin/applications/${applicationId}`)
}
