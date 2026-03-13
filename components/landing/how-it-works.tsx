import Image from "next/image"

const steps = [
  {
    number: "01",
    title: "Elegís tu caja",
    description: "Seleccionás el tipo de caja semanal que querés recibir.",
    image: "/images/step-choose.jpg"
  },
  {
    number: "02",
    title: "Armamos el pedido",
    description: "Recoletamos productos frescos para vos directamente de quintas y granjas.",
    image: "/images/step-prepare.jpg"
  },
  {
    number: "03",
    title: "Llega a tu casa",
    description: "Entrega semanal directa a domicilio.",
    image: "/images/step-delivery.jpg"
  }
]

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
            Cómo funciona
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            En tres simples pasos, tenés productos frescos de la quinta en tu mesa
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="group">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-6">
                <Image
                  src={step.image}
                  alt={step.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-foreground">{step.number}</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
