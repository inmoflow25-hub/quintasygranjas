"use client"

import { useRouter } from "next/navigation"
import { Hero } from "@/components/landing/hero"
import { HowItWorks } from "@/components/landing/how-it-works"
import { BoxesSection } from "@/components/landing/boxes-section"
import { SocialProof } from "@/components/landing/social-proof"
import { DeliveryZones } from "@/components/landing/delivery-zones"
import { FinalCTA } from "@/components/landing/final-cta"
import { Footer } from "@/components/landing/footer"
import { Header } from "@/components/landing/header"
import Cart from "@/components/cart/cart"

type BoxType = "veggie" | "campo" | "granja"

const BOX_DB_IDS: Record<BoxType, string> = {
  veggie: "dff394c8-6a17-45e8-ba3f-960c27f8d76c",
  campo: "d9c75e5b-3e8b-4d3d-9776-d65ad9afae1d",
  granja: "d5b70577-a2b7-47d7-9ccd-e2f336e25af7"
}

export default function Home() {
  const router = useRouter()

  function onSelectBox(boxType: BoxType) {
    const boxId = BOX_DB_IDS[boxType]
    router.push(`/checkout?source=box&box_id=${boxId}`)
  }

  function onWhatsAppClick() {
    window.open("https://wa.me/5491168303596", "_blank")
  }

  return (
    <main>
      <Header />
      <Hero onWhatsAppClick={onWhatsAppClick} />
      <HowItWorks />
      <div id="cart" className="scroll-mt-32">
        <Cart />
      </div>
      <BoxesSection onSelectBox={onSelectBox} />
      <SocialProof />
      <DeliveryZones />
      <FinalCTA onWhatsAppClick={onWhatsAppClick} />
      <Footer onWhatsAppClick={onWhatsAppClick} />
    </main>
  )
}
