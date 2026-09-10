"use client"

import { useEffect } from "react"

const INSTALLATION_KEY = "qyg_pwa_installation_id"
const SESSION_KEY = "qyg_pwa_session_started_at"
const SESSION_WINDOW_MS = 30 * 60 * 1000

function isStandalonePwa() {
  const standaloneDisplay = window.matchMedia(
    "(display-mode: standalone)"
  ).matches

  const iosStandalone = (
    window.navigator as Navigator & {
      standalone?: boolean
    }
  ).standalone === true

  const androidApp =
    document.referrer.startsWith("android-app://")

  return standaloneDisplay || iosStandalone || androidApp
}

function getDeviceType() {
  const userAgent = window.navigator.userAgent.toLowerCase()

  if (/iphone|ipad|ipod/.test(userAgent)) return "ios"
  if (/android/.test(userAgent)) return "android"
  if (/windows|macintosh|linux/.test(userAgent)) {
    return "desktop"
  }

  return "unknown"
}

function getInstallationId() {
  const existing =
    window.localStorage.getItem(INSTALLATION_KEY)

  if (existing) return existing

  const installationId = window.crypto.randomUUID()

  window.localStorage.setItem(
    INSTALLATION_KEY,
    installationId
  )

  return installationId
}

export default function PwaUsageTracker() {
  useEffect(() => {
    if (!isStandalonePwa()) return

    const now = Date.now()

    const previousSession = Number(
      window.sessionStorage.getItem(SESSION_KEY) || 0
    )

    if (
      previousSession &&
      now - previousSession < SESSION_WINDOW_MS
    ) {
      return
    }

    window.sessionStorage.setItem(
      SESSION_KEY,
      String(now)
    )

    fetch("/api/app/analytics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        installation_id: getInstallationId(),
        device_type: getDeviceType(),
        customer_email:
          window.localStorage.getItem("qyg_app_email") || "",
        customer_phone:
          window.localStorage.getItem("qyg_app_phone") || "",
        path:
          window.location.pathname +
          window.location.search
      }),
      keepalive: true
    }).catch((error) => {
      console.error("pwa usage tracking error", error)
    })
  }, [])

  return null
}
