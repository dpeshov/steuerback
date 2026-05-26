'use client'
import { useRef, useState, useCallback } from 'react'
import SignaturePad from 'react-signature-canvas'
import { RotateCcw, CheckCircle, Loader2, PenLine, ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SignatureCanvas({ applicationId, taxYear }: { applicationId: string; taxYear: number }) {
  const padRef   = useRef<SignaturePad>(null)
  const [empty,   setEmpty]   = useState(true)
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const router = useRouter()

  const handleClear = () => {
    padRef.current?.clear()
    setEmpty(true)
    setError(null)
  }

  const handleEnd = useCallback(() => {
    setEmpty(padRef.current?.isEmpty() ?? true)
  }, [])

  const handleSubmit = async () => {
    if (!padRef.current || padRef.current.isEmpty()) {
      setError('Please sign before submitting.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const signatureDataUrl = padRef.current.getTrimmedCanvas().toDataURL('image/png')
      const res = await fetch('/api/documents/sign-vollmacht', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          signatureDataUrl,
          signedAt: new Date().toISOString(),
        }),
      })
      if (!res.ok) {
        const { error: msg } = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(msg)
      }
      setDone(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-black text-brand-navy mb-1">Vollmacht signed!</h2>
          <p className="text-sm text-gray-500 max-w-xs">
            Your Power of Attorney for the {taxYear} tax return has been generated and submitted for review.
          </p>
        </div>
        <button
          onClick={() => router.push('/documents')}
          className="mt-2 bg-brand-navy text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-[#252545] transition-all active:scale-95"
        >
          Back to Documents
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Canvas */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <PenLine size={16} className="text-brand-red" />
            Draw your signature below
          </div>
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors active:scale-95"
          >
            <RotateCcw size={12} />
            Clear
          </button>
        </div>

        <div
          className="rounded-2xl border-2 border-dashed border-gray-200 bg-white overflow-hidden touch-none"
          style={{ height: 180 }}
        >
          <SignaturePad
            ref={padRef}
            onEnd={handleEnd}
            canvasProps={{ className: 'w-full h-full', style: { touchAction: 'none' } }}
            backgroundColor="rgb(255,255,255)"
            penColor="#1A1A2E"
          />
        </div>

        {empty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none mt-8">
            <span className="text-gray-300 text-sm font-medium select-none">Sign here</span>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500 font-medium text-center">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || empty}
        className="w-full flex items-center justify-center gap-2 bg-brand-red hover:bg-red-500 active:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-base py-4 rounded-2xl transition-all shadow-lg shadow-brand-red/20"
      >
        {loading
          ? <><Loader2 size={18} className="animate-spin" /> Generating PDF…</>
          : <><CheckCircle size={18} /> Submit Signature</>
        }
      </button>

      <p className="text-xs text-center text-gray-400 leading-relaxed">
        By submitting, you confirm that this is your legally binding signature and authorize
        SteuerBack to represent you before the German Finanzamt for the {taxYear} tax return.
      </p>
    </div>
  )
}
