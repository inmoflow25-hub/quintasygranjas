"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

type Product = {
  id: string
  slug: string
  name: string
  price: number
  image: string
  category: string
  description: string
  type: string
  unit_label: string
  app_exclusive: boolean
  app_promo: boolean
  promo_label: string
}

type CartItem = Product & {
  quantity: number
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
}

function money(value: number) {
  return `$${Math.round(value || 0).toLocaleString("es-AR")}`
}

export default function AppHomePage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [user, setUser] = useState<AppUser | null>(null)
  const [points, setPoints] = useState<PointsSummary | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)

  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
  }, [cart])

  useEffect(() => {
    const savedEmail = localStorage.getItem("qyg_app_email") || ""
    const savedPhone = localStorage.getItem("qyg_app_phone") || ""

    setEmail(savedEmail)
    setPhone(savedPhone)

    fetchProducts()

    if (savedEmail || savedPhone) {
      identifyCustomer(savedEmail, savedPhone)
    }
  }, [])

  async function fetchProducts() {
    const res = await fetch("/api/app/products")
    const data = await res.json()

    if (data?.products) {
      setProducts(data.products)
    }
  }

  async function identifyCustomer(nextEmail = email, nextPhone = phone) {
    if (!nextEmail && !nextPhone) {
      alert("Ingresá email o WhatsApp")
      return
    }

    setLoading(true)

    try {
      localStorage.setItem("qyg_app_email", nextEmail)
      localStorage.setItem("qyg_app_phone", nextPhone)

      const meRes = await fetch("/api/app/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: nextEmail,
          phone: nextPhone
        })
      })

      const meData = await meRes.json()

      if (meData?.user) {
        setUser(meData.user)
      }

      const pointsRes = await fetch("/api/app/points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: nextEmail,
          phone: nextPhone
        })
      })

      const pointsData = await pointsRes.json()
      setPoints(pointsData?.points || null)
    } finally {
      setLoading(false)
    }
  }

  function addToCart(product: Product) {
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

  function removeFromCart(productId: string) {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  function goToCheckout() {
    if (subtotal < 20000) {
      alert("El pedido mínimo es de $20.000")
      return
    }

    localStorage.setItem("qyg_app_cart", JSON.stringify(cart))
    router.push("/app/checkout")
  }

  return (
    <main className="min-h-screen bg-green-50 px-4 py-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <InstallAppButton />
        <section className="rounded-3xl bg-white p-6 shadow">
          <p className="text-sm font-semibold text-green-700">
            Quintas y Granjas App
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Hola{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>

          <p className="mt-2 text-gray-600">
            Comprá más rápido, acumulá puntos y repetí tus pedidos.
          </p>

          {!user && (
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <input
                className="rounded-xl border px-4 py-3"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                className="rounded-xl border px-4 py-3"
                placeholder="WhatsApp"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <button
                onClick={() => identifyCustomer()}
                disabled={loading}
                className="rounded-xl bg-green-700 px-4 py-3 font-semibold text-white disabled:opacity-60"
              >
                {loading ? "Buscando..." : "Entrar"}
              </button>
            </div>
          )}
        </section>

        {points && (
          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-white p-5 shadow">
              <p className="text-sm text-gray-500">Tus puntos</p>
              <p className="mt-1 text-3xl font-bold text-green-700">
                {points.available_points}
              </p>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow">
              <p className="text-sm text-gray-500">Valor disponible</p>
              <p className="mt-1 text-3xl font-bold text-green-700">
                {money(points.available_discount_value)}
              </p>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow">
              <p className="text-sm text-gray-500">Nivel</p>
              <p className="mt-1 text-xl font-bold text-green-700">
                {points.current_level_name}
              </p>
            </div>
          </section>
        )}

        <section className="flex gap-3">
          <button
            onClick={() => router.push("/app/orders")}
            className="rounded-xl bg-white px-4 py-3 font-semibold shadow"
          >
            Mis pedidos
          </button>

          <button
            onClick={() => router.push("/app/profile")}
            className="rounded-xl bg-white px-4 py-3 font-semibold shadow"
          >
            Mi perfil
          </button>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold">Productos app</h2>

          <div className="grid gap-4 md:grid-cols-3">
            {products.map((product) => {
              const cartItem = cart.find((item) => item.id === product.id)

              return (
                <div
                  key={product.id}
                  className="rounded-2xl border bg-white p-4"
                >
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="mb-3 h-36 w-full rounded-xl object-cover"
                    />
                  )}

                  <div className="mb-2 flex gap-2">
                    {product.app_exclusive && (
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                        Exclusivo app
                      </span>
                    )}

                    {product.app_promo && (
                      <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
                        {product.promo_label || "Promo"}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold">{product.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {product.description}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-lg font-bold text-green-700">
                      {money(product.price)}
                    </p>

                    {cartItem ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="h-8 w-8 rounded-full border font-bold"
                        >
                          -
                        </button>

                        <span className="font-semibold">
                          {cartItem.quantity}
                        </span>

                        <button
                          onClick={() => addToCart(product)}
                          className="h-8 w-8 rounded-full bg-green-700 font-bold text-white"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(product)}
                        className="rounded-xl bg-green-700 px-3 py-2 text-sm font-semibold text-white"
                      >
                        Agregar
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {cart.length > 0 && (
          <div className="sticky bottom-4 rounded-2xl bg-green-800 p-4 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)} productos
                </p>
                <p className="text-xl font-bold">{money(subtotal)}</p>
              </div>

              <button
                onClick={goToCheckout}
                className="rounded-xl bg-white px-5 py-3 font-bold text-green-800"
              >
                Ir al checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
