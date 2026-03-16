"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function SuccessPage() {

  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    notes: ""
  })

  const whatsappLink =
    "https://wa.me/5491133614865?text=Hola%20acabo%20de%20hacer%20un%20pedido%20en%20Quintas%20y%20Granjas"

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const saveData = async () => {

    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      alert("No se encontró usuario")
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        full_name: form.name,
        phone: form.phone,
        address: form.address,
        city: form.city,
        notes: form.notes
      })

    if (error) {
      console.error(error)
      alert("Error guardando datos")
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

        <p className="text-gray-600 mb-8">
          Recibimos tu pago correctamente.
          <br />
          Completá tus datos para coordinar la entrega de tu caja.
        </p>

        {!saved && (

          <div className="space-y-4 text-left">

            <input
              name="name"
              placeholder="Nombre completo"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3"
            />

            <input
              name="phone"
              placeholder="Teléfono / WhatsApp"
              value={form.phone}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3"
            />

            <input
              name="address"
              placeholder="Dirección de entrega"
              value={form.address}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3"
            />

            <input
              name="city"
              placeholder="Barrio / Ciudad"
              value={form.city}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3"
            />

            <textarea
              name="notes"
              placeholder="Indicaciones para la entrega (portón, timbre, etc)"
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
              Tu caja comenzará a enviarse en la próxima entrega semanal.
              <br />
              Si necesitás modificar algo podés escribirnos por WhatsApp.
            </p>

            <a
              href={whatsappLink}
              target="_blank"
              className="block w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition"
            >
              Contactar por WhatsApp
            </a>

            <Link
              href="/cuenta"
              className="block w-full bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-black transition"
            >
              Ir a mi cuenta
            </Link>

            <Link
              href="/"
              className="block w-full border border-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-100 transition"
            >
              Volver al inicio
            </Link>

            <p className="text-xs text-gray-500 pt-4">
              Desde tu cuenta podrás ver tus entregas, pedidos y gestionar tu suscripción.
            </p>

          </div>

        )}

      </div>

    </main>
  )
}
