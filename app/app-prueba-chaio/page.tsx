"use client"

import { useEffect, useMemo, useState } from "react"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{
    outcome: "accepted" | "dismissed"
    platform: string
  }>
}

type DeviceType = "android" | "ios" | "mac" | "windows" | "other"

function getDeviceType(): DeviceType {
  if (typeof navigator === "undefined") return "other"

  const ua = navigator.userAgent.toLowerCase()
  const platform = navigator.platform?.toLowerCase() || ""

  if (/android/.test(ua)) return "android"

  if (
    /iphone|ipad|ipod/.test(ua) ||
    (platform.includes("mac") && "ontouchend" in document)
  ) {
    return "ios"
  }

  if (platform.includes("mac")) return "mac"
  if (platform.includes("win")) return "windows"

  return "other"
}

function isStandaloneMode() {
  if (typeof window === "undefined") return false

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  )
}

export default function AppPruebaChaioPage() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)

  const [showHelp, setShowHelp] = useState(false)
  const [installed, setInstalled] = useState(false)
  const device = useMemo(() => getDeviceType(), [])

  useEffect(() => {
    async function preparePwa() {
      if (!("serviceWorker" in navigator)) return

      try {
        await navigator.serviceWorker.register("/sw.js", { scope: "/" })
        await navigator.serviceWorker.ready
      } catch (error) {
        console.error("Service worker error:", error)
      }
    }

    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
    }

    function onInstalled() {
      setInstalled(true)
      window.location.href = "/app?source=chaio-installed"
    }

    preparePwa()

    if (isStandaloneMode()) {
      setInstalled(true)
      window.location.href = "/app?source=chaio-standalone"
      return
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt)
    window.addEventListener("appinstalled", onInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt)
      window.removeEventListener("appinstalled", onInstalled)
    }
  }, [])

  async function installApp() {
    if (installed) {
      window.location.href = "/app?source=chaio-installed-open"
      return
    }

    if (installPrompt) {
      await installPrompt.prompt()

      const choice = await installPrompt.userChoice

      if (choice.outcome === "accepted") {
        window.location.href = "/app?source=chaio-installed"
        return
      }

      setShowHelp(true)
      return
    }

    setShowHelp(true)
  }

  return (
    <main className="min-h-screen bg-[#fff8f0] px-5 py-8 text-[#07170b]">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center">
        <div className="rounded-[2rem] bg-white p-5 shadow-xl">
          <div className="mb-5 overflow-hidden rounded-[1.5rem]">
            <img
              src="https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/FOTO%20CAJAVEGGIE.png"
              alt="Quintas y Granjas"
              className="h-56 w-full object-cover"
            />
          </div>

          <h1 className="text-3xl font-black leading-tight">
            Quintas y Granjas App
          </h1>

          <p className="mt-2 text-base leading-relaxed text-stone-600">
            Instalá la app para hacer tu pedido desde el celular.
          </p>

          <button
            type="button"
            onClick={installApp}
            className="mt-6 w-full rounded-3xl bg-green-700 px-8 py-6 text-center text-2xl font-black text-white shadow-xl active:scale-[0.98]"
          >
            Instalar app
          </button>

          {showHelp && (
            <div className="mt-5 rounded-2xl bg-green-50 p-4 text-sm leading-relaxed text-green-950">
              {device === "ios" && (
                <>
                  <p className="font-black">En iPhone:</p>
                  <p className="mt-2">
                    Abrí esta página en <strong>Safari</strong>, tocá el botón{" "}
                    <strong>Compartir</strong> y elegí{" "}
                    <strong>Agregar a pantalla de inicio</strong>.
                  </p>
                </>
              )}

              {device === "android" && (
                <>
                  <p className="font-black">En Android:</p>
                  <p className="mt-2">
                    Abrí esta página en <strong>Chrome</strong>, tocá los tres
                    puntitos y elegí <strong>Instalar app</strong> o{" "}
                    <strong>Agregar a pantalla principal</strong>.
                  </p>
                </>
              )}

              {device === "mac" && (
                <>
                  <p className="font-black">En Mac:</p>
                  <p className="mt-2">
                    Usá <strong>Chrome</strong>. En la barra de dirección tocá
                    el ícono de instalación y confirmá{" "}
                    <strong>Instalar</strong>.
                  </p>
                </>
              )}

              {device === "windows" && (
                <>
                  <p className="font-black">En Windows:</p>
                  <p className="mt-2">
                    Usá <strong>Chrome</strong>. En la barra de dirección tocá
                    el ícono de instalación y confirmá{" "}
                    <strong>Instalar</strong>.
                  </p>
                </>
              )}

              {device === "other" && (
                <>
                  <p className="font-black">Para instalar:</p>
                  <p className="mt-2">
                    Usá Chrome y buscá la opción{" "}
                    <strong>Instalar app</strong> o{" "}
                    <strong>Agregar a pantalla principal</strong>.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
