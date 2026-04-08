"use client";

import { useEffect, useState } from "react";

export default function RecetasPage() {
  const [recetas, setRecetas] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/test-openai")
      .then((res) => res.json())
      .then((data) => setRecetas(data));
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      
      {/* HERO */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">
          ¿Qué cocino esta semana? 🍳
        </h1>
        <p className="text-gray-600 mb-4">
          Recetas simples con comida real 🥕🍗
        </p>

        <a
          href="/#boxes"
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold"
        >
          Ver boxes
        </a>
      </div>

      {/* GRID RECETAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recetas.map((r, i) => (
          <div
            key={i}
            className="border rounded-xl p-4 shadow hover:shadow-lg transition"
          >
            <h2 className="text-xl font-bold mb-2">{r.title}</h2>

            <p className="text-sm text-gray-500 mb-2">
              ⏱ Fácil · 👥 2 personas
            </p>

            <ul className="text-sm mb-3">
              {r.ingredients?.slice(0, 3).map((ing: string, idx: number) => (
                <li key={idx}>• {ing}</li>
              ))}
            </ul>

            <button
              onClick={() => alert("Después hacemos la vista detalle")}
              className="text-green-700 font-semibold"
            >
              Ver receta →
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
