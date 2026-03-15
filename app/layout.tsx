import type { Metadata } from 'next'
import { Irish_Grover } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const irishGrover = Irish_Grover({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-irish-grover"
})

export const metadata: Metadata = {
  title: 'Quintas y Granjas | Cajas semanales de frutas, verduras y productos de granja',
  description: 'Recibí frutas, verduras y productos de granja frescos directo en tu casa todas las semanas. Sin supermercado. Sin filas. Entrega en zona norte del Gran Buenos Aires.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={irishGrover.variable}>
      <body
        className="antialiased"
        style={{ fontFamily: 'var(--font-irish-grover)' }}
      >
        {children}
        <Analytics />
      </body>
    </html>
  )
}


