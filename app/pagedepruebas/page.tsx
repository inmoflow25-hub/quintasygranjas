"use client"

import { Header } from "@/components/landing/header"
import { DeliveryZones } from "@/components/landing/delivery-zones"
import { Footer } from "@/components/landing/footer"
import Cart from "@/components/cart/cart"
import { ArrowRight, CheckCircle2, Truck, ShoppingBasket, Leaf } from "lucide-react"

export default function PageDePruebas() {
  function onWhatsAppClick() {
    window.open("https://wa.me/5491168303596", "_blank")
  }

  function scrollToCart() {
    document.getElementById("cart")?.scrollIntoView({ behavior: "smooth" })
  }

  function scrollToCategory(category: string) {
    const el = document.getElementById(`cat-${category}`)
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
    }
  }

  const categories = [
    { label: "Cajas", id: "cajas_armadas" },
    { label: "Verduras", id: "verduras" },
    { label: "Frutas", id: "frutas" },
    { label: "Frutos secos", id: "frutos_secos" },
    { label: "Granja", id: "otros" },
    { label: "Pollo", id: "pollo" },
    { label: "Congelados", id: "congelados" },
    { label: "Listas para horno", id: "comidas_listas_para_horno" }
  ]

  return (
    <main className="min-h-screen bg-background">
      <Header
        tiendaHref="/pagedepruebas#cart"
        zonasHref="/pagedepruebas#zonas"
        ctaHref="/pagedepruebas#cart"
        ctaLabel="Armar pedido"
      />

      {/* HERO CORTO */}
      <section className="relative overflow-hidden pt-24 pb-10 md:pt-28 md:pb-14 bg-[#102719] text-white">
        <div className="absolute inset-0 opacity-25">
          <img
            src="https://pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev/CAJA%20CAMPO.png"
            alt="Caja Quintas y Granjas"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/40" />

        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-lg">
              <Leaf className="h-4 w-4" />
              10% OFF en tu primera compra
            </div>

            <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
              Armá tu pedido de frutas, verduras y productos de granja
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/90 md:text-xl">
              Elegí una caja lista o sumá productos uno por uno. Envío gratis en CABA Norte y GBA Norte.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={scrollToCart}
                className="inline-flex items-center justify-center rounded-xl bg-primary px-7 py-4 text-base font-bold text-primary-foreground transition hover:opacity-90"
              >
                Ver productos
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>

              <a
                href="https://wa.me/5491168303596"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-7 py-4 text-base font-bold text-white backdrop-blur transition hover:bg-white/20"
              >
                Consultar por WhatsApp
              </a>
            </div>
          </div>

          {/* BENEFICIOS COMPACTOS */}
          <div className="mt-9 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <Truck className="mb-2 h-5 w-5 text-green-300" />
              <p className="font-bold">Envío gratis</p>
              <p className="text-sm text-white/75">CABA Norte y GBA Norte</p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <ShoppingBasket className="mb-2 h-5 w-5 text-green-300" />
              <p className="font-bold">Pedido mínimo $20.000</p>
              <p className="text-sm text-white/75">Armá tu caja como quieras</p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <CheckCircle2 className="mb-2 h-5 w-5 text-green-300" />
              <p className="font-bold">10% OFF inicial</p>
              <p className="text-sm text-white/75">Se aplica en tu primera compra</p>
            </div>
          </div>
        </div>
      </section>

      {/* BARRA DE CATEGORÍAS SUPERIOR */}
      <section className="sticky top-16 z-40 border-b border-border bg-background/95 py-3 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => scrollToCategory(category.id)}
                className="shrink-0 rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground transition hover:bg-primary hover:text-primary-foreground"
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CATÁLOGO */}
      <div id="cart" className="scroll-mt-32">
        <Cart />
      </div>

      <DeliveryZones />

      <Footer onWhatsAppClick={onWhatsAppClick} />
    </main>
  )
}
