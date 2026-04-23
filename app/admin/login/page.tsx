"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data?.error || "No se pudo iniciar sesión")
        setLoading(false)
        return
      }

      router.push("/admin")
      router.refresh()
    } catch (error) {
      console.error(error)
      alert("Error de red")
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f5f3] flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-[#1f2a1f] mb-2">
          Ingresar al admin
        </h1>

        <p className="text-sm text-gray-600 mb-6">
          Solo usuarios autorizados
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Tu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border px-4 py-3"
            required
          />

          <input
            type="password"
            placeholder="Clave del portal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border px-4 py-3"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#1f2a1f] py-3 font-semibold text-white"
          >
            {loading ? "Ingresando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  )
}
