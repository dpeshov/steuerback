'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, User, FolderOpen, FileText, MessageSquare } from 'lucide-react'

const NAV = [
  { href: '/dashboard',       icon: LayoutDashboard, label: 'Home' },
  { href: '/profile',         icon: User,            label: 'Profile' },
  { href: '/my-applications', icon: FolderOpen,      label: 'Apps' },
  { href: '/documents',       icon: FileText,        label: 'Docs' },
  { href: '/messages',        icon: MessageSquare,   label: 'Messages', badge: true },
]

export default function MobileNav({ unreadMessages = 0 }: { unreadMessages?: number }) {
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-3"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <div className="bg-[#0F0F1E]/94 backdrop-blur-2xl rounded-2xl border border-white/8 shadow-[0_8px_40px_rgba(0,0,0,0.5)] flex overflow-hidden">
        {NAV.map(({ href, icon: Icon, label, badge }) => {
          const active     = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          const showBadge  = badge && unreadMessages > 0

          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-all duration-200 active:scale-95 ${
                active ? 'bg-white/5' : ''
              }`}
            >
              <div className={`relative w-9 h-7 flex items-center justify-center rounded-xl transition-all duration-200 ${
                active ? 'bg-brand-red/20' : ''
              }`}>
                <Icon
                  size={18}
                  strokeWidth={active ? 2.5 : 1.8}
                  className={`transition-all duration-200 ${active ? 'text-brand-red' : 'text-white/35'}`}
                />
                {/* Unread badge */}
                {showBadge && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-[3px] bg-brand-red rounded-full flex items-center justify-center">
                    <span className="text-[9px] font-black text-white leading-none">
                      {unreadMessages > 9 ? '9+' : unreadMessages}
                    </span>
                  </span>
                )}
              </div>
              <span className={`text-[9px] font-bold tracking-wide transition-all duration-200 ${
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
