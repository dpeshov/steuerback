import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import UserNav from '@/components/layout/UserNav'
import MobileNav from '@/components/layout/MobileNav'
import NotificationBell from '@/components/layout/NotificationBell'
import { getUserNotifications } from '@/lib/notifications'
import { Settings2, ShieldCheck } from 'lucide-react'

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('first_name').eq('user_id', user.id).single()

  // All user application IDs (needed for notifications + unread messages)
  const { data: allApps } = await supabase
    .from('applications').select('id').eq('user_id', user.id)

  const appIds    = allApps?.map(a => a.id) ?? []
  const latestApp = allApps?.[0] ?? null

  // ── Unread messages count ─────────────────────────────────────────────────
  let unreadCount = 0
  if (latestApp) {
    const lastRead: string | undefined = user.user_metadata?.messages_last_read
    const q = supabase
      .from('notes')
      .select('id', { count: 'exact', head: true })
      .eq('application_id', latestApp.id)
      .eq('is_public', true)
      .neq('created_by', user.id)
    if (lastRead) q.gt('created_at', lastRead)
    const { count } = await q
    unreadCount = count ?? 0
  }

  // ── Notifications ─────────────────────────────────────────────────────────
  const lastSeen: string | null = user.user_metadata?.notifications_last_seen ?? null
  const { notifications, unreadCount: notifUnread } = await getUserNotifications(
    supabase, user.id, appIds, lastSeen,
  )

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <UserNav
        user={user}
        firstName={profile?.first_name}
        notifications={notifications}
        notifUnread={notifUnread}
      />

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-red rounded-lg flex items-center justify-center shadow-sm shadow-brand-red/30">
              <ShieldCheck size={13} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-black text-brand-navy text-sm">
              Steuer<span className="text-brand-red">Back</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell notifications={notifications} unreadCount={notifUnread} />
            <Link
              href="/settings"
              className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors active:scale-95"
            >
              <Settings2 size={15} strokeWidth={2} />
            </Link>
          </div>
        </div>
      </header>

      <main className="md:pl-[230px] min-h-screen">
        <div className="px-4 md:px-6 pt-[4.5rem] md:pt-6 pb-28 md:pb-8 max-w-5xl">
          {children}
        </div>
      </main>

      <MobileNav unreadMessages={unreadCount} />
    </div>
  )
}
