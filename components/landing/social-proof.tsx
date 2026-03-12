import { Users, Truck, Leaf } from "lucide-react"

const stats = [
  {
    icon: Users,
    value: "+247",
    label: "Familias confían en nosotros"
  },
  {
    icon: Truck,
    value: "+1.200",
    label: "Cajas entregadas"
  },
  {
    icon: Leaf,
    value: "100%",
    label: "Productos frescos"
  }
]

export function SocialProof() {
  return (
    <section className="py-24 bg-primary">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground text-center text-balance">
          +247 familias ya reciben su caja semanal
        </h2>
        
        <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary-foreground/10 flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-8 h-8 text-primary-foreground" />
              </div>
              <p className="text-4xl font-bold text-primary-foreground">{stat.value}</p>
              <p className="mt-2 text-primary-foreground/80">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
