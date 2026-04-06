import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    receta: {
      titulo: "Pasta cremosa con pollo",
      ingredientes: [
        "200g de pasta",
        "1 pechuga de pollo",
        "1 taza de crema",
        "Ajo",
        "Sal y pimienta"
      ],
      pasos: [
        "Hervir la pasta",
        "Cocinar el pollo en sartén",
        "Agregar crema y mezclar",
        "Unir con la pasta"
      ]
    }
  });
}
