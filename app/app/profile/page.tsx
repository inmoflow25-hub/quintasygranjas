"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type AppUser = {
  id: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  neighborhood: string
}

export default function AppProfilePage() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    user_id: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    neighborhood: ""
  })

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    const email = localStorage.getItem("qyg_app_email") || ""
    const phone = localStorage.getItem("qyg_app_phone") || ""

    if (!email && !phone) return

    setLoading(true)

    try {
      const res = await fetch("/api/app/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone })
      })

      const data = await res.json()
      const user: AppUser | null = data?.user || null

      if (user) {
        setForm({
          user_id: user.id || "",
          name: user.name || "",
          email: user.email || email,
          phone: user.phone || phone,
          address: user.address || "",
          city: user.city || "",
          neighborhood: user.neighborhood || ""
        })
      } else {
        setForm((prev) => ({
          ...prev,
          email,
          phone
        }))
      }
    } finally {
      setLoading(false)
    }
  }

  function updateField(field: string, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.email && !form.phone && !form.user_id) {
      alert("Necesitamos email o WhatsApp")
      return
    }

    setSaving(true)

    try {
      const res = await fetch("/api/app/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data?.error || "No se pudo guardar el perfil")
        setSaving(false)
        return
      }

      localStorage.setItem("qyg_app_email", data.user.email || form.email)
      localStorage.setItem("qyg_app_phone", data.user.phone || form.phone)

      alert("Perfil actualizado")
      router.push("/app")
    } catch (error) {
      console.error(error)
      alert("Error de red")
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-green-50 px-4 py-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <section className="rounded-3xl bg-white p-6 shadow">
          <button
            onClick={() => router.push("/app")}
            className="mb-4 text-sm font-semibold text-green-700"
          >
            ← Volver a la app
          </button>

          <h1 className="text-3xl font-bold text-gray-900">Mi perfil</h1>

          <p className="mt-2 text-gray-600">
            Guardá tus datos para comprar más rápido.
          </p>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow">
          {loading ? (
            <p>Cargando perfil...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                className="w-full rounded-xl border px-4 py-3"
                placeholder="Nombre y apellido"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
              />

              <input
                className="w-full rounded-xl border px-4 py-3"
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
              />

              <input
                className="w-full rounded-xl border px-4 py-3"
                placeholder="WhatsApp"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
              />

              <input
                className="w-full rounded-xl border px-4 py-3"
                placeholder="Dirección"
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
              />

              <input
                className="w-full rounded-xl border px-4 py-3"
                placeholder="Ciudad"
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
              />

              <input
                className="w-full rounded-xl border px-4 py-3"
                placeholder="Barrio"
                value={form.neighborhood}
                onChange={(e) => updateField("neighborhood", e.target.value)}
              />

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-green-700 py-3 font-bold text-white disabled:opacity-60"
              >
                {saving ? "Guardando..." : "Guardar perfil"}
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  )
}
