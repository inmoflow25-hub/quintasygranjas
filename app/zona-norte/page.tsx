"use client"

import { useRouter } from "next/navigation"
import { Header } from "@/components/landing/header"
import { ZonaNorteHero } from "@/components/landing/zona-norte-hero"
import { DeliveryZones } from "@/components/landing/delivery-zones"
import { FinalCTA } from "@/components/landing/final-cta"
import { Footer } from "@/components/landing/footer"
import ZonaNorteCart from "@/components/zona-norte/zona-norte-cart"
import { useEffect } from "react"

export default function ZonaNortePage() {
useEffect(() => {
  const fireZonaNorteTracking = () => {
    const fbq = (window as any).fbq

    if (!fbq) {
      setTimeout(fireZonaNorteTracking, 500)
      return
    }

    fbq("track", "ViewContent", {
      content_name: "Zona Norte",
      content_category: "zona_norte",
      page_path: "/zona-norte"
    })
  }

  fireZonaNorteTracking()
}, [])
  function onWhatsAppClick() {
    window.open("https://wa.me/5491168303596", "_blank")
  }

  return (
    <main>
      <Header />
     <ZonaNorteHero onWhatsAppClick={onWhatsAppClick} />

      <div id="cart" className="scroll-mt-32">
      <ZonaNorteCart />
      </div>

      <DeliveryZones />
      <FinalCTA onWhatsAppClick={onWhatsAppClick} />
      <Footer onWhatsAppClick={onWhatsAppClick} />
    </main>
  )
}
