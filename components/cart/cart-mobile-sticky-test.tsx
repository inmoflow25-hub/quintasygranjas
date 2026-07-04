"use client"

import { useEffect, useMemo, useState } from "react"

type Product = {
  id: string
  slug?: string
  name: string
  price: number
  type: "unit" | "weight_100g" | "weight_500g" | "weight_1kg"
  unit_label?: string
  image: string
  category: string
  description?: string | null
  boxItems?: string[]
}

type CartItem = Product & {
  quantity: number
}

const CATEGORY_LABELS: Record<string, string> = {
  cajas_armadas: "Cajas",
  verduras: "Verduras",
  frutas: "Frutas",
  frutos_secos: "Frutos secos",
  otros: "Granja",
  pollo: "Pollo",
  congelados: "Congelados",
  comidas_listas_para_horno: "Listas para horno",
  repetido: "Pedido repetido"
}

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "caja_veggie",
    slug: "caja-veggie",
    name: "Caja Veggie",
    description:
      "Rica en fibra, vitaminas y antioxidantes. Mejora la digestión y fortalece tus defensas.",
    price: 29000,
    type: "unit",
    unit_label: "caja",
    image: "/images/caja-veggie.jpg",
    category: "cajas_armadas",
    boxItems: [
      "1 zapallo anco",
      "papa negra 2 kg",
      "cebolla 1 kg y 1/2",
      "tomate 1/2 kg",
      "zanahoria 1/2 kg",
      "manzana 1/2 kg",
      "cítricos 1 kg",
      "banana 1 kg",
      "mandarina 1/2 kg",
      "palta 2 unidades",
      "pera 1/2 kg",
      "espinaca 2 atados",
      "lechuga 1 planta"
    ]
  },
  {
    id: "caja_campo",
    slug: "caja-campo",
    name: "Caja Campo",
    description:
      "Equilibrio entre vegetales y proteínas. Más energía, saciedad y nutrición completa.",
    price: 45320,
    type: "unit",
    unit_label: "caja",
    image: "/images/caja-campo.jpg",
    category: "cajas_armadas",
    boxItems: [
      "1 zapallo anco",
      "papa negra 2 kg",
      "cebolla 1 kg y 1/2",
      "tomate 1/2 kg",
      "zanahoria 1/2 kg",
      "manzana 1/2 kg",
      "cítricos 1 kg",
      "banana 1 kg",
      "mandarina 1/2 kg",
      "palta 2 unidades",
      "pera 1/2 kg",
      "lechuga 1 planta",
      "espinaca 2 atados",
      "30 huevos de campo",
      "1 kg suprema de pollo congelado"
    ]
  },
  {
    id: "caja_granja",
    slug: "caja-granja",
    name: "Caja Granja",
    description:
      "Nutrición completa para toda la familia. Proteínas, grasas saludables y alimentos reales.",
    price: 55520,
    type: "unit",
    unit_label: "caja",
    image: "/images/caja-granja.jpg",
    category: "cajas_armadas",
    boxItems: [
      "1 zapallo anco",
      "papa negra 2 kg",
      "cebolla 1 kg y 1/2",
      "tomate 1/2 kg",
      "zanahoria 1/2 kg",
      "manzana 1/2 kg",
      "cítricos 1 kg",
      "banana 1 kg",
      "mandarina 1/2 kg",
      "palta 2 unidades",
      "pera 1/2 kg",
      "lechuga 1 planta",
      "espinaca 2 atados",
      "30 huevos de campo",
      "1 kg suprema de pollo congelado",
      "1/2 kg de miel pura",
      "1 pan de campo grande"
    ]
  }
]

function normalizeProduct(product: any): Product {
  return {
    id: String(product.slug || product.id || product.name),
    slug: product.slug,
    name: String(product.name || product.product_name || "Producto"),
    price: Number(product.price || 0),
    type: product.type || "unit",
    unit_label: product.unit_label,
    image: product.image || "",
    category: product.category || "otros",
    description: product.description || "",
    boxItems: product.boxItems || product.box_items || undefined
  }
}

