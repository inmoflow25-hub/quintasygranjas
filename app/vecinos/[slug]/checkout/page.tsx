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

function money(value: number) {
  return `$${Math.round(value || 0).toLocaleString("es-AR")}`
}

function CheckoutContent() {
  const router = useRouter()
  const params = useParams()
  const slug = String(params?.slug || "")

  const [loading, setLoading] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)
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

  const [propina, setPropina] = useState(0)
  const [customPropina, setCustomPropina] = useState("")

  const [preview, setPreview] = useState({
    subtotal: 0,
    discount_percent: 0,
    discount_amount: 0,
    propina: 0,
    final_price: 0
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

  const subtotal = useMemo(() => {
    return items.reduce(
      (acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 1),
      0
    )
  }, [items])

  useEffect(() => {
    async function loadPreview() {
      if (!location?.id || !items.length) {
        setPreview({
          subtotal,
          discount_percent: 0,
          discount_amount: 0,
          propina,
          final_price: subtotal + propina
        })
        return
      }

      setPreviewLoading(true)

      try {
        const res = await fetch("/api/vecinos/checkout/preview", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            commercial_location_id: location.id,
            customer_email: form.customer_email,
            items,
            propina
          })
        })

        const data = await res.json()

        if (res.ok) {
          setPreview({
            subtotal: Number(data.subtotal || 0),
            discount_percent: Number(data.discount_percent || 0),
            discount_amount: Number(data.discount_amount || 0),
            propina: Number(data.propina || 0),
            final_price: Number(data.final_price || 0)
          })
        }
      } catch (error) {
        console.error("preview error", error)
      } finally {
        setPreviewLoading(false)
      }
    }

    const timeout = setTimeout(loadPreview, 350)
    return () => clearTimeout(timeout)
  }, [location?.id, items, form.customer_email, propina, subtotal])

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

    if (subtotal < 20000) {
      alert("El pedido mínimo es de $20.000")
      return
    }

    if (
      !form.customer_name ||
      !form.customer_email ||
      !form.customer_phone ||
      !form.apartment_floor ||
      !form.apartment_unit
    ) {
      alert("Completá nombre, email, teléfono, piso y departamento")
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
          propina,
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
            {items.length === 0 && (
              <p className="text-sm text-gray-500">
                No hay productos cargados.
              </p>
            )}

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
            <Row label="Subtotal" value={money(preview.subtotal || subtotal)} />

            {preview.discount_percent > 0 && (
              <Row
                label={`Descuento ${preview.discount_percent}%`}
                value={`- ${money(preview.discount_amount)}`}
              />
            )}

            <Row label="Propina" value={money(preview.propina || propina)} />

            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-xl font-bold">
                <span>Total final</span>
                <span>{money(preview.final_price || subtotal + propina)}</span>
              </div>

              {previewLoading && (
                <p className="mt-2 text-xs text-gray-500">
                  Actualizando total...
                </p>
              )}
            </div>
          </div>

          {preview.discount_percent > 0 && (
            <div className="mt-5 rounded-2xl bg-green-100 p-4 text-sm text-green-900">
              Tenés un beneficio activo. Se aplica sobre los productos, no sobre la propina.
            </div>
          )}

          <div className="mt-5 rounded-2xl bg-[#f5f5f3] p-4 text-sm text-gray-600">
            Tu compra suma al progreso comunitario de la manzana. Si se activa el beneficio al cierre, vas a poder usarlo en una próxima compra.
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

export default function VecinosCheckoutPage() {
  return (
    <Suspense fallback={<div className="p-6">Cargando checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  )
}

