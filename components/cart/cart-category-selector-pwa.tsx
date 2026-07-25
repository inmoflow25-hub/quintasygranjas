"use client"

import { useEffect, useMemo, useState } from "react"

type Product = {
  id: string
  slug?: string
  name: string
  price: number
  image?: string | null
  category: string
  description?: string | null
  type?: "unit" | "weight_100g" | "weight_500g" | "weight_1kg"
  unit_label?: string | null
  app_exclusive?: boolean
  app_promo?: boolean
  promo_label?: string | null
  points_multiplier?: number
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
  comidas_listas_para_horno: "Listas para horno"
}

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  cajas_armadas: "Todo resuelto",
  verduras: "Frescas y seleccionadas",
  frutas: "Para todos los días",
  frutos_secos: "Naturales y nutritivos",
  otros: "Productos de granja",
  pollo: "Cortes seleccionados",
  congelados: "Listos para guardar",
  comidas_listas_para_horno: "Prácticas y caseras"
}

const CATEGORY_ORDER = [
  "cajas_armadas",
  "verduras",
  "frutas",
  "otros",
  "pollo",
  "frutos_secos",
  "congelados",
  "comidas_listas_para_horno"
]

function categoryLabel(category: string) {
  return CATEGORY_LABELS[category] || category.replaceAll("_", " ")
}

function categoryDescription(category: string) {
  return CATEGORY_DESCRIPTIONS[category] || "Productos seleccionados"
}

function getProductLabel(product: Product) {
  if (product.category === "cajas_armadas") return "caja"
  if (product.unit_label) return product.unit_label
  if (product.type === "weight_100g") return "100 g"
  if (product.type === "weight_500g") return "500 g"
  if (product.type === "weight_1kg") return "kg"

  return "unidad"
}

