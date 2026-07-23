"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AppNav from "@/components/app/app-nav"

type OrderItem = {
  id: string
  product_name: string
  quantity: number
  price: number
  source_type: string
}

type Order = {
  id: string
  order_number: string | number | null
  created_at: string
  status: string
  payment_method: string
  payment_status: string
  app_context: string
  subtotal_price: number
  discount_amount: number
  loyalty_discount_amount: number
  reward_discount_amount: number
  propina: number
  final_price: number
  points_earned: number
  points_spent: number
  delivery_address: string
  delivery_city: string
  items: OrderItem[]
}

function money(value: number) {
  return `$${Math.round(value || 0).toLocaleString("es-AR")}`
}

function formatDate(value: string) {
  if (!value) return ""

  return new Date(value).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  })
}

function paymentLabel(value: string) {
  if (value === "cash") return "Efectivo"
  if (value === "mp_transfer") return "Transferencia"
  if (value === "mercadopago") return "Mercado Pago"
  return value || "No informado"
}

export default function AppOrdersPage() {
  const router = useRouter()

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrders()
  }, [])

  async function loadOrders() {
    const email = localStorage.getItem("qyg_app_email") || ""
    const phone = localStorage.getItem("qyg_app_phone") || ""

    if (!email && !phone) {
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/app/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          phone,
          limit: 20
        })
      })

      const data = await res.json()

      if (data?.orders) {
        setOrders(data.orders)
      }
    } finally {
      setLoading(false)
    }
  }

function repeatOrder(order: Order) {
  const cart = order.items
    .filter((item) => item.source_type !== "reward")
    .map((item) => ({
      id: item.id || item.product_name,
      name: item.product_name,
      product_name: item.product_name,
      quantity: Number(item.quantity || 1),
      price: Number(item.price || 0),
      type: "unit",
      unit_label: "unidad",
      category: "repetido",
      image: "",
      description: ""
    }))

  if (!cart.length) {
    alert("Este pedido no tiene productos para repetir")
    return
  }

  localStorage.setItem("qyg_app_cart", JSON.stringify(cart))
  router.push("/app/checkout")
}

  return (
    <main className="min-h-screen bg-green-50 px-4 py-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-3xl bg-white p-6 shadow">
        
          <h1 className="text-3xl font-bold text-gray-900">Mis pedidos</h1>

          <p className="mt-2 text-gray-600">
            Consultá tu historial y repetí pedidos anteriores.
          </p>
        </section>

        {loading && (
          <div className="rounded-3xl bg-white p-6 shadow">
            Cargando pedidos...
          </div>
        )}

        {!loading && orders.length === 0 && (
          <div className="rounded-3xl bg-white p-6 shadow">
            <p className="font-semibold">Todavía no encontramos pedidos.</p>
            <p className="mt-1 text-sm text-gray-500">
              Cuando compres desde la app, vas a ver tu historial acá.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {orders.map((order) => (
            <article key={order.id} className="rounded-3xl bg-white p-6 shadow">
              <div className="flex flex-col gap-3 border-b pb-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-green-700">
                    Pedido #{order.order_number || order.id.slice(0, 8)}
                  </p>

                  <h2 className="mt-1 text-xl font-bold">
                    {formatDate(order.created_at)}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {order.delivery_address}, {order.delivery_city}
                  </p>
                </div>

                <div className="text-left md:text-right">
                  <p className="text-2xl font-bold text-green-700">
                    {money(order.final_price)}
                  </p>

                  <p className="text-sm text-gray-500">
                    {paymentLabel(order.payment_method)}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>
                      {item.product_name} x{item.quantity}
                    </span>

                    <span className="font-semibold">
                      {money(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {(order.points_earned > 0 || order.points_spent > 0) && (
                <div className="mt-4 rounded-2xl bg-green-50 p-4 text-sm text-green-900">
                  {order.points_spent > 0 && (
                    <p>Usaste {order.points_spent} puntos.</p>
                  )}

                  {order.points_earned > 0 && (
                    <p>Ganaste {order.points_earned} puntos.</p>
                  )}
                </div>
              )}

              <button
                onClick={() => repeatOrder(order)}
                className="mt-5 w-full rounded-xl bg-green-700 px-4 py-3 font-bold text-white"
              >
                Repetir pedido
              </button>
            </article>
          ))}
        </div>
      </div>
      <AppNav />
    </main>
  )
}
