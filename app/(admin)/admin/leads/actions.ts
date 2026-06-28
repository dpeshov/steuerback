'use server'
import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateLeadStatus(leadId: string, status: string) {
  const supabase = createAdminClient()
  await supabase
    .from('leads')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', leadId)
  revalidatePath('/admin/leads')
}

export async function updateLeadNotes(leadId: string, notes: string) {
  const supabase = createAdminClient()
  await supabase
    .from('leads')
    .update({ admin_notes: notes, updated_at: new Date().toISOString() })
    .eq('id', leadId)
  revalidatePath('/admin/leads')
}

export async function inviteLead(leadId: string) {
  const supabase = createAdminClient()

  const { data: lead } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single()

  if (!lead) return { success: false, error: 'Lead not found' }

  await supabase
    .from('leads')
    .update({ status: 'invited', updated_at: new Date().toISOString() })
    .eq('id', leadId)

  revalidatePath('/admin/leads')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const registerLink = `${appUrl}/register?ref=lead&email=${encodeURIComponent(lead.email)}`

  return { success: true, registerLink }
}

export async function toggleLeadTest(leadId: string, isTest: boolean) {
  const supabase = createAdminClient()
  await supabase
    .from('leads')
    .update({ is_test: isTest, updated_at: new Date().toISOString() })
    .eq('id', leadId)
  revalidatePath('/admin/leads')
}
