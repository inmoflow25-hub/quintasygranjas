"use client"

export function DeliveryZones() {
  const whatsappLink =
    "https://wa.me/5491133614865?text=Hola%20quiero%20coordinar%20una%20entrega"

  return (
    <section id="zonas" className="py-24 bg-card">
      <div className="container mx-auto px-4 text-center max-w-5xl">

        <h2 className="text-3xl md:text-4xl font-bold">
          Entregamos en tu zona
        </h2>

        <p className="mt-4 text-lg text-muted-foreground">
          Cubrimos toda CABA y Gran Buenos Aires
        </p>

        {/* MAPA */}
        <div className="mt-12 rounded-2xl overflow-hidden border shadow-sm bg-white">
          <img
            src="/mapa-zona.jpg"
            alt="Zonas de entrega CABA y GBA"
            className="w-full h-[400px] object-contain"
          />
        </div>

        <p className="mt-8 text-muted-foreground">
          Coordinamos la entrega directamente por WhatsApp según tu ubicación
        </p>

        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-6 px-8 py-4 bg-primary text-white rounded-xl font-semibold hover:opacity-90 transition"
        >
          Consultar entrega
        </a>

      </div>
    </section>
  )
}
