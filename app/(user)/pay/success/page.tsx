import Link from 'next/link'
import { ArrowRight, FileSearch, ClipboardList, Banknote, Layers } from 'lucide-react'

export default async function PaySuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ deferred?: string; bundle?: string; count?: string }>
}) {
  const { deferred, bundle, count } = await searchParams
  const isDeferred = deferred === '1'
  const isBundle   = bundle === '1'
  const yearCount  = Number(count ?? 1)

  return (
    <div className="flex flex-col items-center justify-center min-h-[72vh] text-center px-4 py-12 select-none">

      {/* Animated checkmark ring */}
      <div className="relative mb-10">
        {/* Outer pulse ring */}
        <div className="absolute inset-0 rounded-full bg-emerald-200 animate-ping opacity-20 scale-125" />
        {/* Inner bg */}
        <div className="relative w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/30 animate-pop-in opacity-0">
          {/* Checkmark SVG */}
          <svg
            viewBox="0 0 52 52"
            className="w-11 h-11 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              d="M14 27 L22 35 L38 18"
              className="[stroke-dasharray:40] [stroke-dashoffset:40] animate-draw"
            />
          </svg>
        </div>
      </div>

      {/* Bundle badge */}
      {isBundle && (
        <div className="flex items-center gap-2 bg-emerald-100 text-emerald-700 text-xs font-bold px-4 py-2 rounded-full mb-6">
          <Layers size={13} />
          {yearCount}-year bundle activated
        </div>
      )}

      {/* Title */}
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-black text-brand-navy tracking-tight">
          {isBundle && !isDeferred
            ? `Bundle confirmed! 🎉`
            : isBundle && isDeferred
              ? `Bundle agreement confirmed!`
              : isDeferred
                ? 'Agreement confirmed!'
                : 'Payment confirmed!'
          }
        </h1>
        <p className="text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">
          {isBundle
            ? isDeferred
              ? `Your ${yearCount}-year bundle agreement is signed. We'll process all years together and deduct our fee from each refund.`
              : `Your ${yearCount}-year bundle payment was received. We'll process all years together — faster and at a lower cost.`
            : isDeferred
              ? 'Your deferred payment agreement is signed. We\'ll deduct our fee from your refund when it arrives.'
              : 'Your payment was received. Our team will start processing your refund right away.'
          }
        </p>
      </div>

      {/* What happens next */}
      <div className="w-full max-w-sm mb-8">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">What happens next</p>
        <div className="space-y-0">
          {[
            {
              icon: FileSearch,
              title: 'Document review',
              desc: 'Our team reviews your uploaded documents',
              color: 'bg-blue-50 text-blue-600',
            },
            {
              icon: ClipboardList,
              title: 'Tax return prepared',
              desc: 'We prepare your German tax return',
              color: 'bg-purple-50 text-purple-600',
            },
            {
              icon: Banknote,
              title: 'Refund to your account',
              desc: 'Money lands in your bank within 3–6 months',
              color: 'bg-emerald-50 text-emerald-600',
            },
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3 text-left group">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${step.color}`}>
                  <step.icon size={16} />
                </div>
                {i < 2 && (
                  <div className="w-0.5 h-6 bg-gray-100 my-0.5" />
                )}
              </div>
              <div className="pt-1.5 pb-4">
                <p className="text-sm font-bold text-brand-navy">{step.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 bg-brand-red hover:bg-red-500 active:scale-[0.97] text-white font-bold px-7 py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-brand-red/20"
      >
        Go to dashboard <ArrowRight size={14} />
      </Link>

      <p className="text-xs text-gray-300 mt-4">
        We&apos;ll email you at each step of the process
      </p>
    </div>
  )
}
