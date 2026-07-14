"use client"

import { useEffect } from "react"
import Link from "next/link"
import { CANDELA_ATTRIBUTION, saveAttribution } from "@/lib/attribution"

export default function CandelaBaezPage() {
  useEffect(() => {
    saveAttribution(CANDELA_ATTRIBUTION)
  }, [])

  return (
    <main className="min-h-screen bg-[#10170f] text-white">
      <section className="relative overflow-hidden px-4 py-8 md:py-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(134,239,172,0.22),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(250,204,21,0.14),transparent_32%)]" />

        <div className="relative mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-green-300" />
                Acceso privado para la comunidad de Candela
              </div>

              <div>
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-green-200">
                  Quintas y Granjas
                </p>

                <h1 className="mt-4 max-w-3xl text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
                  Candela te dejó un 10% OFF.
                </h1>

                <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/75 md:text-xl">
                  Activá tu beneficio y pedí frutas, verduras, productos de
                  granja y alimentos saludables directo desde tu celular.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Link
                  href="/#cart"
                  className="rounded-2xl bg-green-400 px-6 py-4 text-center text-base font-black text-green-950 shadow-[0_18px_45px_rgba(74,222,128,0.22)] transition hover:bg-green-300"
                >
                  Activar 10% y comprar
                </Link>

                <Link
                  href="/app?affiliate=candela-baez"
                  className="rounded-2xl border border-white/20 bg-white/10 px-6 py-4 text-center text-base font-black text-white backdrop-blur transition hover:bg-white/15"
                >
                  Entrar a la app
                </Link>
              </div>

              <p className="max-w-xl text-xs leading-relaxed text-white/45">
                Beneficio exclusivo para compras originadas desde esta invitación.
                No acumulable con puntos ni otros descuentos.
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/12 bg-white/[0.08] p-4 shadow-2xl backdrop-blur md:p-6">
              <div className="rounded-[1.5rem] bg-[#f8f5ec] p-5 text-[#152015] md:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-green-800">
                      Beneficio activo
                    </p>
                    <h2 className="mt-2 text-4xl font-black md:text-6xl">
                      10% OFF
                    </h2>
                  </div>

                  <div className="rounded-full bg-green-700 px-4 py-2 text-sm font-black text-white">
                    Candela
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-sm font-bold text-[#152015]">
                      1. Elegí tus productos
                    </p>
                    <p className="mt-1 text-sm text-[#5c665c]">
                      Armá tu pedido desde la web o desde la app.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-sm font-bold text-[#152015]">
                      2. El descuento viaja con vos
                    </p>
                    <p className="mt-1 text-sm text-[#5c665c]">
                      Esta invitación queda guardada para aplicar el beneficio.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-sm font-bold text-[#152015]">
                      3. Recibís en tu casa
                    </p>
                    <p className="mt-1 text-sm text-[#5c665c]">
                      Coordinamos la entrega según zona y disponibilidad.
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl bg-green-950 p-4 text-white">
                  <p className="text-sm font-bold">
                    Tu acceso quedó reservado
                  </p>
                  <p className="mt-1 text-sm text-white/70">
                    Comprá ahora o entrá a la app para una experiencia más rápida.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-3 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
              <p className="text-2xl">🥑</p>
              <h3 className="mt-3 font-black">Productos frescos</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                Selección para comer mejor sin complicarte.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
              <p className="text-2xl">📱</p>
              <h3 className="mt-3 font-black">Pedido desde el celular</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                Web o app, el beneficio queda asociado a tu compra.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
              <p className="text-2xl">✨</p>
              <h3 className="mt-3 font-black">Acceso privado</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                Una invitación especial para la comunidad de Candela.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
