"use client"

import { useEffect } from "react"

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
    provider: "google",
    options: {
      redirectTo: window.location.origin
    }
  })
}

async function createCheckout(
  boxType: "veggie" | "campo" | "granja",
  userId: string
) {

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
      user_id: userId,
      box_type: boxType
    })
  })

  const data = await res.json()

  if (data.url) {
    window.location.href = data.url
  }
}

async function onSelectBox(boxType: "veggie" | "campo" | "granja") {

  console.log("CLICK", boxType)

  const sessionRes = await supabase.auth.getSession()

  const session = sessionRes.data.session

  if (!session || !session.user) {

    console.log("NO SESSION → LOGIN")

    localStorage.setItem("selected_box", boxType)

    window.location.href = "/login-google"

    return
  }

  console.log("SESSION OK", session.user.id)

  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: boxType === "veggie"
        ? "Caja Veggie"
        : boxType === "campo"
        ? "Caja Campo"
        : "Caja Granja",
      price: 0,
      user_id: session.user.id,
      box_type: boxType
    })
  })

  const data = await res.json()

  console.log("CHECKOUT RESPONSE", data)

  if (data.url) {
    window.location.href = data.url
  } else {
    console.error("NO URL", data)
  }
}

export default function Home() {

 useEffect(() => {

  const {
    data: { subscription }
  } = supabase.auth.onAuthStateChange(async (event, session) => {

    if (event === "SIGNED_IN" && session?.user) {

      const savedBox = localStorage.getItem("selected_box")

      if (!savedBox) return

      localStorage.removeItem("selected_box")

      await createCheckout(
        savedBox as "veggie" | "campo" | "granja",
        session.user.id
      )
    }

  })

  return () => subscription.unsubscribe()

}, [])

function onWhatsAppClick() {
  window.open(
    "https://wa.me/5491133614865?text=Hola%20quiero%20información%20sobre%20las%20cajas",
    "_blank"
  )
}
  
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

