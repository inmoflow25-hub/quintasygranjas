"use client"

import { useEffect, useState } from "react"

type PointsSummary = {
  available_points: number
  available_discount_value: number
  current_level_name: string
  next_expiration_at: string | null
}

type AppRewardsHeroProps = {
  userName?: string
  points: PointsSummary | null
}

const images = [
  "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/CAJA%20CAMPO.png",
  "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/FOTO%20CAJAVEGGIE.png",
  "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/WhatsApp%20Image%202026-03-14%20at%2011.13.19.jpeg"
]

const LEVELS = [
  "Nivel 1 — Semilla",
  "Nivel 2 — Brote",
  "Nivel 3 — Huerta",
  "Nivel 4 — Granja"
]

function money(value: number) {
  return `$${Math.round(value || 0).toLocaleString("es-AR")}`
}

export default function AppRewardsHero({
  userName,
  points
}: AppRewardsHeroProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  const firstName = userName?.split(" ")[0] || "bienvenido"

  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-green-950 text-white shadow-xl">
      <div className="absolute inset-0">
        <img
          src={images[index]}
          alt="Quintas y Granjas"
          className="h-full w-full object-cover transition-opacity duration-1000"
        />

        <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-green-950/75 to-black/40" />
      </div>

      <div className="relative z-10 px-5 py-7 sm:px-7 sm:py-8">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-green-200">
          Quintas y Granjas App
        </p>

        <h1 className="mt-2 text-4xl font-black leading-tight">
          Hola, {firstName}
        </h1>

        <p className="mt-3 max-w-xl text-base leading-relaxed text-white/85">
          Sumás puntos con tus compras y los convertís en descuento para
          próximos pedidos.
        </p>

        <div className="mt-6 grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-white/12 p-3 backdrop-blur">
            <p className="text-xs text-white/70">Puntos</p>
            <p className="mt-1 text-2xl font-black">
              {points?.available_points || 0}
            </p>
          </div>

          <div className="rounded-2xl bg-white/12 p-3 backdrop-blur">
            <p className="text-xs text-white/70">Disponible</p>
            <p className="mt-1 text-2xl font-black">
              {money(points?.available_discount_value || 0)}
            </p>
          </div>

          <div className="rounded-2xl bg-white/12 p-3 backdrop-blur">
            <p className="text-xs text-white/70">Nivel</p>
            <p className="mt-1 text-sm font-black leading-tight">
              {points?.current_level_name || "Nivel 1 — Semilla"}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-white/95 p-4 text-green-950">
          <p className="text-sm font-black">
            ¿Cómo funciona?
          </p>

          <p className="mt-1 text-sm leading-relaxed text-green-950/75">
            Cada compra suma puntos. Cuando tenés saldo disponible, podés usarlo
            como descuento en tu próximo pedido.
          </p>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {LEVELS.map((level) => {
              const isCurrent = level === points?.current_level_name

              return (
                <span
                  key={level}
                  className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold ${
                    isCurrent
                      ? "bg-green-700 text-white"
                      : "bg-green-50 text-green-900"
                  }`}
                >
                  {level}
                </span>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
