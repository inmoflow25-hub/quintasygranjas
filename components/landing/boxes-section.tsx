"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Check } from "lucide-react"

interface BoxesSectionProps {
  onSelectBox: (boxType: "veggie" | "campo" | "granja") => void
}

const boxes = [
  { id: "veggie" as const, name: "Caja Veggie", price: "$27.800", image: "/images/caja-veggie.jpg", features: ["..."], popular: false },
  { id: "campo" as const, name: "Caja Campo", price: "$47.400", image: "/images/caja-campo.jpg", features: ["..."], popular: true },
  { id: "granja" as const, name: "Caja Granja", price: "$56.800", image: "/images/caja-granja.jpg", features: ["..."], popular: false }
]

export function BoxesSection({ onSelectBox }: BoxesSectionProps) {

  // 🔥 ACA VA, AFUERA DEL RETURN
  const handleBuy = (boxId: "veggie" | "campo" | "granja") => {
    onSelectBox(boxId)
  }

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
              <Button onClick={() => handleBuy(box.id)}>
                Comprar
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  )
}
