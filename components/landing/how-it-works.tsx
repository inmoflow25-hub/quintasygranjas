import Image from "next/image"

const steps = [
  {
    number: "01",
    title: "Elegís tu caja",
    description:
      "Seleccionás la caja que querés según lo que necesites para tu semana.",
    image: "/images/step-choose.jpg"
  },
  {
    number: "02",
    title: "Pagás de forma segura",
    description:
      "Realizás el pago online de forma rápida y segura.",
    image: "/images/step-prepare.jpg"
  },
  {
    number: "03",
    title: "Recibís tu pedido en tu casa",
    description:
      "Te llevamos la caja directamente a tu domicilio, lista para disfrutar.",
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
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            Elegís tu caja, pagás online y la recibís en tu casa sin complicaciones.
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
                  <span className="text-sm font-bold text-primary-foreground">
                    {step.number}
                  </span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-foreground mb-2">
                {step.title}
              </h3>

              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
