export const dynamic = "force-dynamic"
export const revalidate = 0

import { createClient } from "@supabase/supabase-js"
import { requireAdmin } from "@/lib/admin-auth"
import CustomerMap from "@/components/superadmin/customer-map"
import GeocodeCustomersButton from "@/components/superadmin/geocode-customers-button"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function normalizeEmail(email: string | null | undefined) {
  return String(email || "").trim().toLowerCase()
}

function normalizeArgentinaPhone(rawPhone: string | null | undefined) {
  let phone = String(rawPhone || "").replace(/\D/g, "")

  if (!phone) return ""

  if (phone.startsWith("00")) {
    phone = phone.slice(2)
  }

  if (phone.startsWith("011")) {
    phone = `11${phone.slice(3)}`
  }

  if (phone.startsWith("15") && phone.length >= 10) {
    phone = `11${phone.slice(2)}`
  }

  if (phone.startsWith("5411")) {
    phone = `54911${phone.slice(4)}`
  }

  if (phone.startsWith("54911")) {
    return `+${phone}`
  }

  if (phone.startsWith("11")) {
    return `+549${phone}`
  }

  if (phone.startsWith("54") && !phone.startsWith("549")) {
    return `+549${phone.slice(2)}`
  }

  return `+54${phone}`
}

function cleanText(value: unknown) {
  return String(value || "").trim()
}

function buildOrderCustomerKey(order: any) {
  const phone = normalizeArgentinaPhone(order.customer_phone)
  const email = normalizeEmail(order.customer_email)

  if (phone) return phone
  if (email) return email
  if (order.user_id) return String(order.user_id)

  return ""
}

function buildLocationCustomerKey(location: any) {
  const phone = normalizeArgentinaPhone(location.customer_phone)
  const email = normalizeEmail(location.customer_email)

  if (phone) return phone
  if (email) return email

  return String(location.customer_key || "")
}

function formatDateLabel(dateString: string | null | undefined) {
  if (!dateString) return null

  return new Date(dateString).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit"
  })
}

function money(value: number | null | undefined) {
  return `$${Number(value || 0).toLocaleString("es-AR")}`
}

