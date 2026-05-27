'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { MessageSquare, Send, FileText, ArrowRight, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { addNote } from '@/app/actions/addNote'
import { markMessagesRead } from '@/app/actions/markMessagesRead'

type NoteData = {
  id: string
  text: string
  created_by: string
  created_at: string
}

function fmtTime(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  const isToday = d.toDateString() === today.toDateString()
  const isYesterday = d.toDateString() === new Date(today.setDate(today.getDate() - 1)).toDateString()

  if (isToday) {
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  }
  if (isYesterday) {
    return `Yesterday ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
  }
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    + ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function groupByDate(notes: NoteData[]) {
  const groups: { date: string; notes: NoteData[] }[] = []
  let lastDate = ''
  for (const note of notes) {
    const d = new Date(note.created_at)
    const today = new Date()
    const isToday = d.toDateString() === today.toDateString()
    const label = isToday
      ? 'Today'
      : d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

    if (label !== lastDate) {
      groups.push({ date: label, notes: [note] })
      lastDate = label
    } else {
      groups[groups.length - 1].notes.push(note)
    }
  }
  return groups
}

export default function MessagesClient({
  applicationId,
  taxYear,
  initialNotes,
  userId,
}: {
  applicationId: string | null
  taxYear: number | null
  initialNotes: NoteData[]
  userId: string
}) {
  const [notes,   setNotes]   = useState<NoteData[]>(initialNotes)
  const [text,    setText]    = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)
  const supabase  = createClient()

  // Scroll to bottom
  const scrollBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' })
  }, [])

  // On mount: mark read + instant scroll
  useEffect(() => {
    markMessagesRead()
    scrollBottom(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Scroll when notes change
  useEffect(() => {
    scrollBottom(true)
  }, [notes, scrollBottom])

  // Supabase Realtime subscription
  useEffect(() => {
    if (!applicationId) return

    const channel = supabase
      .channel(`notes:${applicationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notes',
          filter: `application_id=eq.${applicationId}`,
        },
        (payload) => {
          const row = payload.new as NoteData & { is_public: boolean }
          if (!row.is_public) return
          setNotes(prev => {
            // Avoid duplicates
            if (prev.some(n => n.id === row.id)) return prev
            return [...prev, { id: row.id, text: row.text, created_by: row.created_by, created_at: row.created_at }]
          })
          // Mark as read since user is actively on the page
          markMessagesRead()
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId])

  const send = async () => {
    const trimmed = text.trim()
    if (!trimmed || !applicationId) return
    setSending(true)
    setText('')
    // Optimistic insert
    const tempId = `temp-${Date.now()}`
    const optimistic: NoteData = {
      id: tempId,
      text: trimmed,
      created_by: userId,
      created_at: new Date().toISOString(),
    }
    setNotes(prev => [...prev, optimistic])
    await addNote(applicationId, trimmed, true)
    setSending(false)
    inputRef.current?.focus()
  }

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const groups = groupByDate(notes)

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] md:h-[calc(100vh-8rem)] max-h-[720px] min-h-[400px]">
      {/* Header */}
      <div className="mb-4 shrink-0">
        <p className="text-[11px] font-bold text-brand-red uppercase tracking-widest mb-0.5">Messages</p>
        <h1 className="text-2xl font-black text-brand-navy">Chat with advisor</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {taxYear ? `${taxYear} tax return · ` : ''}Questions and updates with your advisor
        </p>
      </div>

      {!applicationId ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center flex-1">
          <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText size={20} className="text-gray-300" />
          </div>
          <p className="font-bold text-brand-navy mb-1">No active application</p>
          <p className="text-gray-400 text-sm mb-5">Start an application to chat with an advisor.</p>
          <a
            href="/application"
            className="inline-flex items-center gap-2 bg-brand-red text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-red-500 transition-colors active:scale-95"
          >
            Start application <ArrowRight size={14} />
          </a>
        </div>
      ) : (
        <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Live indicator */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-50 bg-gray-50/50 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-semibold text-gray-500">Live</span>
            </div>
            <span className="text-xs text-gray-300">·</span>
            <span className="text-xs text-gray-400">SteuerBack advisor</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 overscroll-contain">
            {notes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-10 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <MessageSquare size={20} className="text-gray-300" />
                </div>
                <p className="text-gray-400 font-medium text-sm">No messages yet</p>
                <p className="text-gray-300 text-xs mt-1 max-w-[200px] leading-relaxed">
                  Your advisor will reach out when there&apos;s an update on your application.
                </p>
              </div>
            ) : (
              groups.map(group => (
                <div key={group.date}>
                  {/* Date divider */}
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-gray-100" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">{group.date}</span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>

                  {group.notes.map((note, i) => {
                    const isOwn = note.created_by === userId
                    const isTemp = note.id.startsWith('temp-')
                    const prevNote = group.notes[i - 1]
                    const sameSender = prevNote && prevNote.created_by === note.created_by
                    const showAvatar = !isOwn && !sameSender

                    return (
                      <div
                        key={note.id}
                        className={`flex items-end gap-2 mb-1 ${isOwn ? 'justify-end' : 'justify-start'} ${sameSender ? 'mt-0.5' : 'mt-3'}`}
                      >
                        {/* Advisor avatar */}
                        {!isOwn && (
                          <div className={`w-7 h-7 rounded-full shrink-0 mb-0.5 ${showAvatar ? 'bg-brand-red flex items-center justify-center' : 'invisible'}`}>
                            {showAvatar && <span className="text-white text-[9px] font-black">SB</span>}
                          </div>
                        )}

                        {/* Bubble */}
                        <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                          <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed transition-opacity ${
                            isTemp ? 'opacity-60' : ''
                          } ${
                            isOwn
                              ? 'bg-brand-navy text-white rounded-br-md'
                              : 'bg-gray-100 text-brand-navy rounded-bl-md'
                          }`}>
                            {note.text}
                          </div>
                          <span className={`text-[10px] px-1 ${isOwn ? 'text-gray-400' : 'text-gray-400'}`}>
                            {isTemp
                              ? <span className="flex items-center gap-1"><Loader2 size={9} className="animate-spin" /> Sending…</span>
                              : fmtTime(note.created_at)
                            }
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div className="border-t border-gray-100 p-3 flex gap-2.5 items-end shrink-0 bg-white">
            <textarea
              ref={inputRef}
              value={text}
              onChange={e => { setText(e.target.value) }}
              onKeyDown={handleKey}
              placeholder="Type a message…"
              rows={1}
              className="flex-1 resize-none bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red/30 transition-all leading-relaxed max-h-28 overflow-y-auto"
              style={{ minHeight: 44 }}
            />
            <button
              onClick={send}
              disabled={sending || !text.trim()}
              className="w-11 h-11 bg-brand-red hover:bg-red-500 active:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl flex items-center justify-center transition-all active:scale-95 shrink-0"
            >
              {sending
                ? <Loader2 size={15} className="animate-spin" />
                : <Send size={15} />
              }
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
