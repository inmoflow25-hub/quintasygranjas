import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type Channel = "whatsapp" | "instagram" | "messenger" | "unknown"

function normalizePhone(phone: string | null | undefined) {
  const raw = String(phone || "").replace(/\D/g, "")
  if (!raw) return ""

  let cleaned = raw

  if (cleaned.startsWith("54911")) cleaned = cleaned.slice(3)
  if (cleaned.startsWith("5411")) cleaned = cleaned.slice(2)
  if (cleaned.startsWith("011")) cleaned = cleaned.slice(1)

  if (cleaned.startsWith("15") && cleaned.length >= 10) {
    cleaned = "11" + cleaned.slice(2)
  }

  return cleaned
}

function detectChannel(payload: any): Channel {
  const raw = JSON.stringify(payload || {}).toLowerCase()

  if (raw.includes("whatsapp") || raw.includes("lead_wp") || raw.includes("_wp")) {
    return "whatsapp"
  }

  if (raw.includes("instagram") || raw.includes("_ig")) {
    return "instagram"
  }

  if (raw.includes("messenger") || raw.includes("facebook") || raw.includes("_fb")) {
    return "messenger"
  }

  return "unknown"
}

function getMessageText(payload: any) {
  return (
    payload?.message?.body ||
    payload?.message_body ||
    payload?.body ||
    payload?.text ||
    ""
  )
}

function getMessageType(payload: any) {
  const rawType = payload?.message?.type || payload?.message_type || "text"
  return String(rawType || "text")
}

function getContactName(payload: any) {
  return (
    payload?.full_name ||
    payload?.contact?.full_name ||
    [payload?.first_name, payload?.last_name].filter(Boolean).join(" ") ||
    payload?.first_name ||
    payload?.name ||
    null
  )
}

function getContactPhone(payload: any) {
  return (
    payload?.phone ||
    payload?.contact?.phone ||
    payload?.contact_phone ||
    null
  )
}

function getContactEmail(payload: any) {
  return (
    payload?.email ||
    payload?.contact?.email ||
    payload?.contact_email ||
    null
  )
}

function getExternalUserId(payload: any) {
  return (
    payload?.contact_id ||
    payload?.contact?.id ||
    payload?.phone ||
    payload?.email ||
    crypto.randomUUID()
  )
}

