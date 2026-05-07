"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"

type CheckoutItem = {
  id?: string
  name?: string
  product_name?: string
  quantity: number
  price: number
}

function CheckoutContent() {
  const router = useRouter()
  const params = useParams()
  const slug = String(params?.slug || "")

  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<CheckoutItem[]>([])
  const [location, setLocation] = useState<any>(null)
  const [paymentMethod, setPaymentMethod] = useState<"mercadopago" | "cash">("mercadopago")

  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    apartment_floor: "",
    apartment_unit: "",
    delivery_notes: ""
  })

  useEffect(() => {
    const raw = localStorage.getItem("qyg_vecinos_cart")
    const parsed = raw ? JSON.parse(raw) : []
    setItems(parsed)
  }, [])

  useEffect(() => {
    async function loadLocation() {
      const res = await fetch(`/api/vecinos/location?slug=${encodeURIComponent(slug)}`)
      const data = await res.json()

      if (!res.ok) {
        alert(data?.error || "Edificio inválido")
        router.push(`/vecinos/${slug}`)
        return
      }

      setLocation(data.location)
    }

    if (slug) loadLocation()
  }, [slug, router])

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!location?.id) {
      alert("Edificio inválido")
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
      const res = await fetch("/api/vecinos/checkout/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          commercial_location_id: location.id,
          items,
          payment_method: paymentMethod,
          ...form
        })
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data?.error || "Error creando checkout")
        setLoading(false)
        return
      }

      if (paymentMethod === "cash") {
        localStorage.removeItem("qyg_vecinos_cart")
        router.push(data.redirect_to || `/success?order_id=${data.order_id}`)
        return
      }

      if (!data.init_point) {
        alert("Mercado Pago no devolvió init_point")
        setLoading(false)
        return
      }

      localStorage.removeItem("qyg_vecinos_cart")
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
          <h1 className="mb-2 text-3xl font-bold text-green-700">
            Checkout vecinos
          </h1>

          <p className="mb-2 text-gray-600">
            Edificio: <strong>{location?.name || slug}</strong>
          </p>

          <p className="mb-8 text-sm text-gray-500">
            {location?.address || "Dirección a definir"}
            {location?.city ? ` · ${location.city}` : ""}
          </p>

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

            <div className="grid grid-cols-2 gap-3">
              <input
                className="w-full rounded-xl border px-4 py-3"
                placeholder="Piso"
                value={form.apartment_floor}
                onChange={(e) => updateField("apartment_floor", e.target.value)}
                required
              />

              <input
                className="w-full rounded-xl border px-4 py-3"
                placeholder="Depto"
                value={form.apartment_unit}
                onChange={(e) => updateField("apartment_unit", e.target.value)}
                required
              />
            </div>

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
              Total: ${total.toLocaleString("es-AR")}
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function VecinosCheckoutPage() {
  return (
    <Suspense fallback={<div className="p-6">Cargando checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  )
}
