"use client"

import { useEffect, useState } from "react"

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

// 🔥 PRODUCTOS
const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "caja_veggie",
    slug: "caja-veggie",
    name: "Caja Veggie",
    description: "Rica en fibra, vitaminas y antioxidantes. Mejora la digestión y fortalece tus defensas.",
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
      "citricos (naranja + limon) 1 kg",
      "banana 1 kg",
      "lechuga 1 planta",
      "espinaca 2 atados"
    ]
  },
  {
    id: "caja_campo",
    slug: "caja-campo",
    name: "Caja Campo",
    description: "Equilibrio entre vegetales y proteínas. Más energía, saciedad y nutrición completa.",
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
      "citricos (naranja + limon) 1 kg",
      "banana 1 kg",
      "lechuga 1 planta",
      "espinaca 2 atados",
      "30 huevos de campo",
      "1 pollo fresco entero organico",
      "perfecta para dos personas",
      "ideal si queres cocinar y tener stock"
    ]
  },
  {
    id: "caja_granja",
    slug: "caja-granja",
    name: "Caja Granja",
    description: "Nutrición completa para toda la familia. Proteínas, grasas saludables y alimentos reales.",
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
      "citricos (naranja + limon) 1 kg",
      "banana 1 kg",
      "lechuga 1 planta",
      "espinaca 2 atados",
      "30 huevos de campo",
      "1 pollo fresco entero organico",
      "1 kg de miel de abejas real pura",
      "1 pan de campo grande",
      "le agrega nutrientes a tus desayunos",
      "pensada para toda la familia"
    ]
  },
  {
    id: "zapallo-anco",
    slug: "zapallo-anco",
    name: "Zapallo Anco",
    description: "Ideal para horno, puré o sopa.",
    price: 1800,
    type: "unit",
    unit_label: "unidad",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/WhatsApp%20Image%202026-04-12%20at%2014.21.43.jpeg",
    category: "verduras"
  },
  {
    id: "cebolla",
    slug: "cebolla",
    name: "Cebolla",
    description: "Base para guisos, salsas y salteados.",
    price: 700,
    type: "weight_500g",
    unit_label: "500g",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/cebollas.jpg",
    category: "verduras"
  },
  {
    id: "papa-negra-cepillada",
    slug: "papa-negra-cepillada",
    name: "Papa negra cepillada",
    description: "Ideal para horno, puré o fritas.",
    price: 800,
    type: "weight_500g",
    unit_label: "500g",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/papas%20negras.jpg",
    category: "verduras"
  },
  {
    id: "tomate-perita",
    slug: "tomate-perita",
    name: "Tomate perita",
    description: "Fresco, ideal para ensaladas o salsa.",
    price: 1000,
    type: "weight_500g",
    unit_label: "500g",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/tomates.jpg",
    category: "verduras"
  },
  {
    id: "zanahoria",
    slug: "zanahoria",
    name: "Zanahoria",
    description: "Dulce y crocante, ideal cruda o cocida.",
    price: 800,
    type: "weight_500g",
    unit_label: "500g",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/zanahorias.jpg",
    category: "verduras"
  },
  {
    id: "lechuga",
    slug: "lechuga",
    name: "Lechuga",
    description: "Fresca y crocante, ideal para ensaladas.",
    price: 800,
    type: "unit",
    unit_label: "unidad",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/lechugas.jpg",
    category: "verduras"
  },
  {
    id: "espinaca",
    slug: "espinaca",
    name: "Espinaca",
    description: "Hojas tiernas, ideal para tartas o salteados.",
    price: 1750,
    type: "unit",
    unit_label: "unidad",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/espinacas.jpg",
    category: "verduras"
  },
  {
    id: "apio",
    slug: "apio",
    name: "Apio",
    description: "Fresco, ideal para ensaladas, caldos o jugos.",
    price: 1800,
    type: "unit",
    unit_label: "unidad",
    image: "",
    category: "verduras"
  },
  {
    id: "morrones",
    slug: "morrones",
    name: "Morrones",
    description: "Ideal para rellenos, salteados o ensaladas.",
    price: 1800,
    type: "weight_500g",
    unit_label: "500g",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/morrones.jpg",
    category: "verduras"
  },
  {
    id: "manzana-red-delicious",
    slug: "manzana-red-delicious",
    name: "Manzana red delicious",
    description: "Dulce y crocante, ideal para todo momento.",
    price: 2900,
    type: "weight_500g",
    unit_label: "500g",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/manzanas.jpg",
    category: "frutas"
  },
  {
    id: "naranja-jugo",
    slug: "naranja-jugo",
    name: "Naranja jugo",
    description: "Jugosa, ideal para exprimir.",
    price: 1500,
    type: "weight_500g",
    unit_label: "500g",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/naranja%20jugo.jpg",
    category: "frutas"
  },
  {
    id: "limon",
    slug: "limon",
    name: "Limón",
    description: "Ácido y fresco, ideal para comidas o bebidas.",
    price: 1100,
    type: "weight_500g",
    unit_label: "500g",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/limones.jpg",
    category: "frutas"
  },
  {
    id: "banana",
    slug: "banana",
    name: "Banana",
    description: "Suave y energética, ideal para colaciones.",
    price: 1350,
    type: "weight_500g",
    unit_label: "500g",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/banana.jpg",
    category: "frutas"
  },
  {
    id: "pera",
    slug: "pera",
    name: "Pera",
    description: "Dulce y fresca, ideal para todos los días.",
    price: 1900,
    type: "weight_500g",
    unit_label: "500g",
    image: "",
    category: "frutas"
  },
  {
    id: "mandarina",
    slug: "mandarina",
    name: "Mandarina",
    description: "Fresca, dulce y fácil de pelar.",
    price: 1000,
    type: "weight_500g",
    unit_label: "500g",
    image: "",
    category: "frutas"
  },
  {
    id: "kiwi",
    slug: "kiwi",
    name: "Kiwi",
    description: "Fresco, ácido y nutritivo.",
    price: 1800,
    type: "weight_500g",
    unit_label: "500g",
    image: "",
    category: "frutas"
  },
  {
    id: "palta",
    slug: "palta",
    name: "Palta",
    description: "Cremosa, ideal para ensaladas, tostadas o comidas frescas.",
    price: 1800,
    type: "unit",
    unit_label: "unidad",
    image: "",
    category: "frutas"
  },
  {
    id: "nueces",
    slug: "nueces",
    name: "Nueces",
    description: "Nueces listas para consumir.",
    price: 1600,
    type: "weight_100g",
    unit_label: "100g",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/nueces.jpg",
    category: "frutos_secos"
  },
  {
    id: "almendras",
    slug: "almendras",
    name: "Almendras",
    description: "Almendras naturales.",
    price: 3200,
    type: "weight_100g",
    unit_label: "100g",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/almendras.jpg",
    category: "frutos_secos"
  },
  {
    id: "castanas",
    slug: "castanas",
    name: "Castañas",
    description: "Castañas listas para consumir.",
    price: 2400,
    type: "weight_100g",
    unit_label: "100g",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/castan%CC%83as%20de%20caju.jpg",
    category: "frutos_secos"
  },
  {
    id: "pan",
    slug: "pan",
    name: "Pan",
    description: "Pan de campo, ideal para acompañar comidas.",
    price: 1300,
    type: "unit",
    unit_label: "unidad",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/pan%20de%20campo.jpg",
    category: "otros"
  },
  {
    id: "miel",
    slug: "miel",
    name: "Miel",
    description: "Natural y dulce, ideal para infusiones o tostadas.",
    price: 6500,
    type: "unit",
    unit_label: "unidad",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/miel.jpg",
    category: "otros"
  },
  {
    id: "huevos",
    slug: "huevos",
    name: "Huevos",
    description: "Maple completo, ideal para consumo diario.",
    price: 6000,
    type: "unit",
    unit_label: "maple",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/huevos.jpg",
    category: "otros"
  },
  {
    id: "suprema",
    slug: "suprema",
    name: "Suprema",
    description: "Descongelar y cocinar, ideal para milanesas o plancha.",
    price: 11300,
    type: "weight_1kg",
    unit_label: "kg",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/pechugas%20.jpg",
    category: "pollo"
  },
  {
    id: "pata-y-muslo",
    slug: "pata-y-muslo",
    name: "Pata y muslo",
    description: "Descongelar y cocinar, ideal horno o parrilla.",
    price: 4500,
    type: "weight_1kg",
    unit_label: "kg",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/cuarto%20trasero.jpg",
    category: "pollo"
  },
  {
    id: "medallones-pollo",
    slug: "medallones-pollo",
    name: "Medallones pollo",
    description: "Prácticos, ideales para una comida rápida.",
    price: 9380,
    type: "weight_1kg",
    unit_label: "kg",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/medallones%20de%20pollo%20sin%20espinaca.webp",
    category: "congelados"
  },
  {
    id: "medallones-pollo-con-espinaca",
    slug: "medallones-pollo-con-espinaca",
    name: "Medallones pollo con espinaca",
    description: "Opción práctica con relleno de espinaca.",
    price: 10250,
    type: "weight_1kg",
    unit_label: "kg",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/medallones%20de%20pollo.jpg",
    category: "congelados"
  },
  {
    id: "nuggets-pollo",
    slug: "nuggets-pollo",
    name: "Nuggets pollo",
    description: "Crocantes y prácticos, ideales para chicos.",
    price: 12300,
    type: "weight_1kg",
    unit_label: "kg",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/nuggets.jpeg",
    category: "congelados"
  }
]
function mergeProductWithFallback(product: Product): Product {
  const fallback = FALLBACK_PRODUCTS.find((item) => {
    return (
      item.id === product.id ||
      item.slug === product.slug ||
      item.name.toLowerCase() === product.name.toLowerCase()
    )
  })

  return {
    ...fallback,
    ...product,
    id: product.slug || product.id || fallback?.id || product.name,
    image: product.image || fallback?.image || "",
    description: product.description || fallback?.description || "",
    category: product.category || fallback?.category || "otros",
    type: product.type || fallback?.type || "unit",
    unit_label: product.unit_label || fallback?.unit_label,
    boxItems: product.boxItems || fallback?.boxItems
  }
}

