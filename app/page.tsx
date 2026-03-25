"use client"

import { useEffect, useState } from "react"
import CheckoutBrick from "@/components/checkout/checkout-brick"

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
  campo: "d9c75e5b-3e8b-4d3d-9776-d65ad9afae1d",
  granja: "d5b70577-a2b7-47d7-9ccd-e2f336e25af7"
}

export default function Home() {
  const [preferenceId, setPreferenceId] = useState<string | null>(null)
  const [showLogin, setShowLogin] = useState(false)
  const [email, setEmail] = useState("")
  const [selectedBox, setSelectedBox] = useState<BoxType | null>(null)

  // 🔥 LOGIN DESACTIVADO (NO SE USA MÁS)
  async function loginWithEmail() {
    return
  }

  // 🔥 CHECKOUT SIN USER
  async function createCheckout(boxType: BoxType) {
    const boxId = BOX_DB_IDS[boxType]

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        box_id: boxId
      })
    })

    const data = await res.json()

    console.log("CHECKOUT RESPONSE", data)

    // 🔥 REDIRECCIÓN DIRECTA A MERCADOPAGO
    if (data.init_point) {
      window.location.href = data.init_point
      return
    }

    // fallback si seguís usando brick
    if (data.preference_id) {
      setPreferenceId(data.preference_id)
      return
    }

    console.error("CHECKOUT ERROR", data)
    alert(data.error || "No se pudo iniciar el checkout")
  }

  // 🔥 SIN LOGIN
  async function onSelectBox(boxType: BoxType) {
    console.log("CLICK", boxType)

    await createCheckout(boxType)
  }

  function onWhatsAppClick() {
    window.open(
      "https://wa.me/5491133614865?text=Hola%20quiero%20información%20sobre%20las%20cajas",
      "_blank"
    )
  }

  useEffect(() => {
    // 🔥 BLOQUE ORIGINAL, PERO DESACTIVADO
    const restoreCheckout = async () => {
      return
    }

    restoreCheckout()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async () => {
      return
    })

    return () => subscription.unsubscribe()
  }, [selectedBox])

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

      {/* LOGIN MODAL (NO BORRADO, SOLO DESACTIVADO) */}
      {showLogin && false && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              Ingresá tu email para continuar
            </h2>

            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
            />

            <button
              onClick={loginWithEmail}
              className="w-full bg-green-700 text-white py-2 rounded-lg"
            >
              Enviar link
            </button>

            <button
              onClick={() => setShowLogin(false)}
              className="mt-3 w-full text-gray-500"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL (SE MANTIENE) */}
      {preferenceId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg">
            <CheckoutBrick preferenceId={preferenceId} />

            <button
              onClick={() => setPreferenceId(null)}
              className="mt-4 w-full bg-gray-900 text-white py-2 rounded-lg"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

