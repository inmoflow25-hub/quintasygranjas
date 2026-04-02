import { Leaf, Heart, Zap } from "lucide-react"

interface BoxBenefitsProps {
  type: "veggie" | "campo" | "granja"
}

const benefitsContent = {
  veggie: {
    icon: Leaf,
    text: "Alta en fibra, vitaminas y antioxidantes. Ideal para fortalecer el sistema inmune, mejorar la digestión y mantener una alimentación liviana y natural."
  },
  campo: {
    icon: Zap,
    text: "Equilibrio perfecto entre vegetales y proteínas. Aporta energía sostenida, proteínas de calidad y nutrientes esenciales para una alimentación completa."
  },
  granja: {
    icon: Heart,
    text: "Nutrición completa para toda la familia. Combina proteínas, grasas saludables y alimentos naturales que ayudan a fortalecer el organismo y mantener una dieta balanceada."
  }
}

export function BoxBenefits({ type }: BoxBenefitsProps) {
  const content = benefitsContent[type]
  const Icon = content.icon

  return (
    <div className="bg-secondary/40 rounded-lg p-4 border border-border">
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 text-primary mt-1 shrink-0" />
        <p className="text-sm text-muted-foreground leading-relaxed">
          {content.text}
        </p>
      </div>
    </div>
  )
}
