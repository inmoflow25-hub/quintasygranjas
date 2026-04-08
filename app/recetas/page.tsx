"use client";

import { useEffect, useState } from "react";

export default function RecetasPage() {
  const [recetas, setRecetas] = useState<any[]>([]);
  const [filtro, setFiltro] = useState("todas");

  useEffect(() => {
    fetch("/api/test-openai")
      .then((res) => res.json())
      .then((data) => setRecetas(data));
  }, []);

  const recetasFiltradas =
    filtro === "todas"
      ? recetas
      : recetas.filter((r) => r.tag === filtro);

  return (
    <div className="max-w-6xl mx-auto p-6">

      {/* HERO */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-3">
          Cociná toda la semana con una sola caja 🥕🍗
        </h1>
        <p className="text-gray-600 mb-5">
          Desayunos, almuerzos y cenas reales. Sin pensar.
        </p>

        <a
          href="/#boxes"
          className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold"
        >
          Ver la caja
        </a>
      </div>

      {/* FILTROS */}
      <div className="flex gap-3 mb-8 justify-center">
        {["todas", "desayuno", "almuerzo", "cena"].map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-4 py-2 rounded-full border ${
              filtro === f ? "bg-green-600 text-white" : ""
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-3 gap-6">
        {recetasFiltradas.map((r, i) => (
          <div
            key={i}
            className="border rounded-xl p-4 shadow hover:shadow-lg transition"
          >
            <h2 className="text-xl font-bold mb-2">{r.title}</h2>

            <p className="text-sm text-gray-500 mb-2">
              ⏱ {r.time || "20 min"} · 🍽 {r.tag}
            </p>

            <ul className="text-sm mb-3">
              {r.ingredients?.slice(0, 3).map((ing: string, idx: number) => (
                <li key={idx}>• {ing}</li>
              ))}
            </ul>

            <button className="text-green-700 font-semibold">
              Ver receta →
            </button>
          </div>
        ))}
      </div>

      {/* BLOQUE VENTA */}
      <div className="mt-16 text-center bg-green-50 p-8 rounded-xl">
        <h3 className="text-2xl font-bold mb-3">
          Todas estas recetas salen de la caja semanal
        </h3>

        <p className="text-gray-600 mb-4">
          Recibís ingredientes frescos y resolvés toda la semana sin pensar.
        </p>

        <a
          href="/#boxes"
          className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold"
        >
          Ver la caja completa
        </a>
      </div>

    </div>
  );
}
