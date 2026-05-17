"use client"

import { useState } from "react"

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

type CommercialLocation = {
  id: string
  slug: string
  name: string
  address: string | null
  city: string | null
  delivery_day: string | null
  next_delivery_date: string | null
}

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
  },
  {
    id: "medallones",
    name: "Medallones de pollo",
    description: "prácticos, ideales para una comida rápida",
    price: 9380,
    type: "weight_1kg",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/medallones%20de%20pollo%20sin%20espinaca.webp",
    category: "congelados"
  },
  {
    id: "medallones_espinaca",
    name: "Medallones pollo con espinaca",
    description: "opción práctica con relleno de espinaca",
    price: 10250,
    type: "weight_1kg",
    image: "https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/medallones%20de%20pollo.jpg",
    category: "congelados"
  },
  {
    id: "nuggets",
    name: "Nuggets de pollo",
    description: "crocrantes y prácticos, ideales para chicos",
    price: 12300,
    type: "weight_1kg",
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

  const needsLocationChoice = towers.length > 0

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
    if (product.type === "unit") return "unidad"
    if (product.type === "weight_500g") return "500g"
    if (product.type === "weight_1kg") return "kg"
    return "unidad"
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

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
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
                          ${p.price.toLocaleString()}
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
         <div className="rounded-3xl bg-green-600 p-5 text-white shadow-xl">
            <h3 className="mb-4 text-2xl font-bold">Mi pedido</h3>

            {needsLocationChoice && (
              <div className="mb-3 rounded-2xl bg-white/15 p-3">
                <p className="mb-2 text-sm font-bold uppercase text-green-100">
                  Elegí tu torre
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
                  <p className="mt-2 text-xs text-green-100">
                    Necesitamos saber dónde vivís para organizar la entrega.
                  </p>
                )}
              </div>
            )}

            {selectedLocation && (
              <div className="mb-3 rounded-2xl bg-white/15 p-3">
                <p className="text-xs font-bold uppercase text-green-100">
                  Entrega en
                </p>
                <p className="mt-1 text-lg font-black">
                  {selectedLocation.name}
                </p>
                <p className="mt-1 text-xs text-green-100">
                  En checkout cargás piso, departamento y propina si querés.
                </p>
              </div>
            )}

            <div className="mb-3 rounded-2xl bg-white/15 p-3">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs font-bold uppercase text-green-100">
                    Progreso comunitario
                  </p>
                  <p className="mt-1 text-2xl font-black">
                    {communityProgress}%
                  </p>
                </div>

                <p className="text-right text-xs text-green-100">
                  {confirmedOrders} pedidos
                  <br />
                  {money(confirmedRevenue)}
                </p>
              </div>

              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white"
                  style={{ width: `${Math.max(0, Math.min(100, communityProgress))}%` }}
                />
              </div>

              <p className="mt-2 text-xs text-green-100">
                Tu compra suma al beneficio de la comunidad.
              </p>
            </div>

            <div className="mb-3 rounded-2xl bg-white/15 p-3">
              <p className="mb-2 font-bold">¿Ya compraste antes?</p>

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
              <p className="text-sm text-green-100">
                Todavía no agregaste productos
              </p>
            )}

            {cart.map((item) => (
              <div
                key={item.id}
                className="mb-3 flex items-center justify-between text-sm"
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

            <div className="mt-4 border-t border-green-400 pt-3">
              <div className="flex items-center justify-between text-sm text-green-100">
                <span>Subtotal</span>
                <span>{money(getTotal())}</span>
              </div>

              <div className="mt-2 flex items-center justify-between text-sm text-green-100">
                <span>Pedido mínimo</span>
                <span>$20.000</span>
              </div>

              <p className="mt-4 text-xl font-bold">
                Total: {money(getTotal())}
              </p>
            </div>

          <button
  type="button"
  onClick={handleCheckout}
  className="mt-5 w-full rounded-xl bg-black py-3 text-lg font-bold text-white shadow-xl"
>
  Finalizar compra
</button>
          </div>
        </div>
      </div>
    </div>
  )
}
