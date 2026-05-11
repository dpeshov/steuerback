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
    <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/dashboard" className="font-black text-xl tracking-tight text-brand-navy shrink-0">
          Steuer<span className="text-brand-red">Back</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? 'bg-brand-navy text-white shadow-sm'
                    : 'text-gray-500 hover:text-brand-navy hover:bg-gray-50'
                }`}
              >
                <Icon size={14} />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2.5 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
            <div className="w-6 h-6 bg-brand-navy rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white text-[9px] font-black">{initials}</span>
            </div>
            <span className="text-xs text-gray-400 truncate max-w-32 font-medium">{user.email}</span>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-brand-red bg-gray-50 hover:bg-red-50 border border-gray-100 hover:border-red-100 px-3 py-2 rounded-xl transition-all font-medium"
          >
            <LogOut size={14} />
            <span className="hidden md:block">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  )
}
