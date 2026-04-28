"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

type CheckoutItem = {
  id?: string
  name?: string
  product_name?: string
  quantity: number
  price: number
}

const ZONA_NORTE_CONTEXT_KEY = "qyg_zona_norte_context"
const ZONA_NORTE_CART_KEY = "qyg_zona_norte_cart"

const BARRIOS: Barrio[] = [
  { slug: "belgrano", name: "Belgrano", delivery_day: "Lunes y Viernes" },
  { slug: "nunez", name: "Núñez", delivery_day: "Lunes y Viernes" },
  { slug: "saavedra", name: "Saavedra", delivery_day: "Lunes y Viernes" },
  { slug: "partido-vicente-lopez", name: "Partido de Vicente López", delivery_day: "Lunes y Viernes" },
  { slug: "partido-san-isidro", name: "Partido de San Isidro", delivery_day: "Martes y Sábado" },
  { slug: "partido-san-fernando", name: "Partido de San Fernando", delivery_day: "Martes y Sábado" },
  { slug: "partido-tigre", name: "Partido de Tigre", delivery_day: "Martes y Sábado" }
]

function ZonaNorteCheckoutContent() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<CheckoutItem[]>([])
  const [neighborhoodSlug, setNeighborhoodSlug] = useState("")
  const [neighborhoodName, setNeighborhoodName] = useState("")
  const [deliveryDay, setDeliveryDay] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"mercadopago" | "cash">("mercadopago")

  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    delivery_address: "",
    delivery_city: "",
    delivery_notes: ""
  })

  useEffect(() => {
    const rawCart = localStorage.getItem(ZONA_NORTE_CART_KEY)
    const parsedCart = rawCart ? JSON.parse(rawCart) : []
    setItems(Array.isArray(parsedCart) ? parsedCart : [])

    const rawContext = localStorage.getItem(ZONA_NORTE_CONTEXT_KEY)
    const parsedContext = rawContext ? JSON.parse(rawContext) : null

    if (parsedContext?.neighborhood_slug) {
      setNeighborhoodSlug(parsedContext.neighborhood_slug)
      setNeighborhoodName(parsedContext.neighborhood_name || "")
      setDeliveryDay(parsedContext.delivery_day || "")
    }
  }, [])

  const total = useMemo(() => {
    return items.reduce(
      (acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 1),
      0
    )
  }, [items])

  function updateField(field: string, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  function handleNeighborhoodChange(value: string) {
    const barrio = BARRIOS.find((b) => b.slug === value)

    if (!barrio) {
      setNeighborhoodSlug("")
      setNeighborhoodName("")
      setDeliveryDay("")
      localStorage.removeItem(ZONA_NORTE_CONTEXT_KEY)
      return
    }

    setNeighborhoodSlug(barrio.slug)
    setNeighborhoodName(barrio.name)
    setDeliveryDay(barrio.delivery_day)

    localStorage.setItem(
      ZONA_NORTE_CONTEXT_KEY,
      JSON.stringify({
        neighborhood_slug: barrio.slug,
        neighborhood_name: barrio.name,
        delivery_day: barrio.delivery_day
      })
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!neighborhoodSlug) {
      alert("Elegí tu barrio antes de finalizar la compra")
      return
    }

    if (!items.length) {
      alert("No hay items para comprar")
      return
    }

    if (total < 20000) {
      alert("El pedido mínimo es de $20.000")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/zona-norte/checkout/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          source: "zona-norte",
          neighborhood_slug: neighborhoodSlug,
          items,
          payment_method: paymentMethod,
          ...form
        })
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data?.error || "Error creando checkout Zona Norte")
        setLoading(false)
        return
      }

      if (paymentMethod === "cash") {
        localStorage.removeItem(ZONA_NORTE_CART_KEY)
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
    <main className="min-h-screen bg-green-50 px-6 py-10">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-8 shadow">
          <p className="mb-2 text-sm font-semibold text-green-700">
            Compra Zona Norte
          </p>

          <h1 className="mb-2 text-3xl font-bold text-green-700">
            Checkout
          </h1>

          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="mb-3 text-sm font-semibold">
              Elegí tu barrio/zona
            </p>

            <select
              className="w-full rounded-xl border bg-white px-4 py-3"
              value={neighborhoodSlug}
              onChange={(e) => handleNeighborhoodChange(e.target.value)}
              required
            >
              <option value="">Seleccionar barrio</option>
              {BARRIOS.map((barrio) => (
                <option key={barrio.slug} value={barrio.slug}>
                  {barrio.name} - Entrega {barrio.delivery_day}
                </option>
              ))}
            </select>

            {neighborhoodName && (
              <p className="mt-3 text-sm text-gray-700">
                Barrio/Zona: <strong>{neighborhoodName}</strong> · Entrega:{" "}
                <strong>{deliveryDay}</strong>
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="Teléfono / WhatsApp"
              value={form.customer_phone}
              onChange={(e) => updateField("customer_phone", e.target.value)}
              required
            />

            <input
              className="w-full rounded-xl border px-4 py-3"
              placeholder="Dirección"
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

            <div className="rounded-xl border p-4">
              <p className="mb-3 font-semibold">Método de pago</p>

              <label className="mb-2 flex items-center gap-2">
                <input
                  type="radio"
                  checked={paymentMethod === "mercadopago"}
                  onChange={() => setPaymentMethod("mercadopago")}
                />
                Tarjetas débito / crédito
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
              className="w-full rounded-xl bg-green-600 py-3 font-semibold text-white"
            >
              {loading
                ? "Procesando..."
                : paymentMethod === "mercadopago"
                  ? "Ir a pagar"
                  : "Confirmar pedido"}
            </button>
          </form>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow">
          <h2 className="mb-6 text-2xl font-bold">Tu pedido</h2>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={`${item.id || item.name}-${index}`}
                className="flex items-center justify-between border-b pb-3"
              >
                <div>
                  <p className="font-medium">{item.name || item.product_name}</p>
                  <p className="text-sm text-gray-500">x{item.quantity}</p>
                </div>

                <p className="font-semibold">
                  ${(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString("es-AR")}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t pt-4">
            <p className="text-xl font-bold">
              Total base: ${total.toLocaleString("es-AR")}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Si tenés beneficio disponible, se aplica al confirmar el pedido.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function ZonaNorteCheckoutPage() {
  return (
    <Suspense fallback={<div className="p-6">Cargando checkout...</div>}>
      <ZonaNorteCheckoutContent />
    </Suspense>
  )
}