async function fetchConfirmedOrders() {
  const pageSize = 1000
  let from = 0
  let allOrders: any[] = []

  while (true) {
    const to = from + pageSize - 1

    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        user_id,
        created_at,
        source,
        status,
        payment_method,
        payment_status,
        price,
        final_price,
        customer_name,
        customer_email,
        customer_phone,
        delivery_address,
        delivery_city,
        is_test
      `)
      .eq("is_test", false)
      .eq("status", "confirmed")
      .not("delivery_address", "is", null)
      .order("created_at", { ascending: false })
      .range(from, to)

    if (error) {
      return { data: null, error }
    }

    const batch = data || []

    allOrders = allOrders.concat(batch)

    if (batch.length < pageSize) {
      break
    }

    from += pageSize
  }

  return { data: allOrders, error: null }
}

export default async function SuperAdminMapPage() {
  await requireAdmin()

  const { data: locations, error } = await supabase
    .from("customer_locations")
    .select(`
      id,
      customer_key,
      customer_name,
      customer_email,
      customer_phone,
      address,
      city,
      lat,
      lng,
      geocoding_status,
      notes
    `)
    .order("customer_name", { ascending: true })

  const { data: orders, error: ordersError } = await fetchConfirmedOrders()

  const { data: commercialLocations, error: commercialError } = await supabase
    .from("commercial_locations")
    .select(`
      id,
      slug,
      name,
      type,
      address,
      city,
      lat,
      lng,
      polygon,
      parent_location_id,
      is_active
    `)
    .eq("is_active", true)
    .in("type", ["cluster", "tower"])
    .order("type", { ascending: true })
    .order("slug", { ascending: true })

  if (error || commercialError || ordersError) {
    return (
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        {error && <p className="text-red-600">Error cargando clientes: {error.message}</p>}
        {ordersError && <p className="text-red-600">Error cargando compras reales: {ordersError.message}</p>}
        {commercialError && <p className="text-red-600">Error cargando torres: {commercialError.message}</p>}
      </div>
    )
  }

  const safeLocations = locations || []
  const safeOrders = orders || []

  const statsByCustomerKey = new Map<string, any>()

  for (const order of safeOrders) {
    const key = buildOrderCustomerKey(order)
    const address = cleanText(order.delivery_address)

    if (!key || !address) continue

    const current = statsByCustomerKey.get(key) || {
      purchases_count: 0,
      total_purchased: 0,
      first_order_at: order.created_at,
      last_order_at: order.created_at,
      last_order_label: formatDateLabel(order.created_at),
      main_source: order.source || "-",
      main_payment_method: order.payment_method || "-",
      sources: new Map<string, number>(),
      paymentMethods: new Map<string, number>()
    }

    current.purchases_count += 1
    current.total_purchased += Number(order.final_price || order.price || 0)

    const orderTime = new Date(order.created_at).getTime()

    if (orderTime < new Date(current.first_order_at).getTime()) {
      current.first_order_at = order.created_at
    }

    if (orderTime > new Date(current.last_order_at).getTime()) {
      current.last_order_at = order.created_at
      current.last_order_label = formatDateLabel(order.created_at)
    }

    const source = order.source || "sin-source"
    current.sources.set(source, (current.sources.get(source) || 0) + 1)

    const paymentMethod = order.payment_method || "sin-método"
    current.paymentMethods.set(
      paymentMethod,
      (current.paymentMethods.get(paymentMethod) || 0) + 1
    )

    statsByCustomerKey.set(key, current)
  }

  for (const stats of statsByCustomerKey.values()) {
    const sourceEntries = Array.from(stats.sources.entries()) as [string, number][]
    const paymentEntries = Array.from(stats.paymentMethods.entries()) as [string, number][]

    stats.main_source = sourceEntries.sort((a, b) => b[1] - a[1])[0]?.[0] || "-"
    stats.main_payment_method = paymentEntries.sort((a, b) => b[1] - a[1])[0]?.[0] || "-"
    stats.average_ticket = stats.purchases_count
      ? Math.round(stats.total_purchased / stats.purchases_count)
      : 0

    delete stats.sources
    delete stats.paymentMethods
  }

  const points = safeLocations
    .filter((location: any) => location.lat !== null && location.lng !== null)
    .map((location: any) => {
      const stats = statsByCustomerKey.get(buildLocationCustomerKey(location))

      return {
        ...location,
        lat: Number(location.lat),
        lng: Number(location.lng),
        purchases_count: stats?.purchases_count || 0,
        total_purchased: stats?.total_purchased || 0,
        average_ticket: stats?.average_ticket || 0,
        first_order_at: stats?.first_order_at || null,
        last_order_at: stats?.last_order_at || null,
        last_order_label: stats?.last_order_label || null,
        main_source: stats?.main_source || null,
        main_payment_method: stats?.main_payment_method || null
      }
    })

  const pending = safeLocations.filter(
    (location: any) => location.lat === null || location.lng === null
  )

  const commercial = commercialLocations || []
  const towers = commercial.filter((location: any) => location.type === "tower")
  const clusters = commercial.filter((location: any) => location.type === "cluster")

  const realCustomersCount = statsByCustomerKey.size

  const realPurchasesCount = Array.from(statsByCustomerKey.values()).reduce(
    (acc, stats: any) => acc + Number(stats.purchases_count || 0),
    0
  )

  const realRevenue = Array.from(statsByCustomerKey.values()).reduce(
    (acc, stats: any) => acc + Number(stats.total_purchased || 0),
    0
  )

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-3xl border border-[#e3e1dc] bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold">
            Mapa comercial
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            Clientes reales con compras confirmadas, torres y manzanas comerciales.
          </p>
        </div>

        <GeocodeCustomersButton />
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-7">
        <Metric title="Clientes reales" value={realCustomersCount} />
        <Metric title="Compras reales" value={realPurchasesCount} />
        <Metric title="Total vendido" value={money(realRevenue)} />
        <Metric title="Clientes en mapa" value={safeLocations.length} />
        <Metric title="Con coordenadas" value={points.length} />
        <Metric title="Pendientes" value={pending.length} />
        <Metric title="Torres" value={towers.length} />
      </section>

      <CustomerMap
        points={points}
        commercialLocations={commercial as any}
      />

      <section className="rounded-3xl border border-[#e3e1dc] bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-xl font-serif font-bold">
          Torres comerciales
        </h3>

        <div className="grid gap-3 md:grid-cols-3">
          {towers.map((tower: any) => (
            <a
              key={tower.id}
              href={`/vecinos/${tower.slug}`}
              target="_blank"
              className="rounded-2xl bg-[#f5f5f3] p-4 hover:bg-[#ece8df]"
            >
              <p className="font-bold">{tower.name}</p>
              <p className="text-sm text-gray-500">/vecinos/{tower.slug}</p>
              <p className="mt-2 text-sm">
                {tower.address || "Domicilio pendiente"}
              </p>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}

function Metric({ title, value }: { title: string; value: any }) {
  return (
    <div className="rounded-2xl border border-[#e3e1dc] bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-gray-500">{title}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  )
}

