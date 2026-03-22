"use client"

import { useEffect } from "react"

declare global {
  interface Window {
    MercadoPago: any
  }
}

export default function CheckoutBrick({ preferenceId }: { preferenceId: string }) {
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.MercadoPago) {
        clearInterval(interval)

        const mp = new window.MercadoPago(
          process.env.NEXT_PUBLIC_MP_PUBLIC_KEY,
          { locale: "es-AR" }
        )

        mp.bricks().create("wallet", "paymentBrick_container", {
          initialization: {
            preferenceId
          }
        })
      }
    }, 300)

    return () => clearInterval(interval)
  }, [preferenceId])

  return <div id="paymentBrick_container"></div>
}
