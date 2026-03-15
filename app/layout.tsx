import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const recoleta = localFont({
  src: [
    {
      path: '../fonts/recoleta-regular.woff2',
      weight: '400',
      style: 'normal'
    },
    {
      path: '../fonts/recoleta-semibold.woff2',
      weight: '600',
      style: 'normal'
    },
    {
      path: '../fonts/recoleta-bold.woff2',
      weight: '700',
      style: 'normal'
    }
  ],
  variable: '--font-recoleta',
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'Quintas y Granjas | Cajas semanales de frutas, verduras y productos de granja',
  description:
    'Recibí frutas, verduras y productos de granja frescos directo en tu casa todas las semanas. Sin supermercado. Sin filas. Entrega en zona norte del Gran Buenos Aires.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)'
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)'
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml'
      }
    ],
    apple: '/apple-icon.png'
  }
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={recoleta.variable}>
      <body
        className="antialiased"
        style={{ fontFamily: 'var(--font-recoleta)' }}
      >
        {children}
        <Analytics />
      </body>
    </html>
  )
}


