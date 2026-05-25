import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function getChannelFromPayload(
  payload: any
): "whatsapp" | "instagram" | "messenger" | "unknown" {
  const objectType = String(payload?.object || "").toLowerCase()

  if (objectType === "whatsapp_business_account") return "whatsapp"
  if (objectType === "instagram") return "instagram"
  if (objectType === "page") return "messenger"

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
    const messengerMessageId = messaging?.message?.mid

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

    if (entryId && time) return `${entryId}:${time}`
    if (entryId) return String(entryId)

    return null
  } catch {
    return null
  }
}

async function processMessengerWebhook(eventId: string, payload: any) {
  const entries = Array.isArray(payload?.entry) ? payload.entry : []

  for (const entry of entries) {
    const pageId = String(entry?.id || "")
    const messagingEvents = Array.isArray(entry?.messaging)
      ? entry.messaging
      : []

    for (const item of messagingEvents) {
      const senderId = String(item?.sender?.id || "")
      const recipientId = String(item?.recipient?.id || pageId || "")
      const messageId = String(item?.message?.mid || "")
      const text = String(item?.message?.text || "").trim()

      const timestamp = item?.timestamp
        ? new Date(Number(item.timestamp)).toISOString()
        : new Date().toISOString()

      if (!senderId || !text) continue

      const displayName = `Facebook ${senderId.slice(-6)}`

      const { data: existingContact } = await supabase
        .from("crm_contacts")
        .select("id")
        .eq("source", "meta")
        .filter("metadata->>messenger_psid", "eq", senderId)
        .maybeSingle()

      let contactId = existingContact?.id as string | undefined

      if (!contactId) {
        const { data: newContact, error: contactError } = await supabase
          .from("crm_contacts")
          .insert({
            display_name: displayName,
            phone: null,
            normalized_phone: null,
            lifecycle_status: "lead",
            source: "meta",
            last_seen_at: timestamp,
            metadata: {
              messenger_psid: senderId,
              page_id: recipientId,
              channel: "messenger"
            }
          })
          .select("id")
          .single()

        if (contactError || !newContact?.id) {
          throw new Error(
            contactError?.message || "No se pudo crear contacto Messenger"
          )
        }

        contactId = newContact.id
      } else {
        await supabase
          .from("crm_contacts")
          .update({
            last_seen_at: timestamp,
            updated_at: new Date().toISOString()
          })
          .eq("id", contactId)
      }

      const { data: existingConversation } = await supabase
        .from("crm_conversations")
        .select("id")
        .eq("channel", "messenger")
        .eq("external_thread_id", senderId)
        .maybeSingle()

      let conversationId = existingConversation?.id as string | undefined

      if (!conversationId) {
        const { data: newConversation, error: conversationError } =
          await supabase
            .from("crm_conversations")
            .insert({
              contact_id: contactId,
              channel: "messenger",
              status: "open",
              source: "meta",
              external_thread_id: senderId,
              last_message_at: timestamp,
              metadata: {
                page_id: recipientId,
                messenger_psid: senderId
              }
            })
            .select("id")
            .single()

        if (conversationError || !newConversation?.id) {
          throw new Error(
            conversationError?.message ||
              "No se pudo crear conversación Messenger"
          )
        }

        conversationId = newConversation.id
      } else {
        await supabase
          .from("crm_conversations")
          .update({
            last_message_at: timestamp,
            updated_at: new Date().toISOString()
          })
          .eq("id", conversationId)
      }

      const { data: existingMessage } = await supabase
        .from("crm_messages")
        .select("id")
        .eq("external_message_id", messageId)
        .maybeSingle()

      if (!existingMessage) {
        const { error: messageError } = await supabase
          .from("crm_messages")
          .insert({
            conversation_id: conversationId,
            contact_id: contactId,
            channel: "messenger",
            direction: "inbound",
            external_message_id: messageId || null,
            sender_external_id: senderId,
            recipient_external_id: recipientId,
            message_type: "text",
            text,
            status: "received",
            raw_payload: item
          })

        if (messageError) throw new Error(messageError.message)
      }
    }
  }

  await supabase
    .from("crm_meta_webhook_events")
    .update({
      processed: true,
      processed_at: new Date().toISOString(),
      processing_error: null
    })
    .eq("id", eventId)
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
  let savedEventId: string | null = null

  try {
    const payload = await req.json()

    const channel = getChannelFromPayload(payload)
    const objectType = payload?.object ? String(payload.object) : null
    const externalMessageId = getExternalMessageId(payload)
    const externalEventId = getExternalEventId(payload)

    const { data: savedEvent, error } = await supabase
      .from("crm_meta_webhook_events")
      .insert({
        channel,
        object_type: objectType,
        external_event_id: externalEventId,
        external_message_id: externalMessageId,
        payload,
        processed: false
      })
      .select("id")
      .single()

    if (error || !savedEvent?.id) {
      console.error("meta webhook insert error:", error)

      return NextResponse.json(
        { ok: false, error: "db_error" },
        { status: 500 }
      )
    }

    savedEventId = savedEvent.id

   if (payload?.object === "page") {
  await processMessengerWebhook(savedEvent.id, payload)
}

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error("meta webhook error:", error)

    if (savedEventId) {
      await supabase
        .from("crm_meta_webhook_events")
        .update({
          processed: false,
          processing_error: error?.message || "webhook_error"
        })
        .eq("id", savedEventId)
    }

    return NextResponse.json(
      { ok: false, error: error?.message || "webhook_error" },
      { status: 500 }
    )
  }
}
