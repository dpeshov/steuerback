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
    <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50">
      <div className="bg-[#1A1A2E]/95 backdrop-blur-xl rounded-2xl border border-white/8 shadow-2xl shadow-black/40 flex overflow-hidden">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center py-3.5 gap-1 transition-all ${active ? 'bg-white/8' : ''}`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${active ? 'bg-brand-red/15' : ''}`}>
                <Icon size={18} className={active ? 'text-brand-red' : 'text-white/30'} />
              </div>
              <span className={`text-[10px] font-bold ${active ? 'text-white' : 'text-white/25'}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
