import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function detectChannel(payload: any): "whatsapp" | "instagram" | "messenger" | "unknown" {
  const raw = JSON.stringify(payload || {}).toLowerCase()

  if (raw.includes("whatsapp") || raw.includes("wa_") || raw.includes("whats_app")) {
    return "whatsapp"
  }

  if (raw.includes("instagram") || raw.includes("ig")) {
    return "instagram"
  }

  if (raw.includes("messenger") || raw.includes("facebook")) {
    return "messenger"
  }

  return "unknown"
}

function getExternalMessageId(payload: any): string | null {
  return (
    payload?.messageId ||
    payload?.message_id ||
    payload?.id ||
    payload?.conversationMessageId ||
    payload?.conversation_message_id ||
    payload?.body?.messageId ||
    null
  )
}

function getExternalEventId(payload: any): string | null {
  return (
    payload?.eventId ||
    payload?.event_id ||
    payload?.webhookId ||
    payload?.webhook_id ||
    payload?.id ||
    null
  )
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "ghl/messages-webhook"
  })
}

export async function POST(req: NextRequest) {
  try {
    const secretFromHeader = req.headers.get("x-ghl-webhook-secret")
    const secretFromQuery = new URL(req.url).searchParams.get("token")
    const expectedSecret = process.env.GHL_MESSAGES_WEBHOOK_SECRET

    if (expectedSecret) {
      const receivedSecret = secretFromHeader || secretFromQuery

      if (receivedSecret !== expectedSecret) {
        return NextResponse.json(
          { ok: false, error: "unauthorized" },
          { status: 401 }
        )
      }
    }

    const payload = await req.json()

    const channel = detectChannel(payload)
    const externalMessageId = getExternalMessageId(payload)
    const externalEventId = getExternalEventId(payload)

    const { error } = await supabase
      .from("crm_meta_webhook_events")
      .insert({
        channel,
        object_type: "ghl_message_webhook",
        external_event_id: externalEventId,
        external_message_id: externalMessageId,
        payload,
        processed: false
      })

    if (error) {
      console.error("ghl messages webhook insert error:", error)

      return NextResponse.json(
        { ok: false, error: "db_error" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true
    })
  } catch (error) {
    console.error("ghl messages webhook error:", error)

    return NextResponse.json(
      { ok: false, error: "webhook_error" },
      { status: 500 }
    )
  }
}
