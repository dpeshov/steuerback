import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-brand-navy text-white/70 text-sm">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="font-bold text-xl text-white mb-3">
            Steuer<span className="text-brand-red">Back</span>
          </div>
          <p className="text-sm">Your German tax refund. Simple, fast, trusted.</p>
        </div>
        <div>
          <p className="font-semibold text-white mb-3">Product</p>
          <div className="flex flex-col gap-2">
            <Link href="/how-it-works" className="hover:text-white transition-colors">How it works</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/eligibility" className="hover:text-white transition-colors">Check eligibility</Link>
            <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
          </div>
        </div>
        <div>
          <p className="font-semibold text-white mb-3">Account</p>
          <div className="flex flex-col gap-2">
            <Link href="/register" className="hover:text-white transition-colors">Create account</Link>
            <Link href="/login" className="hover:text-white transition-colors">Login</Link>
            <Link href="/calculate" className="hover:text-white transition-colors">Tax calculator</Link>
          </div>
        </div>
        <div>
          <p className="font-semibold text-white mb-3">Legal</p>
          <div className="flex flex-col gap-2">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 text-center py-4 text-xs">
        © {new Date().getFullYear()} SteuerBack. A Posrednik24 service.
      </div>
    </footer>
  )
}
