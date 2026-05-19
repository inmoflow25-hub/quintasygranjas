import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type CheckoutItem = {
  quantity: number
  price: number
}

function normalizeEmail(email: string) {
  return String(email || "").trim().toLowerCase()
}

function normalizeMoney(value: unknown) {
  const numberValue = Number(value || 0)

  if (!Number.isFinite(numberValue) || numberValue < 0) {
    return 0
  }

  return Math.round(numberValue)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      commercial_location_id,
      customer_email,
      items
    } = body

    const propina = normalizeMoney(body.propina)

    if (!commercial_location_id || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "Faltan datos" },
        { status: 400 }
      )
    }

    const { data: location } = await supabase
      .from("commercial_locations")
      .select("id, type, parent_location_id, is_active")
      .eq("id", commercial_location_id)
      .eq("is_active", true)
      .single()

    if (!location) {
      return NextResponse.json(
        { error: "Edificio inválido" },
        { status: 400 }
      )
    }

    const clusterLocationId =
      location.type === "cluster"
        ? location.id
        : location.parent_location_id

    const subtotal = items.reduce((acc: number, item: CheckoutItem) => {
      return acc + Number(item.price || 0) * Number(item.quantity || 1)
    }, 0)

    let loyaltyDiscountPercent = 0
    let benefitDiscountPercent = 0
    let firstPurchaseDiscountPercent = 0
    let benefitStatus = "none"

    if (customer_email && clusterLocationId) {
      const email = normalizeEmail(customer_email)

      const { data: user } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .maybeSingle()

      if (user?.id) {
        const { data: loyaltyRow } = await supabase
          .from("commercial_customer_loyalty")
          .select("completed_purchases")
          .eq("user_id", user.id)
          .eq("cluster_location_id", clusterLocationId)
          .maybeSingle()

        const completedPurchases = Number(loyaltyRow?.completed_purchases || 0)

        if (completedPurchases <= 0) {
          firstPurchaseDiscountPercent = 10
        }

        const { data: loyaltyDiscount } = await supabase
          .rpc("get_customer_commercial_discount", {
            p_user_id: user.id,
            p_cluster_location_id: clusterLocationId
          })

        loyaltyDiscountPercent = Number(loyaltyDiscount || 0)

        const { data: benefits } = await supabase
          .from("commercial_user_benefits")
          .select("discount_percent")
          .eq("user_id", user.id)
          .eq("cluster_location_id", clusterLocationId)
          .eq("status", "available")
          .order("created_at", { ascending: true })
          .limit(1)

        benefitDiscountPercent = benefits?.[0]
          ? Number(benefits[0].discount_percent || 0)
          : 0
      } else {
        firstPurchaseDiscountPercent = 10
      }
    }

    const discountPercent = Math.max(
      firstPurchaseDiscountPercent,
      loyaltyDiscountPercent,
      benefitDiscountPercent
    )

    const normalizedDiscountPercent = Math.max(0, Math.min(100, discountPercent))

    if (
      firstPurchaseDiscountPercent > 0 &&
      normalizedDiscountPercent === firstPurchaseDiscountPercent &&
      firstPurchaseDiscountPercent >= loyaltyDiscountPercent &&
      firstPurchaseDiscountPercent >= benefitDiscountPercent
    ) {
      benefitStatus = "first_purchase"
    } else if (normalizedDiscountPercent > 0) {
      benefitStatus = "applied"
    }

    const discountAmount = Math.round(subtotal * (normalizedDiscountPercent / 100))
    const finalPrice = Math.max(0, subtotal - discountAmount + propina)

    return NextResponse.json({
      ok: true,
      subtotal,
      discount_percent: normalizedDiscountPercent,
      discount_amount: discountAmount,
      propina,
      final_price: finalPrice,
      benefit_status: benefitStatus
    })
  } catch (error) {
    console.error("vecinos preview error", error)

    return NextResponse.json(
      { error: "Error calculando preview" },
      { status: 500 }
    )
  }
}

