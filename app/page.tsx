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

type BoxType = "veggie" | "campo" | "granja"

const BOX_DB_IDS: Record<BoxType, string> = {
  veggie: "dff394c8-6a17-45e8-ba3f-960c27f8d76c",
  campo: "d9c75e5b-3e8b-4d3d-9776-d65ad9afae1c",
  granja: "d5b70577-a2b7-47d7-9ccd-e2f336e25af7"
}

async function loginGoogle() {
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin
    }
  })
}

async function createCheckout(boxType: BoxType, userId: string) {
  const boxId = BOX_DB_IDS[boxType]

  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      box_id: boxId,
      user_id: userId
    })
  })

  const data = await res.json()

  console.log("CHECKOUT RESPONSE", data)

  if (data.url) {
    window.location.href = data.url
    return
  }

  console.error("CHECKOUT ERROR", data)
  alert(data.error || "No se pudo iniciar el checkout")
}

async function onSelectBox(boxType: BoxType) {
  console.log("CLICK", boxType)

  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session?.user) {
    localStorage.setItem("selected_box", boxType)
    await loginGoogle()
    return
  }

  await createCheckout(boxType, session.user.id)
}

function onWhatsAppClick() {
  window.open(
    "https://wa.me/5491133614865?text=Hola%20quiero%20información%20sobre%20las%20cajas",
    "_blank"
  )
}

export default function Home() {
  useEffect(() => {
    const restoreCheckout = async () => {
      const savedBox = localStorage.getItem("selected_box") as BoxType | null
      if (!savedBox) return

      const {
        data: { session }
      } = await supabase.auth.getSession()

      if (!session?.user) return

      localStorage.removeItem("selected_box")
      await createCheckout(savedBox, session.user.id)
    }

    restoreCheckout()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const savedBox = localStorage.getItem("selected_box") as BoxType | null
        if (!savedBox) return

        localStorage.removeItem("selected_box")
        await createCheckout(savedBox, session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

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
