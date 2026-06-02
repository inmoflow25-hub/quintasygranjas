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

          {/* BLOQUE 10% OFF */}
          <div className="mb-7 max-w-xl rounded-3xl border border-white/30 bg-white/95 p-5 shadow-2xl backdrop-blur">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-green-700">
              Primera compra
            </p>

            <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-end sm:gap-4">
              <span className="text-5xl font-black leading-none text-green-800 md:text-6xl">
                10% OFF
              </span>

              <span className="pb-1 text-lg font-semibold text-[#1f2a1f]">
                automático en tu pedido
              </span>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-gray-700">
              Comprás fresco, directo de productores, y en tu primera compra el descuento se aplica solo.
            </p>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Alimentos frescos directo de productores a tu mesa
          </h1>

          <p className="mt-6 text-lg md:text-xl text-white/90 leading-relaxed max-w-xl">
            Armá tu caja con los productos que quieras o elegí una ya lista. Sin supermercado. Sin filas. Sin pagar de más.
          </p>

          <p className="mt-6 text-lg md:text-xl text-white/90 leading-relaxed max-w-xl">
            Después seguís sumando beneficios con tu domicilio: cada 4 compras, 10% OFF.
          </p>

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
