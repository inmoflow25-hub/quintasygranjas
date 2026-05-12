export const dynamic = "force-dynamic"
export const revalidate = 0

import { notFound } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import VecinosCart from "@/components/vecinos/vecinos-cart"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function money(value: number | string | null | undefined) {
  return `$${Number(value || 0).toLocaleString("es-AR")}`
}

function formatDate(date: string | null | undefined) {
  if (!date) return "A confirmar"

  return new Date(`${date}T12:00:00`).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "long"
  })
}

function formatDateTime(date: string | null | undefined) {
  if (!date) return "A confirmar"

  return new Date(date).toLocaleString("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit"
  })
}

export default async function VecinosPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const { data: location } = await supabase
    .from("commercial_locations")
    .select(`
      id,
      slug,
      commercial_code,
      name,
      type,
      parent_location_id,
      address,
      city,
      delivery_day,
      next_delivery_date,
      is_active
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (!location) {
    notFound()
  }

  const clusterId =
    location.type === "cluster"
      ? location.id
      : location.parent_location_id

  const { data: cluster } = clusterId
    ? await supabase
        .from("commercial_locations")
        .select(`
          id,
          slug,
          commercial_code,
          name,
          address,
          city,
          unit_count,
          benefit_threshold_amount,
          benefit_threshold_orders,
          benefit_discount_percent
        `)
        .eq("id", clusterId)
        .single()
    : { data: null }

  const { data: activeCycle } = clusterId
    ? await supabase
        .from("commercial_location_cycles")
        .select(`
          id,
          cycle_name,
          status,
          delivery_date,
          closes_at,
          threshold_amount,
          threshold_orders,
          discount_percent,
          force_benefit_granted
        `)
        .eq("cluster_location_id", clusterId)
        .eq("status", "active")
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null }

  const { data: cycleOrders } = activeCycle?.id
    ? await supabase
        .from("orders")
        .select("id, price, final_price, customer_email")
        .eq("commercial_cycle_id", activeCycle.id)
        .eq("source", "vecinos")
        .eq("status", "confirmed")
        .eq("is_test", false)
    : { data: [] }

  const orders = cycleOrders || []

  const confirmedOrders = orders.length

  const confirmedRevenue = orders.reduce((acc: number, order: any) => {
    return acc + Number(order.final_price || order.price || 0)
  }, 0)

  const thresholdAmount = Number(
    activeCycle?.threshold_amount ||
      cluster?.benefit_threshold_amount ||
      300000
  )

  const thresholdOrders = Number(
    activeCycle?.threshold_orders ||
      cluster?.benefit_threshold_orders ||
      10
  )

  const discountPercent = Number(
    activeCycle?.discount_percent ||
      cluster?.benefit_discount_percent ||
      5
  )

  const revenueProgress = thresholdAmount
    ? Math.min(100, Math.round((confirmedRevenue / thresholdAmount) * 100))
    : 0

  const ordersProgress = thresholdOrders
    ? Math.min(100, Math.round((confirmedOrders / thresholdOrders) * 100))
    : 0

  const communityProgress = Math.max(revenueProgress, ordersProgress)

  return (
    <main className="min-h-screen bg-[#f3f7ed] text-[#1f2a1f]">
      <section className="px-4 py-6 md:px-6 md:py-10">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-white shadow-xl">
          <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="p-6 md:p-10">
              <p className="mb-3 inline-flex rounded-full bg-green-100 px-4 py-2 text-xs font-bold uppercase tracking-wide text-green-800">
                Compra comunitaria de vecinos
              </p>

              <h1 className="max-w-3xl text-4xl font-serif font-black leading-tight md:text-6xl">
                Comprá junto a tus vecinos y recibí en tu edificio.
              </h1>

              <p className="mt-5 max-w-2xl text-lg text-gray-700">
                Cada vecino compra y paga por separado. Todos los pedidos de la manzana
                suman al progreso comunitario para desbloquear beneficios en próximas compras.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <InfoCard
                  title="Tu ubicación"
                  value={location.name}
                  subtitle={cluster?.commercial_code || location.commercial_code || "Compra comunitaria"}
                />

                <InfoCard
                  title="Cierre de pedidos"
                  value={formatDateTime(activeCycle?.closes_at)}
                  subtitle="Después se prepara la entrega"
                />

                <InfoCard
                  title="Entrega"
                  value={formatDate(activeCycle?.delivery_date)}
                  subtitle="Coordinada para la manzana"
                />
              </div>
            </div>

            <div className="bg-[#1f2a1f] p-6 text-white md:p-10">
              <p className="text-sm font-bold uppercase tracking-wide text-green-200">
                Progreso comunitario
              </p>

              <div className="mt-4 flex items-end gap-3">
                <span className="text-6xl font-black">
                  {communityProgress}%
                </span>
                <span className="pb-2 text-sm text-white/70">
                  hacia el beneficio
                </span>
              </div>

              <div className="mt-5 h-5 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-green-400"
                  style={{ width: `${communityProgress}%` }}
                />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <DarkMetric
                  title="Pedidos confirmados"
                  value={confirmedOrders}
                />

                <DarkMetric
                  title="Facturado comunidad"
                  value={money(confirmedRevenue)}
                />
              </div>

              <div className="mt-6 rounded-3xl bg-white/10 p-5">
                <p className="text-lg font-bold">
                  Beneficio posible: {discountPercent}% para la próxima compra
                </p>

                <p className="mt-2 text-sm leading-relaxed text-white/75">
                  Si la compra comunitaria se activa al cierre, quienes participaron
                  reciben el beneficio individualmente para una próxima compra.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-4 md:px-6">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          <Step
            number="1"
            title="Elegís productos"
            text="Armás tu pedido con cajas, frutas, verduras, pollo, huevos y productos de granja."
          />

          <Step
            number="2"
            title="Cargás tus datos"
            text="En el checkout indicás tu torre, piso, departamento, teléfono y método de pago."
          />

          <Step
            number="3"
            title="Recibís con tus vecinos"
            text="La entrega se organiza para la manzana y tu compra suma al progreso comunitario."
          />
        </div>
      </section>

      <section className="px-4 pb-4 md:px-6">
        <div className="mx-auto max-w-7xl rounded-3xl bg-white p-5 shadow">
          <h2 className="text-2xl font-serif font-bold">
            Detalle de entrega
          </h2>

          <div className="mt-3 grid gap-3 text-sm text-gray-700 md:grid-cols-3">
            <p>
              <strong>Manzana:</strong>{" "}
              {cluster?.name || "Compra comunitaria"}
            </p>

            <p>
              <strong>Edificio/Torre:</strong>{" "}
              {location.name}
            </p>

            <p>
              <strong>Dirección:</strong>{" "}
              {location.address || cluster?.address || "A confirmar"}
              {location.city || cluster?.city ? ` · ${location.city || cluster?.city}` : ""}
            </p>
          </div>
        </div>
      </section>

      <VecinosCart location={location} />
    </main>
  )
}

function InfoCard({
  title,
  value,
  subtitle
}: {
  title: string
  value: string
  subtitle: string
}) {
  return (
    <div className="rounded-3xl border border-green-100 bg-green-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-green-700">
        {title}
      </p>
      <p className="mt-2 text-lg font-black">
        {value}
      </p>
      <p className="mt-1 text-xs text-gray-500">
        {subtitle}
      </p>
    </div>
  )
}

function DarkMetric({ title, value }: { title: string; value: any }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <p className="text-xs uppercase tracking-wide text-white/60">
        {title}
      </p>
      <p className="mt-2 text-2xl font-black">
        {value}
      </p>
    </div>
  )
}

function Step({
  number,
  title,
  text
}: {
  number: string
  title: string
  text: string
}) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-green-700 text-lg font-black text-white">
        {number}
      </div>

      <h3 className="text-xl font-bold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-relaxed text-gray-600">
        {text}
      </p>
    </div>
  )
}

