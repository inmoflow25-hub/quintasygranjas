"use client"

import { useEffect } from "react"

declare global {
  interface Window {
    MercadoPago: any
  }
}

export default function CheckoutBrick({ preferenceId }: { preferenceId: string }) {
  useEffect(() => {
    let interval: NodeJS.Timeout

    const initBrick = () => {
      if (!window.MercadoPago || !preferenceId) return

      clearInterval(interval)

      const mp = new window.MercadoPago(
        process.env.NEXT_PUBLIC_MP_PUBLIC_KEY,
        { locale: "es-AR" }
      )

      const container = document.getElementById("paymentBrick_container")

      // 🔥 limpiar container (evita duplicados)
      if (container) {
        container.innerHTML = ""
      }

      // ✅ WALLET (Checkout Pro)
      mp.bricks().create("wallet", "paymentBrick_container", {
        initialization: {
          preferenceId
        }
      })
    }

    interval = setInterval(initBrick, 300)

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [preferenceId])

  return <div id="paymentBrick_container"></div>
}
