import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function AdminPage() {

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // obtener usuario logueado
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/")
  }

  // verificar si es admin
  const { data: admin } = await supabase
    .from("admins")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (!admin) {
    redirect("/")
  }

  // datos para dashboard

  const { data: users } = await supabase
    .from("users")
    .select("*")
    .limit(20)

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20)

  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("*")
    .limit(20)

  const { data: deliveries } = await supabase
    .from("deliveries")
    .select("*")
    .limit(20)

  return (
    <main className="min-h-screen p-10 space-y-10">

      <h1 className="text-3xl font-bold">
        Admin Dashboard
      </h1>

      <section>
        <h2 className="text-xl font-semibold mb-4">Usuarios</h2>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
          {JSON.stringify(users, null, 2)}
        </pre>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Pedidos</h2>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
          {JSON.stringify(orders, null, 2)}
        </pre>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Suscripciones</h2>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
          {JSON.stringify(subscriptions, null, 2)}
        </pre>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Entregas</h2>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
          {JSON.stringify(deliveries, null, 2)}
        </pre>
      </section>

    </main>
  )
}
