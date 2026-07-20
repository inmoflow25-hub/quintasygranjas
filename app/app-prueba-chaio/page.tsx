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
  const [isInstalled, setIsInstalled] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
    }

    function handleInstalled() {
      setIsInstalled(true)
      setMessage("Listo. La app quedó instalada.")
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleInstalled)

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true

    if (isStandalone) {
      setIsInstalled(true)
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleInstalled)
    }
  }, [])

  async function installApp() {
    if (!installPrompt) {
      setMessage(
        "Si no aparece el botón de instalación, abrí el menú de Chrome y tocá “Agregar a pantalla principal” o “Instalar app”."
      )
      return
    }

    await installPrompt.prompt()

    const choice = await installPrompt.userChoice

    if (choice.outcome === "accepted") {
      setIsInstalled(true)
      setMessage("Perfecto. La app quedó instalada.")
    } else {
      setMessage("No se instaló la app. Podés volver a intentarlo.")
    }

    setInstallPrompt(null)
  }

  return (
    <main className="min-h-screen bg-[#fff8f0] px-4 py-6 text-[#06150a]">
      <section className="mx-auto max-w-xl overflow-hidden rounded-[2rem] bg-white shadow-xl">
        <div className="relative h-72 overflow-hidden">
          <img
            src="https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/FOTO%20CAJAVEGGIE.png"
            alt="Quintas y Granjas"
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-black/70" />

          <div className="absolute bottom-5 left-5 right-5">
            <p className="mb-2 inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-black text-green-800">
              Prueba privada
            </p>

            <h1 className="text-4xl font-black leading-tight text-white">
              Quintas y Granjas App
            </h1>

            <p className="mt-2 text-base font-medium leading-relaxed text-white/90">
              Instalá la app, armá un pedido real y probá la experiencia completa.
            </p>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <div className="rounded-2xl bg-green-50 p-4">
            <p className="text-sm font-black text-green-900">
              ¿Qué podés probar?
            </p>

            <ul className="mt-2 space-y-1 text-sm leading-relaxed text-green-950/75">
              <li>• Armar un pedido desde el celular</li>
              <li>• Ver puntos y beneficios</li>
              <li>• Recibir avisos útiles del pedido</li>
              <li>• Finalizar una compra real</li>
            </ul>
          </div>

          <button
            type="button"
            onClick={installApp}
            className="w-full rounded-2xl bg-green-700 px-5 py-4 text-lg font-black text-white shadow-lg"
          >
            {isInstalled ? "App instalada" : "Instalar app"}
          </button>

          <a
            href="/app"
            className="block w-full rounded-2xl border border-green-700/20 bg-white px-5 py-4 text-center text-lg font-black text-green-800"
          >
            Entrar a la app
          </a>

          {message && (
            <p className="rounded-2xl bg-stone-100 p-4 text-sm leading-relaxed text-stone-700">
              {message}
            </p>
          )}

          <div className="rounded-2xl bg-white p-4 text-sm leading-relaxed text-stone-600">
            <p className="font-black text-stone-900">
              Si el botón no instala:
            </p>

            <p className="mt-1">
              En Android abrí Chrome, tocá los tres puntitos y elegí{" "}
              <strong>“Instalar app”</strong> o{" "}
              <strong>“Agregar a pantalla principal”</strong>.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
