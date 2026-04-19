import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const ghlWebhookUrl = process.env.GHL_ORDER_WEBHOOK_URL;

    if (!ghlWebhookUrl) {
      return NextResponse.json(
        { error: "Falta GHL_ORDER_WEBHOOK_URL en variables de entorno" },
        { status: 500 }
      );
    }

    const payload = {
      order_id: body.order_id,
      customer_name: body.customer_name,
      customer_email: body.customer_email,
      customer_phone: body.customer_phone,
      price: body.price,
      source: body.source || "web_app",
      status: body.status,
      payment_status: body.payment_status,
      order_type: body.order_type,
      box_id: body.box_id ?? null,
      created_at: body.created_at,
    };

    const ghlRes = await fetch(ghlWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const text = await ghlRes.text();

    return NextResponse.json({
      ok: ghlRes.ok,
      status: ghlRes.status,
      response: text,
    });
  } catch (error) {
    console.error("order-sync error:", error);

    return NextResponse.json(
      { error: "Error procesando order-sync" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, route: "ghl/order-sync" });
}
