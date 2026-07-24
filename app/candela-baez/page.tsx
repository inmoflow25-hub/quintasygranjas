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
      <section className="relative min-h-screen overflow-hidden px-4 py-8">
        <div className="absolute inset-0">
          <img
            src={images[index]}
            alt="Productos frescos Quintas y Granjas"
            className="h-full w-full object-cover transition-opacity duration-1000"
          />

          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#06150a]/95 via-[#06150a]/70 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#06150a]/90 via-transparent to-[#06150a]/30" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-6xl flex-col">
          <div className="flex items-center justify-between">
            <AppBrand
              href="/"
              logoClassName="h-14 w-auto md:h-16"
            />

            <div className="hidden rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur md:block">
              Beneficio exclusivo
            </div>
          </div>

          <div className="flex flex-1 items-center py-10">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-green-900 shadow">
                <span className="h-2 w-2 rounded-full bg-green-600" />
                Invitación privada de Candela Báez
              </div>

              <div className="mb-7 inline-flex items-center gap-4 rounded-2xl bg-green-600 px-5 py-4 shadow-2xl">
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

              <h1 className="text-4xl font-black leading-tight text-white md:text-6xl">
                Pedí fresco en casa con un beneficio de Candela.
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85 md:text-xl">
                Frutas, verduras y productos de granja directo a tu mesa.
                Tu 10% OFF queda guardado automáticamente desde esta invitación.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/#cart"
                  className="rounded-2xl bg-green-600 px-8 py-4 text-center text-lg font-black text-white shadow-2xl transition hover:bg-green-700"
                >
                  Comprar con 10% OFF
                </Link>

                <Link
                  href="/app?affiliate=candela-baez"
                  className="rounded-2xl bg-white px-8 py-4 text-center text-lg font-black text-green-900 shadow-2xl transition hover:bg-green-50"
                >
                  Entrar a la app
                </Link>
              </div>

              <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/60">
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
