import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function AdminPage() {

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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">📦 Pedidos nuevos</h2>
          <p className="text-3xl font-bold">
            {orders?.length || 0}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">🚚 Entregas hoy</h2>
          <p className="text-3xl font-bold">
            {deliveries?.length || 0}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">👥 Suscriptores</h2>
          <p className="text-3xl font-bold">
            {subs?.length || 0}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">📍 Direcciones</h2>
          <p className="text-3xl font-bold">
            {addresses?.length || 0}
          </p>
        </div>

      </div>

      <section className="bg-white rounded-xl shadow p-6">

        <h2 className="text-xl font-semibold mb-4">
          Próximas entregas
        </h2>

        <table className="w-full text-left">

          <thead>
            <tr className="border-b">
              <th className="py-2">Usuario</th>
              <th className="py-2">Fecha</th>
              <th className="py-2">Estado</th>
            </tr>
          </thead>

          <tbody>

            {deliveries?.map((d: any) => (
              <tr key={d.id} className="border-b">
                <td className="py-2">{d.user_id}</td>
                <td className="py-2">{d.delivery_date}</td>
                <td className="py-2">{d.status}</td>
              </tr>
            ))}

          </tbody>

        </table>

      </section>

    </main>
  )
}

