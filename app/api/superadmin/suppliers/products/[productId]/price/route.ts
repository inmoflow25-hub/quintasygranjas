import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { requireAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function normalizePrice(value: unknown) {
  const numberValue = Number(value || 0)

  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    return 0
  }

  return Math.round(numberValue)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const admin = await requireAdmin()
  const { productId } = await params
  const body = await request.json().catch(() => null)

  if (!body) {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 })
  }

  const newPrice = normalizePrice(body.new_price)
  const supplierPartnerId = String(body.supplier_partner_id || "").trim() || null
  const reasonBase = String(body.reason || "").trim()

  const reason = [
    reasonBase || "Cambio desde superadmin/proveedores",
    `Cambiado por: ${admin.email}`
  ]
    .filter(Boolean)
    .join(" | ")

  if (!productId) {
    return NextResponse.json(
      { error: "Falta productId" },
      { status: 400 }
    )
  }

  if (newPrice <= 0) {
    return NextResponse.json(
      { error: "Precio inválido" },
      { status: 400 }
    )
  }

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, name, price")
    .eq("id", productId)
    .maybeSingle()

  if (productError) {
    console.error("superadmin product lookup error", productError)

    return NextResponse.json(
      { error: "No se pudo buscar el producto" },
      { status: 500 }
    )
  }

  if (!product) {
    return NextResponse.json(
      { error: "Producto inexistente" },
      { status: 404 }
    )
  }

  const oldPrice = Number(product.price || 0)

  if (oldPrice === newPrice) {
    return NextResponse.json({
      ok: true,
      changed: false,
      product: {
        id: product.id,
        name: product.name,
        price: oldPrice
      }
    })
  }

  const { error: updateError } = await supabase
    .from("products")
    .update({
      price: newPrice,
      updated_at: new Date().toISOString()
    })
    .eq("id", productId)

  if (updateError) {
    console.error("superadmin product price update error", updateError)

    return NextResponse.json(
      { error: "No se pudo actualizar el precio" },
      { status: 500 }
    )
  }

  const { error: auditError } = await supabase
    .from("product_price_updates")
    .insert({
      supplier_partner_id: supplierPartnerId,
      product_id: productId,
      old_price: oldPrice,
      new_price: newPrice,
      reason
    })

  if (auditError) {
    console.error("superadmin product price audit error", auditError)

    return NextResponse.json(
      {
        error:
          "El precio se actualizó, pero no se pudo guardar la auditoría"
      },
      { status: 500 }
    )
  }

  return NextResponse.json({
    ok: true,
    changed: true,
    product: {
      id: product.id,
      name: product.name,
      old_price: oldPrice,
      new_price: newPrice
    }
  })
}
