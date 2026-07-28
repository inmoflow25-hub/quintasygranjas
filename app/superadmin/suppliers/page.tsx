export const dynamic = "force-dynamic"
export const revalidate = 0

import { createClient } from "@supabase/supabase-js"
import { requireAdmin } from "@/lib/admin-auth"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function money(value: number | string | null | undefined) {
  return `$${Number(value || 0).toLocaleString("es-AR")}`
}

function formatDate(dateString: string | null | undefined) {
  if (!dateString) return "-"

  return new Date(dateString).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit"
  })
}

export default async function SuperAdminSuppliersPage() {
  await requireAdmin()

  const [
    partnersResult,
    expensesResult,
    priceUpdatesResult,
    productsResult
  ] = await Promise.all([
    supabase
      .from("supplier_partners")
      .select(`
        id,
        name,
        email,
        phone,
        address,
        city,
        notes,
        active,
        can_update_prices,
        can_log_expenses,
        created_at
      `)
      .order("created_at", { ascending: false }),

    supabase
      .from("supplier_expenses")
      .select(`
        id,
        supplier_partner_id,
        supplier_name,
        product_id,
        product_name,
        quantity,
        unit_cost,
        total_cost,
        unit_label,
        expense_date,
        notes,
        created_at
      `)
      .order("expense_date", { ascending: false })
      .limit(80),

    supabase
      .from("product_price_updates")
      .select(`
        id,
        supplier_partner_id,
        product_id,
        old_price,
        new_price,
        reason,
        created_at,
        products (
          name
        )
      `)
      .order("created_at", { ascending: false })
      .limit(80),

    supabase
      .from("products")
      .select(`
        id,
        name,
        price,
        category,
        unit_label,
        active,
        visible_on_web,
        visible_on_pwa,
        sort_order
      `)
      .eq("active", true)
      .order("category", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true })
  ])

  const errors = [
    partnersResult.error,
    expensesResult.error,
    priceUpdatesResult.error,
    productsResult.error
  ].filter(Boolean)

  if (errors.length > 0) {
    return (
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h2 className="text-3xl font-serif font-bold">Proveedores</h2>
        <p className="mt-4 text-red-600">
          Error cargando proveedores: {errors[0]?.message}
        </p>
      </div>
    )
  }

  const partners = partnersResult.data || []
  const expenses = expensesResult.data || []
  const priceUpdates = priceUpdatesResult.data || []
  const products = productsResult.data || []

  const totalExpenses = expenses.reduce(
    (acc: number, expense: any) => acc + Number(expense.total_cost || 0),
    0
  )

  const activePartners = partners.filter((partner: any) => partner.active)
  const pricePartners = partners.filter(
    (partner: any) => partner.active && partner.can_update_prices
  )

  const partnerNameById = new Map<string, string>()

  for (const partner of partners as any[]) {
    partnerNameById.set(partner.id, partner.name)
  }

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric title="Socios activos" value={activePartners.length} />
        <Metric title="Pueden modificar precios" value={pricePartners.length} />
        <Metric title="Gastos cargados" value={expenses.length} />
        <Metric title="Total gastos" value={money(totalExpenses)} />
      </section>

      <section className="rounded-3xl border border-[#e3e1dc] bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-3xl font-serif font-bold">Proveedores / socios</h2>
          <p className="mt-2 text-sm text-gray-600">
            Socios habilitados, permisos, domicilio y contacto.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#efefed] text-xs uppercase text-gray-600">
              <tr>
                <th className="px-4 py-3">Socio</th>
                <th className="px-4 py-3">Contacto</th>
                <th className="px-4 py-3">Domicilio</th>
                <th className="px-4 py-3">Permisos</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Notas</th>
              </tr>
            </thead>

            <tbody>
              {partners.map((partner: any) => (
                <tr key={partner.id} className="border-b border-[#eee] align-top">
                  <td className="px-4 py-4">
                    <div className="font-bold">{partner.name}</div>
                    <div className="mt-1 text-xs text-gray-500">
                      Alta: {formatDate(partner.created_at)}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div>{partner.phone || "-"}</div>
                    <div className="text-xs text-gray-500">
                      {partner.email || "-"}
                    </div>
                  </td>

                  <td className="px-4 py-4 max-w-[260px]">
                    <div>{partner.address || "-"}</div>
                    <div className="text-xs text-gray-500">
                      {partner.city || "-"}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      {partner.can_log_expenses && (
                        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-bold text-blue-800">
                          Gastos
                        </span>
                      )}

                      {partner.can_update_prices && (
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-800">
                          Precios
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={
                        partner.active
                          ? "rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-800"
                          : "rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-800"
                      }
                    >
                      {partner.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>

                  <td className="px-4 py-4 max-w-[260px] text-xs text-gray-600">
                    {partner.notes || "-"}
                  </td>
                </tr>
              ))}

              {partners.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-gray-500" colSpan={6}>
                    Todavía no hay socios/proveedores cargados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl border border-[#e3e1dc] bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-2xl font-serif font-bold">Productos y precios actuales</h2>
          <p className="mt-2 text-sm text-gray-600">
            Vista rápida de precios activos de tienda.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#efefed] text-xs uppercase text-gray-600">
              <tr>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Unidad</th>
                <th className="px-4 py-3">Visible</th>
                <th className="px-4 py-3 text-right">Precio</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product: any) => (
                <tr key={product.id} className="border-b border-[#eee]">
                  <td className="px-4 py-4 font-bold">{product.name}</td>
                  <td className="px-4 py-4">{product.category || "-"}</td>
                  <td className="px-4 py-4">{product.unit_label || "-"}</td>
                  <td className="px-4 py-4 text-xs text-gray-500">
                    Web: {product.visible_on_web ? "sí" : "no"} · App:{" "}
                    {product.visible_on_pwa ? "sí" : "no"}
                  </td>
                  <td className="px-4 py-4 text-right font-black">
                    {money(product.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-[#e3e1dc] bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-2xl font-serif font-bold">Últimos gastos</h2>
            <p className="mt-2 text-sm text-gray-600">
              Compras/costos cargados por socios.
            </p>
          </div>

          <div className="space-y-3">
            {expenses.map((expense: any) => (
              <div
                key={expense.id}
                className="rounded-2xl border border-[#eee] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-bold">{expense.product_name}</div>
                    <div className="text-xs text-gray-500">
                      {expense.supplier_name} · {formatDate(expense.expense_date)}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      Socio:{" "}
                      {partnerNameById.get(expense.supplier_partner_id) || "-"}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-black">{money(expense.total_cost)}</div>
                    <div className="text-xs text-gray-500">
                      {expense.quantity} {expense.unit_label || ""} ·{" "}
                      {money(expense.unit_cost)}
                    </div>
                  </div>
                </div>

                {expense.notes && (
                  <div className="mt-3 text-xs text-gray-600">
                    {expense.notes}
                  </div>
                )}
              </div>
            ))}

            {expenses.length === 0 && (
              <p className="text-sm text-gray-500">
                Todavía no hay gastos cargados.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-[#e3e1dc] bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-2xl font-serif font-bold">Cambios de precios</h2>
            <p className="mt-2 text-sm text-gray-600">
              Auditoría de modificaciones sobre products.price.
            </p>
          </div>

          <div className="space-y-3">
            {priceUpdates.map((update: any) => (
              <div
                key={update.id}
                className="rounded-2xl border border-[#eee] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-bold">
                      {update.products?.name || update.product_id}
                    </div>
                    <div className="text-xs text-gray-500">
                      Socio:{" "}
                      {partnerNameById.get(update.supplier_partner_id) || "-"}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {formatDate(update.created_at)}
                    </div>
                  </div>

                  <div className="text-right text-sm">
                    <div>
                      <span className="text-gray-500">Antes:</span>{" "}
                      <strong>{money(update.old_price)}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500">Ahora:</span>{" "}
                      <strong>{money(update.new_price)}</strong>
                    </div>
                  </div>
                </div>

                {update.reason && (
                  <div className="mt-3 text-xs text-gray-600">
                    {update.reason}
                  </div>
                )}
              </div>
            ))}

            {priceUpdates.length === 0 && (
              <p className="text-sm text-gray-500">
                Todavía no hay cambios de precios registrados.
              </p>
            )}
          </div>
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
