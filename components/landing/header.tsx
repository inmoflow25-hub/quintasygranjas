type HeaderProps = {
  tiendaHref?: string
  zonasHref?: string
  ctaHref?: string
  ctaLabel?: string
}

export function Header({
  tiendaHref = "/#cart",
  zonasHref = "/zona-norte",
  ctaHref = "/#cart",
  ctaLabel = "Pedí ahora"
}: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#e8e1d6] bg-[#fff8f0]/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <a href="/" className="flex items-center">
          <img
            src="/brand/qyg-logo.svg"
            alt="Quintas y Granjas"
            className="h-14 w-auto"
          />
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          <a
            href={tiendaHref}
            className="text-sm font-semibold text-[#12351f] transition-colors hover:text-[#1f7a3a]"
          >
            Tienda
          </a>

          <a
            href={zonasHref}
            className="text-sm font-semibold text-[#12351f] transition-colors hover:text-[#1f7a3a]"
          >
            Zonas de entrega
          </a>

          <a
            href={ctaHref}
            className="rounded-full bg-[#12351f] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#1f7a3a]"
          >
            {ctaLabel}
          </a>
        </nav>
      </div>
    </header>
  )
}
