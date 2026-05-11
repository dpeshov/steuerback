'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Clock, User } from 'lucide-react'

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/documents', icon: FileText, label: 'Docs' },
  { href: '/status', icon: Clock, label: 'Status' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4"
      style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      <div className="bg-[#0F0F1E]/92 backdrop-blur-2xl rounded-2xl border border-white/8 shadow-[0_8px_40px_rgba(0,0,0,0.4)] flex overflow-hidden">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center py-3 gap-1 transition-all duration-200 active:scale-95 ${
                active ? 'bg-white/6' : 'active:bg-white/4'
              }`}
            >
              <div className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-200 ${
                active ? 'bg-brand-red/20' : ''
              }`}>
                <Icon
                  size={19}
                  strokeWidth={active ? 2.5 : 1.8}
                  className={`transition-all duration-200 ${active ? 'text-brand-red' : 'text-white/35'}`}
                />
              </div>
              <span className={`text-[10px] font-semibold tracking-wide transition-all duration-200 ${
                active ? 'text-white/90' : 'text-white/25'
              }`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
