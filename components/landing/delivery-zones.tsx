import { MapPin } from "lucide-react"

const zonaNorte = [
  "Vicente López",
  "San Isidro",
  "Tigre",
  "Nordelta",
  "Benavídez",
  "Ingeniero Maschwitz",
  "Escobar"
]

const caba = [
  "Palermo",
  "Belgrano",
  "Recoleta",
  "Nuñez",
  "Colegiales"
]

export function DeliveryZones() {
  const whatsappLink =
    "https://wa.me/5491133614865?text=Hola%20quiero%20saber%20si%20entregan%20en%20mi%20zona"

  return (
    <section id="zonas" className="py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">

          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-8 h-8 text-primary" />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Zonas de entrega
          </h2>

          <p className="mt-4 text-lg text-muted-foreground">
            Entregamos semanalmente en dos zonas con días fijos
          </p>

          {/* ZONA NORTE */}
          <div className="mt-12">
            <h3 className="text-xl font-semibold text-foreground">
              Zona Norte
            </h3>
         

            <div className="flex flex-wrap justify-center gap-3">
              {zonaNorte.map((zone) => (
                <span
                  key={zone}
                  className="px-5 py-3 bg-secondary rounded-full text-secondary-foreground font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {zone}
                </span>
              ))}
            </div>
          </div>

          {/* CABA */}
          <div className="mt-12">
            <h3 className="text-xl font-semibold text-foreground">
              Capital Federal
            </h3>
          

            <div className="flex flex-wrap justify-center gap-3">
              {caba.map((zone) => (
                <span
                  key={zone}
                  className="px-5 py-3 bg-secondary rounded-full text-secondary-foreground font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {zone}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <p className="mt-10 text-muted-foreground">
            ¿Tu zona no está en la lista? Expandimos cada semana{" "}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-medium hover:underline"
            >
              Consultanos
            </a>
          </p>

        </div>
      </div>
    </section>
  )
}
