import { NextResponse } from "next/server";

export async function GET() {
  const html = `
    <div style="font-family: Arial; padding: 20px;">
      <h1 style="color: #2E7D32;">🍳 Recetas para hoy</h1>

      <div style="margin-bottom: 30px;">
        <h2>Pollo glaseado con miel</h2>
        <p><strong>Ingredientes:</strong> pollo, miel, zanahoria</p>
        <p><strong>Pasos:</strong></p>
        <ol>
          <li>Preparar ingredientes</li>
          <li>Hornear 25 minutos</li>
          <li>Servir caliente</li>
        </ol>
      </div>

      <div style="margin-bottom: 30px;">
        <h2>Tostadas con huevo</h2>
        <p><strong>Ingredientes:</strong> pan, huevo, miel</p>
        <ol>
          <li>Tostar pan</li>
          <li>Cocinar huevo</li>
          <li>Servir</li>
        </ol>
      </div>

    </div>
  `;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}
