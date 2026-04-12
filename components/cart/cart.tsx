"use client"

import { useState } from "react"

type Product = {
  id: string
  name: string
  price: number
  type: "unit" | "weight_500g" | "weight_1kg"
  image: string
  category: string
}

// 🔥 PRODUCTOS
const PRODUCTS: Product[] = [

  // -------------------
  // VERDURAS
  // -------------------
  { id: "zapallo", name: "Zapallo Anco", price: 1500, type: "unit", image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/WhatsApp%20Image%202026-04-12%20at%2014.21.43.jpeg", category: "verduras" },
  { id: "cebolla", name: "Cebolla", price: 350, type: "weight_500g", image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/cebollas.jpg", category: "verduras" },
  { id: "papa", name: "Papa negra", price: 525, type: "weight_500g", image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/papas%20negras.jpg", category: "verduras" },
  { id: "tomate", name: "Tomate", price: 500, type: "weight_500g", image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/tomates.jpg", category: "verduras" },
  { id: "zanahoria", name: "Zanahoria", price: 400, type: "weight_500g", image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/zanahorias.jpg", category: "verduras" },
  { id: "lechuga", name: "Lechuga", price: 500, type: "unit", image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/lechugas.jpg", category: "verduras" },
  { id: "espinaca", name: "Espinaca", price: 500, type: "unit", image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/espinacas.jpg", category: "verduras" },
  { id: "morron", name: "Morrones", price: 1200, type: "weight_500g", image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/morrones.jpg", category: "verduras" },

  // -------------------
  // FRUTAS
  // -------------------
  { id: "manzana", name: "Manzana", price: 1600, type: "weight_500g", image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/manzanas.jpg", category: "frutas" },
  { id: "naranja", name: "Naranja jugo", price: 800, type: "weight_500g", image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/naranja%20jugo.jpg", category: "frutas" },
  { id: "limon", name: "Limón", price: 900, type: "weight_500g", image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/limones.jpg", category: "frutas" },
  { id: "banana", name: "Banana", price: 370, type: "weight_500g", image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/banana.jpg", category: "frutas" },

  // -------------------
  // PAN / OTROS
  // -------------------
  { id: "pan", name: "Pan", price: 1200, type: "unit", image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/pan%20de%20campo.jpg", category: "otros" },
  { id: "miel", name: "Miel", price: 4500, type: "weight_500g", image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/miel.jpg", category: "otros" },
  { id: "huevos", name: "Huevos (30 unidades)", price: 3000, type: "unit", image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/huevos.jpg", category: "otros" },

  // -------------------
  // POLLO
  // -------------------
  { id: "pollo_entero", name: "Pollo entero", price: 0, type: "weight_1kg", image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/pollo%20entero.jpg", category: "pollo" },
  { id: "suprema", name: "Suprema de pollo", price: 11300, type: "weight_1kg", image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/pechugas%20.jpg", category: "pollo" },
  { id: "muslos", name: "Muslos de pollo", price: 0, type: "weight_1kg", image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/muslo%20de%20pollo.jpg", category: "pollo" },

  // -------------------
  // CONGELADOS
  // -------------------
  { id: "medallones", name: "Medallones de pollo", price: 0, type: "unit", image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/medallones%20de%20pollo%20sin%20espinaca.webp", category: "congelados" },
  { id: "medallones_espinaca", name: "Medallones pollo con espinaca", price: 0, type: "unit", image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/medallones%20de%20pollo.jpg", category: "congelados" },
  { id: "nuggets", name: "Nuggets de pollo", price: 0, type: "unit", image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/nuggets.jpeg", category: "congelados" },

  // -------------------
  // FRUTOS SECOS
  // -------------------
  { id: "nueces", name: "Nueces", price: 0, type: "weight_500g", image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/nueces.jpg", category: "frutos_secos" },
  { id: "almendras", name: "Almendras", price: 0, type: "weight_500g", image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/almendras.jpg", category: "frutos_secos" },
  { id: "pasas", name: "Pasas de uva", price: 0, type: "weight_500g", image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/pasas%20de%20uva.jpg", category: "frutos_secos" },
  { id: "caju", name: "Castañas de cajú", price: 0, type: "weight_500g", image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/castan%CC%83as%20de%20caju.jpg", category: "frutos_secos" },
  { id: "mix", name: "Mix frutos secos", price: 0, type: "weight_500g", image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/mix%20frutos%20secos.jpg", category: "frutos_secos" },
  { id: "mani_tostado", name: "Maní tostado", price: 1800, type: "weight_500g", image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/mani%20tostado.jpg", category: "frutos_secos" },
  { id: "mani_salado", name: "Maní salado", price: 1800, type: "weight_500g", image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/mani%20salado.jpg", category: "frutos_secos" }

]

export default function Cart() {
  const [cart, setCart] = useState<any[]>([])
  const [paymentMethod, setPaymentMethod] = useState<"mp" | "cash">("mp")
  const [loading, setLoading] = useState(false)

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
    if (product.type === "unit") return "unidad"
    if (product.type === "weight_500g") return "500g"
    if (product.type === "weight_1kg") return "kg"
  }

  function getDisplayQuantity(item: any) {
  if (item.type === "weight_500g") {
    const totalGrams = item.quantity * 500

    if (totalGrams >= 1000) {
      return `${totalGrams / 1000} kg`
    }

    return `${totalGrams} g`
  }

  return `x${item.quantity}`
}

  async function handleCheckout() {
    if (cart.length === 0) {
      alert("El carrito está vacío")
      return
    }

    setLoading(true)

    try {
      if (paymentMethod === "mp") {
        const res = await fetch("/api/checkout", {
          method: "POST",
          body: JSON.stringify({
            custom: true,
            cart
          })
        })

        const data = await res.json()

        if (!data.init_point) {
          alert("Error con MercadoPago")
          return
        }

        window.location.href = data.init_point
        return
      }

      const encodedCart = encodeURIComponent(JSON.stringify(cart))
      window.location.href = `/success?cart=${encodedCart}`

    } catch (err) {
      alert("Error en checkout")
    }

    setLoading(false)
  }

  
return (
  <div className="max-w-7xl mx-auto p-6">

    <h2 className="text-3xl font-bold mb-6 text-center">
      Armar tu caja 🧺
    </h2>

    {/* 🟢 PILLS DE CATEGORÍAS */}
    <div className="flex gap-2 mb-6 overflow-x-auto">
      {Array.from(new Set(PRODUCTS.map(p => p.category))).map((cat) => (
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

        {Array.from(new Set(PRODUCTS.map(p => p.category))).map((category) => {

          const items = PRODUCTS.filter(p => p.category === category)

          return (
            <div
  key={category}
  id={`cat-${category}`}
  className="mb-10 scroll-mt-32"
>

              <h3 className="text-xl font-bold mb-3 capitalize">
                {category.replace("_", " ")}
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

                {items.map((p) => {
                  const quantity = getQuantity(p.id)

                  return (
                    <div
                      key={p.id}
                      className="rounded-xl p-3 bg-[#f1f1f1] hover:bg-[#e7e7e7] transition"
                    >

                      <div className="h-40 w-full mb-2 overflow-hidden rounded-lg">
  <img
    src={p.image}
    className="w-full h-full object-cover"
  />
</div>

                      <p className="text-sm font-semibold">{p.name}</p>

                      <p className="text-md font-bold">
                        ${p.price.toLocaleString()}
                      </p>

                      <p className="text-xs text-gray-500 mb-2">
                        por {getLabel(p)}
                      </p>

                      {/* CONTROLES */}
                      <div className="flex justify-center items-center gap-2">

                        <button
                          onClick={() => removeItem(p)}
                          className="w-7 h-7 rounded-full bg-gray-300"
                        >
                          -
                        </button>

                        <span className="text-sm">
                          {quantity}
                        </span>

                        <button
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

          <h3 className="text-xl font-bold mb-4">
            Mi pedido 🛒
          </h3>

          {cart.length === 0 && (
            <p className="text-sm text-green-100">
              Todavía no agregaste productos
            </p>
          )}

          {cart.map((item) => (
            <div key={item.id} className="flex justify-between items-center mb-3 text-sm">

              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-green-200">
                  {getDisplayQuantity(item)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => removeItem(item)}
                  className="w-6 h-6 rounded-full bg-white text-black"
                >
                  -
                </button>
                <button
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
              MercadoPago
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
