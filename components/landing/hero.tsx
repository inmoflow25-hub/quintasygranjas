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

      {/* BARRA SUPERIOR */}
      <div className="absolute top-0 left-0 w-full z-20 bg-green-700 text-white text-sm text-center py-2">
        🚚 Envío GRATIS en CABA y GBA Norte · 🧺 Pedido mínimo $20.000
      </div>

      {/* SLIDER */}
      <div className="absolute inset-0 z-0">
        <img
          src={images[index]}
          alt="Caja de verduras"
          className="w-full h-full object-cover transition-opacity duration-1000"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/10" />
      </div>

      {/* CONTENIDO */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">

          <div className="mb-6 flex flex-wrap items-center gap-3 text-white">
            <span className="h-px w-10 bg-white/70" />

            <span className="text-sm font-semibold uppercase tracking-[0.28em] text-white/90">
              Primera compra
            </span>

            <span className="rounded-full border border-white/40 bg-white/10 px-4 py-1.5 text-sm font-semibold backdrop-blur">
              10% OFF automático
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Alimentos frescos directo de productores a tu mesa
          </h1>

          <p className="mt-6 text-lg md:text-xl text-white/90 leading-relaxed max-w-xl">
            Armá tu caja con los productos que quieras o elegí una ya lista.
            Sin supermercado. Sin filas. Sin pagar de más.
          </p>

          <div className="mt-6 max-w-xl border-l-2 border-white/50 pl-5">
            <p className="text-lg md:text-xl text-white/95 leading-relaxed">
              En tu primera compra tenés{" "}
              <span className="font-bold text-white">10% de descuento</span>.
              Después, cada 4 compras, volvés a recibir otro 10% OFF.
            </p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6"
              onClick={() => {
                document.getElementById("cart")?.scrollIntoView({ behavior: "smooth" })
              }}
            >
              Armar tu pedido
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
