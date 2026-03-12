//app/page.tsx
"use client"

import { Hero } from "@/components/landing/hero"
import { HowItWorks } from "@/components/landing/how-it-works"
import { BoxesSection } from "@/components/landing/boxes-section"
import { SocialProof } from "@/components/landing/social-proof"
import { DeliveryZones } from "@/components/landing/delivery-zones"
import { FinalCTA } from "@/components/landing/final-cta"
import { Footer } from "@/components/landing/footer"
import { Header } from "@/components/landing/header"

function onSelectBox(boxType: "veggie" | "campo" | "granja") {
  console.log(`[v0] Selected box: ${boxType}`)
  // Backend connection will be implemented here
}

function onWhatsAppClick() {
  console.log("[v0] WhatsApp button clicked")
  window.open("https://wa.me/5491100000000?text=Hola!%20Quiero%20reservar%20mi%20caja%20semanal", "_blank")
}

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero onWhatsAppClick={onWhatsAppClick} />
      <HowItWorks />
      <BoxesSection onSelectBox={onSelectBox} />
      <SocialProof />
      <DeliveryZones />
      <FinalCTA onWhatsAppClick={onWhatsAppClick} />
      <Footer onWhatsAppClick={onWhatsAppClick} />
    </main>
  )
}
