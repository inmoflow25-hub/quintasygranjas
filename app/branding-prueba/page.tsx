import { Mali } from "next/font/google"

const mali = Mali({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

export default function BrandingPruebaPage() {
  return (
    <main className={`${mali.className} min-h-screen bg-[#fff8f0] text-[#06150a]`}>
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <a href="/branding-prueba" className="flex items-center gap-4">
          <img
            src="/brand/qyg-logo.svg"
            alt="Quintas y Granjas"
            className="h-16 w-auto"
          />
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#productos" className="text-base font-semibold text-[#06150a]/75">
            Tienda
          </a>

          <a href="#zonas" className="text-base font-semibold text-[#06150a]/75">
            Zonas
          </a>

          <a
            href="#comprar"
            className="rounded-full bg-[#06150a] px-6 py-3 text-base font-bold text-white"
          >
            Pedí ahora
          </a>
        </nav>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 pb-20 pt-8 md:grid-cols-[1fr_0.9fr] md:items-center">
        <div>
          <div className="mb-5 inline-flex items-center gap-3 rounded-full bg-[#e7f2df] px-4 py-2 text-base font-bold text-[#0f3d22]">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
              <img
                src="/logho quintas nuevo.svg"
                alt=""
                className="h-6 w-6 object-contain"
              />
            </span>

            <span>Fresco · simple · directo a tu casa</span>
          </div>

          <h1 className="max-w-3xl text-5xl font-bold leading-[1.02] tracking-tight md:text-7xl">
            Alimentos reales para comer mejor todos los días.
          </h1>

          <p className="mt-6 max-w-xl text-xl font-medium leading-relaxed text-[#06150a]/70">
            Frutas, verduras, productos de granja y alimentos saludables,
            seleccionados para que armes tu pedido desde el celular.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#comprar"
              className="rounded-2xl bg-[#0f3d22] px-7 py-4 text-center text-lg font-bold text-white shadow-sm"
            >
              Armar mi pedido
            </a>

            <a
              href="/app"
              className="rounded-2xl border border-[#0f3d22]/20 bg-white px-7 py-4 text-center text-lg font-bold text-[#0f3d22]"
            >
              Entrar a la app
            </a>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] bg-white p-3 shadow-xl">
          <img
            src="https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/FOTO%20CAJAVEGGIE.png"
            alt="Caja de frutas y verduras Quintas y Granjas"
            className="h-[520px] w-full rounded-[1.5rem] object-cover"
          />
        </div>
      </section>
    </main>
  )
}
