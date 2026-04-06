import { Leaf, MessageCircle, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FooterProps {
  onWhatsAppClick: () => void
}

export function Footer({ onWhatsAppClick }: FooterProps) {
  return (
    <footer className="bg-foreground py-16">
      <div className="container mx-auto px-4">

        <div className="grid md:grid-cols-3 gap-12">

          {/* BRAND */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Leaf className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-background">
                Quintas y Granjas
              </span>
            </div>

            <p className="text-background/70 leading-relaxed">
              Cajas semanales con frutas, verduras y productos de granja directo a tu casa.
            </p>
          </div>

          {/* ZONA (NUEVO) */}
          <div>
            <h4 className="text-background font-bold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Zona de entrega
            </h4>

            <p className="text-background/70 leading-relaxed">
              Cubrimos toda <span className="text-background font-medium">CABA</span> y{" "}
              <span className="text-background font-medium">Gran Buenos Aires</span>.
              <br />
              Coordinamos la entrega según tu ubicación.
            </p>

            <p className="text-background/50 text-sm mt-3">
              Consultanos para confirmar tu zona.
            </p>
          </div>

          {/* CTA */}
          <div>
            <h4 className="text-background font-bold mb-4">
              ¿Tenés dudas?
            </h4>

            <p className="text-background/70 mb-4">
              Escribinos por WhatsApp y te ayudamos a elegir tu caja
            </p>

            <Button
              onClick={() => {
                window.open(
                  "https://wa.me/5491168303596?text=Hola%20quiero%20información%20sobre%20las%20cajas%20de%20Quintas%20y%20Granjas",
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

        {/* COPYRIGHT */}
        <div className="mt-12 pt-8 border-t border-background/10 text-center">
          <p className="text-background/50 text-sm">
            © {new Date().getFullYear()} Quintas y Granjas. Todos los derechos reservados.{" "}
            <a href="/privacy" className="underline hover:opacity-80">Privacidad</a>{" "}|
            {" "}<a href="/terms" className="underline hover:opacity-80">Términos</a>. Desarrollado por{" "}
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
