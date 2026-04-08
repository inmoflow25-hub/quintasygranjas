"use client";

const recetas = [
  // DESAYUNOS
  { titulo: "Tostadas con miel y banana", categoria: "Desayunos", img: "https://images.unsplash.com/photo-1608198093002-ad4e005484ec" },
  { titulo: "Huevos revueltos con espinaca", categoria: "Desayunos", img: "https://images.unsplash.com/photo-1587731556938-38755b4803a6" },
  { titulo: "Licuado de banana y miel", categoria: "Desayunos", img: "https://images.unsplash.com/photo-1572441713132-51c75654db73" },
  { titulo: "Pan con tomate y aceite", categoria: "Desayunos", img: "https://images.unsplash.com/photo-1604908176997-4316c288032e" },
  { titulo: "Omelette de verduras", categoria: "Desayunos", img: "https://images.unsplash.com/photo-1551218808-94e220e084d2" },
  { titulo: "Tostadas con huevo y miel", categoria: "Desayunos", img: "https://images.unsplash.com/photo-1525351484163-7529414344d8" },
  { titulo: "Fruta fresca con miel", categoria: "Desayunos", img: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce" },
  { titulo: "Sandwich caliente de huevo", categoria: "Desayunos", img: "https://images.unsplash.com/photo-1550547660-d9450f859349" },

  // ALMUERZOS
  { titulo: "Pollo al horno con papas", categoria: "Almuerzos", img: "https://images.unsplash.com/photo-1604908554168-3c92d4eec5d0" },
  { titulo: "Ensalada completa con huevo", categoria: "Almuerzos", img: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9" },
  { titulo: "Tarta de verduras", categoria: "Almuerzos", img: "https://images.unsplash.com/photo-1604908177522-429e8a7c7b59" },
  { titulo: "Pollo salteado con zanahoria", categoria: "Almuerzos", img: "https://images.unsplash.com/photo-1604909052743-94e8384f4b77" },
  { titulo: "Ensalada tibia de papa y huevo", categoria: "Almuerzos", img: "https://images.unsplash.com/photo-1604908177070-4a0b1d3a7f3c" },
  { titulo: "Sandwich de pollo desmenuzado", categoria: "Almuerzos", img: "https://images.unsplash.com/photo-1550547660-d9450f859349" },
  { titulo: "Zapallo al horno con huevo", categoria: "Almuerzos", img: "https://images.unsplash.com/photo-1604908177122-1f4f1b1c3d3c" },
  { titulo: "Ensalada de tomate, huevo y lechuga", categoria: "Almuerzos", img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c" },
  { titulo: "Pollo con ensalada fresca", categoria: "Almuerzos", img: "https://images.unsplash.com/photo-1604908177160-9c0e6a1d7f1d" },
  { titulo: "Verduras salteadas con huevo", categoria: "Almuerzos", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd" },

  // MERIENDAS
  { titulo: "Pan con miel", categoria: "Meriendas", img: "https://images.unsplash.com/photo-1587731556938-38755b4803a6" },
  { titulo: "Licuado de frutas", categoria: "Meriendas", img: "https://images.unsplash.com/photo-1553530666-ba11a7da3888" },
  { titulo: "Tostadas con banana", categoria: "Meriendas", img: "https://images.unsplash.com/photo-1525351484163-7529414344d8" },
  { titulo: "Fruta fresca", categoria: "Meriendas", img: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce" },
  { titulo: "Pan tostado con miel", categoria: "Meriendas", img: "https://images.unsplash.com/photo-1608198093002-ad4e005484ec" },
  { titulo: "Batido de banana", categoria: "Meriendas", img: "https://images.unsplash.com/photo-1572441713132-51c75654db73" },
  { titulo: "Sandwich dulce (pan + miel + banana)", categoria: "Meriendas", img: "https://images.unsplash.com/photo-1550547660-d9450f859349" },

  // CENAS
  { titulo: "Pollo al horno con verduras", categoria: "Cenas", img: "https://images.unsplash.com/photo-1604908554168-3c92d4eec5d0" },
  { titulo: "Tortilla de papa", categoria: "Cenas", img: "https://images.unsplash.com/photo-1604908177070-4a0b1d3a7f3c" },
  { titulo: "Revuelto de verduras", categoria: "Cenas", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd" },
  { titulo: "Sopa de verduras", categoria: "Cenas", img: "https://images.unsplash.com/photo-1547592180-85f173990554" },
  { titulo: "Ensalada completa con huevo", categoria: "Cenas", img: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9" },
  { titulo: "Pollo a la plancha con ensalada", categoria: "Cenas", img: "https://images.unsplash.com/photo-1604908177160-9c0e6a1d7f1d" },
  { titulo: "Zapallo relleno", categoria: "Cenas", img: "https://images.unsplash.com/photo-1604908177122-1f4f1b1c3d3c" },
  { titulo: "Omelette grande", categoria: "Cenas", img: "https://images.unsplash.com/photo-1551218808-94e220e084d2" },
  { titulo: "Salteado de verduras con huevo", categoria: "Cenas", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd" },

  // COLACIONES
  { titulo: "Banana", categoria: "Colaciones", img: "https://images.unsplash.com/photo-1574226516831-e1dff420e8f8" },
  { titulo: "Manzana", categoria: "Colaciones", img: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce" },
  { titulo: "Huevo duro", categoria: "Colaciones", img: "https://images.unsplash.com/photo-1587731556938-38755b4803a6" },
  { titulo: "Zanahoria cruda", categoria: "Colaciones", img: "https://images.unsplash.com/photo-1582515073490-dc8c5e3d4c58" },
  { titulo: "Pan con miel", categoria: "Colaciones", img: "https://images.unsplash.com/photo-1608198093002-ad4e005484ec" },
  { titulo: "Fruta con miel", categoria: "Colaciones", img: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce" },
];

export default function RecetasPage() {
  const categorias = ["Desayunos", "Almuerzos", "Meriendas", "Cenas", "Colaciones"];

  return (
    <div className="bg-[#f6f6f2] min-h-screen text-[#1f1f1f]">
      <div className="max-w-6xl mx-auto px-6 py-12">

        <h1 className="text-4xl md:text-5xl font-serif mb-4">
          Cociná toda la semana con una sola caja 🥕
        </h1>

        <p className="text-gray-600 mb-12 text-lg">
          Recetas reales con lo que recibís en tu caja.
        </p>

        {categorias.map((cat) => {
          const items = recetas.filter((r) => r.categoria === cat);

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

      </div>
    </div>
  );
}
