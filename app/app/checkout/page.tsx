"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { getStoredAttribution, isCandelaAttribution } from "@/lib/attribution"
import AppBrand from "@/components/app/app-brand"

type CartItem = {
  id: string
  name: string
  product_name?: string
  quantity: number
  price: number
}

type AppUser = {
  id: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  neighborhood: string
}

type PointsSummary = {
  available_points: number
  available_discount_value: number
  current_level_name: string
  next_expiration_at: string | null
  max_redemption_percent: number
}

function money(value: number) {
  return `$${Math.round(value || 0).toLocaleString("es-AR")}`
}

export default function AppCheckoutPage() {
  const router = useRouter()

  const [items, setItems] = useState<CartItem[]>([])
  const [user, setUser] = useState<AppUser | null>(null)
  const [points, setPoints] = useState<PointsSummary | null>(null)
  const [appliedDiscount, setAppliedDiscount] = useState(0)
  const [pointsNeeded, setPointsNeeded] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<"mercadopago" | "cash" | "mp_transfer">("mercadopago")
  const [loading, setLoading] = useState(false)
  const [isCandelaOrder, setIsCandelaOrder] = useState(false)

  
  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    delivery_address: "",
    delivery_city: "",
    delivery_notes: ""
  })

  const subtotal = useMemo(() => {
    return items.reduce(
      (acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 1),
      0
    )
  }, [items])

  const candelaDiscount = isCandelaOrder ? Math.round(subtotal * 0.1) : 0
const finalTotal = Math.max(subtotal - candelaDiscount - appliedDiscount, 1)

useEffect(() => {
  function resetLoading() {
    setLoading(false)
  }

  window.addEventListener("pageshow", resetLoading)
  window.addEventListener("focus", resetLoading)

  return () => {
    window.removeEventListener("pageshow", resetLoading)
    window.removeEventListener("focus", resetLoading)
  }
}, [])

  
useEffect(() => {
  const savedCart = localStorage.getItem("qyg_app_cart")
  const parsedCart = savedCart ? JSON.parse(savedCart) : []
  setItems(parsedCart)

  const attribution = getStoredAttribution()
  const candelaOrder = isCandelaAttribution(attribution)
  setIsCandelaOrder(candelaOrder)

  const email = localStorage.getItem("qyg_app_email") || ""
  const phone = localStorage.getItem("qyg_app_phone") || ""

  if (email || phone) {
    loadUser(email, phone)

    if (!candelaOrder) {
      loadPoints(email, phone)
    }
  }
}, [])

  async function loadUser(email: string, phone: string) {
    const res = await fetch("/api/app/me", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, phone })
    })

    const data = await res.json()

    if (data?.user) {
      setUser(data.user)

      setForm({
        customer_name: data.user.name || "",
        customer_email: data.user.email || email,
        customer_phone: data.user.phone || phone,
        delivery_address: data.user.address || "",
        delivery_city: data.user.city || "",
        delivery_notes: ""
      })
    }
  }

  async function loadPoints(email: string, phone: string) {
    const res = await fetch("/api/app/points", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, phone })
    })

    const data = await res.json()
    setPoints(data?.points || null)
  }

  function updateField(field: string, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }))
  }

async function applyMaxPoints() {
  if (!points || points.available_points <= 0) return

  if (subtotal < 20000) {
    alert("El pedido mínimo es de $20.000")
    return
  }

  const res = await fetch("/api/app/redemption/quote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subtotal,
      points_to_spend: points.available_points
    })
  })

  const data = await res.json()

  if (!res.ok) {
    alert(data?.error || "No se pudo calcular el descuento")
    return
  }

  setAppliedDiscount(Number(data.applied_discount || 0))
  setPointsNeeded(Number(data.points_needed_for_applied_discount || 0))
}

function removePoints() {
  setAppliedDiscount(0)
  setPointsNeeded(0)
}

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!items.length) {
      alert("No hay productos en el carrito")
      return
    }

    if (subtotal < 20000) {
      alert("El pedido mínimo es de $20.000")
      return
    }

    if (!form.customer_name || !form.customer_email || !form.customer_phone) {
      alert("Completá tus datos")
      return
    }

    if (!form.delivery_address || !form.delivery_city) {
      alert("Completá la dirección de entrega")
      return
    }

