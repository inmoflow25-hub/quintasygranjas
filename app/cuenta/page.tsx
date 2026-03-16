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
  const [boxes, setBoxes] = useState<any[]>([])

  useEffect(() => {
    load()
  }, [])

  async function load() {

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("active", true)
      .single()

    if (!subscription) {
      setLoading(false)
      return
    }

    const { data: box } = await supabase
      .from("boxes")
      .select("*")
      .eq("id", subscription.box_id)
      .single()

    const { data: deliveries } = await supabase
      .from("deliveries")
      .select("*")
      .eq("subscription_id", subscription.id)
      .order("delivery_date", { ascending: true })

    const { data: nextDelivery } = await supabase
      .from("deliveries")
      .select("*")
      .eq("subscription_id", subscription.id)
      .eq("status", "pending")
      .order("delivery_date", { ascending: true })
      .limit(1)
      .single()

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    const { data: allBoxes } = await supabase
      .from("boxes")
      .select("*")

    setBoxes(allBoxes || [])

    setData({
      subscription,
      box,
      deliveries,
      nextDelivery,
      profile
    })

    setLoading(false)
  }

  async function changeBox(boxId: string) {

    await supabase
      .from("subscriptions")
      .update({
        box_id: boxId
      })
      .eq("id", data.subscription.id)

    load()
  }

  async function cancelSubscription() {

    const confirmCancel = confirm("¿Querés cancelar tu suscripción?")

    if (!confirmCancel) return

    await supabase
      .from("subscriptions")
      .update({
        active: false
      })
      .eq("id", data.subscription.id)

    alert("Suscripción cancelada")
    load()
  }

  if (loading) return <div className="p-10">Cargando...</div>

  if (!data) {
    return (
      <div className="p-10">
        No tenés suscripción activa
      </div>
    )
  }

  return (
    <main className="max-w-2xl mx-auto p-10 space-y-8">

      <h1 className="text-3xl font-bold">
        Mi cuenta
      </h1>

      {/* Caja actual */}

      <div className="border rounded-xl p-6">

        <h2 className="font-semibold mb-2">
          Caja actual
        </h2>

        <p>{data.box.name}</p>

      </div>

      {/* Próxima entrega */}

      <div className="border rounded-xl p-6">

        <h2 className="font-semibold mb-2">
          Próxima entrega
        </h2>

        <p>{data.nextDelivery?.delivery_date}</p>

      </div>

      {/* Dirección */}

      <div className="border rounded-xl p-6">

        <h2 className="font-semibold mb-2">
          Dirección
        </h2>

        <p>{data.profile?.address}</p>

      </div>

      {/* Cambiar caja */}

      <div className="border rounded-xl p-6 space-y-4">

        <h2 className="font-semibold">
          Cambiar caja
        </h2>

        {boxes.map((box) => (

          <button
            key={box.id}
            onClick={() => changeBox(box.id)}
            className="block w-full border rounded-lg p-3 hover:bg-gray-100"
          >
            {box.name}
          </button>

        ))}

      </div>

      {/* Cancelar suscripción */}

      <div className="border rounded-xl p-6">

        <button
          onClick={cancelSubscription}
          className="bg-red-600 text-white px-6 py-3 rounded-lg"
        >
          Cancelar suscripción
        </button>

      </div>

      {/* Historial de entregas */}

      <div className="border rounded-xl p-6">

        <h2 className="font-semibold mb-4">
          Entregas
        </h2>

        {data.deliveries.map((d: any) => (

          <div
            key={d.id}
            className="flex justify-between border-b py-2"
          >
            <span>{d.delivery_date}</span>
            <span>{d.status}</span>
          </div>

        ))}

      </div>

    </main>
  )
}
