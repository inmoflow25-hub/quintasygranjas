"use client"

import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { BOX_CATALOG } from "@/lib/boxes"
import { getStoredAttribution } from "@/lib/attribution"
import AppBrand from "@/components/app/app-brand"

type CheckoutItem = {
  id?: string
  name?: string
  product_name?: string
  quantity: number
  price: number
}

type GooglePlacesStatus = "manual" | "loading" | "ready" | "error"

function money(value: number) {
  return `$${Math.round(value || 0).toLocaleString("es-AR")}`
}

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const addressInputRef = useRef<HTMLInputElement | null>(null)

  const source = searchParams.get("source")
  const boxId = searchParams.get("box_id")

  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<CheckoutItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<"mercadopago" | "cash" | "mp_transfer">("mercadopago")
  const [propina, setPropina] = useState(0)
  const [customPropina, setCustomPropina] = useState("")
  const [googlePlacesStatus, setGooglePlacesStatus] = useState<GooglePlacesStatus>("manual")

  const mpAlias = process.env.NEXT_PUBLIC_MP_ALIAS || ""

  /**
   * IMPORTANTE:
   *
   * Para que Google Places cargue, en Vercel poné:
   * NEXT_PUBLIC_ENABLE_GOOGLE_PLACES=true
   *
   * Si está vacío, false, o si Google falla, el checkout queda manual.
   */
  const googlePlacesEnabled =
    process.env.NEXT_PUBLIC_ENABLE_GOOGLE_PLACES === "true" &&
    Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)

  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    delivery_address: "",
    delivery_city: "",
    delivery_notes: "",
    google_place_id: "",
    lat: "",
    lng: ""
  })

  useEffect(() => {
    if (source === "cart") {
      const raw = localStorage.getItem("qyg_checkout_cart")
      const parsed = raw ? JSON.parse(raw) : []
      setItems(parsed)
      return
    }

    if (source === "box" && boxId && BOX_CATALOG[boxId]) {
      const box = BOX_CATALOG[boxId]
      setItems([
        {
          id: boxId,
          name: box.name,
          quantity: 1,
          price: box.price
        }
      ])
      return
    }

    setItems([])
  }, [source, boxId])

  useEffect(() => {
    if (!googlePlacesEnabled) {
      setGooglePlacesStatus("manual")
      return
    }

    if (!addressInputRef.current) return
    if (typeof window === "undefined") return

    let autocomplete: any = null
    let destroyed = false

    function initAutocomplete() {
      if (destroyed) return

      const google = (window as any).google

      if (!google?.maps?.places || !addressInputRef.current) {
        setGooglePlacesStatus("error")
        return
      }

      try {
        autocomplete = new google.maps.places.Autocomplete(addressInputRef.current, {
          types: ["address"],
          componentRestrictions: { country: "ar" },
          fields: ["formatted_address", "address_components", "geometry", "place_id"]
        })

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace()

          if (!place?.formatted_address) return

          const components = place.address_components || []

          const locality =
            components.find((c: any) => c.types.includes("locality"))?.long_name ||
            components.find((c: any) => c.types.includes("administrative_area_level_2"))?.long_name ||
            components.find((c: any) => c.types.includes("administrative_area_level_1"))?.long_name ||
            ""

          const lat =
            typeof place.geometry?.location?.lat === "function"
              ? String(place.geometry.location.lat())
              : ""

          const lng =
            typeof place.geometry?.location?.lng === "function"
              ? String(place.geometry.location.lng())
              : ""

          setForm((prev) => ({
            ...prev,
            delivery_address: place.formatted_address,
            delivery_city: locality || prev.delivery_city,
            google_place_id: place.place_id || "",
            lat,
            lng
          }))
        })

        setGooglePlacesStatus("ready")
      } catch (error) {
        console.error("Google Places init error", error)
        setGooglePlacesStatus("error")
      }
    }

    const existingScript = document.getElementById("google-places-script")

    if ((window as any).google?.maps?.places) {
      initAutocomplete()
      return () => {
        destroyed = true
      }
    }

    if (existingScript) {
      setGooglePlacesStatus("loading")

      const timeout = window.setTimeout(() => {
        if (!(window as any).google?.maps?.places) {
          setGooglePlacesStatus("error")
        } else {
          initAutocomplete()
        }
      }, 2500)

      return () => {
        destroyed = true
        window.clearTimeout(timeout)
      }
    }

    setGooglePlacesStatus("loading")

    const script = document.createElement("script")
    script.id = "google-places-script"
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
    script.async = true
    script.defer = true

    script.onload = initAutocomplete

    script.onerror = () => {
      console.error("Google Places script failed")
      setGooglePlacesStatus("error")
    }

    document.body.appendChild(script)

    return () => {
      destroyed = true
    }
  }, [googlePlacesEnabled])

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

  function updateAddressManually(value: string) {
    setForm((prev) => ({
      ...prev,
      delivery_address: value,
      google_place_id: "",
      lat: "",
      lng: ""
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

  function trackInitiateCheckout() {
    const fbq = (window as any).fbq
    if (!fbq) return

    fbq("track", "InitiateCheckout", {
      value: Number(finalTotal || subtotal || 0),
      currency: "ARS",
      num_items: items.reduce((acc, item) => acc + Number(item.quantity || 1), 0),
      content_ids: items.map((item) => String(item.id || item.product_name || item.name || "")),
      content_type: "product"
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!source) {
      alert("Source inválido")
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

    if (!form.delivery_address.trim()) {
      alert("Ingresá tu dirección de entrega")
      return
    }

    if (!form.delivery_city.trim()) {
      alert("Ingresá tu ciudad")
      return
    }

    trackInitiateCheckout()

    setLoading(true)

    try {
  const attribution = getStoredAttribution()

  const res = await fetch("/api/checkout/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
   body: JSON.stringify({
  source,
  app_context: "web",
  box_id: boxId,
  items,
  payment_method: paymentMethod,
  propina,
  affiliate_slug: attribution.affiliate_slug,
  campaign_source: attribution.campaign_source,
  landing_path: attribution.landing_path,
  attribution_label: attribution.attribution_label,
  ...form
})
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data?.error || "Error creando checkout")
        setLoading(false)
        return
      }

      if (paymentMethod === "cash" || paymentMethod === "mp_transfer") {
        localStorage.removeItem("qyg_checkout_cart")
        router.push(data.redirect_to || `/success?order_id=${data.order_id}`)
        return
      }

      if (!data.init_point) {
        alert("Mercado Pago no devolvió init_point")
        setLoading(false)
        return
      }

      localStorage.removeItem("qyg_checkout_cart")
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
          <AppBrand href="/" />
        </div>

        <div className="grid gap-8 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-8 shadow">
          <h1 className="mb-2 text-3xl font-bold text-green-700">Checkout</h1>
          <p className="mb-8 text-gray-600">Completá tus datos antes de pagar.</p>

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
              ref={addressInputRef}
              className="w-full rounded-xl border px-4 py-3"
              placeholder="Dirección de entrega"
              value={form.delivery_address}
              onChange={(e) => updateAddressManually(e.target.value)}
              required
            />

            <p className="text-xs text-gray-500">
              Escribí tu dirección completa. Si aparecen sugerencias, podés elegir una; si no aparecen, igual podés continuar.
            </p>

            {googlePlacesStatus === "loading" && (
              <p className="text-xs text-gray-400">
                Cargando sugerencias de dirección...
              </p>
            )}

            {googlePlacesStatus === "error" && (
              <p className="text-xs text-amber-700">
                Las sugerencias automáticas no están disponibles. Podés escribir tu domicilio manualmente.
              </p>
            )}

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

              <label className="mb-2 flex items-center gap-2">
                <input
                  type="radio"
                  checked={paymentMethod === "mp_transfer"}
                  onChange={() => setPaymentMethod("mp_transfer")}
                />
                Transferencia / alias Mercado Pago
              </label>

              {paymentMethod === "mp_transfer" && (
                <div className="mb-3 rounded-xl bg-green-50 p-4 text-sm text-green-900">
                  <p className="mb-1 font-semibold">Alias Mercado Pago</p>

                  <p className="rounded-lg bg-white px-3 py-2 font-bold">
                    {mpAlias || "Configurar NEXT_PUBLIC_MP_ALIAS"}
                  </p>

                  <p className="mt-2 text-green-800">
                    Transferí el total y después mandanos el comprobante por WhatsApp.
                  </p>
                </div>
              )}

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
              className="w-full rounded-xl bg-green-600 py-3 font-semibold text-white disabled:opacity-60"
            >
              {loading
                ? "Procesando..."
                : paymentMethod === "mercadopago"
                  ? "Ir a pagar"
                  : paymentMethod === "mp_transfer"
                    ? "Confirmar pedido y transferir"
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
          </div>
        </div>
      </div>
    </main>
  )


function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="p-6">Cargando checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  )
}



