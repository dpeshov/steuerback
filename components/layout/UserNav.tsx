'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, FileText, Clock, User, LogOut } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/documents', icon: FileText, label: 'Documents' },
  { href: '/status', icon: Clock, label: 'Status' },
  { href: '/profile', icon: User, label: 'Profile' },
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
    <header
      className="bg-white/85 backdrop-blur-2xl border-b border-black/[0.06] sticky top-0 z-40"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        <Link href="/dashboard" className="font-black text-[1.15rem] tracking-tight text-brand-navy shrink-0 select-none">
          Steuer<span className="text-brand-red">Back</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[0.8rem] font-semibold transition-all duration-150 ${
                  active
                    ? 'bg-brand-navy text-white shadow-sm'
                    : 'text-gray-500 hover:text-brand-navy hover:bg-gray-100/80'
                }`}
              >
                <Icon size={13} strokeWidth={active ? 2.5 : 2} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-black/[0.06] rounded-xl px-3 py-1.5">
            <div className="w-5 h-5 bg-brand-navy rounded-md flex items-center justify-center shrink-0">
              <span className="text-white text-[9px] font-black leading-none">{initials}</span>
            </div>
            <span className="text-xs text-gray-400 truncate max-w-[7rem] font-medium">{user.email}</span>
          </div>

          {/* Mobile: show avatar + email hint */}
          <div className="md:hidden flex items-center gap-1.5">
            <div className="w-7 h-7 bg-brand-navy rounded-lg flex items-center justify-center">
              <span className="text-white text-[10px] font-black">{initials}</span>
            </div>
          </div>

          <button
            onClick={signOut}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-brand-red bg-gray-50 hover:bg-red-50 border border-black/[0.06] hover:border-red-100 px-3 py-2 rounded-xl transition-all duration-150 font-medium active:scale-95"
          >
            <LogOut size={13} strokeWidth={2} />
            <span className="hidden md:block">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  )
}
