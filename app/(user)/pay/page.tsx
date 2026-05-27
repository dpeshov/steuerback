import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PayOptions from './PayOptions'

export default async function PayPage({
  searchParams,
}: {
  searchParams: Promise<{ app?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: apps } = await supabase
    .from('applications')
    .select('id, tax_year, status')
    .eq('user_id', user!.id)
    .eq('status', 'ready_for_payment')
    .order('tax_year', { ascending: false })

  if (!apps?.length) redirect('/dashboard')

  // If ?app= param present (and valid), use that; otherwise use latest
  const { app: appParam } = await searchParams
  const selected = apps.find(a => a.id === appParam) ?? apps[0]

  return (
    <PayOptions
      applicationId={selected.id}
      taxYear={selected.tax_year}
      allApps={apps.map(a => ({ id: a.id, taxYear: a.tax_year }))}
    />
  )
}
