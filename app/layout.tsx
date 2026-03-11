export const metadata = {
  title: "Quintas y Granjas",
  description: "Caja semanal de frutas y verduras"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  )
}
