"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CANDELA_ATTRIBUTION, saveAttribution } from "@/lib/attribution"
import AppBrand from "@/components/app/app-brand"

const images = [
  "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/CAJA%20CAMPO.png",
  "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/FOTO%20CAJAVEGGIE.png",
  "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/WhatsApp%20Image%202026-03-14%20at%2011.13.19.jpeg"
]

export default function CandelaBaezPage() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    saveAttribution(CANDELA_ATTRIBUTION)

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return (
    <main className="min-h-screen bg-[#06150a] text-white">
      <section className="relative min-h-screen overflow-hidden px-4 py-6">
        <div className="absolute inset-0">
          <img
            src={images[index]}
            alt="Productos frescos Quintas y Granjas"
            className="h-full w-full object-cover transition-opacity duration-1000"
          />

          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#06150a]/95 via-[#06150a]/65 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#06150a]/85 via-transparent to-[#06150a]/20" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-6xl flex-col">
          <div className="mb-8 flex items-center justify-between">
            <div className="inline-flex rounded-2xl bg-white/95 px-4 py-3 shadow-2xl">
              <AppBrand href="/" logoClassName="h-14 w-auto md:h-16" />
            </div>

            <div className="hidden rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white backdrop-blur md:block">
              Beneficio exclusivo
            </div>
          </div>

          <div className="flex flex-1 items-center pb-6">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-green-900 shadow">
                <span className="h-2 w-2 rounded-full bg-green-600" />
                Invitación privada de Candela Báez
              </div>

              <div className="mb-6 inline-flex items-center gap-4 rounded-2xl bg-green-600 px-5 py-4 shadow-2xl">
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-black leading-none md:text-6xl">
                    10%
                  </span>

                  <span className="pb-1 text-2xl font-black uppercase leading-none">
                    OFF
                  </span>
                </div>

                <div className="h-12 w-px bg-white/30" />

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/75">
                    Beneficio activado
                  </p>

                  <p className="text-base font-bold leading-tight md:text-lg">
                    En tu pedido web o app
                  </p>
                </div>
              </div>

              <h1 className="max-w-xl text-4xl font-black leading-tight text-white md:text-5xl">
                Pedí fresco en casa con 10% OFF.
              </h1>

              <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/85">
                Frutas, verduras y productos de granja directo a tu mesa.
                El beneficio de Candela queda guardado automáticamente.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/#cart"
                  className="rounded-2xl bg-green-600 px-7 py-4 text-center text-base font-black text-white shadow-2xl transition hover:bg-green-700"
                >
                  Comprar con 10% OFF
                </Link>

                <Link
                  href="/app?affiliate=candela-baez"
                  className="rounded-2xl bg-white px-7 py-4 text-center text-base font-black text-green-900 shadow-2xl transition hover:bg-green-50"
                >
                  Entrar a la app
                </Link>
              </div>

              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/60">
                Beneficio exclusivo para compras originadas desde esta invitación.
                No acumulable con puntos ni otros descuentos.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
