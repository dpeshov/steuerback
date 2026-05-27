'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard, User, FolderOpen, FileText,
  MessageSquare, Settings2, LogOut, ShieldCheck, Gift,
} from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const NAV = [
  { href: '/dashboard',       icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/profile',         icon: User,            label: 'My Profile' },
  { href: '/my-applications', icon: FolderOpen,      label: 'My Applications' },
  { href: '/documents',       icon: FileText,        label: 'Documents' },
  { href: '/messages',        icon: MessageSquare,   label: 'Messages' },
  { href: '/referrals',       icon: Gift,            label: 'Referrals' },
  { href: '/settings',        icon: Settings2,       label: 'Settings' },
]

export default function UserNav({ user, firstName }: { user: SupabaseUser; firstName?: string | null }) {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()

  const initials = firstName
    ? firstName.slice(0, 1).toUpperCase()
    : (user.email ?? 'U').slice(0, 2).toUpperCase()

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-[230px] bg-white border-r border-gray-100 flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-red rounded-xl flex items-center justify-center shrink-0 shadow-sm shadow-brand-red/30">
            <ShieldCheck size={15} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-black text-brand-navy text-sm leading-tight">
              Steuer<span className="text-brand-red">Back</span>
            </p>
            <p className="text-[10px] text-gray-400 font-medium tracking-wide">Tax Refund Portal</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                active
                  ? 'bg-brand-red text-white shadow-sm shadow-brand-red/25'
                  : 'text-gray-500 hover:text-brand-navy hover:bg-gray-50/80'
              }`}
            >
              <Icon
                size={16}
                strokeWidth={active ? 2.5 : 2}
                className={active ? 'text-white' : 'text-gray-400 group-hover:text-brand-red transition-colors'}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 pb-4 pt-2 border-t border-gray-50 space-y-0.5">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gray-50/60">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-red to-red-400 rounded-full flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-white text-[11px] font-black">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-brand-navy truncate">{firstName ?? user.email?.split('@')[0]}</p>
            <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-2.5 w-full px-3.5 py-2 text-sm font-medium text-gray-400 hover:text-brand-red hover:bg-red-50 rounded-xl transition-all duration-150"
        >
          <LogOut size={14} strokeWidth={2} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
