"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import PushPermissionCard from "@/components/app/push-permission-card"
import InstallAppCard from "@/components/app/install-app-card"
import { CANDELA_ATTRIBUTION, saveAttribution } from "@/lib/attribution"
import CartMobileStickyTest from "@/components/cart/cart-mobile-sticky-test"
import AppRewardsHero from "@/components/app/app-rewards-hero"
import AppNav from "@/components/app/app-nav"
import AppBrand from "@/components/app/app-brand"

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
  const params = new URLSearchParams(window.location.search)
  const affiliate = params.get("affiliate")

  if (affiliate === "candela-baez") {
    saveAttribution(CANDELA_ATTRIBUTION)
  }

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
  <main className="min-h-screen bg-green-50 px-4 py-6 pb-28 md:pb-10">
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex justify-center">
        <AppBrand href="/app" />
      </div>

      <AppNav />

      <AppRewardsHero userName={user?.name} points={points} />

      <InstallAppCard />

      {user && (
        <PushPermissionCard
          email={user.email || email}
          phone={user.phone || phone}
        />
      )}

      <section id="cart" className="scroll-mt-32">
        <CartMobileStickyTest />
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

