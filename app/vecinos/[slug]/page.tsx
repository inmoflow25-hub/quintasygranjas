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
      is_active,
      benefit_threshold_amount,
      benefit_threshold_orders,
      benefit_discount_percent
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

  const { data: towers } =
    location.type === "cluster"
      ? await supabase
          .from("commercial_locations")
          .select(`
            id,
            slug,
            name,
            address,
            city,
            delivery_day,
            next_delivery_date
          `)
          .eq("parent_location_id", location.id)
          .eq("is_active", true)
          .order("name", { ascending: true })
      : { data: [] }

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
          discount_percent
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
        .select("id, price, final_price")
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
      location.benefit_threshold_amount ||
      300000
  )

  const thresholdOrders = Number(
    activeCycle?.threshold_orders ||
      cluster?.benefit_threshold_orders ||
      location.benefit_threshold_orders ||
      10
  )

  const discountPercent = Number(
    activeCycle?.discount_percent ||
      cluster?.benefit_discount_percent ||
      location.benefit_discount_percent ||
      5
  )

  const revenueProgress = thresholdAmount
    ? Math.min(100, Math.round((confirmedRevenue / thresholdAmount) * 100))
    : 0

  const ordersProgress = thresholdOrders
    ? Math.min(100, Math.round((confirmedOrders / thresholdOrders) * 100))
    : 0

  const communityProgress = Math.max(revenueProgress, ordersProgress)
  const pageHref = `/vecinos/${location.slug}`

  return (
    <main className="min-h-screen bg-white text-[#172317]">
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-[#dfe8d9] bg-[#f5faf3]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <a
            href={pageHref}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center">
              <img
                src="/logho quintas nuevo.svg"
                alt="Quintas y Granjas"
                className="h-8 w-auto"
              />
            </div>

            <span className="text-xl font-bold tracking-tight text-[#172317]">
              Quintas y Granjas
            </span>
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href={`${pageHref}#comprar`}
              className="text-[#5e6b5e] transition hover:text-[#172317]"
            >
              Tienda
            </a>

            <a
              href={`${pageHref}#entrega`}
              className="text-[#5e6b5e] transition hover:text-[#172317]"
            >
              Entrega
            </a>

            <a
              href={`${pageHref}#comprar`}
              className="text-[#5e6b5e] transition hover:text-[#172317]"
            >
              Pedí ahora
            </a>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-[#e9f8e9] via-[#f7fff7] to-[#d8f2df] px-5 pb-12 pt-28 md:px-10 md:pb-16 md:pt-32">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-green-300/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-lime-200/40 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <div className="mb-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-green-700 px-4 py-2 text-xs font-black uppercase tracking-wide text-white">
                Compra comunitaria
              </span>

              <span className="rounded-full bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-wide text-green-800 shadow-sm">
                {cluster?.commercial_code || location.commercial_code || "Vecinos"}
              </span>
            </div>

            <h1 className="max-w-4xl text-5xl font-serif font-black leading-[1.02] tracking-tight md:text-7xl">
              Alimentos frescos para recibir en tu edificio
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#455245] md:text-xl">
              Comprá junto a tus vecinos. Cada persona paga su pedido por separado
              y la entrega se organiza para la comunidad.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <HeroPill
                title="Ubicación"
                value={location.name}
              />

              <HeroPill
                title="Cierre"
                value={formatDateTime(activeCycle?.closes_at)}
              />

              <HeroPill
                title="Entrega"
                value={formatDate(activeCycle?.delivery_date)}
              />

              <HeroPill
                title="Pedido mínimo"
                value="$20.000"
              />
            </div>

            <p className="mt-6 text-sm font-medium text-[#5e6b5e]">
              En el checkout cargás torre, piso, departamento, teléfono, método de pago y propina si querés.
            </p>
          </div>

          <div className="rounded-[2rem] bg-[#122214] p-6 text-white shadow-2xl md:p-8">
            <p className="text-sm font-black uppercase tracking-wide text-green-300">
              Progreso comunitario
            </p>

            <div className="mt-5 flex items-end gap-3">
              <span className="text-7xl font-black leading-none">
                {communityProgress}%
              </span>

              <span className="pb-2 text-sm font-semibold text-white/60">
                hacia el beneficio
              </span>
            </div>

            <div className="mt-6 h-5 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-green-400"
                style={{ width: `${communityProgress}%` }}
              />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <DarkBox
                title="Pedidos"
                value={confirmedOrders}
              />

              <DarkBox
                title="Comunidad"
                value={money(confirmedRevenue)}
              />
            </div>

            <div className="mt-5 rounded-3xl bg-white/10 p-5">
              <p className="text-xl font-black">
                Hasta {discountPercent}% para próximas compras
              </p>

              <p className="mt-2 text-sm leading-relaxed text-white/70">
                Tu compra suma al progreso comunitario. Los beneficios se aplican individualmente
                en próximas compras.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="entrega" className="scroll-mt-24 px-5 py-8 md:px-10">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          <Step
            number="1"
            title="Elegís productos"
            text="Armás tu pedido con cajas o productos individuales."
          />

          <Step
            number="2"
            title="Cargás tu depto"
            text="Indicás piso, departamento y datos de contacto."
          />

          <Step
            number="3"
            title="Recibís en tu edificio"
            text="La entrega se organiza junto con la comunidad."
          />
        </div>
      </section>

      <section id="comprar" className="scroll-mt-24">
        <VecinosCart
          location={location}
          towers={towers || []}
          communityProgress={communityProgress}
          confirmedOrders={confirmedOrders}
          confirmedRevenue={confirmedRevenue}
        />
      </section>

      <footer className="bg-[#172317] px-6 py-14 text-white md:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <img
                src="/logho quintas nuevo.svg"
                alt="Quintas y Granjas"
                className="h-10 w-auto"
              />

              <span className="text-xl font-black">
                Quintas y Granjas
              </span>
            </div>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
              Alimentos frescos, productos de granja y entregas comunitarias para vecinos.
            </p>
          </div>

          <div>
            <h4 className="font-black">
              Compra comunitaria
            </h4>

            <p className="mt-4 text-sm leading-relaxed text-white/70">
              Cada vecino compra y paga por separado. La entrega se coordina para el edificio o complejo.
            </p>
          </div>

          <div>
            <h4 className="font-black">
              Contacto
            </h4>

            <a
              href="https://wa.me/5491168303596"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex rounded-xl bg-[#25D366] px-5 py-3 font-black text-white"
            >
              WhatsApp
            </a>

            <p className="mt-4 text-sm text-white/60">
              hola@quintasygranjas.com
            </p>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-center text-xs text-white/50">
          © {new Date().getFullYear()} Quintas y Granjas. Todos los derechos reservados.{" "}
          <a href="/privacy" className="underline hover:text-white">
            Privacidad
          </a>{" "}
          |{" "}
          <a href="/terms" className="underline hover:text-white">
            Términos
          </a>
        </div>
      </footer>
    </main>
  )
}

function HeroPill({
  title,
  value
}: {
  title: string
  value: string
}) {
  return (
    <div className="rounded-2xl bg-white/85 p-4 shadow-sm backdrop-blur">
      <p className="text-xs font-black uppercase tracking-wide text-green-700">
        {title}
      </p>

      <p className="mt-2 text-base font-black text-[#172317]">
        {value}
      </p>
    </div>
  )
}

function DarkBox({ title, value }: { title: string; value: any }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-white/50">
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
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-green-700 text-lg font-black text-white">
        {number}
      </div>

      <h3 className="text-xl font-black">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-relaxed text-gray-600">
        {text}
      </p>
    </div>
  )
}

