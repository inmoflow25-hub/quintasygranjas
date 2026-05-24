export const dynamic = "force-dynamic"
export const revalidate = 0

import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { requireAdmin } from "@/lib/admin-auth"
import ReplyBox from "./ReplyBox"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function formatDateTime(dateString: string | null | undefined) {
  if (!dateString) return "-"

  return new Date(dateString).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  })
}

function channelLabel(channel: string | null | undefined) {
  if (channel === "whatsapp") return "WhatsApp"
  if (channel === "instagram") return "Instagram"
  if (channel === "messenger") return "Facebook"
  return channel || "-"
}

function channelClass(channel: string | null | undefined) {
  if (channel === "whatsapp") return "bg-emerald-100 text-emerald-800"
  if (channel === "instagram") return "bg-pink-100 text-pink-800"
  if (channel === "messenger") return "bg-blue-100 text-blue-800"
  return "bg-gray-100 text-gray-700"
}

export default async function ConversationDetailPage({
  params
}: {
  params: Promise<{ conversationId: string }>
}) {
  await requireAdmin()

  const { conversationId } = await params

  const { data: conversation, error: conversationError } = await supabase
    .from("crm_conversations")
    .select(`
      id,
      contact_id,
      channel,
      status,
      source,
      external_thread_id,
      last_message_at,
      created_at
    `)
    .eq("id", conversationId)
    .maybeSingle()

  if (conversationError || !conversation) {
    notFound()
  }

  const { data: contact } = await supabase
    .from("crm_contacts")
    .select(`
      id,
      display_name,
      first_name,
      last_name,
      email,
      phone,
      normalized_phone,
      lifecycle_status,
      source,
      last_seen_at,
      metadata
    `)
    .eq("id", conversation.contact_id)
    .maybeSingle()

  const { data: messages } = await supabase
    .from("crm_messages")
    .select(`
      id,
      conversation_id,
      contact_id,
      channel,
      direction,
      message_type,
      text,
      status,
      created_at
    `)
    .eq("conversation_id", conversation.id)
    .order("created_at", { ascending: true })

  const displayName =
    contact?.display_name ||
    [contact?.first_name, contact?.last_name].filter(Boolean).join(" ") ||
    "Sin nombre"

  return (
    <main className="min-h-screen bg-neutral-50 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/superadmin/inbox" className="text-sm font-semibold text-green-700">
              ← Volver al inbox
            </Link>

            <h1 className="mt-3 text-3xl font-bold text-neutral-900">
              {displayName}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${channelClass(conversation.channel)}`}>
                {channelLabel(conversation.channel)}
              </span>

              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                {conversation.status}
              </span>

              <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">
                Fuente: {conversation.source || "-"}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-neutral-400">
              Contacto
            </p>
            <p className="mt-1 text-sm font-semibold text-neutral-900">
              {contact?.phone || contact?.normalized_phone || "-"}
            </p>
            {contact?.email ? (
              <p className="mt-1 text-xs text-neutral-500">
                {contact.email}
              </p>
            ) : null}
          </div>
        </div>

        <section className="rounded-3xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-100 px-6 py-4">
            <h2 className="text-lg font-bold text-neutral-900">
              Historial de mensajes
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Vista operativa. En el próximo paso agregamos respuesta desde tu app.
            </p>
          </div>

          <div className="space-y-4 p-6">
            {!messages?.length ? (
              <div className="rounded-2xl bg-neutral-50 p-6 text-center">
                <p className="font-semibold text-neutral-800">
                  Todavía no hay mensajes en esta conversación.
                </p>
              </div>
            ) : (
              messages.map((message: any) => {
                const isInbound = message.direction === "inbound"

                return (
                  <div
                    key={message.id}
                    className={`flex ${isInbound ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                        isInbound
                          ? "bg-neutral-100 text-neutral-900"
                          : "bg-green-700 text-white"
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.text || "[sin texto]"}
                      </p>

                      <div
                        className={`mt-2 text-[11px] ${
                          isInbound ? "text-neutral-500" : "text-green-100"
                        }`}
                      >
                        {isInbound ? "Cliente" : "Tu equipo"} · {formatDateTime(message.created_at)}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <div className="border-t border-neutral-100 bg-neutral-50 px-6 py-4">
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-4">
              <ReplyBox conversationId={conversation.id} />
             
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
