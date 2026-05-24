"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ReplyBox({
  conversationId
}: {
  conversationId: string
}) {
  const router = useRouter()
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function sendMessage() {
    const clean = message.trim()

    if (!clean) {
      setError("Escribí un mensaje.")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/ghl/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          conversationId,
          message: clean
        })
      })

      const data = await response.json()

      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "No se pudo enviar")
      }

      setMessage("")
      setSuccess("Mensaje enviado.")
      router.refresh()
    } catch (err: any) {
      setError(err?.message || "No se pudo enviar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border-t border-neutral-100 bg-neutral-50 px-6 py-4">
      <div className="rounded-2xl border border-neutral-200 bg-white p-4">
        <label className="text-sm font-bold text-neutral-900">
          Responder desde la app
        </label>

        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Escribí la respuesta..."
          className="mt-3 min-h-28 w-full rounded-xl border border-neutral-200 p-3 text-sm outline-none focus:border-green-600"
        />

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="text-sm">
            {error ? <span className="text-red-600">{error}</span> : null}
            {success ? <span className="text-green-700">{success}</span> : null}
          </div>

          <button
            type="button"
            onClick={sendMessage}
            disabled={loading}
            className="rounded-xl bg-green-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </div>
    </div>
  )
}
