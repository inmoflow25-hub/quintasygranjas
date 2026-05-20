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

type CommercialLocation = {
  id: string
  slug: string
  name: string
  address: string | null
  city: string | null
  delivery_day: string | null
  next_delivery_date: string | null
}

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
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/apio.jpg",
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
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/peraok.jpg",
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
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/mandarina.jpg",
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
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/kiwi.jpg",
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
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/palta.jpg",
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

type VecinosCartProps = {
  location: CommercialLocation
  towers?: CommercialLocation[]
  communityProgress?: number
  confirmedOrders?: number
  confirmedRevenue?: number
}

function money(value: number) {
  return `$${Math.round(value || 0).toLocaleString("es-AR")}`
}

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

export default function VecinosCart({
  location,
  towers = [],
  communityProgress = 0,
  confirmedOrders = 0,
  confirmedRevenue = 0
}: VecinosCartProps) {
  const [cart, setCart] = useState<any[]>([])
  const [expandedBoxId, setExpandedBoxId] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<CommercialLocation | null>(
    towers.length > 0 ? null : location
  )
  const [repeatEmail, setRepeatEmail] = useState("")
  const [repeatLoading, setRepeatLoading] = useState(false)
  const [dbProducts, setDbProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(false)

  const needsLocationChoice = towers.length > 0

  const PRODUCTS =
    dbProducts && dbProducts.length > 0
      ? dbProducts.map(mergeProductWithFallback)
      : FALLBACK_PRODUCTS

  useEffect(() => {
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
  }, [])

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
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
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

  function getDisplayQuantity(item: any) {
    if (item.category === "cajas_armadas") {
      return `${item.quantity} caja${item.quantity > 1 ? "s" : ""}`
    }

    if (item.type === "weight_100g") {
      const totalGrams = item.quantity * 100
      return totalGrams >= 1000 ? `${totalGrams / 1000} kg` : `${totalGrams} g`
    }

    if (item.type === "weight_500g") {
      const totalGrams = item.quantity * 500
      return totalGrams >= 1000 ? `${totalGrams / 1000} kg` : `${totalGrams} g`
    }

    if (item.type === "weight_1kg") return `${item.quantity} kg`

    return `x${item.quantity}`
  }

  async function repeatLastOrder() {
    const email = repeatEmail.trim().toLowerCase()

    if (!email) {
      alert("Ingresá tu email")
      return
    }

    setRepeatLoading(true)

    try {
      const res = await fetch("/api/vecinos/orders/last", {
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

      const repeatedItems = (data.items || [])
        .map((item: any) => {
          const product = PRODUCTS.find(
            (p) =>
              p.name.toLowerCase() === String(item.product_name || "").toLowerCase()
          )

          if (!product) return null

          return {
            ...product,
            quantity: Number(item.quantity || 1)
          }
        })
        .filter(Boolean)

      if (!repeatedItems.length) {
        alert("Encontramos tu pedido, pero no pudimos reconstruir los productos")
        return
      }

      setCart(repeatedItems)
      alert("Listo, cargamos tu último pedido")
    } catch (error) {
      console.error(error)
      alert("Error buscando tu último pedido")
    } finally {
      setRepeatLoading(false)
    }
  }

  function handleCheckout() {
    if (needsLocationChoice && !selectedLocation) {
      alert("Elegí tu torre o edificio para continuar")
      return
    }

    if (cart.length === 0) {
      alert("El carrito está vacío")
      return
    }

    if (getTotal() < 20000) {
      alert("El pedido mínimo es de $20.000")
      return
    }

    const checkoutLocation = selectedLocation || location

    localStorage.setItem("qyg_vecinos_cart", JSON.stringify(cart))
    window.location.href = `/vecinos/${checkoutLocation.slug}/checkout`
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      <h2 className="mb-4 text-center text-3xl font-bold">
        Elegí una caja, armá la tuya o sumá productos
      </h2>

      <p className="mb-6 text-center text-lg font-medium">
        Pedido mínimo de $20.000 · Entrega comunitaria
        {selectedLocation ? ` en ${selectedLocation.name}` : ""}
      </p>

      {productsLoading && (
        <p className="mb-6 text-center text-sm text-gray-500">
          Actualizando productos...
        </p>
      )}

      <div className="mb-6 flex gap-2 overflow-x-auto">
        {Array.from(new Set(PRODUCTS.map((p) => p.category))).map((cat) => (
          <button
            key={cat}
            onClick={() =>
              document
                .getElementById(`cat-${cat}`)
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="whitespace-nowrap rounded-full bg-gray-200 px-4 py-1 text-sm transition hover:bg-green-600 hover:text-white"
          >
            {cat.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:items-start overflow-visible">
        <div className="md:col-span-2">
          {Array.from(new Set(PRODUCTS.map((p) => p.category))).map((category) => {
            const items = PRODUCTS.filter((p) => p.category === category)

            return (
              <div
                key={category}
                id={`cat-${category}`}
                className="mb-10 scroll-mt-32"
              >
                <h3 className="mb-3 text-xl font-bold capitalize">
                  {category.replace("_", " ")}
                </h3>

                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                  {items.map((p) => {
                    const quantity = getQuantity(p.id)
                    const isBox = p.category === "cajas_armadas"
                    const isExpanded = expandedBoxId === p.id

                    return (
                      <div
                        key={p.id}
                        className="rounded-xl bg-[#e2e2e2] p-2 transition hover:bg-[#d8d8d8]"
                      >
                        <div className="mb-2 h-30 w-full overflow-hidden rounded-lg">
                          <img
                            src={p.image}
                            className="h-full w-full object-cover"
                            alt={p.name}
                          />
                        </div>

                        <p className="mb-1 text-sm font-semibold text-black">
                          {p.name}
                        </p>

                        {p.description && (
                          <p className="mb-2 text-xs text-gray-600">
                            {p.description}
                          </p>
                        )}

                        {isBox && (
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedBoxId((prev) =>
                                prev === p.id ? null : p.id
                              )
                            }
                            className="mb-2 text-xs font-medium text-black underline"
                          >
                            {isExpanded ? "Ocultar qué trae" : "Qué trae"}
                          </button>
                        )}

                        {isBox && isExpanded && p.boxItems && (
                          <div className="mb-3 rounded-xl border border-gray-300 bg-white p-4 shadow-lg">
                            <p className="mb-3 text-sm font-bold">
                              Esta caja trae:
                            </p>

                            <ul className="space-y-2 text-sm leading-6 text-gray-700">
                              {p.boxItems.map((item, index) => (
                                <li key={`${p.id}-item-${index}`}>
                                  • {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <p className="text-md font-bold">
                          ${p.price.toLocaleString("es-AR")}
                        </p>

                        <p className="mb-2 text-xs text-gray-600">
                          por {getLabel(p)}
                        </p>

                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => removeItem(p)}
                            className="h-7 w-7 rounded-full bg-gray-400"
                          >
                            -
                          </button>

                          <span className="text-sm">{quantity}</span>

                          <button
                            type="button"
                            onClick={() => addItem(p)}
                            className="h-7 w-7 rounded-full bg-green-600 text-white"
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

 <div className="md:col-span-1 self-start overflow-visible">
  <div className="sticky top-24 rounded-3xl bg-green-600 p-4 text-white shadow-xl">
    <h3 className="mb-3 text-2xl font-bold leading-none">Mi pedido</h3>

    {needsLocationChoice && (
      <div className="mb-2 rounded-2xl bg-white/15 p-3">
        <p className="mb-2 text-xs font-bold uppercase text-green-100">
          Elegí tu domicilio
        </p>

        <select
          value={selectedLocation?.id || ""}
          onChange={(e) => {
            const tower = towers.find((t) => t.id === e.target.value) || null
            setSelectedLocation(tower)
          }}
          className="w-full rounded-xl bg-white px-3 py-2 text-sm text-black"
        >
          <option value="">Seleccionar ubicación</option>
          {towers.map((tower) => (
            <option key={tower.id} value={tower.id}>
              {tower.name}
            </option>
          ))}
        </select>

        {!selectedLocation && (
          <p className="mt-1 text-xs leading-tight text-green-100">
            Necesitamos saber dónde vivís para organizar la entrega.
          </p>
        )}
      </div>
    )}

    {selectedLocation && (
      <div className="mb-2 rounded-2xl bg-white/15 p-3">
        <p className="text-xs font-bold uppercase text-green-100">
          Entrega en
        </p>

        <p className="mt-1 text-base font-black leading-tight">
          {selectedLocation.name}
        </p>

        <p className="mt-1 text-xs leading-tight text-green-100">
          En checkout cargás piso, departamento y propina si querés.
        </p>
      </div>
    )}

    <div className="mb-2 rounded-2xl bg-white/15 p-3">
      <p className="text-xs font-bold uppercase text-green-100">
        Progreso comunitario
      </p>

      <p className="mt-1 text-2xl font-black leading-none">
        {communityProgress}%
      </p>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/20">
        <div
          className="h-full rounded-full bg-white"
          style={{ width: `${Math.max(0, Math.min(100, communityProgress))}%` }}
        />
      </div>

      <p className="mt-1 text-xs leading-tight text-green-100">
        Tu compra suma al beneficio de la comunidad.
      </p>
    </div>

    <div className="mb-2 rounded-2xl bg-white/15 p-3">
      <p className="mb-2 text-sm font-bold">¿Ya compraste antes?</p>

      <input
        value={repeatEmail}
        onChange={(e) => setRepeatEmail(e.target.value)}
        placeholder="Tu email"
        type="email"
        className="mb-2 w-full rounded-xl bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500"
      />

      <button
        type="button"
        onClick={repeatLastOrder}
        disabled={repeatLoading}
        className="w-full rounded-xl bg-black py-2 text-sm font-bold text-white"
      >
        {repeatLoading ? "Buscando..." : "Repetir último pedido"}
      </button>
    </div>

    {cart.length === 0 && (
      <p className="mb-2 text-sm text-green-100">
        Todavía no agregaste productos
      </p>
    )}

    {cart.map((item) => (
      <div
        key={item.id}
        className="mb-2 flex items-center justify-between text-sm"
      >
        <div>
          <p className="font-medium leading-tight">{item.name}</p>
          <p className="text-xs text-green-200">
            {getDisplayQuantity(item)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => removeItem(item)}
            className="h-6 w-6 rounded-full bg-white text-black"
          >
            -
          </button>

          <button
            type="button"
            onClick={() => addItem(item)}
            className="h-6 w-6 rounded-full bg-black text-white"
          >
            +
          </button>
        </div>
      </div>
    ))}

    <div className="mt-3 border-t border-green-400 pt-3">
      <div className="flex items-center justify-between text-sm text-green-100">
        <span>Subtotal</span>
        <span>{money(getTotal())}</span>
      </div>

      <div className="mt-1 flex items-center justify-between text-sm text-green-100">
        <span>Pedido mínimo</span>
        <span>$20.000</span>
      </div>

      <p className="mt-3 text-2xl font-bold leading-none">
        Total: {money(getTotal())}
      </p>
    </div>

    <button
      type="button"
      onClick={handleCheckout}
      className="mt-4 w-full rounded-xl bg-black py-3 text-lg font-bold text-white shadow-xl"
    >
      Finalizar compra
    </button>
  </div>
</div>
        
      </div>
    </div>
  )
}
