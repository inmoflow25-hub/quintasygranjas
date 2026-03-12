"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AdminPage() {

  const router = useRouter()

  const [loading, setLoading] = useState(true)

  const [stats, setStats] = useState({
    orders: 0,
    deliveries: 0,
    subs: 0,
    addresses: 0
  })

  const [orders, setOrders] = useState<any[]>([])
  const [topBoxes, setTopBoxes] = useState<any[]>([])
  const [zones, setZones] = useState<any[]>([])

  useEffect(() => {

    async function loadDashboard() {

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/")
        return
      }

      const { data: admin } = await supabase
        .from("admins")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (!admin) {
        router.push("/")
        return
      }

      const today = new Date().toISOString().split("T")[0]

      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20)

      const { data: deliveries } = await supabase
        .from("deliveries")
        .select("*")
        .eq("delivery_date", today)

      const { data: subs } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("active", true)

      const { data: addresses } = await supabase
        .from("addresses")
        .select("*")

      // cajas más vendidas
      const boxCount: any = {}
      ordersData?.forEach((o:any) => {
        const box = o.box || "Caja"
        boxCount[box] = (boxCount[box] || 0) + 1
      })

      const topBoxesArr = Object.entries(boxCount).map(([box, count]) => ({
        box,
        count
      }))

      // zonas
      const zoneCount:any = {}
      addresses?.forEach((a:any) => {
        const city = a.city || "Sin ciudad"
        zoneCount[city] = (zoneCount[city] || 0) + 1
      })

      const zonesArr = Object.entries(zoneCount).map(([city, count]) => ({
        city,
        count
      }))

      setStats({
        orders: ordersData?.length || 0,
        deliveries: deliveries?.length || 0,
        subs: subs?.length || 0,
        addresses: addresses?.length || 0
      })

      setOrders(ordersData || [])
      setTopBoxes(topBoxesArr)
      setZones(zonesArr)

      setLoading(false)

    }

    loadDashboard()

  }, [])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Cargando dashboard...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-green-50 p-10">

      <h1 className="text-3xl font-bold text-green-800 mb-10">
        Dashboard Quintas & Granjas
      </h1>

      {/* métricas */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">📦 Pedidos</h2>
          <p className="text-3xl font-bold">{stats.orders}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">🚚 Entregas hoy</h2>
          <p className="text-3xl font-bold">{stats.deliveries}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">👥 Suscripciones</h2>
          <p className="text-3xl font-bold">{stats.subs}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">📍 Clientes</h2>
          <p className="text-3xl font-bold">{stats.addresses}</p>
        </div>

      </div>

      {/* cajas más vendidas */}

      <section className="bg-white rounded-xl shadow p-6 mb-10">

        <h2 className="text-xl font-semibold mb-4">
          Cajas más vendidas
        </h2>

        {topBoxes.map((b:any) => (
          <div key={b.box} className="flex justify-between border-b py-2">
            <span>{b.box}</span>
            <span>{b.count}</span>
          </div>
        ))}

      </section>

      {/* zonas */}

      <section className="bg-white rounded-xl shadow p-6 mb-10">

        <h2 className="text-xl font-semibold mb-4">
          Clientes por zona
        </h2>

        {zones.map((z:any) => (
          <div key={z.city} className="flex justify-between border-b py-2">
            <span>{z.city}</span>
            <span>{z.count}</span>
          </div>
        ))}

      </section>

      {/* pedidos recientes */}

      <section className="bg-white rounded-xl shadow p-6">

        <h2 className="text-xl font-semibold mb-4">
          Últimos pedidos
        </h2>

        <div className="space-y-2">

          {orders.map((o:any) => (
            <div
              key={o.id}
              className="flex justify-between border-b py-2 text-sm"
            >
              <span>{o.box}</span>
              <span>{o.price}</span>
              <span>{o.status}</span>
            </div>
          ))}

        </div>

      </section>

    </main>
  )
}

