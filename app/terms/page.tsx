export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#f5faf3] px-6 py-16 text-[#1f2a1f]">
      <article className="mx-auto max-w-4xl rounded-[2rem] bg-white p-8 shadow-sm md:p-12">
        <p className="text-sm font-bold uppercase tracking-wide text-green-700">
          Quintas y Granjas
        </p>

        <h1 className="mt-3 text-4xl font-serif font-black md:text-5xl">
          Términos y Condiciones
        </h1>

        <p className="mt-3 text-sm text-gray-500">
          Última actualización: 10 de mayo de 2026
        </p>

        <p className="mt-8 leading-relaxed text-gray-700">
          Bienvenido a Quintas y Granjas. Al acceder y utilizar nuestro sitio web y realizar
          compras a través de nuestra plataforma, aceptás los siguientes Términos y Condiciones.
          Recomendamos leerlos detenidamente antes de utilizar el servicio.
        </p>

        <LegalSection title="1. Información general">
          <p>
            Quintas y Granjas es una plataforma de venta y entrega a domicilio de frutas,
            verduras, huevos, pan, pollo y otros productos alimenticios en Zona Norte de Buenos Aires.
          </p>
          <p className="mt-4">
            Nos reservamos el derecho de modificar estos Términos y Condiciones en cualquier momento.
            Las modificaciones entrarán en vigencia desde su publicación en el sitio web.
          </p>
        </LegalSection>

        <LegalSection title="2. Uso del sitio web">
          <p>
            El usuario se compromete a utilizar el sitio web de manera legal, responsable y de buena fe.
          </p>
          <p className="mt-4">Queda prohibido:</p>
          <LegalList
            items={[
              "utilizar la plataforma para fines ilícitos",
              "interferir en el funcionamiento del sitio",
              "realizar compras fraudulentas",
              "proporcionar información falsa o inexacta"
            ]}
          />
        </LegalSection>

        <LegalSection title="3. Productos y disponibilidad">
          <p>
            Todos nuestros productos están sujetos a disponibilidad. Trabajamos con productos frescos
            y estacionales, por lo que:
          </p>
          <LegalList
            items={[
              "algunos productos pueden variar en tamaño, peso, color o presentación",
              "ciertos productos pueden agotarse temporalmente",
              "podremos reemplazar productos por equivalentes de calidad similar previa comunicación con el cliente cuando sea posible"
            ]}
          />
          <p className="mt-4">
            Las imágenes publicadas son ilustrativas.
          </p>
        </LegalSection>

        <LegalSection title="4. Precios">
          <p>
            Todos los precios están expresados en pesos argentinos (ARS). Los precios publicados
            pueden modificarse sin previo aviso. El precio válido será el informado al momento de
            confirmar la compra.
          </p>
          <p className="mt-4">
            Quintas y Granjas podrá realizar promociones, descuentos o beneficios temporales sujetos
            a condiciones específicas.
          </p>
        </LegalSection>

        <LegalSection title="5. Pedidos y entregas">
          <p>
            El pedido mínimo para realizar compras podrá ser modificado en cualquier momento y será
            informado en el sitio web.
          </p>
          <p className="mt-4">
            Las entregas se realizan en las zonas habilitadas por Quintas y Granjas. Los horarios
            de entrega son estimados y pueden verse afectados por:
          </p>
          <LegalList
            items={[
              "tránsito",
              "condiciones climáticas",
              "demoras logísticas",
              "alta demanda",
              "causas ajenas a la empresa"
            ]}
          />
          <p className="mt-4">
            El cliente deberá asegurarse de que haya una persona disponible para recibir el pedido
            en el domicilio informado.
          </p>
        </LegalSection>

        <LegalSection title="6. Pagos">
          <p>
            Aceptamos medios de pago electrónicos y efectivo contra entrega, según disponibilidad.
          </p>
          <p className="mt-4">
            Los pagos online son procesados mediante plataformas externas seguras. Quintas y Granjas
            no almacena datos completos de tarjetas de crédito o débito.
          </p>
        </LegalSection>

        <LegalSection title="7. Cancelaciones, cambios y reembolsos">
          <p>
            El cliente podrá cancelar el pedido antes de que haya sido preparado o despachado.
            Una vez iniciado el proceso de preparación o entrega, no se aceptarán cancelaciones.
          </p>
          <p className="mt-4">
            Debido a la naturaleza perecedera de los productos, no se realizan devoluciones una vez
            entregado el pedido, salvo en casos de:
          </p>
          <LegalList
            items={[
              "productos en mal estado",
              "errores en el pedido",
              "faltantes",
              "problemas de calidad comprobables"
            ]}
          />
          <p className="mt-4">
            En dichos casos, Quintas y Granjas podrá:
          </p>
          <LegalList
            items={[
              "reemplazar el producto",
              "otorgar crédito para futuras compras",
              "realizar un reembolso parcial o total, según corresponda"
            ]}
          />
          <p className="mt-4">
            Los reclamos deberán realizarse dentro de las 24 horas posteriores a la entrega.
          </p>
        </LegalSection>

        <LegalSection title="8. Suscripciones y pedidos recurrentes">
          <p>
            En caso de ofrecerse servicios de suscripción o pedidos recurrentes, el cliente podrá
            cancelarlos antes del siguiente ciclo de facturación o preparación del pedido.
          </p>
        </LegalSection>

        <LegalSection title="9. Responsabilidad">
          <p>
            Quintas y Granjas realizará sus mejores esfuerzos para brindar un servicio eficiente
            y de calidad. Sin embargo, no será responsable por:
          </p>
          <LegalList
            items={[
              "demoras ocasionadas por terceros",
              "interrupciones del servicio",
              "fallas técnicas",
              "eventos climáticos",
              "cortes de tránsito",
              "fuerza mayor",
              "cualquier circunstancia ajena al control razonable de la empresa"
            ]}
          />
        </LegalSection>

        <LegalSection title="10. Protección de datos">
          <p>
            La información proporcionada por los usuarios será utilizada únicamente para procesar
            pedidos, brindar soporte y mejorar el servicio.
          </p>
          <p className="mt-4">
            Quintas y Granjas se compromete a tratar los datos personales de forma confidencial
            y conforme a la normativa aplicable.
          </p>
        </LegalSection>

        <LegalSection title="11. Propiedad intelectual">
          <p>Todo el contenido del sitio web, incluyendo:</p>
          <LegalList
            items={[
              "marca",
              "logo",
              "imágenes",
              "textos",
              "diseños",
              "software",
              "material gráfico"
            ]}
          />
          <p className="mt-4">
            es propiedad de Quintas y Granjas o de sus respectivos titulares y no podrá ser utilizado
            sin autorización previa.
          </p>
        </LegalSection>

        <LegalSection title="12. Contacto">
          <p>Para consultas, reclamos o soporte:</p>
          <p className="mt-3 font-bold text-green-700">
            hola@quintasygranjas.com
          </p>
        </LegalSection>
      </article>
    </main>
  )
}

function LegalSection({
  title,
  children
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-10 border-t border-[#e3e1dc] pt-8">
      <h2 className="text-2xl font-serif font-bold">
        {title}
      </h2>

      <div className="mt-4 space-y-3 leading-relaxed text-gray-700">
        {children}
      </div>
    </section>
  )
}

function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 list-disc space-y-2 pl-6">
      {items.map((item) => (
        <li key={item}>
          {item}
        </li>
      ))}
    </ul>
  )
}