localStorage.setItem("qyg_app_email", form.customer_email.trim().toLowerCase())
localStorage.setItem("qyg_app_phone", form.customer_phone.trim())
    
    setLoading(true)

   try {
  const attribution = getStoredAttribution()

  const res = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
       body: JSON.stringify({
  source: "cart",
  app_context: "pwa",
  items,
  payment_method: paymentMethod,
  propina: 0,
  points_to_spend: isCandelaOrder ? 0 : pointsNeeded,
  affiliate_slug: attribution.affiliate_slug,
  campaign_source: attribution.campaign_source,
  landing_path: attribution.landing_path,
  attribution_label: attribution.attribution_label,
  ...form
})
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data?.error || "Error creando pedido")
        setLoading(false)
        return
      }

      localStorage.removeItem("qyg_app_cart")

      if (paymentMethod === "cash" || paymentMethod === "mp_transfer") {
        router.push(data.redirect_to || `/success?order_id=${data.order_id}`)
        return
      }

      if (!data.init_point) {
        alert("Mercado Pago no devolvió init_point")
        setLoading(false)
        return
      }

      window.location.href = data.init_point
    } catch (error) {
      console.error(error)
      alert("Error de red")
      setLoading(false)
    }
  }

   return (
    <main className="min-h-screen bg-green-50 px-4 py-6 pb-28 md:pb-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex justify-center">
          <AppBrand href="/app" />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-3xl bg-white p-6 shadow">
            <h1 className="text-3xl font-bold text-gray-900">
              Finalizá tu pedido
            </h1>

            <p className="mt-2 text-gray-600">
              Confirmá tus datos, elegí cómo pagar y aplicá tus puntos si tenés disponibles.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <input
                className="w-full rounded-xl border px-4 py-3"
                placeholder="Nombre y apellido"
                value={form.customer_name}
                onChange={(e) => updateField("customer_name", e.target.value)}
                required
              />

              <input
                className="w-full rounded-xl border px-4 py-3"
                placeholder="Email"
                type="email"
                value={form.customer_email}
                onChange={(e) => updateField("customer_email", e.target.value)}
                required
              />

              <input
                className="w-full rounded-xl border px-4 py-3"
                placeholder="WhatsApp"
                value={form.customer_phone}
                onChange={(e) => updateField("customer_phone", e.target.value)}
                required
              />

              <input
                className="w-full rounded-xl border px-4 py-3"
                placeholder="Dirección de entrega"
                value={form.delivery_address}
                onChange={(e) => updateField("delivery_address", e.target.value)}
                required
              />

              <input
                className="w-full rounded-xl border px-4 py-3"
                placeholder="Ciudad"
                value={form.delivery_city}
                onChange={(e) => updateField("delivery_city", e.target.value)}
                required
              />

              <textarea
                className="w-full rounded-xl border px-4 py-3"
                placeholder="Notas para la entrega"
                value={form.delivery_notes}
                onChange={(e) => updateField("delivery_notes", e.target.value)}
              />

              <div className="rounded-2xl border p-4">
                <p className="mb-3 font-semibold">Método de pago</p>

                <label className="mb-2 flex items-center gap-2">
                  <input
                    type="radio"
                    checked={paymentMethod === "mercadopago"}
                    onChange={() => setPaymentMethod("mercadopago")}
                  />
                  Tarjeta / Mercado Pago
                </label>

                <label className="mb-2 flex items-center gap-2">
                  <input
                    type="radio"
                    checked={paymentMethod === "mp_transfer"}
                    onChange={() => setPaymentMethod("mp_transfer")}
                  />
                  Transferencia
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={paymentMethod === "cash"}
                    onChange={() => setPaymentMethod("cash")}
                  />
                  Efectivo contra entrega
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-green-700 py-3 font-bold text-white disabled:opacity-60"
              >
                {loading ? "Procesando..." : "Confirmar pedido"}
              </button>
            </form>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow">
            <h2 className="mb-4 text-2xl font-bold">Tu pedido</h2>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="flex items-center justify-between border-b pb-3"
                >
                  <div>
                    <p className="font-semibold">
                      {item.name || item.product_name}
                    </p>
                    <p className="text-sm text-gray-500">x{item.quantity}</p>
                  </div>

                  <p className="font-bold">
                    {money(Number(item.price || 0) * Number(item.quantity || 1))}
                  </p>
                </div>
              ))}
            </div>

            {points && !isCandelaOrder && (
              <div className="mt-6 rounded-2xl bg-green-50 p-4">
                <p className="font-bold text-green-800">Tus puntos</p>

                <p className="mt-1 text-sm text-green-900">
                  {points.available_points > 0
                    ? `Tenés ${points.available_points} puntos disponibles.`
                    : "Todavía no tenés puntos disponibles."}
                </p>

                {points.available_points > 0 ? (
                  <>
                    <p className="mt-1 text-sm text-green-900">
                      Podés usarlos como descuento en este pedido.
                    </p>

                    {appliedDiscount > 0 ? (
                      <div className="mt-4 rounded-xl bg-white p-3">
                        <p className="text-sm font-semibold text-green-800">
                          Aplicaste {pointsNeeded} puntos.
                        </p>
                        <p className="text-sm text-green-900">
                          Ahorrás {money(appliedDiscount)} en este pedido.
                        </p>

                        <button
                          type="button"
                          onClick={removePoints}
                          className="mt-3 w-full rounded-xl border border-green-700 px-4 py-3 font-semibold text-green-700"
                        >
                          Quitar puntos
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={applyMaxPoints}
                        className="mt-4 w-full rounded-xl bg-green-700 px-4 py-3 font-semibold text-white"
                      >
                        Usar mis puntos disponibles
                      </button>
                    )}
                  </>
                ) : (
                  <p className="mt-2 text-sm text-green-900">
                    Comprá desde la app y sumá puntos para descontar en próximas compras.
                  </p>
                )}
              </div>
            )}

            <div className="mt-6 space-y-3 border-t pt-4">
              <Row label="Subtotal" value={money(subtotal)} />

              {candelaDiscount > 0 && (
                <Row label="Beneficio Candela" value={`-${money(candelaDiscount)}`} />
              )}

              {appliedDiscount > 0 && (
                <Row label="Puntos" value={`-${money(appliedDiscount)}`} />
              )}

              <div className="border-t pt-4">
                <div className="flex items-center justify-between text-xl font-bold">
                  <span>Total final</span>
                  <span>{money(finalTotal)}</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}
