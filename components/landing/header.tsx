export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <img
              src="/logho quintas nuevo.svg"
              alt="Quintas y Granjas"
              className="h-8 w-auto"
            />
          </div>

          <span className="text-xl font-bold text-foreground tracking-tight">
            Quintas y Granjas
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#cart"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Tienda
          </a>

          <a
            href="#zonas"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Zonas de entrega
          </a>

          <a
            href="#final-cta"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Pedí ahora
          </a>
        </nav>
      </div>
    </header>
  )
}
