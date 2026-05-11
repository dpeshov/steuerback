import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SteuerBack — Your German Tax Refund',
  description: 'Get your German tax refund. Simple, fast, trusted. For international students and workers.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SteuerBack',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
