import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PayOptions from './PayOptions'

export default async function PayPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: app } = await supabase
    .from('applications')
    .select('id, tax_year, status')
    .eq('user_id', user!.id)
    .eq('status', 'ready_for_payment')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!app) redirect('/dashboard')

  return <PayOptions applicationId={app.id} taxYear={app.tax_year} />
}
