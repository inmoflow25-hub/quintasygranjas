"use client"

import { useState } from "react"

type Product = {
  id: string
  name: string
  price: number
  image?: string
}

const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Tomate",
    price: 1200
  },
  {
    id: "2",
    name: "Papa",
    price: 800
  },
  {
    id: "3",
    name: "Huevos",
    price: 2500
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
    <div className="max-w-3xl mx-auto p-6">

      <h2 className="text-2xl font-bold mb-6">
        Armar tu caja 🧺
      </h2>

      {/* PRODUCTOS */}
      <div className="space-y-4">
        {PRODUCTS.map((p) => (
          <div
            key={p.id}
            className="flex justify-between items-center border p-4 rounded-xl"
          >
            <div>
              <p className="font-semibold">{p.name}</p>
              <p className="text-sm text-gray-500">
                ${p.price}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => removeItem(p)}
                className="px-3 py-1 bg-gray-200 rounded"
              >
                -
              </button>

              <span>
                {cart.find((i) => i.id === p.id)?.quantity || 0}
              </span>

              <button
                onClick={() => addItem(p)}
                className="px-3 py-1 bg-green-600 text-white rounded"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* TOTAL */}
      <div className="mt-6 border-t pt-4">
        <p className="text-lg font-bold">
          Total: ${getTotal()}
        </p>
      </div>

      {/* PAGO */}
      <div className="mt-6 space-y-2">
        <label className="flex gap-2">
          <input
            type="radio"
            value="mercadopago"
            checked={paymentMethod === "mercadopago"}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          Pagar ahora (MercadoPago)
        </label>

        <label className="flex gap-2">
          <input
            type="radio"
            value="cash"
            checked={paymentMethod === "cash"}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          Pagar al recibir
        </label>
      </div>

      {/* BOTÓN */}
      <button
        onClick={checkout}
        disabled={cart.length === 0}
        className="w-full mt-6 bg-green-700 text-white py-3 rounded-xl"
      >
        Finalizar compra
      </button>

    </div>
  )
}