async function findOrCreateContact(payload: any, channel: Exclude<Channel, "unknown">) {
  const name = getContactName(payload)
  const phone = getContactPhone(payload)
  const email = getContactEmail(payload)
  const normalizedPhone = normalizePhone(phone)
  const externalUserId = String(getExternalUserId(payload))

  const { data: existingChannel } = await supabase
    .from("crm_contact_channels")
    .select("id, contact_id")
    .eq("channel", channel)
    .eq("external_user_id", externalUserId)
    .maybeSingle()

  if (existingChannel?.contact_id) {
    await supabase
      .from("crm_contacts")
      .update({
        display_name: name,
        phone,
        email,
        normalized_phone: normalizedPhone,
        last_seen_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", existingChannel.contact_id)

  if (!contactId) {
  throw new Error("No se pudo resolver contacto CRM")
}

return {
  contactId: contactId as string,
  channelId: createdChannel.id as string,
  externalUserId
}
  }

  let contactId: string | null = null

  if (normalizedPhone) {
    const { data: existingContactByPhone } = await supabase
      .from("crm_contacts")
      .select("id")
      .eq("normalized_phone", normalizedPhone)
      .maybeSingle()

    if (existingContactByPhone?.id) {
      contactId = existingContactByPhone.id
    }
  }

  if (!contactId && email) {
    const { data: existingContactByEmail } = await supabase
      .from("crm_contacts")
      .select("id")
      .eq("email", String(email).trim().toLowerCase())
      .maybeSingle()

    if (existingContactByEmail?.id) {
      contactId = existingContactByEmail.id
    }
  }

  if (!contactId) {
    const { data: createdContact, error: createContactError } = await supabase
      .from("crm_contacts")
      .insert({
        display_name: name,
        first_name: payload?.first_name || null,
        last_name: payload?.last_name || null,
        email: email ? String(email).trim().toLowerCase() : null,
        phone,
        normalized_phone: normalizedPhone,
        lifecycle_status: payload?.contact_type || "lead",
        source: "ghl",
        metadata: {
          ghl_contact_id: payload?.contact_id || null,
          tags: payload?.tags || null,
          location: payload?.location || null
        }
      })
      .select("id")
      .single()

    if (createContactError || !createdContact?.id) {
      throw new Error(createContactError?.message || "No se pudo crear contacto CRM")
    }

    contactId = createdContact.id
  }

  const { data: createdChannel, error: createChannelError } = await supabase
    .from("crm_contact_channels")
    .insert({
      contact_id: contactId,
      channel,
      external_user_id: externalUserId,
      display_name: name,
      raw_profile: {
        ghl_contact_id: payload?.contact_id || null,
        phone,
        email
      }
    })
    .select("id")
    .single()

  if (createChannelError || !createdChannel?.id) {
    throw new Error(createChannelError?.message || "No se pudo crear canal CRM")
  }

  return {
    contactId,
    channelId: createdChannel.id as string,
    externalUserId
  }
}

async function findOrCreateConversation({
  contactId,
  channelId,
  channel,
  payload
}: {
  contactId: string
  channelId: string
  channel: Exclude<Channel, "unknown">
  payload: any
}) {
  const externalThreadId = String(payload?.contact_id || contactId)

  const { data: existingConversation } = await supabase
    .from("crm_conversations")
    .select("id")
    .eq("channel", channel)
    .eq("external_thread_id", externalThreadId)
    .neq("status", "archived")
    .maybeSingle()

  if (existingConversation?.id) {
    await supabase
      .from("crm_conversations")
      .update({
        status: "open",
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", existingConversation.id)

    return existingConversation.id as string
  }

  const attribution =
    payload?.contact?.lastAttributionSource ||
    payload?.contact?.attributionSource ||
    payload?.lastAttributionSource ||
    payload?.attributionSource ||
    {}

  const { data: createdConversation, error: createConversationError } = await supabase
    .from("crm_conversations")
    .insert({
      contact_id: contactId,
      channel_id: channelId,
      channel,
      external_thread_id: externalThreadId,
      status: "open",
      source: "ghl",
      campaign_id: attribution?.campaignId || null,
      campaign_name: attribution?.campaignName || null,
      ad_id: attribution?.adId || null,
      ad_name: attribution?.adName || null,
      last_message_at: new Date().toISOString(),
      metadata: {
        ghl_contact_id: payload?.contact_id || null,
        workflow: payload?.workflow || null,
        attribution
      }
    })
    .select("id")
    .single()

  if (createConversationError || !createdConversation?.id) {
    throw new Error(createConversationError?.message || "No se pudo crear conversación CRM")
  }

  return createdConversation.id as string
}

async function saveMessage({
  conversationId,
  contactId,
  channel,
  payload,
  rawEventId
}: {
  conversationId: string
  contactId: string
  channel: Exclude<Channel, "unknown">
  payload: any
  rawEventId: string
}) {
  const text = getMessageText(payload)
  const messageType = getMessageType(payload)

  const { error } = await supabase
    .from("crm_messages")
    .insert({
      conversation_id: conversationId,
      contact_id: contactId,
      channel,
      direction: "inbound",
      external_message_id: rawEventId,
      sender_external_id: String(payload?.contact_id || payload?.phone || ""),
      recipient_external_id: payload?.location?.id || null,
      message_type: messageType,
      text,
      status: "received",
      raw_payload: payload
    })

  if (error) {
    throw new Error(error.message)
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "ghl/messages-webhook"
  })
}

export async function POST(req: NextRequest) {
  let rawEventId: string | null = null

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
    const detectedChannel = detectChannel(payload)
    const channel = detectedChannel === "unknown" ? "whatsapp" : detectedChannel

    const { data: rawEvent, error: rawEventError } = await supabase
      .from("crm_meta_webhook_events")
      .insert({
        channel,
        object_type: "ghl_message_webhook",
        external_event_id: payload?.workflow?.id || null,
        external_message_id: null,
        payload,
        processed: false
      })
      .select("id")
      .single()

    if (rawEventError || !rawEvent?.id) {
      console.error("ghl raw event insert error:", rawEventError)

      return NextResponse.json(
        { ok: false, error: "raw_event_db_error" },
        { status: 500 }
      )
    }

    rawEventId = rawEvent.id

    const { contactId, channelId } = await findOrCreateContact(payload, channel)
    const conversationId = await findOrCreateConversation({
      contactId,
      channelId,
      channel,
      payload
    })

    await saveMessage({
      conversationId,
      contactId,
      channel,
      payload,
      rawEventId
    })

    await supabase
      .from("crm_meta_webhook_events")
      .update({
        processed: true,
        processed_at: new Date().toISOString()
      })
      .eq("id", rawEventId)

    return NextResponse.json({
      ok: true,
      contact_id: contactId,
      conversation_id: conversationId
    })
  } catch (error: any) {
    console.error("ghl messages webhook error:", error)

    if (rawEventId) {
      await supabase
        .from("crm_meta_webhook_events")
        .update({
          processed: false,
          processing_error: error?.message || "webhook_error"
        })
        .eq("id", rawEventId)
    }

    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "webhook_error"
      },
      { status: 500 }
    )
  }
}
