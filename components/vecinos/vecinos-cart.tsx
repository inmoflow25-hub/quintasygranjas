"use client"

import { useMemo, useState } from "react"

type Product = {
  id: string
  name: string
  price: number
  type?: string | null
  image?: string | null
  category?: string | null
  description?: string | null
}

type CommercialLocation = {
  id: string
  slug: string
  name: string
  address: string | null
  city: string | null
  delivery_day: string | null
  next_delivery_date: string | null
}

type CartItem = Product & {
  quantity: number
}

function money(value: number) {
  return `$${Math.round(value).toLocaleString("es-AR")}`
}

export default function VecinosCart({
  location,
  products
}: {
  location: CommercialLocation
  products: Product[]
}) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<"mercadopago" | "cash">("mercadopago")
  const [loading, setLoading] = useState(false)

  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [apartmentFloor, setApartmentFloor] = useState("")
  const [apartmentUnit, setApartmentUnit] = useState("")
  const [notes, setNotes] = useState("")

  const categories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category || "otros")))
  }, [products])

  const total = cart.reduce(
    (acc, item) => acc + Number(item.price || 0) * item.quantity,
    0
  )

  function addItem(product: Product) {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)

      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [...prev, { ...product, quantity: 1 }]
    })
  }

  function removeItem(product: Product) {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)

      if (!existing) return prev

      if (existing.quantity <= 1) {
        return prev.filter((item) => item.id !== product.id)
      }

      return prev.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    })
  }

  function getQuantity(productId: string) {
    return cart.find((item) => item.id === productId)?.quantity || 0
  }

  async function submitOrder() {
    if (!cart.length) {
      alert("Agregá productos al pedido")
      return
    }

    if (total < 20000) {
      alert("El pedido mínimo es de $20.000")
      return
    }

    if (!customerName || !customerEmail || !customerPhone || !apartmentFloor || !apartmentUnit) {
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
          items: cart.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: Number(item.price || 0)
          })),
          payment_method: paymentMethod,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          apartment_floor: apartmentFloor,
          apartment_unit: apartmentUnit,
          delivery_notes: notes
        })
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data?.error || "No se pudo crear el pedido")
        setLoading(false)
        return
      }

      if (data.init_point) {
        window.location.href = data.init_point
        return
      }

      if (data.redirect_to) {
        window.location.href = data.redirect_to
        return
      }

      alert("Pedido creado")
    } catch (error) {
      console.error(error)
      alert("Error creando pedido")
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-green-50 px-4 py-6 text-[#1f2a1f]">
      <div className="mx-auto max-w-7xl">
        <section className="mb-6 rounded-3xl bg-white p-6 shadow">
          <p className="text-sm font-bold uppercase tracking-wide text-green-700">
            Compra comunitaria
          </p>

          <h1 className="mt-2 text-4xl font-serif font-bold">
            {location.name}
          </h1>

          <p className="mt-2 text-gray-600">
            Entrega: <strong>{location.delivery_day || "A definir"}</strong>
            {location.next_delivery_date ? ` · ${location.next_delivery_date}` : ""}
          </p>

          <p className="mt-1 text-gray-600">
            {location.address || "Dirección a definir"}
            {location.city ? ` · ${location.city}` : ""}
          </p>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <section className="space-y-8">
            {categories.map((category) => {
              const categoryProducts = products.filter(
                (product) => (product.category || "otros") === category
              )

              return (
                <div key={category}>
                  <h2 className="mb-3 text-2xl font-serif font-bold capitalize">
                    {category.replaceAll("_", " ")}
                  </h2>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {categoryProducts.map((product) => {
                      const quantity = getQuantity(product.id)

                      return (
                        <div
                          key={product.id}
                          className="rounded-3xl bg-white p-4 shadow-sm"
                        >
                          {product.image && (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="mb-3 h-36 w-full rounded-2xl object-cover"
                            />
                          )}

                          <h3 className="font-bold">{product.name}</h3>

                          {product.description && (
                            <p className="mt-1 text-sm text-gray-500">
                              {product.description}
                            </p>
                          )}

                          <p className="mt-2 text-xl font-bold">
                            {money(Number(product.price || 0))}
                          </p>

                          <div className="mt-3 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => removeItem(product)}
                              className="h-9 w-9 rounded-full bg-gray-200 font-bold"
                            >
                              -
                            </button>

                            <span className="font-bold">{quantity}</span>

                            <button
                              type="button"
                              onClick={() => addItem(product)}
                              className="h-9 w-9 rounded-full bg-green-700 font-bold text-white"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </section>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-3xl bg-white p-5 shadow">
              <h2 className="text-2xl font-serif font-bold">
                Tu pedido
              </h2>

              <div className="mt-4 space-y-2">
                {cart.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Todavía no agregaste productos.
                  </p>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between gap-3 rounded-2xl bg-green-50 p-3 text-sm"
                    >
                      <div>
                        <p className="font-bold">{item.name}</p>
                        <p className="text-gray-500">x{item.quantity}</p>
                      </div>

                      <p className="font-bold">
                        {money(Number(item.price || 0) * item.quantity)}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 border-t pt-4">
                <p className="text-2xl font-bold">
                  Total: {money(total)}
                </p>
              </div>

              <div className="mt-5 space-y-3">
                <input
                  className="w-full rounded-xl border p-3"
                  placeholder="Nombre y apellido"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />

                <input
                  className="w-full rounded-xl border p-3"
                  placeholder="Email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />

                <input
                  className="w-full rounded-xl border p-3"
                  placeholder="WhatsApp"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />

                <div className="grid grid-cols-2 gap-3">
                  <input
                    className="w-full rounded-xl border p-3"
                    placeholder="Piso"
                    value={apartmentFloor}
                    onChange={(e) => setApartmentFloor(e.target.value)}
                  />

                  <input
                    className="w-full rounded-xl border p-3"
                    placeholder="Depto"
                    value={apartmentUnit}
                    onChange={(e) => setApartmentUnit(e.target.value)}
                  />
                </div>

                <textarea
                  className="w-full rounded-xl border p-3"
                  placeholder="Notas para la entrega"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />

                <div className="rounded-2xl border p-3">
                  <label className="mb-2 flex gap-2">
                    <input
                      type="radio"
                      checked={paymentMethod === "mercadopago"}
                      onChange={() => setPaymentMethod("mercadopago")}
                    />
                    Tarjeta / MercadoPago
                  </label>

                  <label className="flex gap-2">
                    <input
                      type="radio"
                      checked={paymentMethod === "cash"}
                      onChange={() => setPaymentMethod("cash")}
                    />
                    Efectivo contra entrega
                  </label>
                </div>

                <button
                  type="button"
                  onClick={submitOrder}
                  disabled={loading}
                  className="w-full rounded-2xl bg-green-700 py-4 text-lg font-bold text-white disabled:opacity-60"
                >
                  {loading ? "Procesando..." : "Confirmar pedido"}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
