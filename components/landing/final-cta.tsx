import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"

interface FinalCTAProps {
  onWhatsAppClick: () => void
}

export function FinalCTA({ onWhatsAppClick }: FinalCTAProps) {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground text-balance">
            Probá tu primera caja esta semana
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Reservá ahora y recibí productos frescos de la quinta directo en tu casa
          </p>
          <Button 
            size="lg"
            onClick={()=>{
              window.open(
                "https://wa.me/5491168303596?text=Hola%20quiero%20recibir%20una%20caja%20de%20Quintas%20y%20Granjas",
                "_blank"
              )
            }}
            className="mt-8 bg-[#25D366] hover:bg-[#25D366]/90 text-white text-lg px-10 py-7 rounded-full"
          >
            <MessageCircle className="mr-2 h-6 w-6" />
            Reservar por WhatsApp
          </Button>
        </div>
      </div>
    </section>
  )
}
