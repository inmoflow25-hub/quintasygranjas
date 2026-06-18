"use client"

import { useState } from "react"

export default function GeocodeCustomersButton() {
  const [loading, setLoading] = useState(false)

  async function updateMapCustomers() {
    if (loading) return

    const ok = confirm(
      "Esto va a sincronizar domicilios desde addresses y geocodificar pendientes para mostrar pins. No borra datos. ¿Seguimos?"
    )

    if (!ok) return

    setLoading(true)

    try {
      const syncRes = await fetch("/api/superadmin/customer-locations/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      })

      const syncData = await syncRes.json()

      if (!syncRes.ok) {
        alert(syncData?.error || "Error sincronizando domicilios al mapa")
        setLoading(false)
        return
      }

      let totalProcessed = 0
      let totalGeocoded = 0
      let totalNotFound = 0
      let totalFailed = 0
      let stoppedByRateLimit = false

      for (let batch = 0; batch < 10; batch++) {
        const geocodeRes = await fetch("/api/superadmin/customer-locations/geocode", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            limit: 5
          })
        })

        const geocodeData = await geocodeRes.json()

        if (!geocodeRes.ok) {
          alert(geocodeData?.error || "Error geocodificando domicilios")
          setLoading(false)
          return
        }

        const processed = Number(geocodeData.processed || 0)

        totalProcessed += processed
        totalGeocoded += Number(geocodeData.geocoded || 0)
        totalNotFound += Number(geocodeData.not_found || 0)
        totalFailed += Number(geocodeData.failed || 0)

        if (geocodeData.stopped_by_rate_limit) {
          stoppedByRateLimit = true
          break
        }

        if (processed === 0) {
          break
        }
      }

      alert(
        `Mapa actualizado.\n\n` +
          `Domicilios leídos: ${syncData.addresses_read ?? syncData.read_orders}\n` +
          `Domicilios sincronizados: ${syncData.domicilios ?? syncData.unique_customers}\n` +
          `Insertados: ${syncData.inserted}\n` +
          `Actualizados: ${syncData.updated}\n` +
          `Fallidos sync: ${syncData.failed}\n\n` +
          `Geocoding procesados: ${totalProcessed}\n` +
          `Geocodificados: ${totalGeocoded}\n` +
          `No encontrados: ${totalNotFound}\n` +
          `Errores geocoding: ${totalFailed}` +
          `${stoppedByRateLimit ? "\n\nEl geocoder externo frenó por límite. Esperá y volvé a intentar." : ""}`
      )

      window.location.reload()
    } catch (error) {
      console.error(error)
      alert("Error actualizando mapa")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={updateMapCustomers}
      disabled={loading}
      className="rounded-xl bg-[#1f2a1f] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
    >
      {loading ? "Actualizando pins..." : "Actualizar pins del mapa"}
    </button>
  )
}
