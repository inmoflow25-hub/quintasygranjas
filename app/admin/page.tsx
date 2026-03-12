import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function AdminPage() {

  const supabase = createServerComponentClient({ cookies })

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/")
  }

  const { data: admin } = await supabase
    .from("admins")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (!admin) {
    redirect("/")
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
    .limit(20)

  return (
    <main className="min-h-screen bg-green-50 p-10">

      <h1 className="text-3xl font-bold text-green-800 mb-10">
        Dashboard Quintas & Granjas
      </h1>

      <div className="grid grid-cols-4 gap-6 mb-12">

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">📦 Pedidos nuevos</h2>
          <p className="text-3xl font-bold">{orders?.length || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">🚚 Entregas hoy</h2>
          <p className="text-3xl font-bold">{deliveries?.length || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">👥 Suscriptores</h2>
          <p className="text-3xl font-bold">{subs?.length || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">📍 Direcciones</h2>
          <p className="text-3xl font-bold">{addresses?.length || 0}</p>
        </div>

      </div>

    </main>
  )
}
