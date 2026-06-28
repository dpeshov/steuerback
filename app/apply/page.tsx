import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import AnnouncementBanner from '@/components/landing/AnnouncementBanner'
import LeadForm from './LeadForm'

export const metadata = {
  title: 'Apply — SteuerBack',
  description: 'Express your interest in getting your German tax refund. No registration needed.',
}

export default function ApplyPage() {
  return (
    <>
      <AnnouncementBanner />
      <Navbar />

      <section className="relative overflow-hidden bg-[#0D0D1A] min-h-screen">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[700px] h-[700px] bg-brand-red/8 rounded-full blur-[140px]" />
          <div className="absolute bottom-[-5%] left-[-10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-2xl mx-auto px-6 pt-32 pb-24">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2.5 bg-white/5 border border-white/8 rounded-full px-5 py-2.5 text-sm text-white/60 mb-8 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 bg-brand-success rounded-full animate-pulse shrink-0" />
              No registration required
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
              Interested in your<br />
              <span className="text-brand-red">tax refund?</span>
            </h1>
            <p className="text-white/40 text-lg max-w-md mx-auto">
              Fill out this short form and our team will contact you to help you get started.
            </p>
          </div>

          <LeadForm />
        </div>
      </section>

      <Footer />
    </>
  )
}
