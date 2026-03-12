import type { Metadata } from 'next'
import { DM_Sans, Merriweather } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const dmSans = DM_Sans({ 
  subsets: ["latin"],
  variable: "--font-dm-sans"
});

const merriweather = Merriweather({ 
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-merriweather"
});

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
    <html lang="es" className={`${dmSans.variable} ${merriweather.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
