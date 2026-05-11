import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import UserNav from '@/components/layout/UserNav'
import MobileNav from '@/components/layout/MobileNav'

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <UserNav user={user} />
      <main className="max-w-2xl mx-auto px-4 pt-6 pb-28 md:pb-10" style={{ paddingBottom: 'calc(7rem + env(safe-area-inset-bottom, 0px))' }}>
        {children}
      </main>
      <MobileNav />
    </div>
  )
}
