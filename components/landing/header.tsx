import AppBrand from "@/components/app/app-brand"

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
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-[#0f3d22]/10 bg-[#fff8f0]/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <AppBrand href="/" logoClassName="h-20 w-auto" />

        <nav className="hidden items-center gap-8 md:flex">
          <a
            href={tiendaHref}
            className="text-base font-semibold text-[#06150a]/75 transition-colors hover:text-[#06150a]"
          >
            Tienda
          </a>

          <a
            href={zonasHref}
            className="text-base font-semibold text-[#06150a]/75 transition-colors hover:text-[#06150a]"
          >
            Zonas de entrega
          </a>

          <a
            href={ctaHref}
            className="rounded-full bg-[#06150a] px-6 py-3 text-base font-bold text-white transition hover:bg-[#0f3d22]"
          >
            {ctaLabel}
          </a>
        </nav>
      </div>
    </header>
  )
}
