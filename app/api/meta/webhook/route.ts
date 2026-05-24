import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function getChannelFromPayload(payload: any): "whatsapp" | "instagram" | "messenger" | "unknown" {
  const objectType = String(payload?.object || "").toLowerCase()

  if (objectType === "whatsapp_business_account") {
    return "whatsapp"
  }

  if (objectType === "instagram") {
    return "instagram"
  }

  if (objectType === "page") {
    return "messenger"
  }

  return "unknown"
}

function getExternalMessageId(payload: any): string | null {
  try {
    const entry = payload?.entry?.[0]
    const change = entry?.changes?.[0]

    const whatsappMessageId =
      change?.value?.messages?.[0]?.id ||
      change?.value?.statuses?.[0]?.id

    if (whatsappMessageId) return String(whatsappMessageId)

    const messaging = entry?.messaging?.[0]

    const messengerMessageId =
      messaging?.message?.mid ||
      messaging?.postback?.mid

    if (messengerMessageId) return String(messengerMessageId)

    return null
  } catch {
    return null
  }
}

function getExternalEventId(payload: any): string | null {
  try {
    const entryId = payload?.entry?.[0]?.id
    const time = payload?.entry?.[0]?.time

    if (entryId && time) {
      return `${entryId}:${time}`
    }

    if (entryId) {
      return String(entryId)
    }

    return null
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)

  const mode = url.searchParams.get("hub.mode")
  const token = url.searchParams.get("hub.verify_token")
  const challenge = url.searchParams.get("hub.challenge")

  const verifyToken = process.env.META_VERIFY_TOKEN

  if (!verifyToken) {
    return new NextResponse("Missing META_VERIFY_TOKEN", { status: 500 })
  }

  if (mode === "subscribe" && token === verifyToken && challenge) {
    return new NextResponse(challenge, { status: 200 })
  }

  return new NextResponse("Forbidden", { status: 403 })
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()

    const channel = getChannelFromPayload(payload)
    const objectType = payload?.object ? String(payload.object) : null
    const externalMessageId = getExternalMessageId(payload)
    const externalEventId = getExternalEventId(payload)

    const { error } = await supabase
      .from("crm_meta_webhook_events")
      .insert({
        channel,
        object_type: objectType,
        external_event_id: externalEventId,
        external_message_id: externalMessageId,
        payload,
        processed: false
      })

    if (error) {
      console.error("meta webhook insert error:", error)

      return NextResponse.json(
        {
          ok: false,
          error: "db_error"
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true
    })
  } catch (error) {
    console.error("meta webhook error:", error)

    return NextResponse.json(
      {
        ok: false,
        error: "webhook_error"
      },
      { status: 500 }
    )
  }
}
