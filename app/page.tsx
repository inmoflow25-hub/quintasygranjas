"use client"

import { Hero } from "@/components/landing/hero"
import { HowItWorks } from "@/components/landing/how-it-works"
import { BoxesSection } from "@/components/landing/boxes-section"
import { SocialProof } from "@/components/landing/social-proof"
import { DeliveryZones } from "@/components/landing/delivery-zones"
import { FinalCTA } from "@/components/landing/final-cta"
import { Footer } from "@/components/landing/footer"
import { Header } from "@/components/landing/header"

import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function loginGoogle() {
  await supabase.auth.signInWithOAuth({
    provider: "google"
  })
}

async function onSelectBox(boxType: "veggie" | "campo" | "granja") {

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    await loginGoogle()
    return
  }

  const boxes = {
    veggie: { title: "Caja Veggie", price: 8000 },
    campo: { title: "Caja Campo", price: 14000 },
    granja: { title: "Caja Granja", price: 18000 }
  }

  const box = boxes[boxType]

  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: box.title,
      price: box.price,
      user_id: user.id
    })
  })

  const data = await res.json()

  if (data.url) {
    window.location.href = data.url
  }
}

function onWhatsAppClick() {
  window.open(
    "https://wa.me/5491133614865?text=Hola%20quiero%20información%20sobre%20las%20cajas",
    "_blank"
  )
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
