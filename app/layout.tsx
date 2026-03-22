import type { Metadata } from 'next'
import { Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Script from "next/script"
import './globals.css'

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair"
})

export const metadata: Metadata = {
  title: 'Quintas y Granjas | Cajas semanales de frutas, verduras y productos de granja',
  description: 'Recibí frutas, verduras y productos de granja frescos directo en tu casa todas las semanas. Sin supermercado. Sin filas. Entrega en zona norte del Gran Buenos Aires.',
  generator: 'v0.app',
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png"
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={playfair.variable}>
      <body
        className="antialiased"
        style={{ fontFamily: "var(--font-playfair)" }}
      >

        {/* 🔥 MERCADOPAGO SDK */}
        <Script
          src="https://sdk.mercadopago.com/js/v2"
          strategy="beforeInteractive"
        />

        {children}
        <Analytics />
      </body>
    </html>
  )
}
