'use client'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import { Shield, LayoutList, Users, LogOut, UserPlus, LayoutDashboard, User, Menu, X } from 'lucide-react'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useState } from 'react'

const ADMIN_NAV = [
  { href: '/admin',              icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/applications', icon: LayoutList,      label: 'Applications' },
  { href: '/admin/leads',        icon: UserPlus,        label: 'Leads' },
  { href: '/admin/users',        icon: Users,           label: 'Users' },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex flex-col w-56 bg-brand-navy border-r border-white/8 min-h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 h-14 flex items-center border-b border-white/8 shrink-0">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-brand-red rounded-lg flex items-center justify-center">
            <Shield size={13} className="text-white" />
          </div>
          <span className="font-black text-white text-lg tracking-tight">
            Steuer<span className="text-brand-red">Back</span>
          </span>
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {ADMIN_NAV.map(({ href, icon: Icon, label }) => {
          const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-sm font-semibold ${
                active
                  ? 'bg-white/12 text-white'
                  : 'text-white/40 hover:text-white hover:bg-white/6'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/8">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/40 hover:text-white hover:bg-white/6 transition-all"
        >
          <User size={16} />
          My Profile
        </Link>
      </div>
    </aside>
  )
}

export default function AdminTopBar() {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [mobileOpen, setMobileOpen] = useState(false)

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      <header className="bg-brand-navy border-b border-white/8 sticky top-0 z-40">
        <div className="px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Left: mobile menu + breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-white/60 hover:text-white p-1"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Mobile logo */}
            <Link href="/admin" className="flex lg:hidden items-center gap-2 shrink-0">
              <div className="w-6 h-6 bg-brand-red rounded-md flex items-center justify-center">
                <Shield size={11} className="text-white" />
              </div>
              <span className="font-black text-white text-base tracking-tight">
                Steuer<span className="text-brand-red">Back</span>
              </span>
              <span className="text-[9px] bg-white/8 border border-white/10 text-white/50 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
                Admin
              </span>
            </Link>

            {/* Desktop: page title from nav */}
            <span className="hidden lg:block text-[10px] bg-white/8 border border-white/10 text-white/50 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
              Admin Panel
            </span>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher dark />
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white bg-white/5 hover:bg-white/10 border border-white/8 px-3 py-2 rounded-xl transition-all font-medium"
            >
              <User size={13} />
              <span className="hidden sm:block">Dashboard</span>
            </Link>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 text-xs text-white/35 hover:text-white bg-white/5 hover:bg-white/10 border border-white/8 px-3 py-2 rounded-xl transition-all font-medium"
            >
              <LogOut size={13} />
              <span className="hidden sm:block">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 bg-brand-navy flex flex-col">
            {/* Logo */}
            <div className="px-5 h-14 flex items-center justify-between border-b border-white/8">
              <Link href="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-brand-red rounded-lg flex items-center justify-center">
                  <Shield size={13} className="text-white" />
                </div>
                <span className="font-black text-white text-lg tracking-tight">
                  Steuer<span className="text-brand-red">Back</span>
                </span>
              </Link>
              <button onClick={() => setMobileOpen(false)} className="text-white/40 hover:text-white p-1">
                <X size={18} />
              </button>
            </div>

            {/* Links */}
            <nav className="flex-1 px-3 py-4 space-y-1">
              {ADMIN_NAV.map(({ href, icon: Icon, label }) => {
                const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-3 rounded-xl transition-all text-sm font-semibold ${
                      active
                        ? 'bg-white/12 text-white'
                        : 'text-white/40 hover:text-white hover:bg-white/6'
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                )
              })}
            </nav>

            <div className="px-3 py-4 border-t border-white/8">
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm font-semibold text-white/40 hover:text-white hover:bg-white/6 transition-all"
              >
                <User size={16} />
                My Profile
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
