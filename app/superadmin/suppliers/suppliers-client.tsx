"use client"

import { useMemo, useState } from "react"

type Partner = {
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
  created_at: string
}

type Product = {
  id: string
  name: string
  price: number
  category: string | null
  unit_label: string | null
  active: boolean
  visible_on_web: boolean | null
  visible_on_pwa: boolean | null
}

type Expense = {
  id: string
  supplier_partner_id: string | null
  supplier_name: string
  product_name: string
  quantity: number
  unit_cost: number
  total_cost: number
  unit_label: string | null
  expense_date: string
  notes: string | null
}

type PriceUpdate = {
  id: string
  supplier_partner_id: string | null
  product_id: string
  old_price: number
  new_price: number
  reason: string | null
  created_at: string
  products?:
    | {
        name?: string | null
      }
    | {
        name?: string | null
      }[]
    | null
}

type Props = {
  partners: Partner[]
  products: Product[]
  expenses: Expense[]
  priceUpdates: PriceUpdate[]
}

function money(value: number | string | null | undefined) {
  return `$${Number(value || 0).toLocaleString("es-AR")}`
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function formatDate(dateString: string | null | undefined) {
  if (!dateString) return "-"
  return new Date(`${dateString}T12:00:00`).toLocaleDateString("es-AR")
}

export default function SuppliersClient({
  partners,
  products,
  expenses,
  priceUpdates
}: Props) {
  const [message, setMessage] = useState("")
  const [loadingId, setLoadingId] = useState("")
  const [search, setSearch] = useState("")
  const [supplierPartnerId, setSupplierPartnerId] = useState("")
  const [supplierName, setSupplierName] = useState("")
  const [costs, setCosts] = useState<Record<string, string>>({})
  const [sellPrices, setSellPrices] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}

    for (const product of products) {
      initial[product.id] = String(product.price || "")
    }

    return initial
  })

  const filteredProducts = useMemo(() => {
    const clean = search.trim().toLowerCase()

    if (!clean) return products

    return products.filter((product) =>
      [
        product.name,
        product.category,
        product.unit_label
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(clean)
    )
  }, [products, search])

  const selectedPartner = useMemo(() => {
    return partners.find((partner) => partner.id === supplierPartnerId) || null
  }, [partners, supplierPartnerId])

  const partnerNameById = useMemo(() => {
    const map = new Map<string, string>()

    for (const partner of partners) {
      map.set(partner.id, partner.name)
    }

    return map
  }, [partners])

  async function saveCost(product: Product) {
    const unitCost = Number(costs[product.id] || 0)
    const finalSupplierName =
      selectedPartner?.name || supplierName.trim() || "Proveedor"

    if (!Number.isFinite(unitCost) || unitCost <= 0) {
      setMessage("Poné un precio de compra válido.")
      return
    }

    setLoadingId(`cost-${product.id}`)
    setMessage("")

    try {
      const res = await fetch("/api/superadmin/suppliers/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          supplier_partner_id: supplierPartnerId || null,
          supplier_name: finalSupplierName,
          product_id: product.id,
          product_name: product.name,
          quantity: 1,
          unit_cost: unitCost,
          total_cost: unitCost,
          unit_label: product.unit_label || "unidad",
          expense_date: today(),
          notes: "Precio de compra actualizado desde Proveedores"
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage(data?.error || "No se pudo guardar el precio de compra.")
        return
      }

      setMessage(`Costo guardado: ${product.name} · pagás ${money(unitCost)}.`)
      setCosts((prev) => ({
        ...prev,
        [product.id]: ""
      }))
    } catch (error) {
      console.error(error)
      setMessage("Error de red guardando costo.")
    } finally {
      setLoadingId("")
    }
  }

  async function updateSellPrice(product: Product) {
    const newPrice = Number(sellPrices[product.id] || 0)

    if (!Number.isFinite(newPrice) || newPrice <= 0) {
      setMessage("Poné un precio de venta válido.")
      return
    }

    setLoadingId(`price-${product.id}`)
    setMessage("")

    try {
      const res = await fetch(
        `/api/superadmin/suppliers/products/${product.id}/price`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            supplier_partner_id: supplierPartnerId || null,
            new_price: newPrice,
            reason: "Precio de venta actualizado desde Proveedores"
          })
        }
      )

      const data = await res.json()

      if (!res.ok) {
        setMessage(data?.error || "No se pudo actualizar el precio de venta.")
        return
      }

      setMessage(
        data.changed
          ? `Venta actualizada: ${product.name} pasó de ${money(product.price)} a ${money(newPrice)}.`
          : `El precio de venta de ${product.name} no cambió.`
      )

      setTimeout(() => {
        window.location.reload()
      }, 700)
    } catch (error) {
      console.error(error)
      setMessage("Error de red actualizando precio de venta.")
    } finally {
      setLoadingId("")
    }
  }

  const totalExpenses = expenses.reduce(
    (acc, expense) => acc + Number(expense.total_cost || 0),
    0
  )

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric title="Socios activos" value={partners.filter((p) => p.active).length} />
        <Metric title="Productos activos" value={products.length} />
        <Metric title="Gastos cargados" value={expenses.length} />
        <Metric title="Total gastos" value={money(totalExpenses)} />
      </section>

      <section className="rounded-3xl border border-[#e3e1dc] bg-white p-6 shadow-sm">
        <h2 className="text-3xl font-serif font-bold">Proveedores</h2>

        <p className="mt-2 text-sm text-gray-600">
          Acá cargás cuánto pagás cada producto y modificás cuánto lo vendés en tienda.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <select
            className="rounded-2xl border border-[#d8d4ca] px-4 py-3 text-sm"
            value={supplierPartnerId}
            onChange={(event) => setSupplierPartnerId(event.target.value)}
          >
            <option value="">Sin socio asignado</option>
            {partners.map((partner) => (
              <option key={partner.id} value={partner.id}>
                {partner.name}
              </option>
            ))}
          </select>

          <input
            className="rounded-2xl border border-[#d8d4ca] px-4 py-3 text-sm"
            placeholder="Proveedor manual, ejemplo Mercado Central"
            value={supplierName}
            onChange={(event) => setSupplierName(event.target.value)}
          />

          <input
            className="rounded-2xl border border-[#d8d4ca] px-4 py-3 text-sm"
            placeholder="Buscar producto"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {message && (
          <div className="mt-4 rounded-2xl bg-green-50 px-4 py-3 text-sm font-bold text-green-900">
            {message}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-[#e3e1dc] bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-2xl font-serif font-bold">Precios de compra y venta</h2>
          <p className="mt-2 text-sm text-gray-600">
            Compra = cuánto pagás. Venta = precio real de la tienda.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#efefed] text-xs uppercase text-gray-600">
              <tr>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Unidad</th>
                <th className="px-4 py-3 text-right">Venta actual</th>
                <th className="px-4 py-3">Precio que pago</th>
                <th className="px-4 py-3">Precio que vendo</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-[#eee] align-top">
                  <td className="px-4 py-4">
                    <div className="font-bold">{product.name}</div>
                    <div className="mt-1 text-xs text-gray-500">
                      Web: {product.visible_on_web ? "sí" : "no"} · App:{" "}
                      {product.visible_on_pwa ? "sí" : "no"}
                    </div>
                  </td>

                  <td className="px-4 py-4">{product.category || "-"}</td>
                  <td className="px-4 py-4">{product.unit_label || "-"}</td>

                  <td className="px-4 py-4 text-right font-black">
                    {money(product.price)}
                  </td>

                  <td className="px-4 py-4">
                    <input
                      className="w-36 rounded-xl border border-[#d8d4ca] px-3 py-2 text-sm"
                      placeholder="Ej: 1200"
                      value={costs[product.id] || ""}
                      onChange={(event) =>
                        setCosts((prev) => ({
                          ...prev,
                          [product.id]: event.target.value
                        }))
                      }
                    />
                  </td>

                  <td className="px-4 py-4">
                    <input
                      className="w-36 rounded-xl border border-[#d8d4ca] px-3 py-2 text-sm"
                      value={sellPrices[product.id] || ""}
                      onChange={(event) =>
                        setSellPrices((prev) => ({
                          ...prev,
                          [product.id]: event.target.value
                        }))
                      }
                    />
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => saveCost(product)}
                        disabled={loadingId === `cost-${product.id}`}
                        className="rounded-xl bg-blue-700 px-4 py-2 text-xs font-black text-white disabled:opacity-60"
                      >
                        {loadingId === `cost-${product.id}`
                          ? "Guardando..."
                          : "Guardar costo"}
                      </button>

                      <button
                        type="button"
                        onClick={() => updateSellPrice(product)}
                        disabled={loadingId === `price-${product.id}`}
                        className="rounded-xl bg-green-700 px-4 py-2 text-xs font-black text-white disabled:opacity-60"
                      >
                        {loadingId === `price-${product.id}`
                          ? "Actualizando..."
                          : "Actualizar venta"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-gray-500">
                    No hay productos para mostrar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-[#e3e1dc] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-serif font-bold">Últimos costos cargados</h2>

          <div className="mt-5 space-y-3">
            {expenses.map((expense) => (
              <div key={expense.id} className="rounded-2xl border border-[#eee] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-bold">{expense.product_name}</div>
                    <div className="text-xs text-gray-500">
                      {expense.supplier_name} · {formatDate(expense.expense_date)}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      Socio:{" "}
                      {expense.supplier_partner_id
                        ? partnerNameById.get(expense.supplier_partner_id) || "-"
                        : "-"}
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
              <p className="text-sm text-gray-500">Todavía no hay costos cargados.</p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-[#e3e1dc] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-serif font-bold">Cambios de precios de venta</h2>

          <div className="mt-5 space-y-3">
            {priceUpdates.map((update) => (
              <div key={update.id} className="rounded-2xl border border-[#eee] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-bold">
                      {update.products?.name || update.product_id}
                    </div>
                    <div className="text-xs text-gray-500">
                      Socio:{" "}
                      {update.supplier_partner_id
                        ? partnerNameById.get(update.supplier_partner_id) || "-"
                        : "-"}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {formatDate(update.created_at)}
                    </div>
                  </div>

                  <div className="text-right text-sm">
                    <div>
                      Antes: <strong>{money(update.old_price)}</strong>
                    </div>
                    <div>
                      Ahora: <strong>{money(update.new_price)}</strong>
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
