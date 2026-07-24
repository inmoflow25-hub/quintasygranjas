"use client"

import { useEffect, useMemo, useState } from "react"

type Product = {
  id: string
  name: string
  price: number
  image?: string | null
  category: string
  description?: string | null
  type?: "unit" | "weight_100g" | "weight_500g" | "weight_1kg"
  unit_label?: string | null
}

type CartItem = Product & {
  quantity: number
}

const CATEGORY_LABELS: Record<string, string> = {
  cajas_armadas: "Cajas armadas",
  verduras: "Verduras",
  frutas: "Frutas",
  frutos_secos: "Frutos secos",
  otros: "Granja",
  pollo: "Pollo",
  congelados: "Congelados",
  comidas_listas_para_horno: "Listas para horno"
}

function categoryLabel(category: string) {
  return CATEGORY_LABELS[category] || category.replaceAll("_", " ")
}

function getProductLabel(product: Product) {
  if (product.category === "cajas_armadas") return "caja"
  if (product.unit_label) return product.unit_label
  if (product.type === "weight_100g") return "100 g"
  if (product.type === "weight_500g") return "500 g"
  if (product.type === "weight_1kg") return "kg"

  return "unidad"
}

export default function CartAccordionBrandingTest() {
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [openCategory, setOpenCategory] = useState<string | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch("/api/products", {
          cache: "no-store"
        })

        const data = await response.json()

        const loadedProducts: Product[] = Array.isArray(data?.products)
          ? data.products.filter(
              (product: Product) => product?.id && product?.category
            )
          : []

        setProducts(loadedProducts)

        const loadedCategories = Array.from(
          new Set(loadedProducts.map((product) => product.category))
        )

        if (loadedCategories.includes("cajas_armadas")) {
          setOpenCategory("cajas_armadas")
        } else {
          setOpenCategory(loadedCategories[0] || null)
        }
      } catch (error) {
        console.error("Error cargando productos:", error)
      } finally {
        setProductsLoading(false)
      }
    }

    loadProducts()
  }, [])

  const categories = useMemo(() => {
    return Array.from(
      new Set(products.map((product) => product.category))
    )
  }, [products])

  const total = useMemo(() => {
    return cart.reduce((sum, item) => {
      return sum + Number(item.price) * item.quantity
    }, 0)
  }, [cart])

  const totalItems = useMemo(() => {
    return cart.reduce((sum, item) => {
      return sum + item.quantity
    }, 0)
  }, [cart])

  function getQuantity(productId: string) {
    return cart.find((item) => item.id === productId)?.quantity || 0
  }

  function addItem(product: Product) {
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.id === product.id
      )

      if (!existingItem) {
        return [
          ...currentCart,
          {
            ...product,
            quantity: 1
          }
        ]
      }

      return currentCart.map((item) =>
        item.id === product.id
          ? {
              ...item,
              quantity: item.quantity + 1
            }
          : item
      )
    })
  }

  function removeItem(product: Product) {
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.id === product.id
      )

      if (!existingItem) {
        return currentCart
      }

      if (existingItem.quantity === 1) {
        return currentCart.filter(
          (item) => item.id !== product.id
        )
      }

      return currentCart.map((item) =>
        item.id === product.id
          ? {
              ...item,
              quantity: item.quantity - 1
            }
          : item
      )
    })
  }

  function getCategoryCartQuantity(category: string) {
    return cart
      .filter((item) => item.category === category)
      .reduce((sum, item) => sum + item.quantity, 0)
  }

  function toggleCategory(category: string) {
    setOpenCategory((currentCategory) =>
      currentCategory === category ? null : category
    )
  }

  function handleCheckout() {
    if (cart.length === 0) {
      document
        .getElementById("productos")
        ?.scrollIntoView({ behavior: "smooth" })

      return
    }

    if (total < 20000) {
      alert("El pedido mínimo es de $20.000")
      return
    }

    try {
      setCheckoutLoading(true)

      localStorage.setItem(
        "qyg_checkout_cart",
        JSON.stringify(cart)
      )

      window.location.assign("/checkout?source=cart")
    } catch (error) {
      console.error("Error iniciando checkout:", error)
      alert("No pudimos iniciar el checkout")
      setCheckoutLoading(false)
    }
  }

  return (
    <section
      id="productos"
      className="mx-auto max-w-7xl px-4 pb-32 pt-12 sm:px-6 md:pb-20"
    >
      <div className="mb-8 text-center">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-[#0f3d22]/55">
          Tienda
        </p>

        <h2 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">
          Armá tu pedido
        </h2>

        <p className="mx-auto mt-3 max-w-2xl text-base font-medium text-[#06150a]/65 md:text-lg">
          Elegí una categoría, agregá tus productos y seguí con la próxima.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="space-y-3">
          {productsLoading && (
            <div className="rounded-[24px] border border-[#b9cbaa] bg-[#e7f2df] p-8 text-center font-semibold text-[#0f3d22]">
              Cargando productos...
            </div>
          )}

          {!productsLoading && categories.length === 0 && (
            <div className="rounded-[24px] border border-[#b9cbaa] bg-[#e7f2df] p-8 text-center font-semibold text-[#0f3d22]">
              No pudimos cargar los productos.
            </div>
          )}

          {categories.map((category) => {
            const isOpen = openCategory === category

            const categoryProducts = products.filter(
              (product) => product.category === category
            )

            const selectedQuantity =
              getCategoryCartQuantity(category)

            return (
              <div
                key={category}
                className={`overflow-hidden rounded-[24px] border transition ${
                  isOpen
                    ? "border-[#0f3d22]/35 bg-[#dcebd3] shadow-[0_12px_30px_rgba(15,61,34,0.12)]"
                    : "border-[#0f3d22]/15 bg-[#e7f2df] shadow-[0_5px_16px_rgba(15,61,34,0.06)]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className={`flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition md:px-7 ${
                    isOpen
                      ? "bg-[#d3e6c8]"
                      : "bg-[#e7f2df] hover:bg-[#dcebd3]"
                  }`}
                  aria-expanded={isOpen}
                >
                  <div className="min-w-0">
                    <h3 className="text-lg font-black capitalize tracking-tight text-[#0f3d22] md:text-xl">
                      {categoryLabel(category)}
                    </h3>

                    <p className="mt-1 text-sm font-semibold text-[#0f3d22]/60">
                      {categoryProducts.length} productos
                      {selectedQuantity > 0
                        ? ` · ${selectedQuantity} agregados`
                        : ""}
                    </p>
                  </div>

                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-xl font-medium transition ${
                      isOpen
                        ? "rotate-45 border-[#0f3d22] bg-[#0f3d22] text-white"
                        : "border-[#0f3d22]/25 bg-[#f5f8f1] text-[#0f3d22]"
                    }`}
                    aria-hidden="true"
                  >
                    +
                  </div>
                </button>

                {isOpen && (
                  <div className="grid grid-cols-2 gap-3 border-t border-[#0f3d22]/15 bg-[#f3eee5] p-3 sm:grid-cols-3 md:p-4">
                    {categoryProducts.map((product) => {
                      const quantity = getQuantity(product.id)
                      const isSelected = quantity > 0

                      return (
                        <article
                          key={product.id}
                          className={`flex min-h-full flex-col overflow-hidden rounded-[18px] border bg-[#fffdf8] transition ${
                            isSelected
                              ? "border-[#0f3d22]/45 shadow-[0_8px_22px_rgba(15,61,34,0.13)]"
                              : "border-[#06150a]/10 shadow-[0_4px_12px_rgba(6,21,10,0.06)]"
                          }`}
                        >
                          <div className="aspect-[4/3] overflow-hidden bg-[#dedbd3]">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-xs font-semibold text-black/40">
                                Sin imagen
                              </div>
                            )}
                          </div>

                          <div className="flex flex-1 flex-col p-3">
                            <h4 className="text-sm font-black leading-tight text-[#06150a]">
                              {product.name}
                            </h4>

                            <div className="mt-3">
                              <p className="text-base font-black text-[#0f3d22]">
                                $
                                {Number(product.price).toLocaleString(
                                  "es-AR"
                                )}
                              </p>

                              <p className="text-xs font-semibold text-[#06150a]/45">
                                por {getProductLabel(product)}
                              </p>
                            </div>

                            <div className="mt-auto flex items-center justify-between pt-4">
                              <button
                                type="button"
                                onClick={() => removeItem(product)}
                                disabled={quantity === 0}
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#0f3d22]/15 bg-[#eef3e9] text-lg font-black text-[#0f3d22] transition hover:bg-[#dce8d4] disabled:cursor-not-allowed disabled:opacity-30"
                                aria-label={`Quitar ${product.name}`}
                              >
                                −
                              </button>

                              <span
                                className={`flex min-w-9 items-center justify-center rounded-full px-2 py-1 text-sm font-black ${
                                  isSelected
                                    ? "bg-[#0f3d22] text-white"
                                    : "bg-transparent text-[#06150a]"
                                }`}
                              >
                                {quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() => addItem(product)}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0f3d22] text-lg font-black text-white shadow-sm transition hover:bg-[#18542f]"
                                aria-label={`Agregar ${product.name}`}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <aside className="hidden md:block">
          <div className="sticky top-6 overflow-hidden rounded-[28px] border border-[#0f3d22]/20 bg-[#0f3d22] text-white shadow-[0_18px_45px_rgba(15,61,34,0.22)]">
            <div className="p-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/55">
                Resumen
              </p>

              <h3 className="mt-1 text-2xl font-black">
                Mi pedido
              </h3>

              {cart.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-white/65">
                    Todavía no agregaste productos.
                  </p>
                </div>
              ) : (
                <div className="mt-5 max-h-[48vh] space-y-3 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-2xl bg-white/8 p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">
                          {item.name}
                        </p>

                        <p className="text-xs font-semibold text-white/55">
                          Cantidad: {item.quantity}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => removeItem(item)}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-black text-[#06150a]"
                        >
                          −
                        </button>

                        <button
                          type="button"
                          onClick={() => addItem(item)}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-sm font-black text-white"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-white/10 bg-[#0b301b] p-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white/60">
                    {totalItems} productos
                  </p>

                  <p className="text-3xl font-black">
                    ${Math.round(total).toLocaleString("es-AR")}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="mt-5 w-full rounded-2xl bg-[#fff8f0] px-5 py-4 text-base font-black text-[#0f3d22] transition hover:bg-white disabled:opacity-60"
              >
                {checkoutLoading
                  ? "Procesando..."
                  : "Finalizar compra"}
              </button>

              <p className="mt-3 text-center text-xs font-semibold text-white/45">
                Pedido mínimo de $20.000
              </p>
            </div>
          </div>
        </aside>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#0f3d22]/30 bg-[#0f3d22] px-4 py-3 text-white shadow-[0_-8px_30px_rgba(0,0,0,0.2)] md:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-white/65">
              {totalItems === 0
                ? "Todavía no agregaste productos"
                : `${totalItems} producto${
                    totalItems === 1 ? "" : "s"
                  } en tu pedido`}
            </p>

            <p className="text-xl font-black leading-tight">
              ${Math.round(total).toLocaleString("es-AR")}
            </p>
          </div>

          <button
            type="button"
            onClick={handleCheckout}
            disabled={checkoutLoading}
            className="shrink-0 rounded-xl bg-[#fff8f0] px-5 py-3 text-sm font-black text-[#0f3d22] disabled:opacity-60"
          >
            {totalItems === 0
              ? "Ver productos"
              : checkoutLoading
                ? "Procesando..."
                : "Finalizar"}
          </button>
        </div>
      </div>
    </section>
  )
}
