"use client"

import { useEffect, useState } from "react"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

type DeviceType = "ios" | "android" | "desktop" | "unknown"

function getDeviceType(): DeviceType {
  if (typeof window === "undefined") return "unknown"

  const ua = window.navigator.userAgent.toLowerCase()
  const isIOS = /iphone|ipad|ipod/.test(ua)
  const isAndroid = /android/.test(ua)

  if (isIOS) return "ios"
  if (isAndroid) return "android"
  return "desktop"
}

function isStandaloneApp() {
  if (typeof window === "undefined") return false

  const isStandaloneDisplay = window.matchMedia("(display-mode: standalone)").matches
  const isIOSStandalone = (window.navigator as any).standalone === true

  return isStandaloneDisplay || isIOSStandalone
}

export default function InstallAppCard() {
  const [device, setDevice] = useState<DeviceType>("unknown")
  const [isInstalled, setIsInstalled] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [message, setMessage] = useState("")
  const helpWhatsappUrl =
  "https://wa.me/5491168303596?text=Hola%2C%20quiero%20instalar%20la%20app%20de%20Quintas%20y%20Granjas%20pero%20no%20pude%20hacerlo.%20%C2%BFMe%20ayudan%3F"

  
  useEffect(() => {
    setDevice(getDeviceType())
    setIsInstalled(isStandaloneApp())

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
    }

    function handleAppInstalled() {
      setIsInstalled(true)
      setInstallPrompt(null)
      setMessage("Listo. La app quedó instalada.")
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  async function installApp() {
    if (!installPrompt) {
      setMessage("Si no aparece el botón de instalación, usá el menú del navegador y tocá “Agregar a pantalla de inicio”.")
      return
    }

    await installPrompt.prompt()
    const choice = await installPrompt.userChoice

    if (choice.outcome === "accepted") {
      setMessage("Perfecto. La app se está instalando.")
      setInstallPrompt(null)
    } else {
      setMessage("No se instaló. Podés intentarlo de nuevo cuando quieras.")
    }
  }

  if (isInstalled) return null

  if (device === "ios") {
    return (
      <section className="rounded-3xl border border-green-100 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-xl">
            📲
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="font-serif text-xl font-bold text-stone-950">
              Instalá la app en tu iPhone
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              Comprá más rápido, repetí pedidos y sumá puntos cashback.
            </p>

            <div className="mt-4 rounded-2xl bg-green-50 p-4 text-sm text-green-900">
              <p className="font-bold">En iPhone se instala así:</p>
              <p className="mt-2">1. Tocá el botón de compartir de Safari.</p>
              <p>2. Elegí “Agregar a pantalla de inicio”.</p>
              <p>3. Confirmá con “Agregar”.</p>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-stone-500">
              No necesitás App Store. Se agrega gratis desde la web.
            </p>
          </div>
        </div>
      </section>
    )
  }

  if (device === "android") {
    return (
      <section className="rounded-3xl border border-green-100 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-xl">
            📲
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="font-serif text-xl font-bold text-stone-950">
              Instalá la app gratis
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              Comprá más rápido, repetí pedidos en segundos y sumá puntos cashback.
            </p>

            <button
              type="button"
              onClick={installApp}
              className="mt-4 rounded-2xl bg-green-700 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-green-800"
            >
              Instalar app
            </button>

            <p className="mt-3 text-xs leading-relaxed text-stone-500">
              Si Android no muestra el aviso automático, abrí el menú de Chrome y tocá “Agregar a pantalla principal”.
            </p>

            {message && (
              <p className="mt-3 text-sm leading-relaxed text-stone-600">
                {message}
              </p>
            )}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-3xl border border-green-100 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-xl">
          🌱
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="font-serif text-xl font-bold text-stone-950">
            Usá la app de Quintas y Granjas
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Desde el celular podés instalarla gratis para comprar más rápido y sumar puntos.
          </p>
        </div>
      </div>
    </section>
  )
}
