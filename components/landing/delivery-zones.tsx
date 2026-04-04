import { MapPin } from "lucide-react"

export function DeliveryZones() {
  const whatsappLink =
    "https://wa.me/5491133614865?text=Hola%20quiero%20coordinar%20una%20entrega"

  return (
    <section id="zonas" className="py-24 bg-card">
      <div className="container mx-auto px-4">

        <div className="max-w-5xl mx-auto text-center">

          {/* ICONO */}
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-8 h-8 text-primary" />
          </div>

          {/* TITULO */}
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Entregamos en tu zona
          </h2>

          <p className="mt-4 text-lg text-muted-foreground">
            Cubrimos toda CABA y Gran Buenos Aires
          </p>

          {/* MAPA */}
          <div className="mt-12 rounded-2xl overflow-hidden border shadow-sm">
            <iframe
              src="https://www.google.com/maps?q=Buenos+Aires&output=embed"
              className="w-full h-[400px]"
              loading="lazy"
            />
            
            {/* OVERLAY */}
            <div className="absolute inset-0 bg-primary/10 pointer-events-none" />
          </div>

          {/* TEXTO SIMPLE */}
          <p className="mt-8 text-muted-foreground max-w-xl mx-auto">
            Coordinamos la entrega directamente por WhatsApp según tu ubicación.
          </p>

          {/* CTA */}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-6 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition"
          >
            Consultar entrega
          </a>

        </div>
      </div>
    </section>
  )
}
