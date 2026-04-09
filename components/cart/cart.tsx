"use client"

import { useState } from "react"

type Product = {
  id: string
  name: string
  price: number
  image: string
}

const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Tomate fresco",
    price: 1200,
    image: "/images/tomate.jpg"
  },
  {
    id: "2",
    name: "Papa blanca",
    price: 800,
    image: "/images/papa.jpg"
  },
  {
    id: "3",
    name: "Huevos de campo",
    price: 2500,
    image: "/images/huevos.jpg"
  },
  {
    id: "4",
    name: "Zanahoria",
    price: 900,
    image: "/images/zanahoria.jpg"
  }
]

export default function Cart() {
  const [cart, setCart] = useState<any[]>([])
  const [paymentMethod, setPaymentMethod] = useState("mercadopago")

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
    return cart.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    )
  }

  async function checkout() {
    const res = await fetch("/api/orders/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        items: cart,
        payment_method: paymentMethod,
        customer: {
          email: "test@test.com"
        }
      })
    })

    const data = await res.json()

    if (paymentMethod === "mercadopago") {
      window.location.href = data.checkout_url
    } else {
      window.location.href = "/success"
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">

      <h2 className="text-3xl font-bold mb-8 text-center">
        Armar tu caja 🧺
      </h2>

      {/* GRID PRODUCTOS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

        {PRODUCTS.map((p) => {
          const quantity = getQuantity(p.id)

          return (
            <div
              key={p.id}
              className="border rounded-xl p-4 bg-white hover:shadow-md transition"
            >
              {/* IMAGEN */}
              <div className="w-full h-32 flex items-center justify-center mb-4">
                <img
                  src={p.image}
                  className="max-h-32 object-contain"
                />
              </div>

              {/* NOMBRE */}
              <p className="font-semibold text-sm mb-1">
                {p.name}
              </p>

              {/* PRECIO */}
              <p className="text-lg font-bold mb-3">
                ${p.price.toLocaleString()}
              </p>

              {/* BOTÓN / CONTROLES */}
              {quantity === 0 ? (
                <button
                  onClick={() => addItem(p)}
                  className="w-full bg-green-700 text-white py-2 rounded-lg text-sm"
                >
                  AGREGAR
                </button>
              ) : (
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => removeItem(p)}
                    className="px-3 py-1 bg-gray-200 rounded"
                  >
                    -
                  </button>

                  <span className="font-bold">
                    {quantity}
                  </span>

                  <button
                    onClick={() => addItem(p)}
                    className="px-3 py-1 bg-green-700 text-white rounded"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* TOTAL */}
      <div className="mt-10 text-right">
        <p className="text-2xl font-bold">
          Total: ${getTotal().toLocaleString()}
        </p>
      </div>

      {/* PAGO */}
      <div className="mt-6 space-y-2 text-right">
        <label className="block">
          <input
            type="radio"
            value="mercadopago"
            checked={paymentMethod === "mercadopago"}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          <span className="ml-2">Pagar ahora (MercadoPago)</span>
        </label>

        <label className="block">
          <input
            type="radio"
            value="cash"
            checked={paymentMethod === "cash"}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          <span className="ml-2">Pagar al recibir</span>
        </label>
      </div>

      {/* BOTÓN FINAL */}
      <button
        onClick={checkout}
        disabled={cart.length === 0}
        className="w-full mt-6 bg-green-800 text-white py-4 rounded-xl text-lg"
      >
        Finalizar compra
      </button>

    </div>
  )
}
