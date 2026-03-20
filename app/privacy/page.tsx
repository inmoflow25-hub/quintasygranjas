export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-16">
      <div className="max-w-3xl mx-auto space-y-8">

        <h1 className="text-3xl font-bold">Política de Privacidad</h1>
        <p className="text-sm text-muted-foreground">
          Última actualización: {new Date().toLocaleDateString()}
        </p>

        <section>
          <h2 className="text-xl font-semibold mb-2">1. Información que recopilamos</h2>
          <p>
            Recopilamos información básica como nombre, correo electrónico y datos de autenticación 
            cuando utilizás nuestro servicio o iniciás sesión con Google.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">2. Uso de la información</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Gestionar tu cuenta</li>
            <li>Procesar pedidos</li>
            <li>Brindar soporte</li>
            <li>Mejorar el servicio</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">3. Pagos</h2>
          <p>
            Los pagos se procesan a través de plataformas externas seguras. No almacenamos datos de tarjetas 
            ni información financiera sensible.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">4. Compartición de datos</h2>
          <p>
            No vendemos ni compartimos información personal, salvo cuando sea necesario para operar el servicio 
            (logística, pagos) o por obligación legal.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">5. Autenticación con Google</h2>
          <p>
            Solo accedemos a datos básicos como nombre y correo electrónico.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">6. Seguridad</h2>
          <p>
            Implementamos medidas razonables para proteger tu información. Sin embargo, ningún sistema es 100% seguro.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">7. Tus derechos</h2>
          <p>
            Podés solicitar acceso, modificación o eliminación de tus datos en cualquier momento.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">8. Contacto</h2>
          <p>hola@quintasygranjas.com</p>
        </section>

      </div>
    </main>
  );
}
