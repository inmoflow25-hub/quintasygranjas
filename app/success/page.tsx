"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

declare global {
  interface Window {
    fbq: any
  }
}

export default function SuccessPage() {
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    notes: ""
  })

  const whatsappLink =
    "https://wa.me/5491133614865?text=Hola%20acabo%20de%20hacer%20un%20pedido%20en%20Quintas%20y%20Granjas"

  // 🔥 PIXEL
  useEffect(() => {
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "Purchase", {
        value: 18000,
        currency: "ARS"
      })
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const validate = () => {
    if (!form.name) return "Falta nombre"
    if (!form.email) return "Falta email"
    if (!form.phone) return "Falta teléfono"
    if (!form.address) return "Falta dirección"
    if (!form.city) return "Falta ciudad"
    return null
  }

  const saveData = async () => {
    const errorMsg = validate()
    if (errorMsg) {
      alert(errorMsg)
      return
    }

    setLoading(true)

    // 👤 UPSERT USER POR EMAIL
    let { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("email", form.email)
      .maybeSingle()

    if (!user) {
      const { data: newUser } = await supabase
        .from("users")
        .insert({
          email: form.email
        })
        .select()
        .single()

      user = newUser
    }

    // 👤 PROFILE
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        name: form.name,
        phone: form.phone
      })

    if (profileError) {
      console.error("PROFILE ERROR", profileError)
      alert("Error guardando perfil")
      setLoading(false)
      return
    }

    // 📍 ADDRESS
    const { error: addressError } = await supabase
      .from("addresses")
      .upsert(
        {
          user_id: user.id,
          address: form.address,
          city: form.city,
          notes: form.notes,
          phone: form.phone
        },
        {
          onConflict: "user_id"
        }
      )

    if (addressError) {
      console.error("ADDRESS ERROR", addressError)
      alert("Error guardando dirección")
      setLoading(false)
      return
    }

    setSaved(true)
    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-green-50 px-6">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-lg p-10 text-center">
        <h1 className="text-3xl font-bold text-green-700 mb-4">
          Pedido confirmado 🎉
        </h1>

        <p className="text-gray-600 mb-6">
          Recibimos tu pago correctamente.
        </p>

        {!saved && (
          <div className="space-y-4 text-left">
            <input
              name="name"
              placeholder="Nombre completo *"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3"
            />

            <input
              name="email"
              placeholder="Email *"
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3"
            />

            <input
              name="phone"
              placeholder="Teléfono / WhatsApp *"
              value={form.phone}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3"
            />

            <input
              name="address"
              placeholder="Dirección completa *"
              value={form.address}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3"
            />

            <input
              name="city"
              placeholder="Barrio / Ciudad *"
              value={form.city}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3"
            />

            <textarea
              name="notes"
              placeholder="Indicaciones (portón, timbre, etc)"
              value={form.notes}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3"
            />

            <button
              onClick={saveData}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition"
            >
              {loading ? "Guardando..." : "Guardar datos de entrega"}
            </button>
          </div>
        )}

        {saved && (
          <div className="space-y-6">
            <p className="text-green-700 font-semibold">
              ✅ Datos guardados correctamente
            </p>

            <p className="text-gray-600 text-sm">
              Te vamos a contactar para coordinar la entrega.
            </p>

            <a
              href={whatsappLink}
              target="_blank"
              className="block w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition"
            >
              Contactar por WhatsApp
            </a>

            <Link
              href="/"
              className="block w-full border border-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-100 transition"
            >
              Volver al inicio
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
