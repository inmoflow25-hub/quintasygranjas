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
    price: "$8.000",
    monthly: "$44.000",
    image: "/images/caja-veggie.jpg",
    features: [
      "8–9kg de frutas y verduras de estación",
      "Tomate, papa, cebolla, zanahoria y hojas frescas",
      "Incluye frutas de estación (manzana, banana y naranja)",
      "Productos frescos directo de la quinta",
      "Entrega semanal a domicilio"
    ],
    popular: false
  },
  {
    id: "campo" as const,
    name: "Caja Campo",
    price: "$14.000",
    monthly: "$56.000",
    image: "/images/caja-campo.jpg",
    features: [
      "Todo lo de la Caja Veggie",
      "1 maple de huevos de campo (30)",
      "1 pollo entero fresco de granja (~2kg)",
      "Entrega semanal a domicilio"
    ],
    popular: true
  },
  {
    id: "granja" as const,
    name: "Caja Granja",
    price: "$18.000",
    monthly: "$68.000",
    image: "/images/caja-granja.jpg",
    features: [
      "Todo lo de la Caja Campo",
      "1 pan de campo artesanal",
      "1 frasco de miel natural cruda (500g)",
      "Entrega semanal a domicilio"
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
            Elegí tu caja semanal
          </h2>

          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            Comprás hoy tu primera caja a precio promocional. A los 7 días se activa la suscripción mensual automática con entrega semanal.
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

                {/* PRECIO PROMO */}
                <p className="text-3xl font-bold text-primary">{box.price}</p>
                <span className="text-sm text-muted-foreground">
                  primera caja promocional
                </span>

                {/* PRECIO REAL */}
                <div className="mt-3 rounded-xl bg-muted px-3 py-3">
                  <p className="text-sm text-foreground leading-relaxed">
                    Luego, a los 7 días, comienza la suscripción mensual automática de{" "}
                    <span className="font-semibold">{box.monthly}</span> por mes,
                    con entrega semanal (4 cajas por mes).
                  </p>
                </div>
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
                <p className="text-xs text-muted-foreground text-center leading-relaxed">
                  Iniciás con una caja promocional. Luego recibís 4 entregas por mes y el cobro pasa a ser mensual automáticamente.
                </p>

                <Button
                  className={`w-full py-6 text-lg ${
                    box.popular
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                      : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                  }`}
                  onClick={() => onSelectBox(box.id)}
                >
                  Elegir caja
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
