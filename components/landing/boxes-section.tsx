import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Check } from "lucide-react"

interface BoxesSectionProps {
  onSelectBox: (boxType: "veggie" | "campo" | "granja") => void
}

const boxes = [
  {
    id: "veggie" as const,
    name: "Caja Veggie",
    subtitle: "🟢 Para 1 persona",
    price: "$19.900",
    image: "/images/caja-veggie.jpg",
    features: [
      "8–9kg de frutas y verduras de estación",
      "Productos frescos para tu consumo diario",
      "Tomate, papa, cebolla, zanahoria y hojas frescas",
      "Incluye frutas de estación",
      "✔ Ideal si comprás solo para vos",
      "✔ Rinde varios días sin desperdicio"
    ],
    popular: false
  },
  {
    id: "campo" as const,
    name: "Caja Campo",
    subtitle: "🟡 Para 2 personas",
    price: "$33.900",
    image: "/images/caja-campo.jpg",
    features: [
      "Todo lo de la Caja Veggie",
      "1 maple de huevos de campo (30)",
      "1 pollo entero fresco (~2kg)",
      "Más cantidad y variedad para la semana",
      "✔ Perfecta para dos personas",
      "✔ Ideal si querés cocinar y tener stock"
    ],
    popular: true
  },
  {
    id: "granja" as const,
    name: "Caja Granja",
    subtitle: "🔵 Para familia",
    price: "$40.575",
    image: "/images/caja-granja.jpg",
    features: [
      "Todo lo de la Caja Campo",
      "Pan de campo artesanal",
      "Miel natural cruda (500g)",
      "Mayor cantidad y variedad",
      "✔ Ideal para familias",
      "✔ Pensada para toda la semana"
    ],
    popular: false
  }
]

export function BoxesSection({ onSelectBox }: BoxesSectionProps) {
  return (
    <section id="cajas" className="py-24 bg-background">
      <div className="container mx-auto px-4">

        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Elegí tu caja
          </h2>

          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            Comprás tu caja online y la recibís en tu casa. Simple.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {boxes.map((box) => (
            <Card
              key={box.id}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                box.popular ? "border-primary border-2 scale-105" : "border-border"
              }`}
            >
              {box.popular && (
                <div className="absolute top-4 right-4 z-10 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                  Más elegida
                </div>
              )}

              <div className="relative aspect-[4/3]">
                <Image
                  src={box.image}
                  alt={box.name}
                  fill
                  className="object-cover"
                />
              </div>

             <CardHeader className="pb-2">
  <h3 className="text-xl font-bold text-foreground">{box.name}</h3>

  {/* 👇 ACA VA */}
  <p className="text-sm text-muted-foreground">{box.subtitle}</p>

  <p className="text-3xl font-bold text-primary">{box.price}</p>
</CardHeader>

              <CardContent className="pb-4">
                <ul className="space-y-3">
                  {box.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="flex flex-col gap-3">
                <Button
                  className={`w-full py-6 text-lg ${
                    box.popular
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                      : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                  }`}
                  onClick={() => onSelectBox(box.id)}
                >
                  Comprar caja
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
