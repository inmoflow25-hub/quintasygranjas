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
    try {
      const errorMsg = validate()
      if (errorMsg) {
        alert(errorMsg)
        return
      }

      setLoading(true)

      // 🔍 buscar usuario
      const { data: existingUser, error: findError } = await supabase
        .from("users")
        .select("*")
        .eq("email", form.email)
        .maybeSingle()

      if (findError) {
        console.error(findError)
        alert("Error buscando usuario")
        setLoading(false)
        return
      }

      let user = existingUser
      let userId = existingUser?.id

      // 👤 crear usuario si no existe
      if (!user) {
        userId = crypto.randomUUID()

        const { data: newUser, error: insertError } = await supabase
          .from("users")
          .insert({
            id: userId,
            email: form.email
          })
          .select()
          .single()

        if (insertError || !newUser) {
          console.error(insertError)
          alert("Error creando usuario")
          setLoading(false)
          return
        }

        user = newUser
      }

      if (!userId) {
        alert("Error de usuario")
        setLoading(false)
        return
      }

      // 👤 PROFILE (SIN ID!)
      const { error: profileError } = await supabase
.from("profiles")
.insert({
  id: userId, 
  name: form.name,
  email: form.email,
  phone: form.phone,
  address: form.address,
  city: form.city
})

      if (profileError) {
        console.error(profileError)
        alert("Error guardando perfil")
        setLoading(false)
        return
      }

      // 📦 ADDRESS
      const { error: addressError } = await supabase
        .from("addresses")
        .upsert(
          {
            user_id: userId,
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
        console.error(addressError)
        alert("Error guardando dirección")
        setLoading(false)
        return
      }

      // 🧾 UPDATE ORDER
      const { error: orderUpdateError } = await supabase
        .from("orders")
        .update({
          status: "confirmed",
          price: 0 // opcional
        })
        .eq("status", "paid")
        .order("created_at", { ascending: false })
        .limit(1)

      if (orderUpdateError) {
        console.error("ORDER UPDATE ERROR", orderUpdateError)
      }

      setSaved(true)
      setLoading(false)

    } catch (err) {
      console.error(err)
      alert("Error inesperado")
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-green-50 px-6">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-lg p-10 text-center">

        <h1 className="text-3xl font-bold text-green-700 mb-4">
          Pedido confirmado 🎉
        </h1>

        {!saved && (
          <>
            <div className="mb-6 space-y-2">
              <p className="text-gray-600">
                Recibimos tu pago correctamente.
              </p>

              <p className="text-red-600 font-medium text-sm">
                ⚠️ Completá tus datos para poder enviarte la caja.
              </p>
            </div>

            <div className="space-y-4 text-left">
              <input name="name" placeholder="Nombre *" value={form.name} onChange={handleChange} className="w-full border rounded-xl px-4 py-3" />
              <input name="email" placeholder="Email *" value={form.email} onChange={handleChange} className="w-full border rounded-xl px-4 py-3" />
              <input name="phone" placeholder="Teléfono *" value={form.phone} onChange={handleChange} className="w-full border rounded-xl px-4 py-3" />
              <input name="address" placeholder="Dirección *" value={form.address} onChange={handleChange} className="w-full border rounded-xl px-4 py-3" />
              <input name="city" placeholder="Ciudad *" value={form.city} onChange={handleChange} className="w-full border rounded-xl px-4 py-3" />
              <textarea name="notes" placeholder="Notas" value={form.notes} onChange={handleChange} className="w-full border rounded-xl px-4 py-3" />

              <button
                onClick={saveData}
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold"
              >
                {loading ? "Guardando..." : "Guardar datos de entrega"}
              </button>
            </div>
          </>
        )}

        {saved && (
          <div className="space-y-6">
            <p className="text-green-700 font-semibold text-lg">
              ✅ Pedido confirmado y datos guardados
            </p>

            <a
              href={whatsappLink}
              target="_blank"
              className="block w-full bg-green-600 text-white py-3 rounded-xl"
            >
              WhatsApp
            </a>

            <Link
              href="/"
              className="block w-full border py-3 rounded-xl"
            >
              Volver
            </Link>
          </div>
        )}

      </div>
    </main>
  )
}
