import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import webPush from "web-push"
import {
  getPushTemplate,
  type PushTemplateKey
} from "@/lib/push-templates"

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

function normalizeEmail(email: string | null | undefined) {
  return String(email || "").trim().toLowerCase()
}

function normalizePhone(phone: string | null | undefined) {
  return String(phone || "").replace(/\D/g, "")
}

async function findUserId({
  email,
  phone
}: {
  email: string
  phone: string
}) {
  if (email) {
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle()

    if (data?.id) return data.id
  }

  if (phone) {
    const possiblePhones = [
      phone,
      `+54${phone}`,
      `+549${phone}`,
      phone.startsWith("11") ? `+549${phone}` : phone
    ]

    const { data } = await supabase
      .from("profiles")
      .select("id")
      .in("phone", possiblePhones)
      .maybeSingle()

    if (data?.id) return data.id
  }

  return null
}

export async function POST(req: Request) {
  try {
    if (!vapidPublicKey || !vapidPrivateKey) {
      return NextResponse.json(
        {
          error: "Faltan variables VAPID",
          detail:
            "Revisá NEXT_PUBLIC_VAPID_PUBLIC_KEY y VAPID_PRIVATE_KEY en Vercel."
        },
        { status: 500 }
      )
    }

    const body = await req.json().catch(() => ({}))

    const type = String(body.type || "welcome") as PushTemplateKey
    const email = normalizeEmail(body.email)
    const phone = normalizePhone(body.phone)

    const deliveryWindow = String(body.deliveryWindow || "").trim()
    const pointsValue = Number(body.pointsValue || 0)

    const template = getPushTemplate(type, {
      deliveryWindow,
      pointsValue
    })

    if (!template) {
      return NextResponse.json(
        {
          error: "Tipo de push inválido",
          allowed_types: [
            "welcome",
            "order_confirmed",
            "order_on_the_way",
            "order_delivered",
            "points_expiring",
            "abandoned_cart",
            "weekly_reorder"
          ]
        },
        { status: 400 }
      )
    }

    const userId = await findUserId({ email, phone })

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
      return NextResponse.json({
        ok: false,
        sent: 0,
        failed: 0,
        message: "No hay suscripciones activas para enviar."
      })
    }

    const payload = JSON.stringify({
      title: body.title || template.title,
      body: body.message || template.message,
      url: body.url || template.url
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
      type,
      sent,
      failed,
      total: subscriptions.length,
      template,
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
