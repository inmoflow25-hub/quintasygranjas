import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { requireAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function normalizeMoney(value: unknown) {
  const numberValue = Number(value || 0)

  if (!Number.isFinite(numberValue) || numberValue < 0) {
    return 0
  }

  return Math.round(numberValue * 100) / 100
}

function normalizeQuantity(value: unknown) {
  const numberValue = Number(value || 0)

  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    return 0
  }

  return Math.round(numberValue * 1000) / 1000
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin()
  const body = await request.json().catch(() => null)

  if (!body) {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 })
  }

  const supplierPartnerId = String(body.supplier_partner_id || "").trim() || null
  const supplierName = String(body.supplier_name || "").trim()
  const productId = String(body.product_id || "").trim() || null
  const productName = String(body.product_name || "").trim()
  const quantity = normalizeQuantity(body.quantity)
  const unitCost = normalizeMoney(body.unit_cost)
  const totalCost = normalizeMoney(body.total_cost || quantity * unitCost)
  const unitLabel = String(body.unit_label || "").trim() || null
  const expenseDate =
    String(body.expense_date || "").trim() ||
    new Date().toISOString().slice(0, 10)

  const notesBase = String(body.notes || "").trim()
  const notes = [notesBase, `Cargado por: ${admin.email}`]
    .filter(Boolean)
    .join(" | ")

  if (!supplierName) {
    return NextResponse.json(
      { error: "Falta proveedor/socio" },
      { status: 400 }
    )
  }

  if (!productName) {
    return NextResponse.json(
      { error: "Falta producto" },
      { status: 400 }
    )
  }

  if (quantity <= 0) {
    return NextResponse.json(
      { error: "Cantidad inválida" },
      { status: 400 }
    )
  }

  if (unitCost <= 0 && totalCost <= 0) {
    return NextResponse.json(
      { error: "Costo inválido" },
      { status: 400 }
    )
  }

  const { data: expense, error } = await supabase
    .from("supplier_expenses")
    .insert({
      supplier_partner_id: supplierPartnerId,
      supplier_name: supplierName,
      product_id: productId,
      product_name: productName,
      quantity,
      unit_cost: unitCost,
      total_cost: totalCost,
      unit_label: unitLabel,
      expense_date: expenseDate,
      notes
    })
    .select()
    .single()

  if (error) {
    console.error("superadmin supplier expense error", error)

    return NextResponse.json(
      { error: "No se pudo guardar el gasto" },
      { status: 500 }
    )
  }

  return NextResponse.json({
    ok: true,
    expense
  })
}
