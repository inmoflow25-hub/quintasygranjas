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
      "1 pollo fresco entero organico"
    ],
    popular: true
  },
  {
    id: "granja" as const,
    name: "Caja Granja",
    price: "$56.800",
    image: "/images/caja-granja.jpg",
    benefit:
      "Nutrición completa para toda la familia.",
    features: [
      "1 zapallo anco",
      "papa negra 2 kg",
      "30 huevos",
      "pollo",
      "miel",
      "pan"
    ],
    popular: false
  }
]

export function BoxesSection({ onSelectBox }: BoxesSectionProps) {
  return (
    <section className="py-24">
      <div className="grid md:grid-cols-3 gap-8">
        {boxes.map((box) => (
          <Card key={box.id}>
            <CardHeader>
              <h3>{box.name}</h3>
              <p>{box.price}</p>
            </CardHeader>

            <CardContent>
              {box.features.map((f, i) => (
                <div key={i}>{f}</div>
              ))}
            </CardContent>

            <CardFooter>
              <Button onClick={() => onSelectBox(box.id)}>
                Comprar
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  )
}
