"use client"

import { useEffect, useState } from "react"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{
    outcome: "accepted" | "dismissed"
    platform: string
  }>
}

declare global {
  interface Window {
    deferredInstallPrompt?: BeforeInstallPromptEvent
  }
}

export default function AppPruebaChaioPage() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)

  const [selectedSystem, setSelectedSystem] =
    useState<"android" | "ios" | null>(null)

  useEffect(() => {
    async function preparePwa() {
      if (!("serviceWorker" in navigator)) return

      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/"
        })

        await navigator.serviceWorker.ready
        await registration.update()
      } catch (error) {
        console.error("Service worker error:", error)
      }
    }

    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault()

      const promptEvent = event as BeforeInstallPromptEvent

      window.deferredInstallPrompt = promptEvent
      setInstallPrompt(promptEvent)
    }

    preparePwa()

    if (window.deferredInstallPrompt) {
      setInstallPrompt(window.deferredInstallPrompt)
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt)

    window.addEventListener("appinstalled", () => {
      window.location.href = "/app?source=installed"
    })

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt)
    }
  }, [])

  async function installAndroid() {
    setSelectedSystem("android")

    const promptEvent = installPrompt || window.deferredInstallPrompt

    if (!promptEvent) {
      return
    }

    await promptEvent.prompt()

    const choice = await promptEvent.userChoice

    window.deferredInstallPrompt = undefined
    setInstallPrompt(null)

    if (choice.outcome === "accepted") {
      window.location.href = "/app?source=android-installed"
    }
  }

  function installIphone() {
    setSelectedSystem("ios")
  }

  return (
    <main className="min-h-screen bg-[#07170b] text-white">
      <section className="relative flex min-h-screen items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/CAJA%20CAMPO.png"
            alt="Quintas y Granjas App"
            className="h-full w-full object-cover opacity-40"
          />

          <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-green-950/80 to-black/55" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-5 py-16 md:py-24">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex rounded-full bg-green-600 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white shadow-lg">
              Prueba privada
            </p>

            <h1 className="text-4xl font-black leading-tight md:text-6xl">
              Instalá la app de Quintas y Granjas
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/85 md:text-xl">
              Tocá tu sistema operativo para instalar el ícono de la app en tu
              pantalla principal.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={installAndroid}
                className="rounded-3xl bg-green-600 px-6 py-6 text-left shadow-2xl transition hover:bg-green-500 active:scale-[0.98]"
              >
                <span className="block text-sm font-black uppercase tracking-[0.16em] text-green-100">
                  Android / Chrome
                </span>

                <span className="mt-1 block text-2xl font-black">
                  Descargar app
                </span>

                <span className="mt-2 block text-sm leading-relaxed text-white/85">
                  Abre el instalador para guardar el ícono en tu celular.
                </span>
              </button>

              <button
                type="button"
                onClick={installIphone}
                className="rounded-3xl bg-white px-6 py-6 text-left text-green-950 shadow-2xl transition hover:bg-green-50 active:scale-[0.98]"
              >
                <span className="block text-sm font-black uppercase tracking-[0.16em] text-green-700">
                  iPhone / Safari
                </span>

                <span className="mt-1 block text-2xl font-black">
                  Descargar app
                </span>

                <span className="mt-2 block text-sm leading-relaxed text-green-950/75">
                  Guardala en la pantalla de inicio desde Safari.
                </span>
              </button>
            </div>

            {selectedSystem === "android" && !installPrompt && (
              <div className="mt-6 rounded-3xl bg-white p-5 text-green-950 shadow-xl">
                <p className="text-xl font-black">
                  Si no se abrió el instalador
                </p>

                <p className="mt-2 text-base leading-relaxed text-green-950/75">
                  En Chrome tocá el botón <strong>Instalar</strong> que aparece
                  arriba en la barra del navegador. En tu captura ya aparece.
                </p>
              </div>
            )}

            {selectedSystem === "ios" && (
              <div className="mt-6 rounded-3xl bg-white p-5 text-green-950 shadow-xl">
                <p className="text-xl font-black">En iPhone</p>

                <ol className="mt-3 space-y-2 text-base leading-relaxed text-green-950/80">
                  <li>
                    <strong>1.</strong> Abrí esta página desde{" "}
                    <strong>Safari</strong>.
                  </li>
                  <li>
                    <strong>2.</strong> Tocá <strong>Compartir</strong>.
                  </li>
                  <li>
                    <strong>3.</strong> Elegí{" "}
                    <strong>Agregar a pantalla de inicio</strong>.
                  </li>
                  <li>
                    <strong>4.</strong> Confirmá y abrí la app desde el ícono.
                  </li>
                </ol>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
