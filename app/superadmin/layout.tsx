import Link from "next/link"

const navItems = [
  { href: "/superadmin", label: "Resumen" },
  { href: "/superadmin/orders", label: "Pedidos" },
  { href: "/superadmin/customers", label: "Clientes" },
  { href: "/superadmin/expenses", label: "Gastos" },
  { href: "/superadmin/suppliers", label: "Proveedores" },
  { href: "/superadmin/map", label: "Mapa" }
]

export default function SuperAdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen bg-[#f5f5f3] text-[#1f2a1f]">
      <header className="sticky top-0 z-30 border-b border-[#e3e1dc] bg-[#f5f5f3]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-serif font-bold">
              Quintas y Granjas · Superadmin
            </h1>
            <p className="text-xs text-gray-500">
              Centro de comando del negocio
            </p>
          </div>

          <nav className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-[#d8d4ca] bg-white px-4 py-2 text-sm font-medium hover:bg-[#1f2a1f] hover:text-white"
              >
                {item.label}
              </Link>
            ))}

            <Link
              href="/admin"
              className="rounded-full bg-[#1f2a1f] px-4 py-2 text-sm font-medium text-white"
            >
              Admin clásico
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-[1600px] px-6 py-6">
        {children}
      </section>
    </main>
  )
}
