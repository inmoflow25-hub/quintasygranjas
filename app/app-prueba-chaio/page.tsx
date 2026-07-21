"use client"

import { useEffect, useState } from "react"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{
    outcome: "accepted" | "dismissed"
    platform: string
  }>
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
      window.location.href = "/app?source=chaio-installed"
    }

    preparePwa()

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt)
    window.addEventListener("appinstalled", onInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt)
      window.removeEventListener("appinstalled", onInstalled)
    }
  }, [])

  async function handleAndroidInstall() {
    setSelectedSystem("android")

    if (!installPrompt) return

    await installPrompt.prompt()

    const choice = await installPrompt.userChoice

    if (choice.outcome === "accepted") {
      window.location.href = "/app?source=android-installed"
    }

    setInstallPrompt(null)
  }

  function handleIosInstall() {
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
              Tené la app en tu pantalla principal para pedir más rápido, sumar
              puntos y recibir avisos importantes sobre tus entregas.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleAndroidInstall}
                className="rounded-3xl bg-green-600 px-6 py-6 text-left shadow-2xl transition hover:bg-green-500 active:scale-[0.98]"
              >
                <span className="block text-sm font-black uppercase tracking-[0.16em] text-green-100">
                  Android
                </span>

                <span className="mt-1 block text-2xl font-black">
                  Tengo Android
                </span>

                <span className="mt-2 block text-sm leading-relaxed text-white/85">
                  Instalá desde Chrome y dejala en tu pantalla principal.
                </span>
              </button>

              <button
                type="button"
                onClick={handleIosInstall}
                className="rounded-3xl bg-white px-6 py-6 text-left text-green-950 shadow-2xl transition hover:bg-green-50 active:scale-[0.98]"
              >
                <span className="block text-sm font-black uppercase tracking-[0.16em] text-green-700">
                  iPhone
                </span>

                <span className="mt-1 block text-2xl font-black">
                  Tengo iPhone
                </span>

                <span className="mt-2 block text-sm leading-relaxed text-green-950/75">
                  Agregala desde Safari a tu pantalla de inicio.
                </span>
              </button>
            </div>

            {selectedSystem === "android" && (
              <div className="mt-6 rounded-3xl bg-white p-5 text-green-950 shadow-xl">
                <p className="text-xl font-black">Cómo instalar en Android</p>

                {installPrompt ? (
                  <p className="mt-2 text-base leading-relaxed text-green-950/75">
                    Chrome va a mostrar el cartel de instalación. Confirmá{" "}
                    <strong>Instalar</strong> y después abrí la app desde el
                    ícono.
                  </p>
                ) : (
                  <ol className="mt-3 space-y-2 text-base leading-relaxed text-green-950/80">
                    <li>
                      <strong>1.</strong> Abrí esta página desde{" "}
                      <strong>Chrome</strong>.
                    </li>
                    <li>
                      <strong>2.</strong> Tocá los{" "}
                      <strong>tres puntitos</strong>.
                    </li>
                    <li>
                      <strong>3.</strong> Elegí{" "}
                      <strong>Instalar app</strong> o{" "}
                      <strong>Agregar a pantalla principal</strong>.
                    </li>
                    <li>
                      <strong>4.</strong> Abrí Quintas y Granjas desde el ícono.
                    </li>
                  </ol>
                )}
              </div>
            )}

            {selectedSystem === "ios" && (
              <div className="mt-6 rounded-3xl bg-white p-5 text-green-950 shadow-xl">
                <p className="text-xl font-black">Cómo instalar en iPhone</p>

                <ol className="mt-3 space-y-2 text-base leading-relaxed text-green-950/80">
                  <li>
                    <strong>1.</strong> Abrí esta página desde{" "}
                    <strong>Safari</strong>.
                  </li>
                  <li>
                    <strong>2.</strong> Tocá el botón de{" "}
                    <strong>Compartir</strong>.
                  </li>
                  <li>
                    <strong>3.</strong> Elegí{" "}
                    <strong>Agregar a pantalla de inicio</strong>.
                  </li>
                  <li>
                    <strong>4.</strong> Confirmá y abrí Quintas y Granjas desde
                    el nuevo ícono.
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
