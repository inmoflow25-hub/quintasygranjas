import type { Metadata, Viewport } from "next"
import { Mali } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import Script from "next/script"
import "./globals.css"
import "leaflet/dist/leaflet.css"

const mali = Mali({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mali"
})

export const metadata: Metadata = {
  title: "Quintas y Granjas | Alimentos de verdad directo a tu domicilio",
  description:
    "Siempre sumás puntos y ganás descuentos usando la app de Quintas y Granjas. Sin supermercado. Sin filas. Entregas sin costo.",
  generator: "v0.app",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/push-icon-192.png?v=10",
    apple: "/icons/push-icon-192.png?v=10"
  },
  appleWebApp: {
    capable: true,
    title: "Quintas y Granjas",
    statusBarStyle: "default"
  }
}

export const viewport: Viewport = {
  themeColor: "#15803d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={mali.variable}>
      <body
        className="antialiased"
        style={{ fontFamily: "var(--font-mali)" }}
      >
        {/* META PIXEL */}
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
            alt=""
          />
        </noscript>

        {/* MERCADOPAGO SDK */}
        <Script
          src="https://sdk.mercadopago.com/js/v2"
          strategy="beforeInteractive"
        />

        {/* PWA INSTALL + SERVICE WORKER */}
        <Script id="pwa-install-handler" strategy="beforeInteractive">
          {`
            window.qygInstallPrompt = null;

            window.addEventListener("beforeinstallprompt", function (event) {
              event.preventDefault();
              window.qygInstallPrompt = event;
              window.dispatchEvent(new Event("qyg-install-ready"));
              console.log("QYG install prompt ready");
            });

            window.addEventListener("appinstalled", function () {
              window.qygInstallPrompt = null;
              window.location.href = "/app?source=pwa-installed";
            });
          `}
        </Script>

        <Script id="register-service-worker" strategy="afterInteractive">
          {`
            if ("serviceWorker" in navigator) {
              navigator.serviceWorker
                .register("/sw.js", { scope: "/" })
                .then(function (registration) {
                  console.log("Service worker registered:", registration.scope);
                  registration.update();
                })
                .catch(function (error) {
                  console.error("Service worker registration failed:", error);
                });
            }
          `}
        </Script>

        {children}
        <Analytics />
      </body>
    </html>
  )
}
