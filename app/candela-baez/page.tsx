"use client"

import { useEffect } from "react"
import Link from "next/link"
import { CANDELA_ATTRIBUTION, saveAttribution } from "@/lib/attribution"

export default function CandelaBaezPage() {
  useEffect(() => {
    saveAttribution(CANDELA_ATTRIBUTION)
  }, [])

  return (
    <main className="min-h-screen bg-green-50 px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="rounded-3xl bg-white p-6 shadow md:p-10">
          <p className="text-sm font-bold uppercase tracking-wide text-green-700">
            Beneficio exclusivo
          </p>

          <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight text-gray-950 md:text-6xl">
            Clientas de Candela Báez tienen 10% OFF en Quintas y Granjas
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-gray-600">
            Comprá frutas, verduras, productos de granja y alimentos saludables
            listos para cocinar. El descuento se aplica automáticamente en tu
            pedido desde web o app.
          </p>

          <div className="mt-6 rounded-2xl bg-green-100 p-5 text-green-950">
            <p className="text-sm font-semibold">Tu beneficio</p>
            <p className="mt-1 text-3xl font-black">10% OFF</p>
            <p className="mt-2 text-sm">
              Válido para compras hechas desde esta URL. No acumulable con otros
              descuentos o puntos.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/#cart"
              className="rounded-2xl bg-green-700 px-6 py-4 text-center font-bold text-white shadow hover:bg-green-800"
            >
              Comprar ahora
            </Link>

            <Link
              href="/app?affiliate=candela-baez"
              className="rounded-2xl border border-green-700 bg-white px-6 py-4 text-center font-bold text-green-800 hover:bg-green-50"
            >
              Entrar a la app
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-5 shadow">
            <p className="text-2xl">🥬</p>
            <h2 className="mt-3 font-bold text-gray-950">Fresco</h2>
            <p className="mt-1 text-sm text-gray-600">
              Productos seleccionados para cocinar mejor en casa.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow">
            <p className="text-2xl">🚚</p>
            <h2 className="mt-3 font-bold text-gray-950">A domicilio</h2>
            <p className="mt-1 text-sm text-gray-600">
              Pedís online y coordinamos la entrega.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow">
            <p className="text-2xl">📱</p>
            <h2 className="mt-3 font-bold text-gray-950">Web o app</h2>
            <p className="mt-1 text-sm text-gray-600">
              El beneficio queda guardado para esta compra.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
