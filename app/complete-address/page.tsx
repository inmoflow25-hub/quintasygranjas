"use client"

import { useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function CompleteAddressPage() {

  const router = useRouter()

  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    phone: "",
    notes: ""
  })

  function updateField(field: string, value: string) {
    setForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      alert("Debes iniciar sesión")
      return
    }

    const { error } = await supabase
      .from("addresses")
      .insert({
        user_id: user.id,
        address: form.address,
        city: form.city,
        phone: form.phone,
        notes: `${form.name} | ${form.notes}`
      })

    setLoading(false)

    if (error) {
      alert("No pudimos guardar la dirección")
      return
    }

    router.push("/")
  }

  return (
    <main className="min-h-screen bg-green-50 flex items-center justify-center px-6">

      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-10">

        <h1 className="text-3xl font-bold text-green-700 mb-2">
          Último paso 🌿
        </h1>

        <p className="text-gray-600 mb-8">
          Necesitamos tu dirección para enviarte la caja semanal.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

          <input
            type="text"
            placeholder="Nombre"
            required
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <input
            type="text"
            placeholder="Dirección"
            required
            value={form.address}
            onChange={(e) => updateField("address", e.target.value)}
            className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <input
            type="text"
            placeholder="Ciudad"
            required
            value={form.city}
            onChange={(e) => updateField("city", e.target.value)}
            className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <input
            type="text"
            placeholder="WhatsApp"
            required
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <textarea
            placeholder="Notas para la entrega (opcional)"
            value={form.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition"
          >
            {loading ? "Guardando..." : "Guardar dirección"}
          </button>

        </form>

      </div>

    </main>
  )
}
