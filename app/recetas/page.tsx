"use client";

const recetas = {
  desayunos: [
    "Tostadas con miel y banana",
    "Huevos revueltos con espinaca",
    "Licuado de banana y miel",
    "Pan con tomate y aceite",
    "Omelette de verduras",
    "Tostadas con huevo y miel",
    "Fruta fresca con miel",
    "Sandwich caliente de huevo",
  ],
  almuerzos: [
    "Pollo al horno con papas",
    "Ensalada completa con huevo",
    "Tarta de verduras",
    "Pollo salteado con zanahoria",
    "Ensalada tibia de papa y huevo",
    "Sandwich de pollo desmenuzado",
    "Zapallo al horno con huevo",
    "Ensalada de tomate, huevo y lechuga",
    "Pollo con ensalada fresca",
    "Verduras salteadas con huevo",
  ],
  meriendas: [
    "Pan con miel",
    "Licuado de frutas",
    "Tostadas con banana",
    "Fruta fresca",
    "Pan tostado con miel",
    "Batido de banana",
    "Sandwich dulce (pan + miel + banana)",
  ],
  cenas: [
    "Pollo al horno con verduras",
    "Tortilla de papa",
    "Revuelto de verduras",
    "Sopa de verduras",
    "Ensalada completa con huevo",
    "Pollo a la plancha con ensalada",
    "Zapallo relleno",
    "Omelette grande",
    "Salteado de verduras con huevo",
  ],
  colaciones: [
    "Banana",
    "Manzana",
    "Huevo duro",
    "Zanahoria cruda",
    "Pan con miel",
    "Fruta con miel",
  ],
};

function RecetaCard({ titulo }: { titulo: string }) {
  return (
    <button
      onClick={() => alert(`Abrir receta: ${titulo}`)}
      className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:shadow-md hover:scale-[1.02] transition"
    >
      <p className="font-medium text-[#1f1f1f]">{titulo}</p>
    </button>
  );
}

function Seccion({
  titulo,
  items,
}: {
  titulo: string;
  items: string[];
}) {
  return (
    <section className="mb-14">
      <h2 className="text-2xl font-semibold mb-6">
        {titulo} ({items.length})
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item, i) => (
          <RecetaCard key={i} titulo={item} />
        ))}
      </div>
    </section>
  );
}

export default function RecetasPage() {
  return (
    <div className="bg-[#f6f6f2] min-h-screen text-[#1f1f1f]">
      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* HERO */}
        <h1 className="text-4xl md:text-5xl font-serif mb-4">
          Cociná toda la semana con una sola caja 🥕
        </h1>

        <p className="text-gray-600 mb-12 text-lg">
          Desayunos, almuerzos, meriendas y cenas reales. Sin pensar.
        </p>

        {/* SECCIONES */}
        <Seccion titulo="Desayunos" items={recetas.desayunos} />
        <Seccion titulo="Almuerzos" items={recetas.almuerzos} />
        <Seccion titulo="Meriendas" items={recetas.meriendas} />
        <Seccion titulo="Cenas" items={recetas.cenas} />
        <Seccion titulo="Colaciones" items={recetas.colaciones} />

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
