import Link from 'next/link'
import { LayoutDashboard, FileText, Clock, User } from 'lucide-react'

export default function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-50">
      {[
        { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
        { href: '/documents', icon: FileText, label: 'Docs' },
        { href: '/status', icon: Clock, label: 'Status' },
        { href: '/profile', icon: User, label: 'Profile' },
      ].map(({ href, icon: Icon, label }) => (
        <Link key={href} href={href} className="flex-1 flex flex-col items-center py-3 gap-1 text-xs text-gray-500 hover:text-brand-red transition-colors">
          <Icon size={20} />
          {label}
        </Link>
      ))}
    </nav>
  )
}
