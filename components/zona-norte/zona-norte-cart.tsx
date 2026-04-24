"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Product = {
  id: string
  name: string
  price: number
  type: "unit" | "weight_500g" | "weight_1kg"
  image: string
  category: string
  description?: string
  boxItems?: string[]
}

const ZONA_NORTE_CART_KEY = "qyg_zona_norte_cart"

const PRODUCTS: Product[] = [
  {
    id: "caja_veggie",
    name: "Caja Veggie",
    description: "Rica en fibra, vitaminas y antioxidantes. Mejora la digestión y fortalece tus defensas.",
    price: 22820,
    type: "unit",
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
    name: "Caja Campo",
    description: "Equilibrio entre vegetales y proteínas. Más energía, saciedad y nutrición completa.",
    price: 45320,
    type: "unit",
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
      "1 pollo fresco entero organico"
    ]
  },
  {
    id: "caja_granja",
    name: "Caja Granja",
    description: "Nutrición completa para toda la familia. Proteínas, grasas saludables y alimentos reales.",
    price: 55520,
    type: "unit",
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
      "1 pan de campo grande"
    ]
  },
  {
    id: "zapallo",
    name: "Zapallo Anco",
    description: "ideal para horno, puré o sopa",
    price: 1700,
    type: "unit",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/WhatsApp%20Image%202026-04-12%20at%2014.21.43.jpeg",
    category: "verduras"
  },
  {
    id: "cebolla",
    name: "Cebolla",
    description: "base para guisos, salsas y salteados",
    price: 600,
    type: "weight_500g",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/cebollas.jpg",
    category: "verduras"
  },
  {
    id: "papa",
    name: "Papa negra",
    description: "ideal para horno, puré o fritas",
    price: 733,
    type: "weight_500g",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/papas%20negras.jpg",
    category: "verduras"
  },
  {
    id: "tomate",
    name: "Tomate",
    description: "fresco, ideal para ensaladas o salsa",
    price: 833,
    type: "weight_500g",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/tomates.jpg",
    category: "verduras"
  },
  {
    id: "zanahoria",
    name: "Zanahoria",
    description: "dulce y crocante, ideal cruda o cocida",
    price: 670,
    type: "weight_500g",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/zanahorias.jpg",
    category: "verduras"
  },
  {
    id: "lechuga",
    name: "Lechuga",
    description: "fresca y crocante, ideal para ensaladas",
    price: 390,
    type: "unit",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/lechugas.jpg",
    category: "verduras"
  },
  {
    id: "espinaca",
    name: "Espinaca",
    description: "hojas tiernas, ideal para tartas o salteados",
    price: 1750,
    type: "unit",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/espinacas.jpg",
    category: "verduras"
  },
  {
    id: "morron",
    name: "Morrones",
    description: "ideal para rellenos, salteados o ensaladas",
    price: 1800,
    type: "weight_500g",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/morrones.jpg",
    category: "verduras"
  },
  {
    id: "manzana",
    name: "Manzana RED DELICIOUS",
    description: "dulce y crocante, ideal para todo momento",
    price: 2600,
    type: "weight_500g",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/manzanas.jpg",
    category: "frutas"
  },
  {
    id: "naranja",
    name: "Naranja jugo",
    description: "jugosa, ideal para exprimir",
    price: 1400,
    type: "weight_500g",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/naranja%20jugo.jpg",
    category: "frutas"
  },
  {
    id: "limon",
    name: "Limón",
    description: "ácido y fresco, ideal para comidas o bebidas",
    price: 1300,
    type: "weight_500g",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/limones.jpg",
    category: "frutas"
  },
  {
    id: "banana",
    name: "Banana",
    description: "suave y energética, ideal para colaciones",
    price: 1250,
    type: "weight_500g",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/banana.jpg",
    category: "frutas"
  },
  {
    id: "pan",
    name: "Pan",
    description: "pan de campo, ideal para acompañar comidas",
    price: 1200,
    type: "unit",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/pan%20de%20campo.jpg",
    category: "otros"
  },
  {
    id: "miel",
    name: "Miel",
    description: "natural y dulce, ideal para infusiones o tostadas",
    price: 4500,
    type: "weight_500g",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/miel.jpg",
    category: "otros"
  },
  {
    id: "huevos",
    name: "Huevos (30 unidades)",
    description: "maple completo, ideal para consumo diario",
    price: 6000,
    type: "unit",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/huevos.jpg",
    category: "otros"
  },
  {
    id: "pollo_entero",
    name: "Pollo entero Orgánico",
    description: "ideal para horno, parrilla o cacerola",
    price: 18500,
    type: "unit",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/pollo%20entero.jpg",
    category: "pollo"
  },
  {
    id: "suprema",
    name: "Suprema deshuesada sin piel (Congelada)",
    description: "Descongelar y cocinar, ideal para milanesas o plancha",
    price: 11300,
    type: "weight_1kg",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/pechugas%20.jpg",
    category: "pollo"
  },
  {
    id: "cuartos",
    name: "Pata y muslo de pollo (Congelado)",
    description: "Desconglar y cocinar, ideal horno o parrilla",
    price: 4500,
    type: "weight_1kg",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/cuarto%20trasero.jpg",
    category: "pollo"
  }
]