function categoryLabel(category: string) {
  return CATEGORY_LABELS[category] || category.replaceAll("_", " ")
}

function getLabel(product: Product) {
  if (product.category === "cajas_armadas") return "caja"
  if (product.unit_label) return product.unit_label
  if (product.type === "unit") return "unidad"
  if (product.type === "weight_100g") return "100g"
  if (product.type === "weight_500g") return "500g"
  if (product.type === "weight_1kg") return "kg"
  return "unidad"
}

function getDisplayQuantity(item: CartItem) {
  if (item.category === "cajas_armadas") {
    return `${item.quantity} caja${item.quantity > 1 ? "s" : ""}`
  }

  if (item.type === "weight_100g") {
    const totalGrams = item.quantity * 100
    if (totalGrams >= 1000) return `${totalGrams / 1000} kg`
    return `${totalGrams} g`
  }

  if (item.type === "weight_500g") {
    const totalGrams = item.quantity * 500
    if (totalGrams >= 1000) return `${totalGrams / 1000} kg`
    return `${totalGrams} g`
  }

  if (item.type === "weight_1kg") {
    return `${item.quantity} kg`
  }

  return `x${item.quantity}`
}

export default function CartMobileStickyTest({
  products
}: {
  products?: Product[]
}) {
  const [dbProducts, setDbProducts] = useState<Product[]>(products || [])
  const [productsLoading, setProductsLoading] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<"mp" | "cash">("mp")
  const [loading, setLoading] = useState(false)
  const [expandedBoxId, setExpandedBoxId] = useState<string | null>(null)
  const [repeatEmail, setRepeatEmail] = useState("")
  const [repeatLoading, setRepeatLoading] = useState(false)

  const PRODUCTS = useMemo(() => {
    if (dbProducts.length > 0) return dbProducts.map(normalizeProduct)
    return FALLBACK_PRODUCTS
  }, [dbProducts])

  const categories = useMemo(() => {
    return Array.from(new Set(PRODUCTS.map((p) => p.category)))
  }, [PRODUCTS])

  useEffect(() => {
    if (products && products.length > 0) {
      setDbProducts(products)
      return
    }

    async function loadProducts() {
      setProductsLoading(true)

      try {
        const res = await fetch("/api/products", {
          cache: "no-store"
        })

        const data = await res.json()

        if (res.ok && Array.isArray(data.products) && data.products.length > 0) {
          setDbProducts(data.products.map(normalizeProduct))
        }
      } catch (error) {
        console.error("load products error", error)
      } finally {
        setProductsLoading(false)
      }
    }

    loadProducts()
  }, [products])

  function addItem(product: Product) {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === product.id)

      if (existing) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
        )
      }

      return [...prev, { ...product, quantity: 1 }]
    })
  }

  function removeItem(product: Product) {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === product.id)

      if (!existing) return prev

      if (existing.quantity === 1) {
        return prev.filter((p) => p.id !== product.id)
      }

      return prev.map((p) =>
        p.id === product.id ? { ...p, quantity: p.quantity - 1 } : p
      )
    })
  }

  function getQuantity(id: string) {
    return cart.find((i) => i.id === id)?.quantity || 0
  }

  function getTotal() {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
  }

  function getTotalItems() {
    return cart.reduce((acc, item) => acc + item.quantity, 0)
  }

  function toggleBoxDetails(productId: string) {
    setExpandedBoxId((prev) => (prev === productId ? null : productId))
  }

  async function repeatLastOrder() {
    const email = repeatEmail.trim().toLowerCase()

    if (!email) {
      alert("Ingresá el email con el que hiciste tu compra anterior")
      return
    }

    setRepeatLoading(true)

    try {
      const res = await fetch("/api/orders/last", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data?.error || "No pudimos encontrar tu último pedido")
        return
      }

      const repeatedItems: CartItem[] = data.items.map((item: any) => ({
        id: String(item.product_name),
        name: String(item.product_name),
        quantity: Number(item.quantity || 1),
        price: Number(item.price || 0),
        type: "unit",
        unit_label: "unidad",
        category: "repetido",
        image: "",
        description: ""
      }))

      setCart(repeatedItems)
    } catch (error) {
      console.error(error)
      alert("Error buscando tu último pedido")
    } finally {
      setRepeatLoading(false)
    }
  }

  async function handleCheckout() {
    if (cart.length === 0) {
      alert("El carrito está vacío")
      return
    }

    if (getTotal() < 20000) {
      alert("El pedido mínimo es de $20.000")
      return
    }

    try {
      setLoading(true)
      localStorage.setItem("qyg_checkout_cart", JSON.stringify(cart))
      window.location.assign("/checkout?source=cart")
    } catch (err) {
      console.error(err)
      alert("No pudimos iniciar el checkout")
      setLoading(false)
    }
  }

  function scrollToCategory(category: string) {
    const el = document.getElementById(`cat-${category}`)
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 pb-28 md:pb-6">
      <h2 className="text-3xl font-bold mb-6 text-center">
        Elegí una caja, armá la tuya o sumá productos
      </h2>

      <p className="text-lg font-medium mb-6 text-center">
        Pedido mínimo de $20.000 - Recibís en tu casa
      </p>

      {productsLoading && (
        <p className="mb-6 text-center text-sm text-gray-500">
          Actualizando productos...
        </p>
      )}

      {/* PILLS DE CATEGORÍAS */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => scrollToCategory(cat)}
            className="px-4 py-1 rounded-full bg-gray-200 text-sm whitespace-nowrap hover:bg-green-600 hover:text-white transition"
          >
            {categoryLabel(cat)}
          </button>
        ))}
      </div>

      {/* LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* PRODUCTOS */}
        <div className="md:col-span-2">
          {categories.map((category) => {
            const items = PRODUCTS.filter((p) => p.category === category)

            return (
              <div
                key={category}
                id={`cat-${category}`}
                className="mb-10 scroll-mt-32"
              >
                <h3 className="text-xl font-bold mb-3 capitalize">
                  {categoryLabel(category)}
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {items.map((p) => {
                    const quantity = getQuantity(p.id)
                    const isBox = p.category === "cajas_armadas"
                    const isExpanded = expandedBoxId === p.id

                    return (
                      <div
                        key={p.id}
                        className="rounded-xl p-2 bg-[#e2e2e2] hover:bg-[#d8d8d8] transition"
                      >
                        <div className="h-30 w-full mb-2 overflow-hidden rounded-lg bg-gray-200">
                          {p.image ? (
                            <img
                              src={p.image}
                              className="w-full h-full object-cover"
                              alt={p.name}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">
                              Sin imagen
                            </div>
                          )}
                        </div>

                        <p className="text-sm font-semibold text-black mb-1">
                          {p.name}
                        </p>

                        {p.description && (
                          <p className="text-xs text-gray-600 mb-2">
                            {p.description}
                          </p>
                        )}

                        {isBox && (
                          <button
                            type="button"
                            onClick={() => toggleBoxDetails(p.id)}
                            className="text-xs font-medium text-black underline mb-2"
                          >
                            {isExpanded ? "Ocultar qué trae" : "Qué trae"}
                          </button>
                        )}

                        {isBox && isExpanded && p.boxItems && (
                          <div className="mb-3 rounded-xl bg-white p-4 shadow-lg border border-gray-300">
                            <p className="text-sm font-bold mb-3">
                              Esta caja trae:
                            </p>

                            <ul className="text-sm text-gray-700 space-y-2 leading-6">
                              {p.boxItems.map((item, index) => (
                                <li key={`${p.id}-item-${index}`}>• {item}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <p className="text-md font-bold">
                          ${p.price.toLocaleString()}
                        </p>

                        <p className="text-xs text-gray-600 mb-2">
                          por {getLabel(p)}
                        </p>

                        <div className="flex justify-center items-center gap-2">
                          <button
                            type="button"
                            onClick={() => removeItem(p)}
                            className="w-7 h-7 rounded-full bg-gray-400"
                          >
                            -
                          </button>

                          <span className="text-sm">{quantity}</span>

                          <button
                            type="button"
                            onClick={() => addItem(p)}
                            className="w-7 h-7 rounded-full bg-green-600 text-white"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* CARRITO VERDE DESKTOP */}
        <div className="hidden md:block md:col-span-1">
          <div className="sticky top-24 rounded-xl p-5 bg-green-600 text-white shadow-lg">
            <div className="mb-4 rounded-xl bg-white/15 p-3">
              <p className="mb-2 text-sm font-semibold">¿Ya compraste antes?</p>

              <input
                className="mb-2 w-full rounded-lg px-3 py-2 text-sm text-black"
                placeholder="Tu email"
                value={repeatEmail}
                onChange={(e) => setRepeatEmail(e.target.value)}
              />

              <button
                type="button"
                onClick={repeatLastOrder}
                disabled={repeatLoading}
                className="w-full rounded-lg bg-black px-3 py-2 text-sm font-semibold text-white"
              >
                {repeatLoading ? "Buscando..." : "Repetir último pedido"}
              </button>
            </div>

            <h3 className="text-xl font-bold mb-4">Mi pedido</h3>

            {cart.length === 0 && (
              <p className="text-sm text-green-100">
                Todavía no agregaste productos
              </p>
            )}

            {cart.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center mb-3 text-sm"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-green-200">
                    {getDisplayQuantity(item)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => removeItem(item)}
                    className="w-6 h-6 rounded-full bg-white text-black"
                  >
                    -
                  </button>

                  <button
                    type="button"
                    onClick={() => addItem(item)}
                    className="w-6 h-6 rounded-full bg-black text-white"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}

            <div className="mt-4 border-t border-green-400 pt-3">
              <p className="text-lg font-bold">
                Total: ${Math.round(getTotal()).toLocaleString()}
              </p>
            </div>

            <div className="mt-3 flex flex-col gap-2 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={paymentMethod === "mp"}
                  onChange={() => setPaymentMethod("mp")}
                />
                Tarjetas débito / crédito
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={paymentMethod === "cash"}
                  onChange={() => setPaymentMethod("cash")}
                />
                Efectivo
              </label>
            </div>

            <button
              type="button"
              onClick={handleCheckout}
              disabled={loading}
              className="mt-5 w-full bg-black text-white py-3 rounded-xl text-lg disabled:opacity-60"
            >
              {loading ? "Procesando..." : "Finalizar compra"}
            </button>
          </div>
        </div>
      </div>

      {/* BARRA FIJA SOLO MOBILE */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-green-800 bg-green-700 px-4 py-3 text-white shadow-2xl md:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-green-100">
              {cart.length === 0
                ? "Todavía no agregaste productos"
                : `${getTotalItems()} producto${
                    getTotalItems() === 1 ? "" : "s"
                  } en tu pedido`}
            </p>

            <p className="text-lg font-black leading-tight">
              ${Math.round(getTotal()).toLocaleString()}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (cart.length === 0) {
                document
                  .getElementById("cart")
                  ?.scrollIntoView({ behavior: "smooth" })
                return
              }

              handleCheckout()
            }}
            disabled={loading}
            className="rounded-xl bg-black px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {cart.length === 0
              ? "Ver productos"
              : loading
                ? "Procesando..."
                : "Finalizar"}
          </button>
        </div>
      </div>
    </div>
  )
}
