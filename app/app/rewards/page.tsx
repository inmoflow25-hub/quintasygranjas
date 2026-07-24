"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AppNav from "@/components/app/app-nav"
import AppBrand from "@/components/app/app-brand"


type PointsSummary = {
  points_balance: number
  available_points: number
  lifetime_points: number
  available_discount_value: number
  next_expiration_at: string | null
  point_value_ars: number
  max_redemption_percent: number
  minimum_order_amount_for_redemption: number
}

function money(value: number) {
  return `$${Math.round(value || 0).toLocaleString("es-AR")}`
}

function formatDate(value: string | null) {
  if (!value) return "Sin vencimiento próximo"

  return new Date(value).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  })
}

export default function AppRewardsPage() {
  const router = useRouter()

  const [points, setPoints] = useState<PointsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")

  useEffect(() => {
    loadPoints()
  }, [])

  async function loadPoints() {
    const email = localStorage.getItem("qyg_app_email") || ""
    const phone = localStorage.getItem("qyg_app_phone") || ""

    if (!email && !phone) {
      setMessage("Ingresá a la app con tu email o WhatsApp para ver tus puntos.")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/app/points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          phone
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage(data?.error || "No se pudieron consultar tus puntos.")
        return
      }

      setPoints(data?.points || null)
    } catch {
      setMessage("No se pudieron consultar tus puntos.")
    } finally {
      setLoading(false)
    }
  }

   return (
    <main className="min-h-screen bg-green-50 px-4 py-6 pb-28 md:pb-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex justify-center">
          <AppBrand href="/app" />
        </div>

        <AppNav />

        <section className="rounded-3xl bg-white p-6 shadow">
          <h1 className="text-3xl font-bold text-gray-900">Mis puntos</h1>

          <p className="mt-2 text-gray-600">
            Consultá tus puntos cashback disponibles para usar como descuento en próximas compras.
          </p>
        </section>

        {loading && (
          <section className="rounded-3xl bg-white p-6 shadow">
            Cargando puntos...
          </section>
        )}

        {!loading && message && (
          <section className="rounded-3xl bg-white p-6 shadow">
            <p className="font-semibold text-gray-900">{message}</p>

            <button
              onClick={() => router.push("/app")}
              className="mt-4 rounded-xl bg-green-700 px-4 py-3 font-bold text-white"
            >
              Ir a la app
            </button>
          </section>
        )}

        {!loading && points && (
          <>
            <section className="rounded-3xl bg-green-700 p-6 text-white shadow">
              <p className="text-sm font-semibold text-green-100">
                Puntos disponibles
              </p>

              <p className="mt-2 text-5xl font-black">
                {points.available_points}
              </p>

              <p className="mt-3 text-green-50">
                Equivalen a{" "}
                <span className="font-bold">
                  {money(points.available_discount_value)}
                </span>{" "}
                de descuento.
              </p>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow">
              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <p className="text-sm font-semibold text-gray-500">
                    Puntos acumulados
                  </p>

                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {points.lifetime_points}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-500">
                    Próximo vencimiento
                  </p>

                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {formatDate(points.next_expiration_at)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-500">
                    Límite de uso
                  </p>

                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    Hasta {points.max_redemption_percent}% del pedido
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow">
              <h2 className="text-xl font-bold text-gray-900">
                Cómo usarlos
              </h2>

              <p className="mt-2 text-gray-600">
                Al pagar tu pedido desde la app, vas a poder usar tus puntos como descuento.
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Pedido mínimo para usar puntos:{" "}
                <span className="font-semibold">
                  {money(points.minimum_order_amount_for_redemption)}
                </span>
              </p>

              <button
                onClick={() => router.push("/app")}
                className="mt-5 w-full rounded-xl bg-green-700 px-4 py-3 font-bold text-white"
              >
                Comprar desde la app
              </button>
            </section>
          </>
        )}
      </div>
    </main>
  )
}

