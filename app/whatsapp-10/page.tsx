"use client"

import { useEffect, useState } from "react"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Header } from "@/components/landing/header"
import { DeliveryZones } from "@/components/landing/delivery-zones"
import { Footer } from "@/components/landing/footer"
import CartCategorySelectorWeb from "@/components/cart/cart-category-selector-web"

import {
  getScheduledDelivery,
  type DeliverySchedule
} from "@/lib/delivery-schedule"

const images = [
  "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/CAJA%20CAMPO.png",
  "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/FOTO%20CAJAVEGGIE.png",
  "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/WhatsApp%20Image%202026-03-14%20at%2011.13.19.jpeg"
]

export default function WhatsApp10Page() {
  const [index, setIndex] = useState(0)
  const [deliverySchedule, setDeliverySchedule] =
    useState<DeliverySchedule | null>(null)

useEffect(() => {
  localStorage.removeItem("qyg_affiliate_slug")

  localStorage.setItem(
    "qyg_campaign_source",
    "meta_interaccion_whatsapp"
  )

  localStorage.setItem(
    "qyg_landing_path",
    "/whatsapp-10"
  )

  localStorage.setItem(
    "qyg_attribution_label",
    "WhatsApp 10% 24hs"
  )

  localStorage.setItem(
    "qyg_app_context",
    "webwhapp"
  )
}, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setDeliverySchedule(getScheduledDelivery(new Date()))
  }, [])

  function onWhatsAppClick() {
    window.open("https://wa.me/5491176518605", "_blank")
  }

  function scrollToCart() {
    document
      .getElementById("cart")
      ?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <main>
      <Header />

      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute top-0 left-0 w-full z-20 bg-green-700 text-white text-sm text-center py-2 px-3">
          🚚 Envío GRATIS en CABA Norte y GBA Norte · 🧺 Pedido mínimo $20.000
        </div>

        <div className="absolute inset-0 z-0">
          <img
            src={images[index]}
            alt="Productos frescos Quintas y Granjas"
            className="w-full h-full object-cover transition-opacity duration-1000"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/10" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex max-w-full flex-col rounded-2xl bg-green-700/95 px-6 py-5 text-white shadow-2xl">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-white/80">
                Promo WhatsApp · 24 hs
              </p>

              <div className="mt-2 flex items-end gap-2">
                <span className="text-5xl font-black leading-none md:text-6xl">
                  10%
                </span>

                <span className="pb-1 text-2xl font-black uppercase leading-none">
                  OFF
                </span>
              </div>

              <p className="mt-3 text-lg font-black leading-tight">
                Por responder nuestro mensaje, activaste tu beneficio.
              </p>

              <p className="mt-2 text-sm leading-relaxed text-white/90 md:text-base">
                En tu primera compra tenés 10% de descuento automático.
                Después seguís ahorrando: cada compra suma puntos que podés
                usar como descuento en tus próximas compras.
              </p>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Tu súper de zona norte
            </h1>

            <p className="mt-6 text-lg md:text-xl text-white/90 leading-relaxed max-w-xl">
              Armá tu caja con los productos que quieras o elegí una ya lista.
              Sin supermercado. Sin filas.
            </p>

            <div className="mb-6 mt-5 inline-flex max-w-full items-center rounded-full border border-white/25 bg-black/40 px-4 py-2 text-sm font-bold text-white backdrop-blur-sm md:text-base">
              Comprando ahora, recibís{" "}
              {deliverySchedule
                ? deliverySchedule.scheduledDeliveryLabel.toLowerCase()
                : "en la próxima entrega programada"}
            </div>

            <p className="mt-3 text-sm font-semibold text-white/75 md:text-base">
              Entregamos todos los lunes y viernes · Envío gratis en CABA Norte
              y GBA Norte
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6"
                onClick={scrollToCart}
              >
                Usar mi 10% OFF
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div id="cart" className="scroll-mt-32">
       <CartCategorySelectorWeb />
      </div>

      <DeliveryZones />

      <Footer onWhatsAppClick={onWhatsAppClick} />
    </main>
  )
}
