export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f5faf3] px-6 py-16 text-[#1f2a1f]">
      <article className="mx-auto max-w-4xl rounded-[2rem] bg-white p-8 shadow-sm md:p-12">
        <p className="text-sm font-bold uppercase tracking-wide text-green-700">
          Quintas y Granjas
        </p>

        <h1 className="mt-3 text-4xl font-serif font-black md:text-5xl">
          Política de Privacidad
        </h1>

        <p className="mt-3 text-sm text-gray-500">
          Última actualización: 10 de mayo de 2026
        </p>

        <p className="mt-8 leading-relaxed text-gray-700">
          En Quintas y Granjas valoramos y protegemos la privacidad de nuestros usuarios.
          La presente Política de Privacidad explica cómo recopilamos, utilizamos y protegemos
          la información personal de quienes utilizan nuestro sitio web y servicios.
        </p>

        <p className="mt-4 leading-relaxed text-gray-700">
          Al utilizar nuestra plataforma, aceptás las prácticas descritas en esta política.
        </p>

        <LegalSection title="1. Información que recopilamos">
          <p>Podemos recopilar la siguiente información personal:</p>
          <LegalList
            items={[
              "nombre y apellido",
              "dirección de correo electrónico",
              "número de teléfono",
              "dirección de entrega",
              "información de pedidos",
              "datos de acceso y autenticación",
              "información básica proporcionada por servicios de terceros como Google Login"
            ]}
          />

          <p className="mt-4">También podremos recopilar información técnica de navegación, como:</p>
          <LegalList
            items={[
              "dirección IP",
              "tipo de dispositivo",
              "navegador utilizado",
              "páginas visitadas",
              "horarios de acceso",
              "cookies y datos de uso"
            ]}
          />
        </LegalSection>

        <LegalSection title="2. Uso de la información">
          <p>Utilizamos la información recopilada para:</p>
          <LegalList
            items={[
              "gestionar cuentas de usuario",
              "procesar pedidos y entregas",
              "coordinar pagos",
              "brindar soporte y atención al cliente",
              "enviar comunicaciones relacionadas con el servicio",
              "mejorar la experiencia de uso",
              "realizar análisis internos y operativos",
              "prevenir fraudes o usos indebidos de la plataforma"
            ]}
          />
        </LegalSection>

        <LegalSection title="3. Pagos">
          <p>
            Los pagos online son procesados mediante plataformas externas seguras.
            Quintas y Granjas no almacena información completa de tarjetas de crédito,
            débito ni datos financieros sensibles.
          </p>
          <p className="mt-4">
            Las plataformas de pago podrán aplicar sus propias políticas de privacidad y seguridad.
          </p>
        </LegalSection>

        <LegalSection title="4. Compartición de información">
          <p>
            No vendemos información personal de nuestros usuarios. Podremos compartir ciertos
            datos únicamente cuando sea necesario para operar el servicio, incluyendo:
          </p>
          <LegalList
            items={[
              "empresas de logística o reparto",
              "plataformas de pago",
              "proveedores tecnológicos",
              "servicios de autenticación",
              "o cuando exista obligación legal o requerimiento de autoridad competente"
            ]}
          />
          <p className="mt-4">
            En todos los casos, procuramos trabajar con proveedores que mantengan estándares
            adecuados de protección de datos.
          </p>
        </LegalSection>

        <LegalSection title="5. Inicio de sesión con Google">
          <p>
            Si el usuario elige iniciar sesión mediante Google, únicamente accederemos a información
            básica autorizada por el usuario, como:
          </p>
          <LegalList
            items={[
              "nombre",
              "dirección de correo electrónico",
              "foto de perfil, si estuviera disponible"
            ]}
          />
          <p className="mt-4">
            No accedemos a contraseñas ni a información privada adicional de la cuenta de Google.
          </p>
        </LegalSection>

        <LegalSection title="6. Cookies y tecnologías similares">
          <p>Nuestro sitio web puede utilizar cookies y tecnologías similares para:</p>
          <LegalList
            items={[
              "recordar preferencias",
              "mantener sesiones activas",
              "analizar tráfico y comportamiento de navegación",
              "mejorar el funcionamiento de la plataforma"
            ]}
          />
          <p className="mt-4">
            El usuario puede configurar su navegador para rechazar cookies, aunque esto podría
            afectar algunas funcionalidades del sitio.
          </p>
        </LegalSection>

        <LegalSection title="7. Seguridad">
          <p>
            Implementamos medidas técnicas y organizativas razonables para proteger la información
            personal de accesos no autorizados, pérdida, alteración o divulgación indebida.
          </p>
          <p className="mt-4">
            Sin embargo, ningún sistema informático o transmisión de datos por internet puede
            garantizar seguridad absoluta.
          </p>
        </LegalSection>

        <LegalSection title="8. Conservación de datos">
          <p>Conservaremos la información personal únicamente durante el tiempo necesario para:</p>
          <LegalList
            items={[
              "prestar el servicio",
              "cumplir obligaciones legales",
              "resolver disputas",
              "mantener registros administrativos y operativos"
            ]}
          />
        </LegalSection>

        <LegalSection title="9. Derechos del usuario">
          <p>El usuario podrá solicitar en cualquier momento:</p>
          <LegalList
            items={[
              "acceso a sus datos personales",
              "corrección o actualización",
              "eliminación de información",
              "limitación del tratamiento de datos",
              "revocación de consentimiento cuando corresponda"
            ]}
          />
          <p className="mt-4">
            Las solicitudes podrán realizarse a través del correo de contacto indicado más abajo.
          </p>
        </LegalSection>

        <LegalSection title="10. Modificaciones de esta política">
          <p>
            Quintas y Granjas podrá actualizar esta Política de Privacidad en cualquier momento.
            Las modificaciones entrarán en vigencia desde su publicación en el sitio web.
          </p>
        </LegalSection>

        <LegalSection title="11. Contacto">
          <p>Para consultas relacionadas con privacidad o protección de datos:</p>
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
