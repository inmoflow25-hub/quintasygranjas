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

    const webhookUrl = process.env.GHL_SEND_MESSAGE_WEBHOOK_URL

    if (!webhookUrl) {
      return NextResponse.json(
        { ok: false, error: "Falta GHL_SEND_MESSAGE_WEBHOOK_URL" },
        { status: 500 }
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

    const phone = contact.phone || contact.normalized_phone

    if (!phone) {
      return NextResponse.json(
        { ok: false, error: "El contacto no tiene teléfono" },
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
        name: displayName,
        message,
        channel: conversation.channel,
        conversation_id: conversation.id,
        contact_id: contact.id,
        external_thread_id: conversation.external_thread_id
      })
    })

    const ghlText = await ghlResponse.text()

    if (!ghlResponse.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: "GHL rechazó el envío",
          details: ghlText
        },
        { status: 502 }
      )
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
        recipient_external_id: phone,
        message_type: "text",
        text: message,
        status: "sent",
        raw_payload: {
          provider: "ghl_webhook",
          ghl_response: ghlText
        }
      })

    if (messageError) {
      return NextResponse.json(
        {
          ok: false,
          error: "El mensaje salió a GHL pero no se guardó en CRM",
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
      ok: true
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
