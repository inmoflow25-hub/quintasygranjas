"use client"

import { useState } from "react"

export function GhlSyncButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")

  async function syncBuyers() {
    setLoading(true)
    setError("")
    setResult(null)

    try {
      const response = await fetch("/api/ghl/sync-buyers", {
        method: "POST"
      })

      const data = await response.json()

      if (!response.ok || !data.ok) {
        throw new Error(data?.error || "No se pudo sincronizar")
      }

      setResult(data)
    } catch (err: any) {
      setError(err?.message || "Error sincronizando compradores")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-3xl border border-[#e3e1dc] bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-serif font-bold">
        Sincronizar compradores con GHL
      </h2>

      <p className="mt-2 max-w-2xl text-sm text-gray-600">
        Envía a Go High Level todos los compradores confirmados de Supabase.
        Agrupa por teléfono, calcula comportamiento y aplica tags automáticos.
      </p>

      <button
        type="button"
        onClick={syncBuyers}
        disabled={loading}
        className="mt-5 rounded-full bg-[#1f2a1f] px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Sincronizando..." : "Enviar compradores a GHL"}
      </button>

      {result && (
        <div className="mt-5 rounded-2xl bg-green-50 p-4 text-sm text-green-800">
          <p className="font-bold">Sincronización terminada</p>
          <p>Total compradores: {result.total_buyers}</p>
          <p>Enviados OK: {result.synced}</p>
          <p>Fallidos: {result.failed}</p>

          {result.errors?.length > 0 && (
            <div className="mt-3">
              <p className="font-semibold">Errores:</p>
              <ul className="mt-1 list-disc pl-5">
                {result.errors.map((item: any, index: number) => (
                  <li key={index}>
                    {item.buyer}: {item.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  )
}
