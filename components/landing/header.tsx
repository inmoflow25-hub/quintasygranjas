import { Leaf } from "lucide-react"

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Leaf className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">Quintas y Granjas</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a href="#como-funciona" className="text-muted-foreground hover:text-foreground transition-colors">
            Cómo funciona
          </a>
          <a href="#cajas" className="text-muted-foreground hover:text-foreground transition-colors">
            Cajas
          </a>
          <a href="#zonas" className="text-muted-foreground hover:text-foreground transition-colors">
            Zonas de entrega
          </a>
        </nav>
      </div>
    </header>
  )
}
