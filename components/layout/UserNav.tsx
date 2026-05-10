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

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/dashboard" className="font-black text-lg tracking-tight text-brand-navy shrink-0">
          Steuer<span className="text-brand-red">Back</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-brand-navy text-white'
                    : 'text-gray-500 hover:text-brand-navy hover:bg-gray-50'
                }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden md:block text-xs text-gray-400 truncate max-w-36">{user.email}</span>
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-brand-red transition-colors font-medium"
          >
            <LogOut size={14} />
            <span className="hidden md:block">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  )
}
