'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle2, Circle, ChevronDown, X, ArrowRight } from 'lucide-react'

export type ChecklistStep = {
  id:    string
  label: string
  desc:  string
  href:  string
  done:  boolean
}

const DISMISS_KEY  = 'sb_checklist_dismissed'
const COLLAPSE_KEY = 'sb_checklist_collapsed'

export default function OnboardingChecklist({ steps }: { steps: ChecklistStep[] }) {
  const doneCount  = steps.filter(s => s.done).length
  const totalCount = steps.length
  const allDone    = doneCount === totalCount
  const pct        = Math.round((doneCount / totalCount) * 100)

  const [visible,   setVisible]   = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return
    setVisible(true)
    setCollapsed(localStorage.getItem(COLLAPSE_KEY) === '1')
  }, [])

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1')
    setVisible(false)
  }

  const toggleCollapse = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0')
  }

  if (!visible) return null

  // If all done, show a quick success state then auto-dismiss
  if (allDone) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 flex items-center gap-3">
        <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-bold text-emerald-800">All set! 🎉</p>
          <p className="text-xs text-emerald-600 mt-0.5">You&apos;ve completed all the setup steps.</p>
        </div>
        <button onClick={dismiss} className="text-emerald-400 hover:text-emerald-600 transition-colors">
          <X size={14} />
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
      {/* Header row */}
      <button
        onClick={toggleCollapse}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
      >
        {/* Progress ring (simple arc) */}
        <div className="relative w-10 h-10 shrink-0">
          <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="16" fill="none" stroke="#F3F4F6" strokeWidth="3.5" />
            <circle
              cx="20" cy="20" r="16"
              fill="none"
              stroke="#E63946"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 16}`}
              strokeDashoffset={`${2 * Math.PI * 16 * (1 - pct / 100)}`}
              className="transition-all duration-500"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-brand-navy">
            {doneCount}/{totalCount}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-brand-navy">Getting started</p>
          <p className="text-xs text-gray-400 mt-0.5">{totalCount - doneCount} step{totalCount - doneCount !== 1 ? 's' : ''} remaining</p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={e => { e.stopPropagation(); dismiss() }}
            className="w-6 h-6 rounded-md text-gray-300 hover:text-gray-500 hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X size={12} />
          </button>
          <ChevronDown
            size={15}
            className={`text-gray-400 transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`}
          />
        </div>
      </button>

      {/* Steps list */}
      {!collapsed && (
        <div className="border-t border-gray-50">
          {steps.map((step, i) => (
            <div key={step.id} className={`flex items-start gap-3 px-5 py-3.5 ${i < steps.length - 1 ? 'border-b border-gray-50' : ''}`}>
              {/* Icon */}
              <div className="mt-0.5 shrink-0">
                {step.done
                  ? <CheckCircle2 size={18} className="text-emerald-500" />
                  : <Circle size={18} className="text-gray-200" />
                }
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold leading-snug ${step.done ? 'text-gray-400 line-through' : 'text-brand-navy'}`}>
                  {step.label}
                </p>
                {!step.done && (
                  <p className="text-xs text-gray-400 mt-0.5 leading-snug">{step.desc}</p>
                )}
              </div>

              {/* Action */}
              {!step.done && (
                <Link
                  href={step.href}
                  className="shrink-0 flex items-center gap-1 text-xs font-bold text-brand-red hover:text-red-500 mt-0.5 transition-colors"
                >
                  Go <ArrowRight size={11} />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
