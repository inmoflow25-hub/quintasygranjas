"use client"

import Link from "next/link"

export default function SuccessPage() {

  const whatsappLink =
    "https://wa.me/5491133614865?text=Hola%20acabo%20de%20hacer%20un%20pedido%20en%20Quintas%20y%20Granjas"

  return (
    <main className="min-h-screen flex items-center justify-center bg-green-50 px-6">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-lg p-10 text-center">

        <h1 className="text-3xl font-bold text-green-700 mb-4">
          Pedido confirmado 🎉
        </h1>

        <p className="text-gray-600 mb-6">
          Recibimos tu pago correctamente.
          <br />
          Tu caja comenzará a enviarse en la próxima entrega semanal.
        </p>

        <div className="space-y-4">

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

      </div>
    </main>
  )
}
