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

        {/* 🔥 META PIXEL */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '899097899619057');
            fbq('track', 'PageView');
          `}
        </Script>

        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=899097899619057&ev=PageView&noscript=1"
          />
        </noscript>

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

