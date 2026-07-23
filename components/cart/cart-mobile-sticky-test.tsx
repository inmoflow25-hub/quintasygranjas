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
      "citricos (naranja + limon) 1 kg",
      "banana 1 kg",
      "mandarina 1/2 kg",
      "palta 2 unidades",
      "pera 1/2kg",
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
      "citricos (naranja + limon) 1 kg",
      "banana 1 kg",
      "mandarina 1/2 kg",
      "palta 2 unidades",
      "pera 1/2kg",
      "lechuga 1 planta",
      "espinaca 2 atados",
      "30 huevos de campo",
      "1 kg suprema de pollo congelado",
      "perfecta para dos personas",
      "ideal si queres cocinar y tener stock"
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
      "citricos (naranja + limon) 1 kg",
      "banana 1 kg",
      "mandarina 1/2 kg",
      "palta 2 unidades",
      "pera 1/2 kg",
      "lechuga 1 planta",
      "espinaca 2 atados",
      "30 huevos de campo",
      "1 kg suprema de pollo congelado",
      "1/2 kg de miel de abejas real pura",
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
    image:
      "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/WhatsApp%20Image%202026-04-12%20at%2014.21.43.jpeg",
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
    image:
      "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/papas%20negras.jpg",
    category: "verduras"
  },
  {
    id: "tomate-perita",
    slug: "tomate-perita",
    name: "Tomate perita",
    description: "Fresco, ideal para ensaladas o salsa.",
    price: 1200,
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
    image:
      "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/zanahorias.jpg",
    category: "verduras"
  },
  {
    id: "lechuga",
    slug: "lechuga",
    name: "Lechuga",
    description: "Fresca y crocante, ideal para ensaladas.",
    price: 1300,
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
    price: 1900,
    type: "unit",
    unit_label: "unidad",
    image:
      "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/espinacas.jpg",
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
    image:
      "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/morrones.jpg",
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
    image:
      "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/naranja%20jugo.jpg",
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
    image:
      "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/mandarina.jpg",
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
    image:
      "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/almendras.jpg",
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
    image:
      "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/castan%CC%83as%20de%20caju.jpg",
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
    image:
      "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/pan%20de%20campo.jpg",
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
    image:
      "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/pechugas%20.jpg",
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
    image:
      "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/cuarto%20trasero.jpg",
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
    image:
      "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/medallones%20de%20pollo%20sin%20espinaca.webp",
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
    image:
      "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/medallones%20de%20pollo.jpg",
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
  },
  {
    id: "milanesa-soja-rellena-cheddar",
    slug: "milanesa-soja-rellena-cheddar",
    name: "Milanesa de soja rellena cheddar",
    description: "Paquete de 2 unidades. Rellena con cheddar.",
    price: 7200,
    type: "unit",
    unit_label: "paquete x2",
    image:
      "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/mila%20entera%20cadrada.png",
    category: "comidas_listas_para_horno"
  },
  {
    id: "milanesa-soja-rellena-caprese",
    slug: "milanesa-soja-rellena-caprese",
    name: "Milanesa de soja rellena caprese",
    description: "Paquete de 2 unidades. Rellena con muzzarella, tomate y albahaca.",
    price: 7200,
    type: "unit",
    unit_label: "paquete x2",
    image:
      "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/mila%20plato%20azul%20cuadrada.png",
    category: "comidas_listas_para_horno"
  },
  {
    id: "milanesa-soja-rellena-roquefort",
    slug: "milanesa-soja-rellena-roquefort",
    name: "Milanesa de soja rellena roquefort",
    description: "Paquete de 2 unidades. Rellena con muzzarella, roquefort y nueces.",
    price: 7200,
    type: "unit",
    unit_label: "paquete x2",
    image:
      "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/mila%20varias%20cuadrada.png",
    category: "comidas_listas_para_horno"
  },
  {
    id: "milanesa-soja-rellena-verdura",
    slug: "milanesa-soja-rellena-verdura",
    name: "Milanesa de soja rellena verdura",
    description: "Paquete de 2 unidades. Rellena con muzzarella, acelga, choclo y verdeo.",
    price: 7200,
    type: "unit",
    unit_label: "paquete x2",
    image:
      "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/mila%20verdura%20cuadrada.png",
    category: "comidas_listas_para_horno"
  },
  {
    id: "milanesa-soja-rellena-queso",
    slug: "milanesa-soja-rellena-queso",
    name: "Milanesa de soja rellena queso",
    description: "Paquete de 2 unidades. Rellena con muzzarella y orégano.",
    price: 7200,
    type: "unit",
    unit_label: "paquete x2",
    image:
      "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/mila%20entera%20vertical.png",
    category: "comidas_listas_para_horno"
  },
  {
    id: "milanesa-soja-rellena-calabaza",
    slug: "milanesa-soja-rellena-calabaza",
    name: "Milanesa de soja rellena calabaza",
    description: "Paquete de 2 unidades. Rellena con muzzarella y calabaza asada.",
    price: 7200,
    type: "unit",
    unit_label: "paquete x2",
    image:
      "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/mila%20plato%20azul%20vertical.png",
    category: "comidas_listas_para_horno"
  },
  {
    id: "milanesa-soja-rellena-cebolla",
    slug: "milanesa-soja-rellena-cebolla",
    name: "Milanesa de soja rellena cebolla",
    description: "Paquete de 2 unidades. Rellena con muzzarella y cebolla caramelizada.",
    price: 7200,
    type: "unit",
    unit_label: "paquete x2",
    image:
      "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/mila%20%20cebolla%20cuadrado.png",
    category: "comidas_listas_para_horno"
  },
  {
    id: "milanesa-soja-rellena-aceituna",
    slug: "milanesa-soja-rellena-aceituna",
    name: "Milanesa de soja rellena aceituna",
    description: "Paquete de 2 unidades. Rellena con muzzarella y aceitunas verdes.",
    price: 7200,
    type: "unit",
    unit_label: "paquete x2",
    image:
      "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/mila%20varias%20vertical.png",
    category: "comidas_listas_para_horno"
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

    // IMPORTANTE:
    // El id real debe venir primero de DB.
    // No pisarlo con slug porque después se usa para carrito / checkout.
    id: product.id || fallback?.id || product.slug || product.name,

    // IMPORTANTE:
    // La imagen viene SOLO de Supabase/R2.
    // No usamos fallback para imagen.
    image: String(product.image || "").trim(),

    description: product.description || fallback?.description || "",
    category: product.category || fallback?.category || "otros",
    type: product.type || fallback?.type || "unit",
    unit_label: product.unit_label || fallback?.unit_label,
    boxItems: product.boxItems || fallback?.boxItems
  }
}

