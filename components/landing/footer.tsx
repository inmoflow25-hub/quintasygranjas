import { MessageCircle, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import AppBrand from "@/components/app/app-brand"

interface FooterProps {
  onWhatsAppClick: () => void
}

export function Footer({ onWhatsAppClick }: FooterProps) {
  return (
    <footer className="bg-[#06150a] py-16">
      <div className="container mx-auto px-4">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <AppBrand
              href="/"
              iconClassName="h-10 w-10"
              logoClassName="h-14 w-auto"
            />

            <p className="mt-4 leading-relaxed text-white/70">
              Cajas semanales con frutas, verduras, frutos secos y productos de
              granja directo a tu casa.
            </p>
          </div>

          <div>
            <h4 className="mb-4 flex items-center gap-2 font-bold text-white">
              <MapPin className="h-5 w-5" />
              Zona de entrega
            </h4>

            <p className="leading-relaxed text-white/70">
              Cubrimos toda{" "}
              <span className="font-medium text-white">CABA NORTE</span> y{" "}
              <span className="font-medium text-white">
                Gran Buenos Aires NORTE
              </span>
              .
              <br />
              Coordinamos la entrega según tu ubicación.
            </p>

            <p className="mt-3 text-sm text-white/50">
              Consultanos para confirmar tu zona.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-bold text-white">¿Tenés dudas?</h4>

            <p className="mb-4 text-white/70">
              Escribinos por WhatsApp y te ayudamos a elegir tu caja.
            </p>

            <Button
              onClick={() => {
                window.open(
                  "https://wa.me/5491168303596?text=Hola%20quiero%20información%20sobre%20las%20cajas%20de%20Quintas%20y%20Granjas",
                  "_blank"
                )
              }}
              className="bg-[#25D366] text-white hover:bg-[#25D366]/90"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              WhatsApp
            </Button>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-center">
          <p className="text-sm text-white/50">
            © {new Date().getFullYear()} Quintas y Granjas. Todos los derechos
            reservados.{" "}
            <a href="/privacy" className="underline hover:opacity-80">
              Privacidad
            </a>{" "}
            |{" "}
            <a href="/terms" className="underline hover:opacity-80">
              Términos
            </a>
            . Desarrollado por{" "}
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
