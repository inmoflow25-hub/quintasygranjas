import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { requireAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function cleanMessage(value: unknown) {
  return String(value || "").trim()
}

async function sendMessengerMessage(psid: string, message: string) {
  const token = process.env.META_PAGE_ACCESS_TOKEN

  if (!token) {
    throw new Error("Falta META_PAGE_ACCESS_TOKEN")
  }

  const response = await fetch(
    `https://graph.facebook.com/v25.0/me/messages?access_token=${encodeURIComponent(token)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        recipient: {
          id: psid
        },
        message: {
          text: message
        },
        messaging_type: "RESPONSE"
      })
    }
  )

  const text = await response.text()

  if (!response.ok) {
    throw new Error(`Meta rechazó el envío: ${text}`)
  }

  return text
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()

    const body = await req.json()
    const conversationId = cleanMessage(body.conversationId)
    const message = cleanMessage(body.message)

    if (!conversationId || !message) {
      return NextResponse.json(
        { ok: false, error: "conversationId y message son requeridos" },
        { status: 400 }
      )
    }

    const { data: conversation, error: conversationError } = await supabase
      .from("crm_conversations")
      .select(`
        id,
        contact_id,
        channel,
        source,
        external_thread_id
      `)
      .eq("id", conversationId)
      .maybeSingle()

    if (conversationError || !conversation) {
      return NextResponse.json(
        { ok: false, error: "Conversación no encontrada" },
        { status: 404 }
      )
    }

    const { data: contact, error: contactError } = await supabase
      .from("crm_contacts")
      .select(`
        id,
        display_name,
        first_name,
        last_name,
        email,
        phone,
        normalized_phone,
        metadata
      `)
      .eq("id", conversation.contact_id)
      .maybeSingle()

    if (contactError || !contact) {
      return NextResponse.json(
        { ok: false, error: "Contacto no encontrado" },
        { status: 404 }
      )
    }

    const displayName =
      contact.display_name ||
      [contact.first_name, contact.last_name].filter(Boolean).join(" ") ||
      "Cliente"

    const phone = contact.phone || contact.normalized_phone || null

    let provider = "ghl_webhook"
    let providerResponse = ""
    let recipientExternalId = phone || conversation.external_thread_id || null

    if (conversation.channel === "messenger" && conversation.source === "meta") {
      const psid = conversation.external_thread_id

      if (!psid) {
        return NextResponse.json(
          { ok: false, error: "La conversación Messenger no tiene PSID" },
          { status: 400 }
        )
      }

      provider = "meta_messenger"
      providerResponse = await sendMessengerMessage(psid, message)
      recipientExternalId = psid
    } else {
      const webhookUrl = process.env.GHL_SEND_MESSAGE_WEBHOOK_URL

      if (!webhookUrl) {
        return NextResponse.json(
          { ok: false, error: "Falta GHL_SEND_MESSAGE_WEBHOOK_URL" },
          { status: 500 }
        )
      }

      const ghlContactId =
        conversation.source === "ghl"
          ? conversation.external_thread_id || null
          : null

      if (!phone && !ghlContactId) {
        return NextResponse.json(
          {
            ok: false,
            error: "El contacto no tiene teléfono ni contact_id de GHL"
          },
          { status: 400 }
        )
      }

      const ghlResponse = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          phone,
          contact_id: ghlContactId,
          name: displayName,
          message,
          channel: conversation.channel,
          conversation_id: conversation.id,
          crm_contact_id: contact.id,
          external_thread_id: conversation.external_thread_id
        })
      })

      providerResponse = await ghlResponse.text()

      if (!ghlResponse.ok) {
        return NextResponse.json(
          {
            ok: false,
            error: "GHL rechazó el envío",
            details: providerResponse
          },
          { status: 502 }
        )
      }

      recipientExternalId = phone || ghlContactId
    }

    const { error: messageError } = await supabase
      .from("crm_messages")
      .insert({
        conversation_id: conversation.id,
        contact_id: contact.id,
        channel: conversation.channel,
        direction: "outbound",
        external_message_id: null,
        sender_external_id: "qyg_app",
        recipient_external_id: recipientExternalId,
        message_type: "text",
        text: message,
        status: "sent",
        raw_payload: {
          provider,
          provider_response: providerResponse
        }
      })

    if (messageError) {
      return NextResponse.json(
        {
          ok: false,
          error: "El mensaje salió pero no se guardó en CRM",
          details: messageError.message
        },
        { status: 500 }
      )
    }

    await supabase
      .from("crm_conversations")
      .update({
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", conversation.id)

    return NextResponse.json({
      ok: true,
      provider
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "send_message_error"
      },
      { status: 500 }
    )
  }
}
