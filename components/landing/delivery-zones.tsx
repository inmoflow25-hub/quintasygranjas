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

        <p className="mt-4 text-muted-foreground">
          Cubrimos toda CABA y Gran Buenos Aires
        </p>

        <div className="mt-12 rounded-2xl overflow-hidden border shadow-sm relative">
          <iframe
            src="https://www.google.com/maps?q=Buenos+Aires&output=embed"
            className="w-full h-[400px]"
            loading="lazy"
          />

          {/* Overlay verde */}
          <div className="absolute inset-0 bg-green-600/20 pointer-events-none" />
        </div>

        <p className="mt-8 text-muted-foreground">
          Coordinamos la entrega directamente por WhatsApp según tu ubicación
        </p>

        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-6 px-8 py-4 bg-primary text-white rounded-xl font-semibold"
        >
          Consultar entrega
        </a>

      </div>
    </section>
  )
}