export default function ZonaNorteCart() {
  const router = useRouter()
  const [cart, setCart] = useState<any[]>([])
  const [expandedBoxId, setExpandedBoxId] = useState<string | null>(null)

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

  function getLabel(product: Product) {
    if (product.category === "cajas_armadas") return "caja"
    if (product.type === "unit") return "unidad"
    if (product.type === "weight_500g") return "500g"
    if (product.type === "weight_1kg") return "kg"
    return ""
  }

  function getDisplayQuantity(item: any) {
    if (item.category === "cajas_armadas") {
      return `${item.quantity} caja${item.quantity > 1 ? "s" : ""}`
    }

    if (item.type === "weight_500g") {
      const totalGrams = item.quantity * 500
      return totalGrams >= 1000 ? `${totalGrams / 1000} kg` : `${totalGrams} g`
    }

    if (item.type === "weight_1kg") return `${item.quantity} kg`

    return `x${item.quantity}`
  }

  function toggleBoxDetails(productId: string) {
    setExpandedBoxId((prev) => (prev === productId ? null : productId))
  }

  function handleCheckout() {
    if (cart.length === 0) {
      alert("El carrito está vacío")
      return
    }

    if (getTotal() < 20000) {
      alert("El pedido mínimo es de $20.000")
      return
    }

    localStorage.setItem(ZONA_NORTE_CART_KEY, JSON.stringify(cart))
    router.push("/zona-norte/checkout")
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">
        Elegí una caja, armá la tuya o sumá productos
      </h2>

      <p className="text-lg font-medium mb-6 text-center">
        Pedido mínimo de $20.000 - Recibís en Zona Norte
      </p>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {Array.from(new Set(PRODUCTS.map((p) => p.category))).map((cat) => (
          <button
            key={cat}
            onClick={() => {
              const el = document.getElementById(`zn-cat-${cat}`)
              if (el) el.scrollIntoView({ behavior: "smooth" })
            }}
            className="px-4 py-1 rounded-full bg-gray-200 text-sm whitespace-nowrap hover:bg-green-600 hover:text-white transition"
          >
            {cat.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {Array.from(new Set(PRODUCTS.map((p) => p.category))).map((category) => {
            const items = PRODUCTS.filter((p) => p.category === category)

            return (
              <div key={category} id={`zn-cat-${category}`} className="mb-10 scroll-mt-32">
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
                          <img src={p.image} className="w-full h-full object-cover" alt={p.name} />
                        </div>

                        <p className="text-sm font-semibold text-black mb-1">{p.name}</p>

                        {p.description && (
                          <p className="text-xs text-gray-600 mb-2">{p.description}</p>
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
                            <p className="text-sm font-bold mb-3">Esta caja trae:</p>
                            <ul className="text-sm text-gray-700 space-y-2 leading-6">
                              {p.boxItems.map((item, index) => (
                                <li key={`${p.id}-item-${index}`}>• {item}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <p className="text-md font-bold">${p.price.toLocaleString("es-AR")}</p>

                        <p className="text-xs text-gray-600 mb-2">por {getLabel(p)}</p>

                        <div className="flex justify-center items-center gap-2">
                          <button onClick={() => removeItem(p)} className="w-7 h-7 rounded-full bg-gray-400">
                            -
                          </button>

                          <span className="text-sm">{quantity}</span>

                          <button onClick={() => addItem(p)} className="w-7 h-7 rounded-full bg-green-600 text-white">
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

        <div className="md:col-span-1">
          <div className="sticky top-24 rounded-xl p-5 bg-green-600 text-white shadow-lg">
            <h3 className="text-xl font-bold mb-4">Mi pedido</h3>

            {cart.length === 0 && (
              <p className="text-sm text-green-100">Todavía no agregaste productos</p>
            )}

            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center mb-3 text-sm">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-green-200">{getDisplayQuantity(item)}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => removeItem(item)} className="w-6 h-6 rounded-full bg-white text-black">
                    -
                  </button>
                  <button onClick={() => addItem(item)} className="w-6 h-6 rounded-full bg-black text-white">
                    +
                  </button>
                </div>
              </div>
            ))}

            <div className="mt-4 border-t border-green-400 pt-3">
              <p className="text-lg font-bold">
                Total: ${Math.round(getTotal()).toLocaleString("es-AR")}
              </p>
            </div>

            <button
              onClick={handleCheckout}
              className="mt-5 w-full bg-black text-white py-3 rounded-xl text-lg"
            >
              Finalizar compra
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
