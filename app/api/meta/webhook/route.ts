async function processMessengerWebhook(eventId: string, payload: any) {
  const entries = Array.isArray(payload?.entry) ? payload.entry : []

  for (const entry of entries) {
    const pageId = String(entry?.id || "")
    const messagingEvents = Array.isArray(entry?.messaging) ? entry.messaging : []

    for (const item of messagingEvents) {
      const senderId = String(item?.sender?.id || "")
      const recipientId = String(item?.recipient?.id || pageId || "")
      const messageId = String(item?.message?.mid || "")
      const text = String(item?.message?.text || "").trim()
      const timestamp = item?.timestamp ? new Date(Number(item.timestamp)).toISOString() : new Date().toISOString()

      if (!senderId || !text) continue

      const displayName = `Facebook ${senderId.slice(-6)}`

      const { data: existingContact } = await supabase
        .from("crm_contacts")
        .select("id")
        .eq("source", "meta")
        .filter("metadata->>messenger_psid", "eq", senderId)
        .maybeSingle()

      let contactId = existingContact?.id

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

        if (contactError) throw contactError
        contactId = newContact.id
      } else {
        await supabase
          .from("crm_contacts")
          .update({
            last_seen_at: timestamp
          })
          .eq("id", contactId)
      }

      const { data: existingConversation } = await supabase
        .from("crm_conversations")
        .select("id")
        .eq("channel", "messenger")
        .eq("external_thread_id", senderId)
        .maybeSingle()

      let conversationId = existingConversation?.id

      if (!conversationId) {
        const { data: newConversation, error: conversationError } = await supabase
          .from("crm_conversations")
          .insert({
            contact_id: contactId,
            channel: "messenger",
            status: "open",
            source: "meta",
            external_thread_id: senderId,
            last_message_at: timestamp
          })
          .select("id")
          .single()

        if (conversationError) throw conversationError
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
        await supabase
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
