export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-16">
      <div className="max-w-3xl mx-auto space-y-8">

        <h1 className="text-3xl font-bold">Términos y Condiciones</h1>
        <p className="text-sm text-muted-foreground">
          Última actualización: {new Date().toLocaleDateString()}
        </p>

        <section>
          <h2 className="text-xl font-semibold mb-2">1. Uso del servicio</h2>
          <p>
            El usuario se compromete a utilizar la plataforma de forma legal y responsable.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">2. Productos</h2>
          <p>
            Los productos pueden variar según disponibilidad. Trabajamos con productos frescos y estacionales.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">3. Precios</h2>
          <p>
            Los precios pueden cambiar sin previo aviso. El precio final es el indicado al momento de la compra.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">4. Pagos</h2>
          <p>
            Los pagos se procesan mediante plataformas externas seguras.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">5. Cancelaciones y reembolsos</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Podés cancelar antes del despacho</li>
            <li>No hay reembolso una vez enviado el pedido</li>
            <li>Si hay problema, se reemplaza o acredita</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">6. Suscripciones</h2>
          <p>
            Podés cancelar en cualquier momento antes del siguiente ciclo de facturación.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">7. Responsabilidad</h2>
          <p>
            No somos responsables por demoras causadas por terceros, clima o logística.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">8. Cuenta</h2>
          <p>
            Sos responsable de la seguridad de tu cuenta.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">9. Contacto</h2>
          <p>hola@quintasygranjas.com</p>
        </section>

      </div>
    </main>
  );
}
