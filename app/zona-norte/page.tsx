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
    if (typeof window !== "undefined" && (window as any).fbq) {
      ;(window as any).fbq("trackCustom", "ZonaNorteView")
    }
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
