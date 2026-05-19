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

const BARRIOS = [
  { slug: "belgrano", name: "Belgrano", delivery_day: "Lunes y Viernes" },
  { slug: "nunez", name: "Núñez", delivery_day: "Lunes y Viernes" },
  { slug: "saavedra", name: "Saavedra", delivery_day: "Lunes y Viernes" },
  { slug: "partido-vicente-lopez", name: "Partido de Vicente López", delivery_day: "Lunes y Viernes" },
  { slug: "villa-urquiza", name: "Villa Urquiza", delivery_day: "Lunes y Viernes" },
  { slug: "partido-san-martin", name: "Partido de San Martín", delivery_day: "Lunes y Viernes" },
  { slug: "partido-san-isidro", name: "Partido de San Isidro", delivery_day: "Martes y Sábado" },
  { slug: "partido-san-fernando", name: "Partido de San Fernando", delivery_day: "Martes y Sábado" },
  { slug: "partido-tigre", name: "Partido de Tigre", delivery_day: "Martes y Sábado" }
]

function money(value: number) {
  return `$${Math.round(value || 0).toLocaleString("es-AR")}`
}

function ZonaNorteCheckoutContent() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<CheckoutItem[]>([])
  const [neighborhoodSlug, setNeighborhoodSlug] = useState("")
  const [neighborhoodName, setNeighborhoodName] = useState("")
  const [deliveryDay, setDeliveryDay] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"mercadopago" | "cash">("mercadopago")
  const [propina, setPropina] = useState(0)
  const [customPropina, setCustomPropina] = useState("")

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

  const subtotal = useMemo(() => {
    return items.reduce(
      (acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 1),
      0
    )
  }, [items])

  const finalTotal = subtotal + propina

  function updateField(field: string, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  function selectPropina(value: number) {
    setPropina(value)
    setCustomPropina("")
  }

  function updateCustomPropina(value: string) {
    setCustomPropina(value)

    const cleanValue = Number(value || 0)

    if (!Number.isFinite(cleanValue) || cleanValue < 0) {
      setPropina(0)
      return
    }

    setPropina(Math.round(cleanValue))
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

  function trackInitiateCheckout() {
    const fbq = (window as any).fbq
    if (!fbq) return

    localStorage.setItem("qyg_last_checkout_source", "zona_norte")

    fbq("track", "InitiateCheckout", {
      value: finalTotal,
      currency: "ARS",
      num_items: items.reduce((acc, item) => acc + Number(item.quantity || 1), 0),
      content_type: "product",
      content_category: "zona_norte",
      page_path: "/zona-norte/checkout"
    })
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

    if (subtotal < 20000) {
      alert("El pedido mínimo es de $20.000")
      return
    }

    trackInitiateCheckout()

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
          propina,
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

      localStorage.removeItem(ZONA_NORTE_CART_KEY)
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
              <p className="mb-2 font-semibold">
                Propina para el equipo
              </p>

              <p className="mb-3 text-sm text-gray-500">
                Sumá una propina para quienes preparan y entregan tu pedido.
              </p>

              <div className="grid grid-cols-4 gap-2">
                {[0, 1000, 2000, 5000].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => selectPropina(value)}
                    className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                      propina === value && !customPropina
                        ? "border-green-700 bg-green-700 text-white"
                        : "bg-white"
                    }`}
                  >
                    {value === 0 ? "Sin propina" : money(value)}
                  </button>
                ))}
              </div>

              <input
                className="mt-3 w-full rounded-xl border px-4 py-3"
                placeholder="Otro monto"
                inputMode="numeric"
                value={customPropina}
                onChange={(e) => updateCustomPropina(e.target.value)}
              />
            </div>

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
                  {money(Number(item.price || 0) * Number(item.quantity || 1))}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3 border-t pt-4">
            <Row label="Subtotal" value={money(subtotal)} />
            <Row label="Propina" value={money(propina)} />

            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-xl font-bold">
                <span>Total final</span>
                <span>{money(finalTotal)}</span>
              </div>
            </div>

            <p className="mt-2 text-sm text-gray-500">
              Si tenés beneficio disponible, se aplica al confirmar el pedido. La propina no recibe descuento.
            </p>
          </div>
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

export default function ZonaNorteCheckoutPage() {
  return (
    <Suspense fallback={<div className="p-6">Cargando checkout...</div>}>
      <ZonaNorteCheckoutContent />
    </Suspense>
  )
}
