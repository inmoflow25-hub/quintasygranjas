"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const items = [
  {
    label: "Inicio",
    href: "/app"
  },
  {
    label: "Pedidos",
    href: "/app/orders"
  },
  {
    label: "Puntos",
    href: "/app/rewards"
  },
  {
    label: "Perfil",
    href: "/app/profile"
  }
]

export default function AppNav() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-3 z-40 mx-auto mb-5 max-w-4xl rounded-2xl border border-green-100 bg-white/95 p-2 shadow-sm backdrop-blur">
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
              className={`rounded-xl px-3 py-3 text-center text-sm font-bold transition ${
                active
                  ? "bg-green-700 text-white"
                  : "bg-green-50 text-green-900 hover:bg-green-100"
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
