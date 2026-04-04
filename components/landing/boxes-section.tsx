"use client"

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
    price: "$27.800",
    image: "/images/caja-veggie.jpg",
    benefit:
      "Rica en fibra, vitaminas y antioxidantes. Mejora la digestión y fortalece tus defensas.",
    features: [
      "1 zapallo anco",
      "papa negra 2 kg",
      "cebolla 1 kg y 1/2",
      "tomate 1/2 kg",
      "zanahoria 1/2 kg",
      "manzana 1/2 kg",
      "citricos (naranja + limon) 1 kg",
      "banana 1 kg",
      "lechuga 1 planta",
      "espinaca 2 atados",
      "ideal si compras solo para vos",
      "rinde muy bien sin desperdicio"
    ],
    popular: false
  },
  {
    id: "campo" as const,
    name: "Caja Campo",
    price: "$47.400",
    image: "/images/caja-campo.jpg",
    benefit:
      "Equilibrio entre vegetales y proteínas. Más energía, saciedad y nutrición completa.",
    features: [
      "1 zapallo anco",
      "papa negra 2 kg",
      "cebolla 1 kg y 1/2",
      "tomate 1/2 kg",
      "zanahoria 1/2 kg",
      "manzana 1/2 kg",
      "citricos (naranja + limon) 1 kg",
      "banana 1 kg",
      "lechuga 1 planta",
      "espinaca 2 atados",
      "30 huevos de campo",
      "1 pollo fresco entero organico",
      "perfecta para dos personas",
      "ideal si queres cocinar y tener stock"
    ],
    popular: true
  },
  {
    id: "granja" as const,
    name: "Caja Granja",
    price: "$56.800",
    image: "/images/caja-granja.jpg",
    benefit:
      "Nutrición completa para toda la familia. Proteínas, grasas saludables y alimentos reales.",
    features: [
      "1 zapallo anco",
      "papa negra 2 kg",
      "cebolla 1 kg y 1/2",
      "tomate 1/2 kg",
      "zanahoria 1/2 kg",
      "manzana 1/2 kg",
      "citricos (naranja + limon) 1 kg",
      "banana 1 kg",
      "lechuga 1 planta",
      "espinaca 2 atados",
      "30 huevos de campo",
      "1 pollo fresco entero organico",
      "1 kg de miel de abejas real pura",
      "1 pan de campo grande",
      "le agrega nutrientes a tus desayunos",
      "pensada para toda la familia"
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
                <div className="absolute top-4 right-4 z-20 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
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

                <div className="absolute inset-0 bg-black/40" />

                <div className="absolute bottom-0 p-4 text-white text-sm leading-snug">
                  {box.benefit}
                </div>
              </div>

              <CardHeader className="pb-2">
                <h3 className="text-xl font-bold text-foreground">{box.name}</h3>
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
