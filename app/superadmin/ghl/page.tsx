import { requireAdmin } from "@/lib/admin-auth"
import { GhlSyncButton } from "@/components/superadmin/ghl-sync-button"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function SuperAdminGhlPage() {
  await requireAdmin()

  return (
    <div className="space-y-6">
      <GhlSyncButton />

      <div className="rounded-3xl border border-[#e3e1dc] bg-white p-6 shadow-sm">
        <h3 className="text-xl font-serif font-bold">Tags que se envían a GHL</h3>

        <div className="mt-4 space-y-2 text-sm text-gray-700">
          <p>
            <strong>Base:</strong> comprador_quintas_y_granjas
          </p>
          <p>
            <strong>Loyalty:</strong> loyalty_1_de_4 · loyalty_2_de_4 · loyalty_3_de_4 · loyalty_4_de_4
          </p>
        </div>
      </div>
    </div>
  )
}
