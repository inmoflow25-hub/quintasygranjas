"use client";

export default function RecetasPage() {
  return (
   

        {/* HERO */}
        <h1 className="text-4xl md:text-5xl font-serif mb-4">
          ¿Qué cocinás esta semana? 🍳
        </h1>

        <p className="text-gray-600 mb-10 text-lg">
          Todas estas comidas salen de tu caja granja. Sin pensar.
        </p>

        {/* DESAYUNOS */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Desayunos (8)</h2>
          <ul className="space-y-2 text-gray-700">
            <li>Tostadas con miel y banana</li>
            <li>Huevos revueltos con espinaca</li>
            <li>Licuado de banana y miel</li>
            <li>Pan con tomate y aceite</li>
            <li>Omelette de verduras</li>
            <li>Tostadas con huevo y miel</li>
            <li>Fruta fresca con miel</li>
            <li>Sandwich caliente de huevo</li>
          </ul>
        </section>

        {/* ALMUERZOS */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Almuerzos (10)</h2>
          <ul className="space-y-2 text-gray-700">
            <li>Pollo al horno con papas</li>
            <li>Ensalada completa con huevo</li>
            <li>Tarta de verduras</li>
            <li>Pollo salteado con zanahoria</li>
            <li>Ensalada tibia de papa y huevo</li>
            <li>Sandwich de pollo desmenuzado</li>
            <li>Zapallo al horno con huevo</li>
            <li>Ensalada de tomate, huevo y lechuga</li>
            <li>Pollo con ensalada fresca</li>
            <li>Verduras salteadas con huevo</li>
          </ul>
        </section>

        {/* MERIENDAS */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Meriendas (7)</h2>
          <ul className="space-y-2 text-gray-700">
            <li>Pan con miel</li>
            <li>Licuado de frutas</li>
            <li>Tostadas con banana</li>
            <li>Fruta fresca</li>
            <li>Pan tostado con miel</li>
            <li>Batido de banana</li>
            <li>Sandwich dulce (pan + miel + banana)</li>
          </ul>
        </section>

        {/* CENAS */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Cenas (9)</h2>
          <ul className="space-y-2 text-gray-700">
            <li>Pollo al horno con verduras</li>
            <li>Tortilla de papa</li>
            <li>Revuelto de verduras</li>
            <li>Sopa de verduras</li>
            <li>Ensalada completa con huevo</li>
            <li>Pollo a la plancha con ensalada</li>
            <li>Zapallo relleno</li>
            <li>Omelette grande</li>
            <li>Salteado de verduras con huevo</li>
          </ul>
        </section>

        {/* COLACIONES */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Colaciones (6)</h2>
          <ul className="space-y-2 text-gray-700">
            <li>Banana</li>
            <li>Manzana</li>
            <li>Huevo duro</li>
            <li>Zanahoria cruda</li>
            <li>Pan con miel</li>
            <li>Fruta con miel</li>
          </ul>
        </section>

        {/* CTA FINAL */}
        <div className="mt-16 bg-[#e8efe6] p-8 rounded-xl text-center">
          <h3 className="text-2xl font-semibold mb-3">
            Todo esto sale de la Caja Granja
          </h3>

          <p className="text-gray-600 mb-5">
            Recibís ingredientes reales y resolvés toda la semana.
          </p>

          <a
            href="/#cajas"
            className="inline-block bg-[#2f6f3e] text-white px-6 py-3 rounded-lg font-semibold"
          >
            Ver la caja
          </a>
        </div>

      </div>
    </div>
  );
}
