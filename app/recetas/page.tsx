"use client";

const recetas = [
  {
    titulo: "Tostadas con miel y banana",
    categoria: "Desayunos",
    img: "https://source.unsplash.com/400x300/?toast,honey",
  },
  {
    titulo: "Huevos revueltos con espinaca",
    categoria: "Desayunos",
    img: "https://source.unsplash.com/400x300/?eggs,spinach",
  },
  {
    titulo: "Pollo al horno con papas",
    categoria: "Almuerzos",
    img: "https://source.unsplash.com/400x300/?roast,chicken",
  },
  {
    titulo: "Ensalada completa con huevo",
    categoria: "Almuerzos",
    img: "https://source.unsplash.com/400x300/?salad,egg",
  },
  {
    titulo: "Licuado de banana",
    categoria: "Meriendas",
    img: "https://source.unsplash.com/400x300/?banana,smoothie",
  },
  {
    titulo: "Pan con miel",
    categoria: "Meriendas",
    img: "https://source.unsplash.com/400x300/?bread,honey",
  },
  {
    titulo: "Tortilla de papa",
    categoria: "Cenas",
    img: "https://source.unsplash.com/400x300/?potato,omelette",
  },
  {
    titulo: "Pollo con verduras",
    categoria: "Cenas",
    img: "https://source.unsplash.com/400x300/?chicken,vegetables",
  },
];

export default function RecetasPage() {
  const categorias = ["Desayunos", "Almuerzos", "Meriendas", "Cenas", "Colaciones"];

  return (
    <div className="bg-[#f6f6f2] min-h-screen text-[#1f1f1f]">
      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* HERO */}
        <h1 className="text-4xl md:text-5xl font-serif mb-4">
          Cociná toda la semana con una sola caja 🥕
        </h1>

        <p className="text-gray-600 mb-12 text-lg">
          Recetas reales con lo que recibís en tu caja.
        </p>

        {/* LISTADO POR CATEGORÍA */}
        {categorias.map((cat) => {
          const items = recetas.filter((r) => r.categoria === cat);

          if (items.length === 0) return null;

          return (
            <section key={cat} className="mb-14">
              <h2 className="text-2xl font-semibold mb-6">
                {cat} ({items.length})
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {items.map((receta, i) => (
                  <div
                    key={i}
                    className="cursor-pointer group"
                    onClick={() => alert(receta.titulo)}
                  >
                    <div className="rounded-xl overflow-hidden bg-white shadow-sm group-hover:shadow-md transition">

                      <img
                        src={receta.img}
                        alt={receta.titulo}
                        className="w-full h-40 object-cover"
                      />

                      <div className="p-3">
                        <p className="text-sm font-medium">
                          {receta.titulo}
                        </p>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        {/* CTA */}
        <div className="mt-16 bg-[#e8efe6] p-8 rounded-xl text-center">
          <h3 className="text-2xl font-semibold mb-3">
            Todo esto sale de la Caja Granja
          </h3>

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
