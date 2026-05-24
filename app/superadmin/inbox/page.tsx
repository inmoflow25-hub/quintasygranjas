export const dynamic = "force-dynamic"
export const revalidate = 0

import Link from "next/link"
import { createClient } from "@supabase/supabase-js"
import { requireAdmin } from "@/lib/admin-auth"

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
  if (channel === "messenger") return "Messenger"
  return channel || "-"
}

function statusLabel(status: string | null | undefined) {
  if (status === "open") return "Abierta"
  if (status === "pending") return "Pendiente"
  if (status === "closed") return "Cerrada"
  if (status === "archived") return "Archivada"
  return status || "-"
}

function statusClass(status: string | null | undefined) {
  if (status === "open") return "bg-green-100 text-green-800"
  if (status === "pending") return "bg-yellow-100 text-yellow-800"
  if (status === "closed") return "bg-gray-100 text-gray-700"
  if (status === "archived") return "bg-gray-100 text-gray-500"
  return "bg-gray-100 text-gray-700"
}

function channelClass(channel: string | null | undefined) {
  if (channel === "whatsapp") return "bg-emerald-100 text-emerald-800"
  if (channel === "instagram") return "bg-pink-100 text-pink-800"
  if (channel === "messenger") return "bg-blue-100 text-blue-800"
  return "bg-gray-100 text-gray-700"
}

export default async function SuperAdminInboxPage() {
  await requireAdmin()

  const { data: conversations, error: conversationsError } = await supabase
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
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .limit(100)

  if (conversationsError) {
    return (
      <main className="min-h-screen bg-neutral-50 p-6">
        <div className="mx-auto max-w-6xl">
          <Link href="/superadmin" className="text-sm text-green-700 font-semibold">
            ← Volver al superadmin
          </Link>

          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm border border-red-100">
            <h1 className="text-2xl font-bold text-red-700">Error cargando inbox</h1>
            <p className="mt-2 text-sm text-red-600">
              {conversationsError.message}
            </p>
          </div>
        </div>
      </main>
    )
  }

  const safeConversations = conversations || []
  const contactIds = Array.from(
    new Set(safeConversations.map((item: any) => item.contact_id).filter(Boolean))
  )
  const conversationIds = safeConversations.map((item: any) => item.id).filter(Boolean)

  const { data: contacts } = contactIds.length
    ? await supabase
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
          last_seen_at
        `)
        .in("id", contactIds)
    : { data: [] }

  const { data: messages } = conversationIds.length
    ? await supabase
        .from("crm_messages")
        .select(`
          id,
          conversation_id,
          channel,
          direction,
          message_type,
          text,
          status,
          created_at
        `)
        .in("conversation_id", conversationIds)
        .order("created_at", { ascending: false })
        .limit(300)
    : { data: [] }

  const contactsById = new Map<string, any>()
  for (const contact of contacts || []) {
    contactsById.set(contact.id, contact)
  }

  const lastMessageByConversationId = new Map<string, any>()
  for (const message of messages || []) {
    if (!lastMessageByConversationId.has(message.conversation_id)) {
      lastMessageByConversationId.set(message.conversation_id, message)
    }
  }

  const openCount = safeConversations.filter((item: any) => item.status === "open").length
  const whatsappCount = safeConversations.filter((item: any) => item.channel === "whatsapp").length
  const ghlCount = safeConversations.filter((item: any) => item.source === "ghl").length

  return (
    <main className="min-h-screen bg-neutral-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/superadmin" className="text-sm text-green-700 font-semibold">
              ← Volver al superadmin
            </Link>

            <h1 className="mt-3 text-3xl font-bold text-neutral-900">
              Inbox
            </h1>

            <p className="mt-1 text-sm text-neutral-500">
              Mensajes reales recibidos desde GHL. Vista solo lectura.
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-neutral-200 px-4 py-3 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-neutral-400">
              Estado
            </p>
            <p className="text-sm font-semibold text-green-700">
              GHL espejo activo
            </p>
          </div>
        </div>

        <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-neutral-200">
            <p className="text-sm text-neutral-500">Conversaciones</p>
            <p className="mt-2 text-3xl font-bold text-neutral-900">
              {safeConversations.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm border border-neutral-200">
            <p className="text-sm text-neutral-500">Abiertas</p>
            <p className="mt-2 text-3xl font-bold text-green-700">
              {openCount}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm border border-neutral-200">
            <p className="text-sm text-neutral-500">WhatsApp</p>
            <p className="mt-2 text-3xl font-bold text-emerald-700">
              {whatsappCount}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm border border-neutral-200">
            <p className="text-sm text-neutral-500">Fuente GHL</p>
            <p className="mt-2 text-3xl font-bold text-blue-700">
              {ghlCount}
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-2xl bg-white shadow-sm border border-neutral-200 overflow-hidden">
          <div className="border-b border-neutral-100 px-5 py-4">
            <h2 className="text-lg font-bold text-neutral-900">
              Conversaciones recientes
            </h2>
          </div>

          {!safeConversations.length ? (
            <div className="p-10 text-center">
              <p className="text-lg font-semibold text-neutral-800">
                Todavía no hay conversaciones procesadas.
              </p>
              <p className="mt-2 text-sm text-neutral-500">
                Mandá un WhatsApp real y debería aparecer acá.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-sm">
                <thead className="bg-neutral-50 text-neutral-500">
                  <tr>
                    <th className="px-5 py-3 text-left font-semibold">Cliente</th>
                    <th className="px-5 py-3 text-left font-semibold">Canal</th>
                    <th className="px-5 py-3 text-left font-semibold">Último mensaje</th>
                    <th className="px-5 py-3 text-left font-semibold">Estado</th>
                    <th className="px-5 py-3 text-left font-semibold">Fuente</th>
                    <th className="px-5 py-3 text-left font-semibold">Fecha</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-neutral-100">
                  {safeConversations.map((conversation: any) => {
                    const contact = contactsById.get(conversation.contact_id)
                    const lastMessage = lastMessageByConversationId.get(conversation.id)

                    const displayName =
                      contact?.display_name ||
                      [contact?.first_name, contact?.last_name].filter(Boolean).join(" ") ||
                      "Sin nombre"

                    const phone = contact?.phone || contact?.normalized_phone || "-"
                    const text = lastMessage?.text || "Sin mensaje"

                    return (
                        <tr key={conversation.id} className="hover:bg-neutral-50">
                      <td className="px-5 py-4">
                          <Link
                            href={`/superadmin/inbox/${conversation.id}`}
                                className="font-semibold text-neutral-900 hover:text-green-700"
                                  >
                                {displayName}
                            </Link>
                          <div className="mt-1 text-xs text-neutral-500">
                            {phone}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${channelClass(conversation.channel)}`}>
                            {channelLabel(conversation.channel)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="max-w-md truncate text-neutral-800">
                            {text}
                          </div>
                          <div className="mt-1 text-xs text-neutral-400">
                            {lastMessage?.direction === "inbound" ? "Entrante" : "Saliente"}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClass(conversation.status)}`}>
                            {statusLabel(conversation.status)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-neutral-700">
                            {conversation.source || "-"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-neutral-600">
                          {formatDateTime(conversation.last_message_at || conversation.created_at)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
