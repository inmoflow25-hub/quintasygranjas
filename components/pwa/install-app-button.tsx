"use client"

import { useEffect, useState } from "react"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{
    outcome: "accepted" | "dismissed"
    platform: string
  }>
}

function isIosDevice() {
  if (typeof window === "undefined") return false

  return /iphone|ipad|ipod/i.test(window.navigator.userAgent)
}

function isStandaloneMode() {
  if (typeof window === "undefined") return false

  const isStandaloneDisplay = window.matchMedia(
    "(display-mode: standalone)"
  ).matches

  const isIosStandalone =
    "standalone" in window.navigator &&
    Boolean((window.navigator as any).standalone)

  return isStandaloneDisplay || isIosStandalone
}

export default function InstallAppButton() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)

  const [isInstalled, setIsInstalled] = useState(false)
  const [isIos, setIsIos] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    setIsInstalled(isStandaloneMode())
    setIsIos(isIosDevice())

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
    }

    function handleAppInstalled() {
      setIsInstalled(true)
      setInstallPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      )
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  async function handleInstallClick() {
    if (isInstalled) {
      window.location.href = "/app"
      return
    }

    if (installPrompt) {
      await installPrompt.prompt()

      const choice = await installPrompt.userChoice

      if (choice.outcome === "accepted") {
        setIsInstalled(true)
      }

      setInstallPrompt(null)
      return
    }

    setShowHelp(true)
  }

  return (
    <section className="rounded-3xl bg-green-800 p-6 text-white shadow-xl">
      <div className="grid gap-5 md:grid-cols-[1.4fr_0.6fr] md:items-center">
        <div>
          <p className="text-sm font-semibold text-green-100">
            Quintas y Granjas App
          </p>

          <h2 className="mt-1 text-3xl font-bold">
            Instalá la app en tu celular
          </h2>

          <p className="mt-3 max-w-2xl text-green-50">
            Pedí más rápido, acumulá puntos, repetí tu último pedido y accedé a
            beneficios exclusivos desde tu pantalla de inicio.
          </p>

          <p className="mt-3 text-sm text-green-100">
            No hace falta App Store ni Play Store. Se instala desde el navegador
            en segundos.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleInstallClick}
            className="rounded-2xl bg-white px-5 py-4 text-lg font-bold text-green-800 shadow"
          >
            {isInstalled ? "Abrir app" : "Instalar app"}
          </button>

          <button
            type="button"
            onClick={() => {
              window.location.href = "/app"
            }}
            className="rounded-2xl border border-white/40 px-5 py-3 font-semibold text-white"
          >
            Entrar sin instalar
          </button>
        </div>
      </div>

      {showHelp && (
        <div className="mt-5 rounded-2xl bg-white p-4 text-green-950">
          {isIos ? (
            <div>
              <p className="font-bold">Para instalar en iPhone:</p>

              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
                <li>Abrí esta página en Safari.</li>
                <li>Tocá el botón de compartir.</li>
                <li>Elegí “Agregar a pantalla de inicio”.</li>
                <li>Confirmá con “Agregar”.</li>
              </ol>
            </div>
          ) : (
            <div>
              <p className="font-bold">Para instalar:</p>

              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
                <li>Abrí esta página desde Chrome en el celular.</li>
                <li>Tocá el menú de los tres puntos.</li>
                <li>Elegí “Instalar app” o “Agregar a pantalla principal”.</li>
              </ol>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
