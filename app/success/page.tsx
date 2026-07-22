"use client"

import { useEffect, useMemo } from "react"
import Link from "next/link"

function getInstallTarget() {
  if (typeof window === "undefined") {
    return {
      label: "Instalar app gratis",
      href: "/app?source=success_web",
      device: "general"
    }
  }

  const ua = window.navigator.userAgent.toLowerCase()
  const isIOS = /iphone|ipad|ipod/.test(ua)
  const isAndroid = /android/.test(ua)

  if (isIOS) {
    return {
      label: "Instalar en iPhone",
      href: "/app?source=success_web_ios",
      device: "ios"
    }
  }

  if (isAndroid) {
    return {
      label: "Instalar app gratis",
      href: "/app?source=success_web_android",
      device: "android"
    }
  }

  return {
    label: "Abrir app",
    href: "/app?source=success_web_desktop",
    device: "desktop"
  }
}

export default function SuccessPage() {
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

  const context = useMemo(() => {
    if (typeof window === "undefined") return "web"
    const params = new URLSearchParams(window.location.search)
    return params.get("context") || "web"
  }, [])

  const isPwa = context === "pwa"
  const mpAlias = process.env.NEXT_PUBLIC_MP_ALIAS || ""
  const installTarget = useMemo(() => getInstallTarget(), [])

  useEffect(() => {
    localStorage.removeItem("qyg_checkout_cart")
    localStorage.removeItem("qyg_zona_norte_cart")
    localStorage.removeItem("qyg_app_cart")
  }, [])

  const title =
    payment === "failure"
      ? "No se pudo confirmar el pago"
      : payment === "pending"
        ? "Tu pago quedó pendiente"
        : "¡Pedido recibido!"

  const message =
    payment === "failure"
      ? "Tu pedido quedó registrado, pero el pago no fue aprobado."
      : payment === "pending"
        ? "Tu pedido quedó registrado. Cuando Mercado Pago confirme el pago, lo actualizamos."
        : isPwa
          ? "Tu pedido ya está confirmado. Sumaste puntos con esta compra para usar en próximos pedidos desde la app."
          : payment === "mp_transfer"
            ? "Transferí al alias de Mercado Pago y mandanos el comprobante por WhatsApp."
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

        {isPwa ? (
          <div className="flex flex-col gap-3">
            <Link
              href="/app/orders"
              className="w-full bg-green-700 text-white py-3 rounded-xl font-semibold"
            >
              Ver mis pedidos
            </Link>

            <Link
              href="/app/rewards"
              className="w-full border border-green-700 text-green-700 py-3 rounded-xl font-semibold"
            >
              Ver mis puntos
            </Link>

            <Link
              href="/app"
              className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold"
            >
              Volver a la app
            </Link>
          </div>
        ) : (
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
        )}
      </div>
    </main>
  )
}
