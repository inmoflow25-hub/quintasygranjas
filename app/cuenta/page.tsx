"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function CuentaPage() {

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {

    const load = async () => {

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      const { data: sub } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("active", true)
        .single()

      if (!sub) {
        setLoading(false)
        return
      }

      const { data: box } = await supabase
        .from("boxes")
        .select("*")
        .eq("id", sub.box_id)
        .single()

      const { data: nextDelivery } = await supabase
        .from("deliveries")
        .select("*")
        .eq("subscription_id", sub.id)
        .eq("status", "pending")
        .order("delivery_date", { ascending: true })
        .limit(1)
        .single()

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      setData({
        subscription: sub,
        box,
        nextDelivery,
        profile
      })

      setLoading(false)
    }

    load()

  }, [])

  if (loading) return <div className="p-10">Cargando...</div>

  if (!data) {
    return (
      <div className="p-10">
        No tenés suscripción activa
      </div>
    )
  }

  return (
    <main className="max-w-2xl mx-auto p-10 space-y-6">

      <h1 className="text-2xl font-bold">
        Mi cuenta
      </h1>

      <div className="border p-6 rounded-xl">

        <h2 className="font-semibold mb-2">
          Caja activa
        </h2>

        <p>{data.box.name}</p>

      </div>

      <div className="border p-6 rounded-xl">

        <h2 className="font-semibold mb-2">
          Próxima entrega
        </h2>

        <p>{data.nextDelivery?.delivery_date}</p>

      </div>

      <div className="border p-6 rounded-xl">

        <h2 className="font-semibold mb-2">
          Dirección
        </h2>

        <p>{data.profile?.address}</p>

      </div>

    </main>
  )
}
