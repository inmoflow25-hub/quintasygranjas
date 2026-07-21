"use client"

import { useEffect, useState } from "react"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{
    outcome: "accepted" | "dismissed"
    platform: string
  }>
}

export function AppDownloadSection() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)

  const [help, setHelp] = useState<"android" | "iphone" | null>(null)

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

    preparePwa()

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt)

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt)
    }
  }, [])

  async function installAndroid() {
    if (installPrompt) {
      await installPrompt.prompt()
      await installPrompt.userChoice
      setInstallPrompt(null)
      return
    }

    setHelp("android")
  }

  function installIphone() {
    setHelp("iphone")
  }

  return (
    <section
      id="descargar-app"
      className="relative overflow-hidden bg-[#07170b] px-4 py-20 text-white"
    >
      <div className="absolute inset-0">
        <img
          src="https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/CAJA%20CAMPO.png"
          alt="Quintas y Granjas App"
          className="h-full w-full object-cover opacity-35"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-green-950/80 to-black/60" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="mb-4 inline-flex rounded-full bg-green-600 px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-white shadow-lg">
            Nueva app
          </p>

          <h2 className="text-4xl font-black leading-tight md:text-6xl">
            Pedí más rápido. Sumá puntos. Recibí avisos de tu pedido.
          </h2>

          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/85 md:text-xl">
            Instalá Quintas y Granjas en tu celular y comprá frutas, verduras,
            cajas armadas y productos de granja sin buscar links, sin perder
            conversaciones y con beneficios para próximas compras.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={installAndroid}
              className="rounded-3xl bg-green-600 px-6 py-5 text-left shadow-2xl transition hover:bg-green-500 active:scale-[0.98]"
            >
              <span className="block text-sm font-black uppercase tracking-[0.16em] text-green-100">
                Android
              </span>

              <span className="mt-1 block text-2xl font-black">
                Tengo Android
              </span>

              <span className="mt-2 block text-sm leading-relaxed text-white/85">
                Instalá la app desde Chrome y dejala en la pantalla principal.
              </span>
            </button>

            <button
              type="button"
              onClick={installIphone}
              className="rounded-3xl bg-white px-6 py-5 text-left text-green-950 shadow-2xl transition hover:bg-green-50 active:scale-[0.98]"
            >
              <span className="block text-sm font-black uppercase tracking-[0.16em] text-green-700">
                iPhone
              </span>

              <span className="mt-1 block text-2xl font-black">
                Tengo iPhone
              </span>

              <span className="mt-2 block text-sm leading-relaxed text-green-950/75">
                Agregala a tu pantalla de inicio desde Safari.
              </span>
            </button>
          </div>

          {help === "android" && (
            <div className="mt-6 rounded-3xl bg-white p-5 text-green-950 shadow-xl">
              <p className="text-xl font-black">
                Cómo instalar en Android
              </p>

              <ol className="mt-3 space-y-2 text-base leading-relaxed">
                <li>
                  <strong>1.</strong> Abrí esta página desde{" "}
                  <strong>Chrome</strong>.
                </li>
                <li>
                  <strong>2.</strong> Tocá los <strong>tres puntitos</strong>.
                </li>
                <li>
                  <strong>3.</strong> Elegí <strong>Instalar app</strong> o{" "}
                  <strong>Agregar a pantalla principal</strong>.
                </li>
                <li>
                  <strong>4.</strong> Abrí Quintas y Granjas desde el ícono del
                  celular.
                </li>
              </ol>

              <a
                href="/app?source=android-download-section"
                className="mt-5 block rounded-2xl bg-green-700 px-5 py-4 text-center text-lg font-black text-white"
              >
                Abrir app
              </a>
            </div>
          )}

          {help === "iphone" && (
            <div className="mt-6 rounded-3xl bg-white p-5 text-green-950 shadow-xl">
              <p className="text-xl font-black">
                Cómo instalar en iPhone
              </p>

              <ol className="mt-3 space-y-2 text-base leading-relaxed">
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
                  <strong>4.</strong> Confirmá y abrí Quintas y Granjas desde el
                  ícono.
                </li>
              </ol>

              <a
                href="/app?source=iphone-download-section"
                className="mt-5 block rounded-2xl bg-green-700 px-5 py-4 text-center text-lg font-black text-white"
              >
                Abrir app
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
