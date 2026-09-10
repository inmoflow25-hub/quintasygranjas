import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function clean(value: unknown, maxLength: number) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const installationId = clean(body?.installation_id, 36)

    if (!UUID_PATTERN.test(installationId)) {
      return NextResponse.json(
        { error: "installation_id inválido" },
        { status: 400 }
      )
    }

    const requestedDevice = clean(body?.device_type, 20)

    const deviceType = [
      "ios",
      "android",
      "desktop",
      "unknown"
    ].includes(requestedDevice)
      ? requestedDevice
      : "unknown"

    const requestedPath = clean(body?.path, 300)
    const lastPath = requestedPath.startsWith("/app")
      ? requestedPath
      : "/app"

    const { error } = await supabase.rpc(
      "track_pwa_installation",
      {
        p_installation_id: installationId,
        p_device_type: deviceType,
        p_customer_email: clean(body?.customer_email, 200),
        p_customer_phone: clean(body?.customer_phone, 50),
        p_user_agent: clean(
          request.headers.get("user-agent"),
          500
        ),
        p_last_path: lastPath
      }
    )

    if (error) {
      console.error("pwa analytics error", error)

      return NextResponse.json(
        { error: "No se pudo registrar el uso" },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("pwa analytics fatal error", error)

    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    )
  }
}
