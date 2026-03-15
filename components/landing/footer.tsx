import { Leaf, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FooterProps {
  onWhatsAppClick: () => void
}

const zones = [
  "Vicente López",
  "San Isidro",
  "Tigre",
  "Nordelta",
  "Benavídez",
  "Ing. Maschwitz",
  "Escobar"
]

export function Footer({ onWhatsAppClick }: FooterProps) {
  return (
    <footer className="bg-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Leaf className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-background">Quintas y Granjas</span>
            </div>
            <p className="text-background/70 leading-relaxed">
              Cajas semanales con frutas, verduras y productos de granja directo a tu casa.
            </p>
          </div>

          <div>
            <h4 className="text-background font-bold mb-4">Zonas de entrega</h4>
            <ul className="space-y-2">
              {zones.map((zone) => (
                <li key={zone} className="text-background/70">{zone}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-background font-bold mb-4">¿Tenés dudas?</h4>
            <p className="text-background/70 mb-4">
              Escribinos por WhatsApp y te ayudamos a elegir tu caja
            </p>
            <Button 
              onClick={()=>{
                window.open(
                  "https://wa.me/5491133614865?text=Hola%20quiero%20información%20sobre%20las%20cajas%20de%20Quintas%20y%20Granjas",
                  "_blank"
                )
              }}
              className="bg-[#25D366] hover:bg-[#25D366]/90 text-white"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              WhatsApp
            </Button>
          </div>
        </div>

       <div className="mt-12 pt-8 border-t border-background/10 text-center">
  <p className="text-background/50 text-sm">
    © {new Date().getFullYear()} Quintas y Granjas. Todos los derechos reservados. Desarrollado por{" "}
    <a
      href="https://jmfullstack.com"
      target="_blank"
      rel="noopener noreferrer"
      className="underline hover:opacity-80"
    >
      jmfullstack.com
    </a>
  </p>
</div>

      </div>
    </footer>
  )
}
