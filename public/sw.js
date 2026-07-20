const CACHE_NAME = "qyg-pwa-v1"

const STATIC_ASSETS = [
  "/",
  "/app",
  "/manifest.json"
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )

  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      )
    })
  )

  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  const request = event.request
  const url = new URL(request.url)

  if (request.method !== "GET") {
    return
  }

  if (url.pathname.startsWith("/api/")) {
    return
  }

  if (url.hostname.includes("supabase.co")) {
    return
  }

  if (url.hostname.includes("mercadopago")) {
    return
  }

  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request)
    })
  )
})

self.addEventListener("push", (event) => {
  const fallbackData = {
    title: "Quintas y Granjas",
    body: "Tenés novedades en la app.",
    url: "/app"
  }

  let data = fallbackData

  if (event.data) {
    try {
      data = {
        ...fallbackData,
        ...event.data.json()
      }
    } catch {
      data = fallbackData
    }
  }

  event.waitUntil(
   self.registration.showNotification(data.title, {
  body: data.body,
  icon: "/icons/icon-192.png",
  badge: "/icons/icon-192.png",
  data: {
    url: data.url || "/app"
  }
})
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  const targetUrl = event.notification.data?.url || "/app"

  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client && client.url.includes(targetUrl)) {
          return client.focus()
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl)
      }
    })
  )
})
