export const dynamic = "force-dynamic"
export const revalidate = 0

import { createClient } from "@supabase/supabase-js"
import { requireAdmin } from "@/lib/admin-auth"
import SuppliersClient from "./suppliers-client"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

  return (
    <SuppliersClient
      partners={partnersResult.data || []}
      expenses={expensesResult.data || []}
      priceUpdates={priceUpdatesResult.data || []}
      products={productsResult.data || []}
    />
  )
}
