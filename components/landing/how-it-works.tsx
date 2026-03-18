import Image from "next/image"

const steps = [
  {
    number: "01",
    title: "Elegís tu caja y pagás la primera entrega",
    description:
      "Elegís una de las 3 cajas y pagás solo la primera entrega a precio promocional.",
    image: "/images/step-choose.jpg"
  },
  {
    number: "02",
    title: "Recibís tu caja y completás tus datos",
    description:
      "Después del pago, completás tu dirección y datos de entrega para organizar correctamente tus envíos semanales.",
    image: "/images/step-prepare.jpg"
  },
  {
    number: "03",
    title: "A los 7 días comienza tu suscripción",
    description:
      "Desde el séptimo día se activa el débito mensual automático al precio regular de tu caja, y recibís una entrega por semana.",
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
            Empezás con una primera caja promocional y, 7 días después, se activa tu suscripción automática para seguir recibiendo una caja por semana.
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

        <div className="mt-12 max-w-3xl mx-auto rounded-2xl border border-border bg-background p-6 text-center">
          <p className="text-sm md:text-base text-foreground leading-relaxed">
            <span className="font-semibold">Importante:</span> hoy pagás solo la primera caja promocional.
            Luego, a los 7 días, comienza el débito mensual automático correspondiente a{" "}
            <span className="font-semibold">4 entregas semanales</span> de la caja que elegiste, al{" "}
            <span className="font-semibold">precio regular</span>.
          </p>
        </div>
      </div>
    </section>
  )
}
