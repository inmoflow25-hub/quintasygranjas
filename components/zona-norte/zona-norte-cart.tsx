"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const ZONA_NORTE_CART_KEY = "qyg_zona_norte_cart"

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

const PRODUCTS: Product[] = [
  {
    id: "caja_veggie",
    name: "Caja Veggie",
    description: "Rica en fibra, vitaminas y antioxidantes.",
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
      "citricos 1 kg",
      "banana 1 kg",
      "lechuga 1 planta",
      "espinaca 2 atados"
    ]
  },
  {
    id: "caja_campo",
    name: "Caja Campo",
    description: "Vegetales, huevos y pollo.",
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
      "citricos 1 kg",
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
    description: "Caja familiar completa.",
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
      "citricos 1 kg",
      "banana 1 kg",
      "lechuga 1 planta",
      "espinaca 2 atados",
      "30 huevos de campo",
      "1 pollo fresco entero organico",
      "1 kg de miel",
      "1 pan de campo"
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
    description: "dulce y crocante",
    price: 670,
    type: "weight_500g",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/zanahorias.jpg",
    category: "verduras"
  },
  {
    id: "lechuga",
    name: "Lechuga",
    description: "fresca y crocante",
    price: 390,
    type: "unit",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/lechugas.jpg",
    category: "verduras"
  },
  {
    id: "espinaca",
    name: "Espinaca",
    description: "ideal para tartas o salteados",
    price: 1750,
    type: "unit",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/espinacas.jpg",
    category: "verduras"
  },
  {
    id: "manzana",
    name: "Manzana RED DELICIOUS",
    description: "dulce y crocante",
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
    description: "ideal para comidas o bebidas",
    price: 1300,
    type: "weight_500g",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/limones.jpg",
    category: "frutas"
  },
  {
    id: "banana",
    name: "Banana",
    description: "suave y energética",
    price: 1250,
    type: "weight_500g",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/banana.jpg",
    category: "frutas"
  },
  {
    id: "pan",
    name: "Pan",
    description: "pan de campo",
    price: 1200,
    type: "unit",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/pan%20de%20campo.jpg",
    category: "otros"
  },
  {
    id: "miel",
    name: "Miel",
    description: "natural y dulce",
    price: 4500,
    type: "weight_500g",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/miel.jpg",
    category: "otros"
  },
  {
    id: "huevos",
    name: "Huevos (30 unidades)",
    description: "maple completo",
    price: 6000,
    type: "unit",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/huevos.jpg",
    category: "otros"
  },
  {
    id: "pollo_entero",
    name: "Pollo entero Orgánico",
    description: "ideal para horno",
    price: 18500,
    type: "unit",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/pollo%20entero.jpg",
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

    if (item.type === "weight_1kg") {
      return `${item.quantity} kg`
    }

    return `x${item.quantity}`
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
    <div className="mt-8 rounded-2xl bg-white p-6 shadow">
      <h2 className="mb-2 text-3xl font-bold text-center">
        Armá tu pedido
      </h2>

      <p className="mb-6 text-center text-gray-600">
        Pedido mínimo de $20.000
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

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          {Array.from(new Set(PRODUCTS.map((p) => p.category))).map((category) => {
            const items = PRODUCTS.filter((p) => p.category === category)

            return (
              <div
                key={category}
                id={`zn-cat-${category}`}
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
                              setExpandedBoxId(isExpanded ? null : p.id)
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
                                <li key={`${p.id}-item-${index}`}>• {item}</li>
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
                            onClick={() => removeItem(p)}
                            className="h-7 w-7 rounded-full bg-gray-400"
                          >
                            -
                          </button>

                          <span className="text-sm">{quantity}</span>

                          <button
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

        <div className="md:col-span-1">
          <div className="sticky top-24 rounded-xl bg-green-600 p-5 text-white shadow-lg">
            <h3 className="mb-4 text-xl font-bold">
              Mi pedido
            </h3>

            {cart.length === 0 && (
              <p className="text-sm text-green-100">
                Todavía no agregaste productos
              </p>
            )}

            {cart.map((item) => (
              <div key={item.id} className="mb-3 flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-green-200">
                    {getDisplayQuantity(item)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => removeItem(item)}
                    className="h-6 w-6 rounded-full bg-white text-black"
                  >
                    -
                  </button>
                  <button
                    onClick={() => addItem(item)}
                    className="h-6 w-6 rounded-full bg-black text-white"
                  >
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
              className="mt-5 w-full rounded-xl bg-black py-3 text-lg text-white"
            >
              Finalizar compra
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
