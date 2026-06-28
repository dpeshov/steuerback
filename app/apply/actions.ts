'use server'
import { createAdminClient } from '@/lib/supabase/server'

export type LeadFormState = {
  success: boolean
  error: string | null
}

export async function submitLead(_prev: LeadFormState, formData: FormData): Promise<LeadFormState> {
  const firstName = formData.get('first_name') as string
  const lastName = formData.get('last_name') as string
  const email = formData.get('email') as string
  const phoneCountryCode = formData.get('phone_country_code') as string
  const phoneNumber = formData.get('phone_number') as string
  const contactApp = formData.get('contact_app') as string
  const taxYears = formData.getAll('tax_years').map(Number)
  const hasSteuerIdRaw = formData.get('has_steuer_id')
  const hasPayslipsRaw = formData.get('has_payslips')

  if (!firstName || !lastName || !email || !phoneNumber || taxYears.length === 0) {
    return { success: false, error: 'Please fill in all required fields and select at least one tax year.' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { success: false, error: 'Please enter a valid email address.' }
  }

  const supabase = createAdminClient()

  const { error } = await supabase.from('leads').insert({
    first_name: firstName.trim(),
    last_name: lastName.trim(),
    email: email.trim().toLowerCase(),
    phone_country_code: phoneCountryCode || '+49',
    phone_number: phoneNumber.trim(),
    contact_app: contactApp || 'whatsapp',
    tax_years: taxYears,
    has_steuer_id: hasSteuerIdRaw === 'yes',
    has_payslips: hasPayslipsRaw === 'yes',
  })

  if (error) {
    return { success: false, error: 'Something went wrong. Please try again.' }
  }

  // Notify all admins
  const { data: admins } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'admin')

  if (admins && admins.length > 0) {
    await supabase.from('notifications').insert(
      admins.map(admin => ({
        user_id: admin.id,
        type: 'new_lead',
        title: 'New lead received',
        body: `${firstName} ${lastName} (${email}) submitted an application interest form.`,
      }))
    )
  }

  return { success: true, error: null }
}
