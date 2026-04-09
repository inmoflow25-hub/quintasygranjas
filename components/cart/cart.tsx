"use client"

import { useState } from "react"

type Product = {
  id: string
  name: string
  price: number
  type: "unit" | "weight_500g" | "weight_1kg"
  image: string
}

const PRODUCTS: Product[] = [
  { id: "zapallo", name: "Zapallo Anco", price: 1500, type: "weight_500g", image: "/images/zapallo.jpg" },
  { id: "cebolla", name: "Cebolla", price: 350, type: "weight_500g", image: "/images/cebolla.jpg" },
  { id: "papa", name: "Papa negra", price: 525, type: "weight_500g", image: "/images/papa.jpg" },
  { id: "tomate", name: "Tomate", price: 500, type: "weight_500g", image: "/images/tomate.jpg" },
  { id: "zanahoria", name: "Zanahoria", price: 400, type: "weight_500g", image: "/images/zanahoria.jpg" },
  { id: "manzana", name: "Manzana", price: 1600, type: "weight_500g", image: "/images/manzana.jpg" },
  { id: "naranja", name: "Naranja jugo", price: 800, type: "weight_500g", image: "/images/naranja.jpg" },
  { id: "limon", name: "Limón", price: 900, type: "weight_500g", image: "/images/limon.jpg" },
  { id: "banana", name: "Banana", price: 370, type: "weight_500g", image: "/images/banana.jpg" },

  { id: "lechuga", name: "Lechuga", price: 500, type: "unit", image: "/images/lechuga.jpg" },
  { id: "espinaca", name: "Espinaca", price: 500, type: "unit", image: "/images/espinaca.jpg" },

  { id: "miel", name: "Miel", price: 4500, type: "unit", image: "/images/miel.jpg" },
  { id: "pan", name: "Pan", price: 1200, type: "unit", image: "/images/pan.jpg" },

  // 🔥 POLLO
  { id: "pollo", name: "Suprema de pollo", price: 11300, type: "weight_1kg", image: "/images/pollo.jpg" }
]

export default function Cart() {
  const [cart, setCart] = useState<any[]>([])

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
      let multiplier = 1

      if (item.type === "weight_500g") multiplier = 0.5
      if (item.type === "weight_1kg") multiplier = 1

      return acc + item.price * item.quantity * multiplier
    }, 0)
  }

  function getLabel(product: Product) {
    if (product.type === "unit") return "unidad"
    if (product.type === "weight_500g") return "500g"
    if (product.type === "weight_1kg") return "kg"
  }

  return (
    <div className="max-w-6xl mx-auto p-6">

      <h2 className="text-3xl font-bold mb-8 text-center">
        Armar tu caja 🧺
      </h2>

      {/* GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

        {PRODUCTS.map((p) => {
          const quantity = getQuantity(p.id)

          return (
            <div key={p.id} className="border rounded-xl p-4 bg-white hover:shadow-md">

              <div className="h-32 flex items-center justify-center mb-4">
                <img src={p.image} className="max-h-28 object-contain" />
              </div>

              <p className="font-semibold text-sm">{p.name}</p>

              <p className="text-lg font-bold">
                ${p.price.toLocaleString()}
              </p>

              <p className="text-xs text-gray-500 mb-3">
                por {getLabel(p)}
              </p>

              {quantity === 0 ? (
                <button
                  onClick={() => addItem(p)}
                  className="w-full bg-green-700 text-white py-2 rounded-lg text-sm"
                >
                  AGREGAR
                </button>
              ) : (
                <div className="flex justify-between items-center">
                  <button onClick={() => removeItem(p)} className="px-3 bg-gray-200">-</button>
                  <span>{quantity}</span>
                  <button onClick={() => addItem(p)} className="px-3 bg-green-700 text-white">+</button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* TOTAL */}
      <div className="mt-10 text-right">
        <p className="text-2xl font-bold">
          Total: ${Math.round(getTotal()).toLocaleString()}
        </p>
      </div>

    </div>
  )
}
