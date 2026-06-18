"use client"

import { useState } from "react"

export default function GeocodeCustomersButton() {
  const [loading, setLoading] = useState(false)

  async function updateMapCustomers() {
    if (loading) return

    const ok = confirm(
      "Esto va a sincronizar compradores reales desde pedidos hacia el mapa y después cargar coordenadas pendientes. No borra customer_locations. ¿Seguimos?"
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
        alert(syncData?.error || "Error sincronizando compradores al mapa")
        setLoading(false)
        return
      }

      const geocodeRes = await fetch("/api/superadmin/customer-locations/geocode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          limit: 25
        })
      })

      const geocodeData = await geocodeRes.json()

      if (!geocodeRes.ok) {
        alert(geocodeData?.error || "Error geocodificando clientes")
        setLoading(false)
        return
      }

      alert(
        `Mapa actualizado.\n\n` +
          `Pedidos leídos: ${syncData.read_orders}\n` +
          `Pedidos usables: ${syncData.usable_orders}\n` +
          `Clientes únicos desde pedidos: ${syncData.unique_customers}\n` +
          `Insertados: ${syncData.inserted}\n` +
          `Actualizados: ${syncData.updated}\n` +
          `Sincronizados: ${syncData.synced}\n` +
          `Fallidos sync: ${syncData.failed}\n\n` +
          `Geocoding procesados: ${geocodeData.processed}\n` +
          `Geocodificados: ${geocodeData.geocoded}\n` +
          `No encontrados: ${geocodeData.not_found}\n` +
          `Errores geocoding: ${geocodeData.failed}`
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
      {loading ? "Actualizando mapa..." : "Actualizar clientes del mapa"}
    </button>
  )
}
