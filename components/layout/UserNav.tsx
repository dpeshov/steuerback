'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, FileText, MessageSquare, Settings, LogOut, ShieldCheck } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/documents', icon: FileText,         label: 'Documents' },
  { href: '/messages',  icon: MessageSquare,    label: 'Messages' },
  { href: '/profile',   icon: Settings,         label: 'Settings' },
]

export default function UserNav({ user }: { user: SupabaseUser }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const initials = (user.email ?? 'U').slice(0, 2).toUpperCase()

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-[220px] bg-white border-r border-gray-100 flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-red rounded-lg flex items-center justify-center shrink-0">
            <ShieldCheck size={16} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-black text-brand-navy text-sm leading-tight">
              Steuer<span className="text-brand-red">Back</span>
            </p>
            <p className="text-[10px] text-gray-400 font-medium">Tax Refund Portal</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                active
                  ? 'bg-brand-red text-white shadow-sm shadow-brand-red/20'
                  : 'text-gray-500 hover:text-brand-navy hover:bg-gray-50'
              }`}
            >
              <Icon size={16} strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User + Sign out */}
      <div className="px-3 pb-4 pt-2 border-t border-gray-50 space-y-0.5">
        <div className="flex items-center gap-2.5 px-3 py-2.5">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
            <span className="text-gray-500 text-[11px] font-bold">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-brand-navy truncate">{user.email}</p>
            <p className="text-[10px] text-gray-400">Applicant</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm font-medium text-gray-400 hover:text-brand-red hover:bg-red-50 rounded-xl transition-all"
        >
          <LogOut size={14} strokeWidth={2} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
