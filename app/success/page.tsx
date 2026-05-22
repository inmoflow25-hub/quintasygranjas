"use client"

import { useEffect, useMemo, useRef } from "react"
import Link from "next/link"

export default function SuccessPage() {
  const purchaseTrackedRef = useRef(false)

  const orderNumber = useMemo(() => {
    if (typeof window === "undefined") return null
    const params = new URLSearchParams(window.location.search)
    return params.get("order_number")
  }, [])

  const payment = useMemo(() => {
    if (typeof window === "undefined") return null
    const params = new URLSearchParams(window.location.search)
    return params.get("payment")
  }, [])

  const mpAlias = process.env.NEXT_PUBLIC_MP_ALIAS || ""

  useEffect(() => {
    localStorage.removeItem("qyg_checkout_cart")
    localStorage.removeItem("qyg_zona_norte_cart")
  }, [])

  useEffect(() => {
    if (purchaseTrackedRef.current) return
    if (payment === "failure" || payment === "pending") return
    if (typeof window === "undefined") return

    const firePurchase = () => {
      const fbq = (window as any).fbq

      if (!fbq) {
        setTimeout(firePurchase, 500)
        return
      }

      if (purchaseTrackedRef.current) return
      purchaseTrackedRef.current = true

      fbq("track", "Purchase", {
        value: 1,
        currency: "ARS",
        content_ids: orderNumber ? [orderNumber] : [],
        content_type: "order"
      }, {
        eventID: orderNumber || Date.now().toString()
      })

      console.log("Purchase disparado", orderNumber)
    }

    firePurchase()
  }, [orderNumber, payment])

  const title =
    payment === "failure"
      ? "No se pudo confirmar el pago"
      : payment === "pending"
        ? "Tu pago quedó pendiente"
        : payment === "mp_transfer"
          ? "¡Pedido recibido!"
          : "¡Gracias por tu pedido!"

  const message =
    payment === "failure"
      ? "Tu orden quedó registrada, pero el pago no fue aprobado."
      : payment === "pending"
        ? "Tu orden quedó registrada. Cuando Mercado Pago confirme, la actualizamos."
        : payment === "mp_transfer"
          ? "Transferí al alias de Mercado Pago y mandanos el comprobante por WhatsApp para confirmar tu pedido."
          : "Recibimos tu pedido. Por favor, mandanos un WhatsApp para confirmar."

  return (
    <main className="min-h-screen flex items-center justify-center bg-green-50 px-6">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-lg p-10 text-center">
        <div className="text-6xl mb-4">🎉</div>

        <h1 className="text-3xl font-bold text-green-700 mb-4">
          {title}
        </h1>

        <p className="text-gray-600 mb-4">{message}</p>

        {orderNumber && (
          <div className="mb-6 rounded-xl bg-green-50 px-4 py-3 text-green-800">
            <p className="text-sm text-green-700">Número de pedido</p>
            <p className="text-2xl font-bold">#{orderNumber}</p>
          </div>
        )}

        {payment === "mp_transfer" && (
          <div className="mb-6 rounded-xl bg-green-50 px-4 py-3 text-green-800">
            <p className="text-sm text-green-700">Alias Mercado Pago</p>
            <p className="text-2xl font-bold">
              {mpAlias || "Alias no configurado"}
            </p>
            <p className="mt-2 text-sm text-green-700">
              Después de transferir, mandanos el comprobante por WhatsApp.
            </p>
          </div>
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
