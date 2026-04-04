"use client"

import { Hero } from "@/components/landing/hero"
import { HowItWorks } from "@/components/landing/how-it-works"
import { BoxesSection } from "@/components/landing/boxes-section"
import { SocialProof } from "@/components/landing/social-proof"
import { DeliveryZones } from "@/components/landing/delivery-zones"
import { FinalCTA } from "@/components/landing/final-cta"
import { Footer } from "@/components/landing/footer"
import { Header } from "@/components/landing/header"

type BoxType = "veggie" | "campo" | "granja"

const BOX_DB_IDS: Record<BoxType, string> = {
  veggie: "dff394c8-6a17-45e8-ba3f-960c27f8d76c",
  campo: "d9c75e5b-3e8b-4d3d-9776-d65ad9afae1d",
  granja: "d5b70577-a2b7-47d7-9ccd-e2f336e25af7"
}

export default function Home() {

  async function onSelectBox(boxType: BoxType) {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        box_id: BOX_DB_IDS[boxType]
      })
    })

    const data = await res.json()

    if (data.init_point) {
      window.location.href = data.init_point
    } else {
      alert("Error iniciando pago")
    }
  }

  function onWhatsAppClick() {
    window.open("https://wa.me/5491133614865", "_blank")
  }

  return (
    <main>
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
