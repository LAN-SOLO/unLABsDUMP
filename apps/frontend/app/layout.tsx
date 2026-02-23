import type { Metadata } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { Providers } from './providers'
import './globals.css'

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: '_untradeHUB',
  description:
    'Open, buy, and trade _unITM card packs in the _unstablecoins gaming ecosystem. Collect rare cards, build your deck, and compete on Solana.',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jetbrainsMono.variable} antialiased`}>
        <Providers>
          <div className="crt">{children}</div>
          <div className="crt-line" aria-hidden="true" />
          <Toaster position="bottom-right" />
        </Providers>
      </body>
    </html>
  )
}
