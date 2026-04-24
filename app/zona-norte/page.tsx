"use client"

import ZonaNorteCart from "@/components/zona-norte/zona-norte-cart"
import { useEffect, useState } from "react"
import Link from "next/link"

const ZONA_NORTE_CONTEXT_KEY = "qyg_zona_norte_context"

const BARRIOS = [
  {
    slug: "belgrano",
    name: "Belgrano",
    delivery_day: "Lunes",
    progress: 55
  },
  {
    slug: "nunez",
    name: "Núñez",
    delivery_day: "Lunes",
    progress: 50
  },
  {
    slug: "saavedra",
    name: "Saavedra",
    delivery_day: "Lunes",
    progress: 45
  },
  {
    slug: "partido-vicente-lopez",
    name: "Partido de Vicente López",
    delivery_day: "Lunes",
    progress: 70
  },
  {
    slug: "partido-san-isidro",
    name: "Partido de San Isidro",
    delivery_day: "Martes",
    progress: 40
  },
  {
    slug: "partido-san-fernando",
    name: "Partido de San Fernando",
    delivery_day: "Martes",
    progress: 30
  },
  {
    slug: "partido-tigre",
    name: "Partido de Tigre",
    delivery_day: "Martes",
    progress: 65
  }
]

export default function ZonaNortePage() {
  const [selected, setSelected] = useState(BARRIOS[0])

  useEffect(() => {
    const raw = localStorage.getItem(ZONA_NORTE_CONTEXT_KEY)

    if (raw) {
      const parsed = JSON.parse(raw)
      const found = BARRIOS.find((b) => b.slug === parsed.neighborhood_slug)

      if (found) {
        setSelected(found)
        return
      }
    }

    localStorage.setItem(
      ZONA_NORTE_CONTEXT_KEY,
      JSON.stringify({
        neighborhood_slug: BARRIOS[0].slug,
        neighborhood_name: BARRIOS[0].name,
        delivery_day: BARRIOS[0].delivery_day
      })
    )
  }, [])

  function chooseBarrio(barrio: typeof BARRIOS[number]) {
    setSelected(barrio)

    localStorage.setItem(
      ZONA_NORTE_CONTEXT_KEY,
      JSON.stringify({
        neighborhood_slug: barrio.slug,
        neighborhood_name: barrio.name,
        delivery_day: barrio.delivery_day
      })
    )
  }

  return (
    <main className="min-h-screen bg-green-50 px-6 py-10">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-3xl bg-white p-8 shadow">
          <p className="mb-2 text-sm font-semibold uppercase text-green-700">
            Zona Norte
          </p>

          <h1 className="mb-3 text-4xl font-bold text-green-800">
            Comprá en tu barrio y sumá beneficios
          </h1>

          <p className="max-w-2xl text-lg text-gray-700">
            Elegí tu zona, armá tu pedido y ayudá a completar el objetivo semanal
            para acceder a beneficios en próximas compras.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow md:col-span-1">
            <h2 className="mb-4 text-xl font-bold">
              Elegí tu barrio
            </h2>

            <div className="space-y-2">
              {BARRIOS.map((barrio) => (
                <button
                  key={barrio.slug}
                  onClick={() => chooseBarrio(barrio)}
                  className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                    selected.slug === barrio.slug
                      ? "border-green-600 bg-green-100"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <p className="font-semibold">{barrio.name}</p>
                  <p className="text-sm text-gray-500">
                    Entrega: {barrio.delivery_day}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow md:col-span-2">
            <p className="mb-2 text-sm font-semibold text-green-700">
              Estás comprando en
            </p>

            <h2 className="mb-2 text-3xl font-bold">
              {selected.name}
            </h2>

            <p className="mb-6 text-gray-600">
              Día de entrega: <strong>{selected.delivery_day}</strong>
            </p>

            <div className="mb-6 rounded-xl border bg-green-50 p-5">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-semibold">
                  Avance semanal para beneficio
                </p>
                <p className="font-bold text-green-700">
                  {selected.progress}%
                </p>
              </div>

              <div className="h-4 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-green-600"
                  style={{ width: `${selected.progress}%` }}
                />
              </div>

              <p className="mt-3 text-sm text-gray-600">
                Las compras de esta semana ayudan a completar el objetivo para
                beneficios en próximas compras.
              </p>
            </div>

            <div className="rounded-xl border border-dashed p-6 text-center">
              <p className="mb-4 text-lg font-semibold">
                Próximo paso: conectar el carrito Zona Norte
              </p>

              <p className="mb-5 text-sm text-gray-500">
                El barrio ya queda guardado. Falta agregar el carrito especial
                que manda a /zona-norte/checkout.
              </p>

              <Link
                href="/zona-norte/checkout"
                className="inline-block rounded-xl bg-green-600 px-6 py-3 font-semibold text-white"
              >
                Ir al checkout Zona Norte
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
