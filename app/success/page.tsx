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
  const [boxId, setBoxId] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get("external_reference")
    setBoxId(ref)
  }, [])
  
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

  // 🔥 PIXEL CORRECTO (DINÁMICO)
  useEffect(() => {
    if (!boxId) return

    const priceMap: any = {
      "dff394c8-6a17-45e8-ba3f-960c27f8d76c": 27800,
      "d9c75e5b-3e8b-4d3d-9776-d65ad9afae1d": 47400,
      "d5b70577-a2b7-47d7-9ccd-e2f336e25af7": 56800
    }

    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "Purchase", {
        value: priceMap[boxId],
        currency: "ARS"
      })
    }
  }, [boxId])

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

    // 🔥 CREAR USER SI NO EXISTE
    if (!user) {
      const userId = crypto.randomUUID()

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

    if (!user?.id) {
      alert("Error de usuario")
      setLoading(false)
      return
    }

    // 🔥 PROFILE
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        name: form.name,
        phone: form.phone
      })

    if (profileError) {
      console.error(profileError)
      alert("Error guardando perfil")
      setLoading(false)
      return
    }

    // 🔥 ADDRESS
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
        { onConflict: "user_id" }
      )

    if (addressError) {
      console.error(addressError)
      alert("Error guardando dirección")
      setLoading(false)
      return
    }

    // 🔥 VALIDAR BOX (VIENE DE MP)
    if (!boxId) {
      alert("No llegó el producto desde MercadoPago")
      setLoading(false)
      return
    }

    // 🔥 PRECIOS
    const priceMap: any = {
      "dff394c8-6a17-45e8-ba3f-960c27f8d76c": 27800,
      "d9c75e5b-3e8b-4d3d-9776-d65ad9afae1d": 47400,
      "d5b70577-a2b7-47d7-9ccd-e2f336e25af7": 56800
    }

    // 🔥 CREAR ORDER
    const { error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        box_id: boxId,
        price: priceMap[boxId],
        status: "paid"
      })

    if (orderError) {
      console.error(orderError)
      alert("Error creando orden")
      setLoading(false)
      return
    }

    setLoading(false)
    setSaved(true)

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

