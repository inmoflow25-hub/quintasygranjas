import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface HeroProps {
  onWhatsAppClick: () => void
}

export function Hero({ onWhatsAppClick }: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center pt-16">
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-box.jpg"
          alt="Caja de verduras frescas"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight text-balance">
            Caja semanal directo de la quinta
          </h1>

          <p className="mt-6 text-lg md:text-xl text-white/90 leading-relaxed max-w-xl">
            Frutas, verduras y productos de granja entregados en tu casa todas las semanas. Sin supermercado. Sin filas. Sin perder tiempo.
          </p>

          <div className="mt-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-4 md:p-5 max-w-xl">
            <p className="text-sm md:text-base text-white leading-relaxed">
              <span className="font-semibold">Comprás hoy tu primera caja a precio promocional.</span>{" "}
              A los <span className="font-semibold">7 días</span> activamos tu{" "}
              <span className="font-semibold">suscripción mensual automática</span> para que recibas{" "}
              <span className="font-semibold">una caja por semana</span>, al{" "}
              <span className="font-semibold">precio regular</span> de la caja elegida.
            </p>
          </div>

          <div className="mt-4">
            <p className="text-sm text-white/80 max-w-xl">
              Transparencia total: hoy pagás solo la primera caja. Luego recibís 4 entregas semanales y se debita una vez por mes.
            </p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6"
              onClick={() => {
                document.getElementById("cajas")?.scrollIntoView({ behavior: "smooth" })
              }}
            >
              Elegir caja
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <Button
              size="lg"
              className="bg-primary text-white hover:bg-primary/90 text-lg px-8 py-6"
              onClick={() => {
                document.getElementById("como-funciona")?.scrollIntoView({ behavior: "smooth" })
              }}
            >
              Cómo funciona
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
