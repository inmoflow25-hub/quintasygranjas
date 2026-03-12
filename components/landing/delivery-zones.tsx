import { MapPin } from "lucide-react"

const zones = [
  "Vicente López",
  "San Isidro",
  "Tigre",
  "Nordelta",
  "Benavídez",
  "Ingeniero Maschwitz",
  "Escobar"
]

export function DeliveryZones() {
  return (
    <section id="zonas" className="py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
            Zonas de entrega
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Entregamos semanalmente en zona norte del Gran Buenos Aires
          </p>
          
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            {zones.map((zone) => (
              <span 
                key={zone}
                className="px-5 py-3 bg-secondary rounded-full text-secondary-foreground font-medium hover:bg-primary hover:text-primary-foreground transition-colors cursor-default"
              >
                {zone}
              </span>
            ))}
          </div>

          <p className="mt-8 text-muted-foreground">
            ¿Tu zona no está en la lista? <span className="text-primary font-medium">Consultanos</span>
          </p>
        </div>
      </div>
    </section>
  )
}
