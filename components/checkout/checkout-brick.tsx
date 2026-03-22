"use client"

import { useEffect } from "react"

declare global {
  interface Window {
    MercadoPago: any
  }
}

export default function CheckoutBrick({ preferenceId }: { preferenceId: string }) {
  useEffect(() => {
    const initBrick = () => {
      if (!window.MercadoPago) {
        console.error("MP SDK NO CARGADO")
        return
      }

      if (!process.env.NEXT_PUBLIC_MP_PUBLIC_KEY) {
        console.error("FALTA PUBLIC KEY")
        return
      }

      const mp = new window.MercadoPago(
        process.env.NEXT_PUBLIC_MP_PUBLIC_KEY,
        { locale: "es-AR" }
      )

      const bricksBuilder = mp.bricks()

      bricksBuilder.create("payment", "paymentBrick_container", {
        initialization: {
          preferenceId: preferenceId
        },
        customization: {
          visual: {
            style: {
              theme: "default"
            }
          }
        }
      })
    }

    // 🔥 esperar a que cargue el script SI o SI
    if (window.MercadoPago) {
      initBrick()
    } else {
      const interval = setInterval(() => {
        if (window.MercadoPago) {
          clearInterval(interval)
          initBrick()
        }
      }, 300)
    }
  }, [preferenceId])

  return <div id="paymentBrick_container" />
}
