import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import webPush from "web-push"

export const runtime = "nodejs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:inmoflow25@gmail.com"

if (vapidPublicKey && vapidPrivateKey) {
  webPush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)
}

export async function POST(req: Request) {
  try {
    if (!vapidPublicKey || !vapidPrivateKey) {
      return NextResponse.json(
        {
          error: "Faltan variables VAPID",
          detail: "Revisá NEXT_PUBLIC_VAPID_PUBLIC_KEY y VAPID_PRIVATE_KEY en Vercel."
        },
        { status: 500 }
      )
    }

    const body = await req.json().catch(() => ({}))

    const title = body.title || "Quintas y Granjas"
    const message =
      body.message || "Tenés novedades importantes en la app."
    const url = body.url || "/app"

    const email = String(body.email || "").trim().toLowerCase()
    const phone = String(body.phone || "").replace(/\D/g, "")

    let userId: string | null = null

    if (email) {
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .maybeSingle()

      userId = data?.id || null
    }

    if (!userId && phone) {
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .or(`phone.eq.${phone},phone.eq.+54${phone},phone.eq.+549${phone}`)
        .maybeSingle()

      userId = data?.id || null
    }

    let query = supabase
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .eq("active", true)
      .eq("permission_status", "granted")

    if (userId) {
      query = query.eq("user_id", userId)
    }

    const { data: subscriptions, error } = await query

    if (error) {
      return NextResponse.json(
        {
          error: "No se pudieron buscar suscripciones push",
          detail: error.message,
          code: error.code
        },
        { status: 500 }
      )
    }

    if (!subscriptions?.length) {
      return NextResponse.json(
        {
          ok: false,
          sent: 0,
          failed: 0,
          message: "No hay suscripciones activas para enviar."
        },
        { status: 200 }
      )
    }

    const payload = JSON.stringify({
      title,
      body: message,
      url
    })

    let sent = 0
    let failed = 0

    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          await webPush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth
              }
            },
            payload
          )

          sent += 1

          return {
            id: subscription.id,
            ok: true
          }
        } catch (error: any) {
          failed += 1

          const statusCode = error?.statusCode || null

          if (statusCode === 404 || statusCode === 410) {
            await supabase
              .from("push_subscriptions")
              .update({
                active: false,
                permission_status: "revoked",
                updated_at: new Date().toISOString()
              })
              .eq("id", subscription.id)
          }

          return {
            id: subscription.id,
            ok: false,
            statusCode,
            message: error?.message || "Error enviando push"
          }
        }
      })
    )

    return NextResponse.json({
      ok: true,
      sent,
      failed,
      total: subscriptions.length,
      results
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Error interno enviando push",
        detail: error?.message
      },
      { status: 500 }
    )
  }
}
