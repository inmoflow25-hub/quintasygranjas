import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const ghlWebhookUrl = process.env.GHL_ORDER_WEBHOOK_URL;

    if (!ghlWebhookUrl) {
      return NextResponse.json(
        {
          ok: false,
          error: "Falta GHL_ORDER_WEBHOOK_URL en variables de entorno",
        },
        { status: 500 }
      );
    }

    const payload = {
      // Pedido
      order_id: body.order_id ?? null,
      order_type: body.order_type ?? null,
      box_id: body.box_id ?? null,
      price: Number(body.price || 0),
      source: body.source || "web_app",
      status: body.status ?? null,
      payment_status: body.payment_status ?? null,
      payment_method: body.payment_method ?? null,
      created_at: body.created_at ?? new Date().toISOString(),

      // Cliente
      customer_name: String(body.customer_name || "").trim(),
      customer_email: String(body.customer_email || "")
        .trim()
        .toLowerCase(),
      customer_phone: String(body.customer_phone || "").trim(),

      // Domicilio y ubicación
      delivery_address: String(body.delivery_address || "").trim(),
      delivery_city: String(body.delivery_city || "").trim(),
      delivery_notes: String(body.delivery_notes || "").trim(),
      google_place_id: String(body.google_place_id || "").trim(),

      // Coordenadas
      latitude:
        body.lat !== undefined && body.lat !== null && body.lat !== ""
          ? Number(body.lat)
          : null,

      longitude:
        body.lng !== undefined && body.lng !== null && body.lng !== ""
          ? Number(body.lng)
          : null,
    };

    console.log("Sending order to GHL", {
      order_id: payload.order_id,
      customer_email: payload.customer_email,
      customer_phone: payload.customer_phone,
      delivery_city: payload.delivery_city,
      delivery_address: payload.delivery_address,
      latitude: payload.latitude,
      longitude: payload.longitude,
    });

    const ghlRes = await fetch(ghlWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const responseText = await ghlRes.text();

    if (!ghlRes.ok) {
      console.error("GHL webhook error", {
        status: ghlRes.status,
        response: responseText,
      });

      return NextResponse.json(
        {
          ok: false,
          error: "GHL rechazó el webhook",
          status: ghlRes.status,
          response: responseText,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      status: ghlRes.status,
      response: responseText,
    });
  } catch (error) {
    console.error("order-sync error:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Error procesando order-sync",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "ghl/order-sync",
  });
}
