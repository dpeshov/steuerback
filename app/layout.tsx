import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SteuerBack — Your German Tax Refund',
  description: 'Get your German tax refund. Simple, fast, trusted. For international students and workers.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
