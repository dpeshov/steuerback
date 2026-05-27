'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { ChevronRight, RefreshCw, Home } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to error tracking in production
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <div className="min-h-screen bg-brand-navy flex flex-col items-center justify-center px-4 text-center">

      {/* Icon */}
      <div className="w-20 h-20 bg-white/8 border border-white/10 rounded-3xl flex items-center justify-center mb-8">
        <svg viewBox="0 0 24 24" className="w-9 h-9 text-brand-red" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>

      <Link href="/" className="font-black text-2xl text-white tracking-tight mb-5">
        Steuer<span className="text-brand-red">Back</span>
      </Link>

      <h1 className="text-2xl sm:text-3xl font-black text-white mb-3">
        Something went wrong
      </h1>
      <p className="text-white/40 text-sm max-w-sm mx-auto leading-relaxed mb-2">
        An unexpected error occurred. This has been logged and we&apos;ll look into it.
      </p>
      {error.digest && (
        <p className="text-white/20 text-xs mb-8 font-mono">
          Error ID: {error.digest}
        </p>
      )}
      {!error.digest && <div className="mb-8" />}

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 bg-brand-red hover:bg-red-500 active:scale-[0.98] text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-brand-red/30"
        >
          <RefreshCw size={14} />
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all border border-white/10"
        >
          <Home size={14} />
          Go home <ChevronRight size={13} />
        </Link>
      </div>
    </div>
  )
}
