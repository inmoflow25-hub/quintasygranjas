"use client"

import { useEffect, useState } from "react"

type PushPermissionCardProps = {
  email?: string
  phone?: string
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/")

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}

function getPermissionLabel(permission: NotificationPermission | "unsupported") {
  if (permission === "granted") return "Notificaciones activas"
  if (permission === "denied") return "Notificaciones bloqueadas"
  if (permission === "unsupported") return "No disponible en este navegador"
  return "Activar avisos"
}

export default function PushPermissionCard({
  email = "",
  phone = ""
}: PushPermissionCardProps) {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    "default"
  )
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("Notification" in window) ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      setPermission("unsupported")
      return
    }

    setPermission(Notification.permission)
  }, [])

  async function activatePush() {
    try {
      setIsLoading(true)
      setMessage("")

      if (
        typeof window === "undefined" ||
        !("Notification" in window) ||
        !("serviceWorker" in navigator) ||
        !("PushManager" in window)
      ) {
        setPermission("unsupported")
        setMessage("Tu navegador no permite notificaciones push.")
        return
      }

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

      if (!vapidPublicKey) {
        setMessage("Falta configurar NEXT_PUBLIC_VAPID_PUBLIC_KEY.")
        return
      }

      const requestedPermission = await Notification.requestPermission()
      setPermission(requestedPermission)

      if (requestedPermission !== "granted") {
        setMessage("No se activaron las notificaciones.")
        return
      }

     let registration = await navigator.serviceWorker.getRegistration("/")

if (!registration) {
  registration = await navigator.serviceWorker.register("/sw.js", {
    scope: "/"
  })
}

await registration.update()

if (!registration.active) {
  await new Promise((resolve) => setTimeout(resolve, 1500))
}

if (!registration.active) {
  throw new Error("No se pudo activar el sistema de avisos. Cerrá y abrí la app una vez más.")
}

      const existingSubscription =
        await registration.pushManager.getSubscription()

      const subscription =
        existingSubscription ||
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
        }))

      const response = await fetch("/api/app/push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          phone,
          subscription
        })
      })

      const result = await response.json().catch(() => null)

     if (!response.ok) {
  throw new Error(
    result?.detail ||
      result?.hint ||
      result?.error ||
      `No se pudo guardar la suscripción. Status ${response.status}`
  )
}

      setMessage("Listo. Notificaciones activadas y guardadas.")
    } catch (error: any) {
      console.error("push activation error", error)
      setMessage(error?.message || "No se pudieron activar las notificaciones.")
    } finally {
      setIsLoading(false)
    }
  }

  if (permission === "unsupported") {
    return (
      <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-100 text-xl">
            🔕
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-stone-950">
              Avisos de la app
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-stone-600">
              Este navegador no permite activar notificaciones push. Podés seguir
              usando la app normalmente.
            </p>
          </div>
        </div>
      </section>
    )
  }
 if (permission === "granted") {
  return null
 }
  return (
    <section className="rounded-3xl border border-green-100 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-xl">
          🔔
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-serif text-xl font-bold text-stone-950">
              Avisos útiles
            </h2>

            <span className="w-fit rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
              {getPermissionLabel(permission)}
            </span>
          </div>

          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Te avisamos cuando haya novedades de tu pedido, beneficios de la app
            o puntos por vencer.
          </p>

          {permission !== "granted" && (
            <button
              type="button"
              onClick={activatePush}
              disabled={isLoading}
              className="mt-4 rounded-2xl bg-green-700 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-stone-300"
            >
              {isLoading ? "Activando..." : "Activar avisos"}
            </button>
          )}

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