export default function Cart({ products }: { products?: Product[] }) {
  const [dbProducts, setDbProducts] = useState<Product[]>(products || [])
  const [productsLoading, setProductsLoading] = useState(false)

  const PRODUCTS =
    dbProducts && dbProducts.length > 0
      ? dbProducts.map(mergeProductWithFallback)
      : FALLBACK_PRODUCTS

  const [cart, setCart] = useState<any[]>([])
  const [paymentMethod, setPaymentMethod] = useState<"mp" | "cash">("mp")
  const [loading, setLoading] = useState(false)
  const [expandedBoxId, setExpandedBoxId] = useState<string | null>(null)
  const [repeatEmail, setRepeatEmail] = useState("")
  const [repeatLoading, setRepeatLoading] = useState(false)

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
          setDbProducts(data.products)
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
          p.id === product.id
            ? { ...p, quantity: p.quantity + 1 }
            : p
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
        p.id === product.id
          ? { ...p, quantity: p.quantity - 1 }
          : p
      )
    })
  }

  function getQuantity(id: string) {
    return cart.find((i) => i.id === id)?.quantity || 0
  }

  function getTotal() {
    return cart.reduce((acc, item) => {
      return acc + item.price * item.quantity
    }, 0)
  }

  function getLabel(product: Product) {
    if (product.category === "cajas_armadas") return "caja"
    if (product.unit_label) return product.unit_label
    if (product.type === "unit") return "unidad"
    if (product.type === "weight_500g") return "500g"
    if (product.type === "weight_1kg") return "kg"
    return "unidad"
  }

  function getDisplayQuantity(item: any) {
    if (item.category === "cajas_armadas") {
      return `${item.quantity} caja${item.quantity > 1 ? "s" : ""}`
    }

    if (item.type === "weight_100g") {
  const totalGrams = item.quantity * 100

  if (totalGrams >= 1000) {
    return `${totalGrams / 1000} kg`
  }

  return `${totalGrams} g`
}

    if (item.type === "weight_500g") {
      const totalGrams = item.quantity * 500

      if (totalGrams >= 1000) {
        return `${totalGrams / 1000} kg`
      }

      return `${totalGrams} g`
    }

    if (item.type === "weight_1kg") {
      return `${item.quantity} kg`
    }

    return `x${item.quantity}`
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
        setRepeatLoading(false)
        return
      }

      const repeatedItems = data.items.map((item: any) => ({
        id: item.product_name,
        name: item.product_name,
        product_name: item.product_name,
        quantity: Number(item.quantity || 1),
        price: Number(item.price || 0),
        type: "unit",
        category: "repetido",
        image: ""
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

    setLoading(true)

    try {
      localStorage.setItem("qyg_checkout_cart", JSON.stringify(cart))
      window.location.href = "/checkout?source=cart"
    } catch (err) {
      console.error(err)
      alert("No pudimos iniciar el checkout")
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
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

      {/* 🟢 PILLS DE CATEGORÍAS */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {Array.from(new Set(PRODUCTS.map((p) => p.category))).map((cat) => (
          <button
            key={cat}
            onClick={() => {
              const el = document.getElementById(`cat-${cat}`)
              if (el) {
                el.scrollIntoView({ behavior: "smooth" })
              }
            }}
            className="px-4 py-1 rounded-full bg-gray-200 text-sm whitespace-nowrap hover:bg-green-600 hover:text-white transition"
          >
            {cat.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* 🔥 LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* IZQUIERDA */}
        <div className="md:col-span-2">
          {Array.from(new Set(PRODUCTS.map((p) => p.category))).map((category) => {
            const items = PRODUCTS.filter((p) => p.category === category)

            return (
              <div
                key={category}
                id={`cat-${category}`}
                className="mb-10 scroll-mt-32"
              >
                <h3 className="text-xl font-bold mb-3 capitalize">
                  {category.replace("_", " ")}
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
                        <div className="h-30 w-full mb-2 overflow-hidden rounded-lg">
                          <img
                            src={p.image}
                            className="w-full h-full object-cover"
                            alt={p.name}
                          />
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
                            {isExpanded ? "🔍 Ocultar qué trae" : "🔍 Qué trae"}
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

                        {/* CONTROLES */}
                        <div className="flex justify-center items-center gap-2">
                          <button
                            type="button"
                            onClick={() => removeItem(p)}
                            className="w-7 h-7 rounded-full bg-gray-400"
                          >
                            -
                          </button>

                          <span className="text-sm">
                            {quantity}
                          </span>

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

        {/* 🔥 CARRITO VERDE */}
        <div className="md:col-span-1">
          <div className="sticky top-24 rounded-xl p-5 bg-green-600 text-white shadow-lg">
            <div className="mb-4 rounded-xl bg-white/15 p-3">
              <p className="mb-2 text-sm font-semibold">
                ¿Ya compraste antes?
              </p>

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

            <h3 className="text-xl font-bold mb-4">
              Mi pedido
            </h3>

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

            {/* TOTAL */}
            <div className="mt-4 border-t border-green-400 pt-3">
              <p className="text-lg font-bold">
                Total: ${Math.round(getTotal()).toLocaleString()}
              </p>
            </div>

            {/* PAGOS */}
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

            {/* CTA */}
            <button
              type="button"
              onClick={handleCheckout}
              disabled={loading}
              className="mt-5 w-full bg-black text-white py-3 rounded-xl text-lg"
            >
              {loading ? "Procesando..." : "Finalizar compra"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
