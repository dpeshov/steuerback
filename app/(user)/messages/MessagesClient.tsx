'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MessageSquare, Send, FileText, ArrowRight } from 'lucide-react'
import { addNote } from '@/app/actions/addNote'

type NoteData = {
  id: string
  text: string
  created_by: string
  created_at: string
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    + ' at '
    + new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export default function MessagesClient({
  applicationId,
  initialNotes,
  userId,
}: {
  applicationId: string | null
  initialNotes: NoteData[]
  userId: string
}) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const router = useRouter()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [initialNotes])

  const send = async () => {
    if (!text.trim() || !applicationId) return
    setSending(true)
    await addNote(applicationId, text.trim(), true)
    setText('')
    setSending(false)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black text-brand-navy">Messages</h1>
        <p className="text-sm text-gray-400 mt-0.5">Communication with your SteuerBack advisor</p>
      </div>

      {!applicationId ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center">
          <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText size={20} className="text-gray-300" />
          </div>
          <p className="font-bold text-brand-navy mb-1">No active application</p>
          <p className="text-gray-400 text-sm mb-5">Start an application to chat with an advisor.</p>
          <a
            href="/application"
            className="inline-flex items-center gap-2 bg-brand-red text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-red-500 transition-colors"
          >
            Start application <ArrowRight size={14} />
          </a>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 flex flex-col" style={{ minHeight: '60vh' }}>
          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3" style={{ maxHeight: 'calc(60vh - 80px)' }}>
            {initialNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <MessageSquare size={20} className="text-gray-300" />
                </div>
                <p className="text-gray-400 font-medium text-sm">No messages yet</p>
                <p className="text-gray-300 text-xs mt-1">Your advisor will reach out when there&apos;s an update on your application.</p>
              </div>
            ) : (
              initialNotes.map(note => {
                const isOwn = note.created_by === userId
                return (
                  <div key={note.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    {!isOwn && (
                      <div className="w-7 h-7 bg-brand-red rounded-full flex items-center justify-center mr-2 shrink-0 mt-auto mb-1">
                        <span className="text-white text-[9px] font-black">SB</span>
                      </div>
                    )}
                    <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      isOwn
                        ? 'bg-brand-navy text-white rounded-br-none'
                        : 'bg-gray-100 text-brand-navy rounded-bl-none'
                    }`}>
                      <p className="text-sm leading-relaxed">{note.text}</p>
                      <p className={`text-[11px] mt-1.5 ${isOwn ? 'text-white/50' : 'text-gray-400'}`}>
                        {fmtDateTime(note.created_at)}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 p-4 flex gap-3">
            <input
              type="text"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); send() } }}
              placeholder="Type a message..."
              className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red/30 transition-all"
            />
            <button
              onClick={send}
              disabled={sending || !text.trim()}
              className="flex items-center gap-1.5 bg-brand-red hover:bg-red-500 disabled:opacity-40 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all active:scale-95"
            >
              <Send size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
