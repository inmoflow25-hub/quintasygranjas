"use client"

import { useEffect, useMemo } from "react"
import Link from "next/link"

export default function SuccessPage() {
  const orderId = useMemo(() => {
    if (typeof window === "undefined") return null
    const params = new URLSearchParams(window.location.search)
    return params.get("order_id")
  }, [])

  const payment = useMemo(() => {
    if (typeof window === "undefined") return null
    const params = new URLSearchParams(window.location.search)
    return params.get("payment")
  }, [])

  useEffect(() => {
    localStorage.removeItem("qyg_checkout_cart")
  }, [])

  const title =
    payment === "failure"
      ? "No se pudo confirmar el pago"
      : payment === "pending"
        ? "Tu pago quedó pendiente"
        : "¡Gracias por tu pedido!"

  const message =
    payment === "failure"
      ? "Tu orden quedó registrada, pero el pago no fue aprobado."
      : payment === "pending"
        ? "Tu orden quedó registrada. Cuando Mercado Pago confirme, la actualizamos."
        : "Recibimos tu pedido. En breve seguimos por WhatsApp."

  return (
    <main className="min-h-screen flex items-center justify-center bg-green-50 px-6">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-lg p-10 text-center">
        <div className="text-6xl mb-4">🎉</div>

        <h1 className="text-3xl font-bold text-green-700 mb-4">
          {title}
        </h1>

        <p className="text-gray-600 mb-4">{message}</p>

        {orderId && (
          <p className="text-sm text-gray-500 mb-8">
            Número de pedido: <span className="font-semibold">{orderId}</span>
          </p>
        )}

        <div className="flex flex-col gap-3">
          <a
            href="https://wa.me/5491168303596"
            target="_blank"
            rel="noreferrer"
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold"
          >
            Hablar por WhatsApp
          </a>

          <Link
            href="/"
            className="w-full border border-green-600 text-green-700 py-3 rounded-xl font-semibold"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  )
}
