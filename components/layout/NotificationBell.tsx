'use client'
import { useState, useRef, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { Bell, X, CheckCircle2, MessageSquare, FileText, RefreshCw, Inbox } from 'lucide-react'
import { markNotificationsRead } from '@/app/actions/markNotificationsRead'
import type { AppNotification } from '@/lib/notifications'

const TYPE_ICON = {
  status_change:   RefreshCw,
  message:         MessageSquare,
  document_review: FileText,
} as const

const TYPE_COLOR = {
  status_change:   'bg-indigo-100 text-indigo-600',
  message:         'bg-blue-100 text-blue-600',
  document_review: 'bg-amber-100 text-amber-600',
} as const

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins < 2)   return 'just now'
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7)   return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export default function NotificationBell({
  notifications: initial,
  unreadCount:   initialUnread,
}: {
  notifications: AppNotification[]
  unreadCount:   number
}) {
  const [open,        setOpen]        = useState(false)
  const [unread,      setUnread]      = useState(initialUnread)
  const [items,       setItems]       = useState(initial)
  const [, startTransition]           = useTransition()
  const panelRef = useRef<HTMLDivElement>(null)
  const btnRef   = useRef<HTMLButtonElement>(null)

  // Close when clicking outside
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        btnRef.current  && !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleOpen = () => {
    const next = !open
    setOpen(next)
    if (next && unread > 0) {
      // Mark all read optimistically
      setUnread(0)
      setItems(prev => prev.map(n => ({ ...n, read: true })))
      // Persist server-side
      startTransition(() => { markNotificationsRead() })
    }
  }

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        ref={btnRef}
        onClick={handleOpen}
        className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
          open
            ? 'bg-brand-red text-white shadow-sm shadow-brand-red/30'
            : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-brand-navy'
        }`}
        aria-label="Notifications"
      >
        <Bell size={16} strokeWidth={2} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-[3px] bg-brand-red rounded-full flex items-center justify-center border-2 border-white">
            <span className="text-[9px] font-black text-white leading-none">
              {unread > 9 ? '9+' : unread}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/60 z-50 overflow-hidden animate-fade-in"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <Bell size={14} className="text-brand-navy" />
              <span className="text-sm font-black text-brand-navy">Notifications</span>
              {items.filter(n => !n.read).length === 0 && items.length > 0 && (
                <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  All read
                </span>
              )}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-6 h-6 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center transition-colors"
            >
              <X size={12} />
            </button>
          </div>

          {/* List */}
          <div className="max-h-[420px] overflow-y-auto overscroll-contain">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-center px-4">
                <div className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <Inbox size={18} className="text-gray-400" />
                </div>
                <p className="text-sm font-bold text-gray-500">No notifications yet</p>
                <p className="text-xs text-gray-400 leading-snug max-w-[180px]">
                  We&apos;ll notify you when your application status changes.
                </p>
              </div>
            ) : (
              items.map((n, i) => {
                const Icon = TYPE_ICON[n.type]
                return (
                  <Link
                    key={n.id}
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors ${
                      i < items.length - 1 ? 'border-b border-gray-50' : ''
                    } ${!n.read ? 'bg-blue-50/40' : ''}`}
                  >
                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${TYPE_COLOR[n.type]}`}>
                      <Icon size={14} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold leading-snug ${n.read ? 'text-gray-600' : 'text-brand-navy'}`}>
                        {n.title}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5 leading-snug line-clamp-2">{n.body}</p>
                      <p className="text-[10px] text-gray-300 mt-1">{timeAgo(n.created_at)}</p>
                    </div>

                    {/* Unread dot */}
                    {!n.read && (
                      <div className="w-1.5 h-1.5 bg-brand-red rounded-full mt-2 shrink-0" />
                    )}
                  </Link>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
