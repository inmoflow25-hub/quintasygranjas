import { NextResponse } from "next/server";

export async function GET() {
  const html = `
  <div style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
    
    <div style="max-width:600px; margin:auto; background:white; border-radius:10px; overflow:hidden;">

      <!-- HEADER -->
      <div style="background:#2E7D32; padding:20px; text-align:center;">
        <img src="https://quintasygranjas.com/logo.png" alt="Quintas y Granjas" style="max-width:180px;">
      </div>

      <!-- BODY -->
      <div style="padding:20px;">
        
        <h2 style="color:#2E7D32;">Hola {{contact.first_name}} </h2>
        <p>Te dejamos recetas personalizadas con productos frescos de nuestras quintas </p>

        <!-- RECETA 1 -->
        <div style="margin-top:25px;">
          <h3>Pollo glaseado con miel</h3>
          <p><strong>Ingredientes:</strong> pollo, miel, zanahoria</p>
          <ol>
            <li>Preparar ingredientes</li>
            <li>Hornear 25 minutos</li>
            <li>Servir caliente</li>
          </ol>
        </div>

        <!-- RECETA 2 -->
        <div style="margin-top:25px;">
          <h3>Tostadas con huevo</h3>
          <p><strong>Ingredientes:</strong> pan, huevo, miel</p>
          <ol>
            <li>Tostar pan</li>
            <li>Cocinar huevo</li>
            <li>Servir</li>
          </ol>
        </div>

        <!-- CTA -->
        <div style="text-align:center; margin-top:30px;">
          <a href="https://quintasygranjas.com/#cajas" 
             style="background:#2E7D32; color:white; padding:15px 25px; text-decoration:none; border-radius:5px; font-weight:bold;">
             Comprar productos frescos
          </a>
        </div>

      </div>

      <!-- FOOTER -->
      <div style="background:#eee; padding:15px; text-align:center; font-size:12px;">
        <p>Quintas y Granjas</p>
        <p>Alimentos frescos directo del productor</p>
      </div>

    </div>

  </div>
  `;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}
