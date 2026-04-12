"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"

interface HeroProps {
  onWhatsAppClick: () => void
}

const images = [
  "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/CAJA%20CAMPO.png",
  "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/FOTO%20CAJAVEGGIE.png",
  "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/WhatsApp%20Image%202026-03-14%20at%2011.13.19.jpeg"
]

export function Hero({ onWhatsAppClick }: HeroProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">

      {/* 🔥 BARRA SUPERIOR */}
      <div className="absolute top-0 left-0 w-full z-20 bg-green-600 text-white text-sm text-center py-2">
        🚚 Envío GRATIS en CABA y GBA Norte · 🧺 Pedido mínimo $20.000
      </div>

      {/* SLIDER */}
      <div className="absolute inset-0 z-0">
        <img
          src={images[index]}
          alt="Caja de verduras"
          className="w-full h-full object-cover transition-opacity duration-1000"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
      </div>

      {/* CONTENIDO */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
           Alimentos directamente de productores a tu mesa
          </h1>

          <p className="mt-6 text-lg md:text-xl text-white/90 leading-relaxed max-w-xl">
            Armá tu caja con los productos que quieras o elegí una ya lista. Sin supermercado. Sin filas. Sin pagar de más.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">

            {/* 🔥 CTA 1 */}
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6"
              onClick={() => {
                document.getElementById("cart")?.scrollIntoView({ behavior: "smooth" })
              }}
            >
              Armar tu caja
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            {/* 🔥 CTA 2 */}
            <Button
              size="lg"
              className="bg-white text-black hover:bg-gray-200 text-lg px-8 py-6"
              onClick={() => {
                document.getElementById("cajas")?.scrollIntoView({ behavior: "smooth" })
              }}
            >
              Ver cajas armadas
            </Button>

          </div>
        </div>
      </div>
    </section>
  )
}
