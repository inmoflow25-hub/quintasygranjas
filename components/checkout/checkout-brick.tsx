"use client"

import { useEffect, useRef } from "react"

declare global {
  interface Window {
    MercadoPago: any
  }
}

export default function CheckoutBrick({ preferenceId }: { preferenceId: string }) {
  const brickRef = useRef<any>(null)

  useEffect(() => {
    if (!window.MercadoPago) {
      console.error("MP SDK no cargó")
      return
    }

    if (!preferenceId) {
      console.error("No preferenceId")
      return
    }

    const mp = new window.MercadoPago(
      process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!,
      {
        locale: "es-AR"
      }
    )

    const bricksBuilder = mp.bricks()

    // 🔥 IMPORTANTE: destruir brick anterior si existe
    if (brickRef.current) {
      brickRef.current.unmount()
    }

    bricksBuilder
      .create("wallet", "paymentBrick_container", {
        initialization: {
          preferenceId: preferenceId
        },
        customization: {
          texts: {
            valueProp: "smart_option"
          }
        }
      })
      .then((controller: any) => {
        brickRef.current = controller
      })
      .catch((error: any) => {
        console.error("BRICK ERROR", error)
      })
  }, [preferenceId])

  return <div id="paymentBrick_container"></div>
}
