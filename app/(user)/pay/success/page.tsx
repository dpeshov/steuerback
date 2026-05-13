import Link from 'next/link'
import { CheckCircle, ArrowRight } from 'lucide-react'

export default function PaySuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 space-y-4">
      <div className="w-16 h-16 bg-brand-success/10 rounded-full flex items-center justify-center">
        <CheckCircle size={32} className="text-brand-success" />
      </div>
      <div>
        <h1 className="text-2xl font-black text-brand-navy tracking-tight mb-1">Payment confirmed!</h1>
        <p className="text-gray-400 text-sm max-w-xs">
          Your payment was successful. Our team will start processing your refund shortly.
        </p>
      </div>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 bg-brand-red text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-red-500 active:scale-[0.97] transition-all"
      >
        Go to dashboard <ArrowRight size={14} />
      </Link>
    </div>
  )
}