function normalizeProduct(product: any): Product {
  const normalizedProduct: Product = {
    // IMPORTANTE:
    // Primero id real de DB. Después slug solo como respaldo.
    id: String(product.id || product.slug || product.name),

    slug: product.slug,
    name: String(product.name || product.product_name || "Producto"),
    price: Number(product.price || 0),
    type: product.type || "unit",
    unit_label: product.unit_label,

    // IMPORTANTE:
    // Imagen directa de DB. Si está vacía, queda vacía.
    image: String(product.image || "").trim(),

    category: product.category || "otros",
    description: product.description || "",
    boxItems: product.boxItems || product.box_items || undefined
  }

  return mergeProductWithFallback(normalizedProduct)
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


 const PRODUCTS = useMemo(() => {
  return dbProducts.map(normalizeProduct)
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
     const isAppRoute = window.location.pathname.startsWith("/app")

localStorage.setItem(
  isAppRoute ? "qyg_app_cart" : "qyg_checkout_cart",
  JSON.stringify(cart)
)

window.location.assign(isAppRoute ? "/app/checkout" : "/checkout?source=cart")
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

      {/* CATEGORÍAS MOBILE + DESKTOP */}
      <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3 md:flex md:overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => scrollToCategory(cat)}
            className="rounded-full bg-gray-200 px-3 py-2 text-center text-sm font-medium leading-tight text-black transition hover:bg-green-600 hover:text-white md:whitespace-nowrap md:px-4 md:py-1"
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
                    const boxItems = p.boxItems || []

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

                        {isBox && isExpanded && (
                          <div className="mb-3 rounded-xl bg-white p-4 shadow-lg border border-gray-300">
                            <p className="text-sm font-bold mb-3">
                              Esta caja trae:
                            </p>

                            {boxItems.length > 0 ? (
                              <ul className="text-sm text-gray-700 space-y-2 leading-6">
                                {boxItems.map((item, index) => (
                                  <li key={`${p.id}-item-${index}`}>• {item}</li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-gray-600">
                                No hay detalle cargado para esta caja.
                              </p>
                            )}
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

