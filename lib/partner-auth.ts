import { createClient } from "@supabase/supabase-js"

export const partnerSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export type SupplierPartner = {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  notes: string | null
  active: boolean
  can_update_prices: boolean
  can_log_expenses: boolean
}

export async function getPartnerByToken(accessToken: string | null) {
  const cleanToken = String(accessToken || "").trim()

  if (!cleanToken) {
    return {
      partner: null,
      error: "Falta access_token",
      status: 401
    }
  }

  const { data: partner, error } = await partnerSupabase
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
  can_log_expenses
`)
    .eq("access_token", cleanToken)
    .maybeSingle()

  if (error) {
    console.error("partner lookup error", error)

    return {
      partner: null,
      error: "No se pudo validar el socio",
      status: 500
    }
  }

  if (!partner) {
    return {
      partner: null,
      error: "Token inválido",
      status: 401
    }
  }

  if (!partner.active) {
    return {
      partner: null,
      error: "Socio inactivo",
      status: 403
    }
  }

  return {
    partner: partner as SupplierPartner,
    error: null,
    status: 200
  }
}
