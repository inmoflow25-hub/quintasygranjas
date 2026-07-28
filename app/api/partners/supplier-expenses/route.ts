import { NextRequest, NextResponse } from "next/server"
import { getPartnerByToken, partnerSupabase } from "@/lib/partner-auth"

export const dynamic = "force-dynamic"

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
  const body = await request.json().catch(() => null)

  if (!body) {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 })
  }

  const { partner, error, status } = await getPartnerByToken(body.access_token)

  if (!partner) {
    return NextResponse.json({ error }, { status })
  }

  if (!partner.can_log_expenses) {
    return NextResponse.json(
      { error: "Este socio no puede cargar gastos" },
      { status: 403 }
    )
  }

  const supplierName = String(body.supplier_name || partner.name || "").trim()
  const productId = String(body.product_id || "").trim() || null
  const productName = String(body.product_name || "").trim()
  const quantity = normalizeQuantity(body.quantity)
  const unitCost = normalizeMoney(body.unit_cost)
  const totalCost = normalizeMoney(
    body.total_cost || quantity * unitCost
  )
  const unitLabel = String(body.unit_label || "").trim() || null
  const expenseDate =
    String(body.expense_date || "").trim() ||
    new Date().toISOString().slice(0, 10)
  const notes = String(body.notes || "").trim() || null

  if (!supplierName) {
    return NextResponse.json(
      { error: "Falta supplier_name" },
      { status: 400 }
    )
  }

  if (!productName) {
    return NextResponse.json(
      { error: "Falta product_name" },
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

  const { data: expense, error: expenseError } = await partnerSupabase
    .from("supplier_expenses")
    .insert({
      supplier_partner_id: partner.id,
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

  if (expenseError) {
    console.error("supplier expense insert error", expenseError)

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
