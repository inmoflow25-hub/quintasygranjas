"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CANDELA_ATTRIBUTION, saveAttribution } from "@/lib/attribution"

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
    <main className="min-h-screen bg-black text-white">
      <section className="relative flex min-h-screen items-center overflow-hidden px-4 py-10">
        <div className="absolute inset-0">
          <img
            src={images[index]}
            alt="Productos frescos Quintas y Granjas"
            className="h-full w-full object-cover transition-opacity duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/25" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-6xl">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-green-900 shadow">
              <span className="h-2 w-2 rounded-full bg-green-600" />
              Invitación privada de Candela Báez
            </div>

            <div className="mb-7 inline-flex max-w-full flex-col rounded-2xl bg-green-700/95 px-6 py-4 text-white shadow-2xl sm:flex-row sm:items-center sm:gap-5">
              <div className="flex items-end gap-2">
                <span className="text-6xl font-black leading-none md:text-7xl">
                  10%
                </span>
                <span className="pb-2 text-3xl font-black uppercase leading-none">
                  OFF
                </span>
              </div>

              <div className="mt-3 sm:mt-0">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/80">
                  Beneficio activado
                </p>
                <p className="text-lg font-semibold leading-tight">
                  Para comprar en web o entrar a la app
                </p>
              </div>
            </div>

            <h1 className="text-4xl font-black leading-tight text-white md:text-6xl">
              Candela te dejó un beneficio para pedir fresco en casa.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/90 md:text-xl">
              Frutas, verduras, productos de granja y alimentos saludables.
              Tu 10% OFF queda guardado desde esta invitación.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/#cart"
                className="rounded-2xl bg-green-600 px-8 py-4 text-center text-lg font-black text-white shadow-2xl hover:bg-green-700"
              >
                Comprar con 10% OFF
              </Link>

              <Link
                href="/app?affiliate=candela-baez"
                className="rounded-2xl bg-white px-8 py-4 text-center text-lg font-black text-green-900 shadow-2xl hover:bg-green-50"
              >
                Entrar a la app
              </Link>
            </div>

            <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/70">
              Beneficio exclusivo para compras originadas desde esta invitación.
              No acumulable con puntos ni otros descuentos.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
