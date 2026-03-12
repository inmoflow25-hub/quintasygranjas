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

  useEffect(() => {

    async function init() {

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

      const { data: orders } = await supabase
        .from("orders")
        .select("*")
        .eq("status", "pending")

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

      setStats({
        orders: orders?.length || 0,
        deliveries: deliveries?.length || 0,
        subs: subs?.length || 0,
        addresses: addresses?.length || 0
      })

      setLoading(false)

    }

    init()

  }, [])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Cargando dashboard...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-green-50 p-10">

      <h1 className="text-3xl font-bold text-green-800 mb-10">
        Dashboard Quintas & Granjas
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">📦 Pedidos nuevos</h2>
          <p className="text-3xl font-bold">{stats.orders}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">🚚 Entregas hoy</h2>
          <p className="text-3xl font-bold">{stats.deliveries}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">👥 Suscriptores</h2>
          <p className="text-3xl font-bold">{stats.subs}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">📍 Direcciones</h2>
          <p className="text-3xl font-bold">{stats.addresses}</p>
        </div>

      </div>

    </main>
  )
}