export default function CartCategorySelectorPwa() {
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch("/api/app/products", {
          cache: "no-store"
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data?.error || "No se pudieron cargar los productos")
        }

        const loadedProducts: Product[] = Array.isArray(data?.products)
          ? data.products.filter(
              (product: Product) =>
                product?.id &&
                product?.category &&
                Number(product?.price) >= 0
            )
          : []

        setProducts(loadedProducts)

        const availableCategories = Array.from(
          new Set(
            loadedProducts.map((product) => product.category)
          )
        )

        if (availableCategories.includes("cajas_armadas")) {
          setActiveCategory("cajas_armadas")
        } else {
          setActiveCategory(availableCategories[0] || null)
        }
      } catch (error) {
        console.error("Error cargando productos PWA:", error)
      } finally {
        setProductsLoading(false)
      }
    }

    loadProducts()
  }, [])

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("qyg_app_cart")

      if (!savedCart) return

      const parsedCart = JSON.parse(savedCart)

      if (Array.isArray(parsedCart)) {
        setCart(
          parsedCart.filter(
            (item: CartItem) =>
              item?.id &&
              item?.name &&
              Number(item?.quantity) > 0
          )
        )
      }
    } catch (error) {
      console.error("Error leyendo carrito PWA:", error)
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(
        "qyg_app_cart",
        JSON.stringify(cart)
      )
    } catch (error) {
      console.error("Error guardando carrito PWA:", error)
    }
  }, [cart])

  const categories = useMemo(() => {
    const availableCategories = Array.from(
      new Set(products.map((product) => product.category))
    )

    return availableCategories.sort((a, b) => {
      const positionA = CATEGORY_ORDER.indexOf(a)
      const positionB = CATEGORY_ORDER.indexOf(b)

      if (positionA === -1 && positionB === -1) {
        return categoryLabel(a).localeCompare(categoryLabel(b))
      }

      if (positionA === -1) return 1
      if (positionB === -1) return -1

      return positionA - positionB
    })
  }, [products])

  const visibleProducts = useMemo(() => {
    if (!activeCategory) return []

    return products.filter(
      (product) => product.category === activeCategory
    )
  }, [products, activeCategory])

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

  function getCategoryImage(category: string) {
    return (
      products.find(
        (product) =>
          product.category === category &&
          Boolean(product.image)
      )?.image || null
    )
  }

  function getCategoryProductCount(category: string) {
    return products.filter(
      (product) => product.category === category
    ).length
  }

  function getCategoryCartQuantity(category: string) {
    return cart
      .filter((item) => item.category === category)
      .reduce((sum, item) => sum + item.quantity, 0)
  }

  function getQuantity(productId: string) {
    return (
      cart.find((item) => item.id === productId)?.quantity || 0
    )
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

      if (!existingItem) return currentCart

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

  function handleCategoryChange(category: string) {
    setActiveCategory(category)

    window.requestAnimationFrame(() => {
      document
        .getElementById("productos-listado")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        })
    })
  }

  function handleCheckout() {
    if (cart.length === 0) {
      document
        .getElementById("selector-categorias")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        })

      return
    }

    if (total < 20000) {
      alert("El pedido mínimo es de $20.000")
      return
    }

    try {
      setCheckoutLoading(true)

      localStorage.setItem(
        "qyg_app_cart",
        JSON.stringify(cart)
      )

      window.location.assign("/app/checkout")
    } catch (error) {
      console.error("Error iniciando checkout PWA:", error)
      alert("No pudimos iniciar el checkout")
      setCheckoutLoading(false)
    }
  }

  return (
    <section
      id="productos"
      className="mx-auto max-w-7xl px-4 pb-32 pt-10 sm:px-6 md:pb-20 md:pt-16"
    >
      <div className="mb-7 md:mb-10">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#0f3d22]/55">
          Nuestra tienda
        </p>

        <div className="mt-2 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-[#102d1c] md:text-5xl">
              ¿Qué estás buscando?
            </h2>

            <p className="mt-2 max-w-2xl text-base font-medium text-[#102d1c]/60 md:text-lg">
              Elegí una categoría y armá tu pedido sin recorrer
              todo el catálogo.
            </p>
          </div>

          <p className="text-sm font-bold text-[#102d1c]/55">
            Pedido mínimo de $20.000
          </p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(290px,1fr)]">
        <div className="min-w-0">
          {productsLoading && (
            <div className="rounded-[28px] border border-[#ded5c8] bg-[#f3eee6] p-8 text-center font-bold text-[#173c27]">
              Cargando productos...
            </div>
          )}

          {!productsLoading && categories.length === 0 && (
            <div className="rounded-[28px] border border-[#ded5c8] bg-[#f3eee6] p-8 text-center font-bold text-[#173c27]">
              No pudimos cargar los productos.
            </div>
          )}

          {!productsLoading && categories.length > 0 && (
            <>
              <div
                id="selector-categorias"
                className="-mx-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0"
              >
                <div className="flex min-w-max gap-3 sm:grid sm:min-w-0 sm:grid-cols-3 lg:grid-cols-4">
                  {categories.map((category) => {
                    const isActive =
                      activeCategory === category

                    const image = getCategoryImage(category)

                    const productCount =
                      getCategoryProductCount(category)

                    const selectedQuantity =
                      getCategoryCartQuantity(category)

                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() =>
                          handleCategoryChange(category)
                        }
                        className={`group relative w-[145px] shrink-0 overflow-hidden rounded-[22px] border text-left transition-all duration-200 sm:w-auto ${
                          isActive
                            ? "border-[#0f3d22] bg-[#fffaf2] shadow-[0_12px_28px_rgba(15,61,34,0.16)]"
                            : "border-[#ded5c8] bg-[#f4efe7] shadow-[0_4px_14px_rgba(39,34,25,0.05)] hover:-translate-y-0.5 hover:border-[#0f3d22]/35 hover:shadow-[0_10px_24px_rgba(39,34,25,0.1)]"
                        }`}
                        aria-pressed={isActive}
                      >
                        <div className="relative aspect-[1.45/1] overflow-hidden bg-[#e5ded3]">
                          {image ? (
                            <img
                              src={image}
                              alt=""
                              className={`h-full w-full object-cover transition duration-300 ${
                                isActive
                                  ? "scale-[1.03]"
                                  : "group-hover:scale-[1.04]"
                              }`}
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-[#eee5d8] to-[#d9cfbf]" />
                          )}

                          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />

                          {selectedQuantity > 0 && (
                            <span className="absolute right-2 top-2 flex min-w-7 items-center justify-center rounded-full bg-[#0f3d22] px-2 py-1 text-xs font-black text-white shadow-md">
                              {selectedQuantity}
                            </span>
                          )}

                          {isActive && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0f3d22]" />
                          )}
                        </div>

                        <div className="px-3 pb-3 pt-3">
                          <p className="truncate text-sm font-black text-[#102d1c] sm:text-base">
                            {categoryLabel(category)}
                          </p>

                          <p className="mt-0.5 truncate text-xs font-semibold text-[#102d1c]/50">
                            {categoryDescription(category)}
                          </p>

                          <p className="mt-2 text-xs font-bold text-[#0f3d22]/65">
                            {productCount} producto
                            {productCount === 1 ? "" : "s"}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div
                id="productos-listado"
                className="scroll-mt-4 pt-5 md:pt-7"
              >
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0f3d22]/45">
                      Categoría
                    </p>

                    <h3 className="mt-1 text-2xl font-black text-[#102d1c] md:text-3xl">
                      {activeCategory
                        ? categoryLabel(activeCategory)
                        : ""}
                    </h3>
                  </div>

                  <p className="text-sm font-bold text-[#102d1c]/45">
                    {visibleProducts.length} productos
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {visibleProducts.map((product) => {
                    const quantity = getQuantity(product.id)
                    const isSelected = quantity > 0

                    return (
                      <article
                        key={product.id}
                        className={`flex min-h-full flex-col overflow-hidden rounded-[22px] border bg-[#fffdf9] transition ${
                          isSelected
                            ? "border-[#0f3d22]/50 shadow-[0_10px_28px_rgba(15,61,34,0.14)]"
                            : "border-[#ded8cf] shadow-[0_4px_15px_rgba(37,31,23,0.06)] hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(37,31,23,0.1)]"
                        }`}
                      >
                        <div className="relative aspect-[1.2/1] overflow-hidden bg-[#e7e1d8]">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-full w-full object-cover transition duration-300 hover:scale-[1.03]"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs font-bold text-black/35">
                              Sin imagen
                            </div>
                          )}

                          {product.app_promo && (
                            <span className="absolute left-2 top-2 rounded-full bg-[#fff8f0] px-2.5 py-1 text-[11px] font-black text-[#0f3d22] shadow">
                              {product.promo_label || "Promo app"}
                            </span>
                          )}

                          {product.app_exclusive && (
                            <span className="absolute bottom-2 left-2 rounded-full bg-[#0f3d22] px-2.5 py-1 text-[11px] font-black text-white shadow">
                              Exclusivo app
                            </span>
                          )}
                        </div>

                        <div className="flex flex-1 flex-col p-3 md:p-4">
                          <h4 className="text-sm font-black leading-tight text-[#102d1c] md:text-base">
                            {product.name}
                          </h4>

                          {product.description && (
                            <p className="mt-1 line-clamp-2 text-xs font-medium leading-relaxed text-[#102d1c]/48">
                              {product.description}
                            </p>
                          )}

                          <div className="mt-3">
                            <p className="text-lg font-black text-[#0f3d22]">
                              $
                              {Number(
                                product.price
                              ).toLocaleString("es-AR")}
                            </p>

                            <p className="text-xs font-semibold text-[#102d1c]/45">
                              por {getProductLabel(product)}
                            </p>
                          </div>

                          <div className="mt-auto flex items-center justify-between pt-4">
                            <button
                              type="button"
                              onClick={() => removeItem(product)}
                              disabled={quantity === 0}
                              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#0f3d22]/15 bg-[#f1eee8] text-lg font-black text-[#0f3d22] transition hover:bg-[#e4e8df] disabled:cursor-not-allowed disabled:opacity-30"
                              aria-label={`Quitar ${product.name}`}
                            >
                              −
                            </button>

                            <span
                              className={`flex min-w-10 items-center justify-center rounded-full px-3 py-1.5 text-sm font-black ${
                                isSelected
                                  ? "bg-[#0f3d22] text-white"
                                  : "text-[#102d1c]"
                              }`}
                            >
                              {quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() => addItem(product)}
                              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0f3d22] text-lg font-black text-white shadow-sm transition hover:bg-[#195331]"
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
              </div>
            </>
          )}
        </div>

        <aside className="hidden md:block">
          <div className="sticky top-6 overflow-hidden rounded-[30px] border border-[#0f3d22]/15 bg-[#0f3d22] text-white shadow-[0_20px_48px_rgba(15,61,34,0.2)]">
            <div className="p-6">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/50">
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
                <div className="mt-5 max-h-[46vh] space-y-3 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/10 p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">
                          {item.name}
                        </p>

                        <p className="mt-0.5 text-xs font-semibold text-white/50">
                          {item.quantity} × $
                          {Number(item.price).toLocaleString(
                            "es-AR"
                          )}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => removeItem(item)}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-black text-[#102d1c]"
                          aria-label={`Quitar ${item.name}`}
                        >
                          −
                        </button>

                        <button
                          type="button"
                          onClick={() => addItem(item)}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-sm font-black text-white"
                          aria-label={`Agregar ${item.name}`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-white/10 bg-[#0a321c] p-6">
              <p className="text-sm font-semibold text-white/55">
                {totalItems} producto
                {totalItems === 1 ? "" : "s"}
              </p>

              <p className="mt-1 text-3xl font-black">
                ${Math.round(total).toLocaleString("es-AR")}
              </p>

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

              <p className="mt-3 text-center text-xs font-semibold text-white/40">
                Pedido mínimo de $20.000
              </p>
            </div>
          </div>
        </aside>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#0f3d22]/30 bg-[#0f3d22] px-4 py-3 text-white shadow-[0_-8px_30px_rgba(0,0,0,0.2)] md:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-white/60">
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
