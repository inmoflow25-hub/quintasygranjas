"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const items = [
  {
    label: "Inicio",
    href: "/app",
    icon: "🏠"
  },
  {
    label: "Pedidos",
    href: "/app/orders",
    icon: "🧺"
  },
  {
    label: "Puntos",
    href: "/app/rewards",
    icon: "🌱"
  },
  {
    label: "Perfil",
    href: "/app/profile",
    icon: "👤"
  }
]

export default function AppNav() {
  const pathname = usePathname()

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-green-100 bg-white/95 px-3 py-2 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
          {items.map((item) => {
            const active =
              item.href === "/app"
                ? pathname === "/app"
                : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-xs font-bold ${
                  active
                    ? "bg-green-700 text-white"
                    : "text-green-900 hover:bg-green-50"
                }`}
              >
                <span className="text-lg leading-none">{item.icon}</span>
                <span className="mt-1">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      <nav className="hidden md:block">
        <div className="mx-auto mt-8 max-w-4xl rounded-3xl bg-white p-3 shadow">
          <div className="grid grid-cols-4 gap-2">
            {items.map((item) => {
              const active =
                item.href === "/app"
                  ? pathname === "/app"
                  : pathname.startsWith(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-2xl px-4 py-3 text-center font-bold ${
                    active
                      ? "bg-green-700 text-white"
                      : "bg-green-50 text-green-900 hover:bg-green-100"
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
    </>
  )
}
