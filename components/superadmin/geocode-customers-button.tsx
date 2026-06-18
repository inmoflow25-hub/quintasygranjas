"use client"

import { useState } from "react"

export default function GeocodeCustomersButton() {
  const [loading, setLoading] = useState(false)

  async function runGeocoding() {
    if (loading) return

    const ok = confirm(
      "Esto va a buscar coordenadas para clientes pendientes de customer_locations. No borra clientes ni reconstruye la tabla. ¿Seguimos?"
    )

    if (!ok) return

    setLoading(true)

    try {
      const res = await fetch("/api/superadmin/customer-locations/geocode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          limit: 25
        })
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data?.error || "Error geocodificando clientes")
        setLoading(false)
        return
      }

      alert(
        `Listo.\n` +
          `Procesados: ${data.processed}\n` +
          `Geocodificados: ${data.geocoded}\n` +
          `No encontrados: ${data.not_found}\n` +
          `Errores: ${data.failed}`
      )

      window.location.reload()
    } catch (error) {
      console.error(error)
      alert("Error ejecutando geocoding")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={runGeocoding}
      disabled={loading}
      className="rounded-xl bg-[#1f2a1f] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
    >
      {loading ? "Geocodificando..." : "Cargar coordenadas"}
    </button>
  )
}
