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

  useEffect(() => {
    async function prepareInstall() {
      if (!("serviceWorker" in navigator)) return

      try {
        await navigator.serviceWorker.register("/sw.js", { scope: "/" })
        await navigator.serviceWorker.ready
      } catch (error) {
        console.error("Service worker registration failed:", error)
      }
    }

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
    }

    function handleInstalled() {
      window.location.href = "/app?source=pwa-installed"
    }

    prepareInstall()

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleInstalled)
    }
  }, [])

  async function installApp() {
    if (!installPrompt) {
      alert(
        "Para instalar: tocá los tres puntitos de Chrome y elegí “Instalar app” o “Agregar a pantalla principal”."
      )
      return
    }

    await installPrompt.prompt()

    const choice = await installPrompt.userChoice

    if (choice.outcome === "accepted") {
      window.location.href = "/app?source=pwa-installed"
      return
    }

    alert("No se instaló la app. Volvé a tocar Instalar app.")
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fff8f0] px-6">
      <button
        type="button"
        onClick={installApp}
        className="w-full max-w-sm rounded-3xl bg-green-700 px-8 py-6 text-2xl font-black text-white shadow-xl active:scale-[0.98]"
      >
        Instalar app
      </button>
    </main>
  )
}
