'use client'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import { Shield, LayoutList, Users, LogOut } from 'lucide-react'

const ADMIN_NAV = [
  { href: '/admin/applications', icon: LayoutList, label: 'Applications' },
  { href: '/admin/users', icon: Users, label: 'Users' },
]

export default function AdminNav() {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="bg-brand-navy border-b border-white/8 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-2.5 shrink-0">
            <div className="w-7 h-7 bg-brand-red rounded-lg flex items-center justify-center">
              <Shield size={13} className="text-white" />
            </div>
            <span className="font-black text-white text-lg tracking-tight">
              Steuer<span className="text-brand-red">Back</span>
            </span>
            <span className="text-[10px] bg-white/8 border border-white/10 text-white/50 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
              Admin
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {ADMIN_NAV.map(({ href, icon: Icon, label }) => {
              const active = pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-xs font-semibold ${
                    active
                      ? 'bg-white/12 text-white'
                      : 'text-white/40 hover:text-white hover:bg-white/8'
                  }`}
                >
                  <Icon size={13} />
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>

        <button
          onClick={signOut}
          className="flex items-center gap-1.5 text-xs text-white/35 hover:text-white bg-white/5 hover:bg-white/10 border border-white/8 px-3 py-2 rounded-xl transition-all font-medium"
        >
          <LogOut size={13} />
          <span className="hidden md:block">Sign out</span>
        </button>
      </div>
    </header>
  )
}
