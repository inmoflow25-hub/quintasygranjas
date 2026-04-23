import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const COOKIE_NAME = "qyg_admin_session"

type AdminSessionPayload = {
  userId: string
  email: string
  exp: number
}

function sign(payload: string) {
  return crypto
    .createHmac("sha256", process.env.ADMIN_SESSION_SECRET!)
    .update(payload)
    .digest("hex")
}

export function createAdminSessionValue(data: AdminSessionPayload) {
  const payload = Buffer.from(JSON.stringify(data)).toString("base64url")
  const signature = sign(payload)
  return `${payload}.${signature}`
}

export function readAdminSessionValue(value: string | undefined | null): AdminSessionPayload | null {
  if (!value) return null

  const [payload, signature] = value.split(".")
  if (!payload || !signature) return null

  const expected = sign(payload)
  if (expected !== signature) return null

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AdminSessionPayload

    if (!parsed?.userId || !parsed?.email || !parsed?.exp) return null
    if (Date.now() > parsed.exp) return null

    return parsed
  } catch {
    return null
  }
}

export async function getAdminUserByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase()

  const { data, error } = await supabase.auth.admin.listUsers()

  if (error || !data?.users?.length) {
    return null
  }

  const authUser = data.users.find(
    (user) => user.email?.toLowerCase() === normalizedEmail
  )

  if (!authUser?.id || !authUser.email) {
    return null
  }

  const { data: admin, error: adminError } = await supabase
    .from("admins")
    .select("id, user_id")
    .eq("user_id", authUser.id)
    .maybeSingle()

  if (adminError || !admin?.user_id) {
    return null
  }

  return {
    id: authUser.id,
    email: authUser.email
  }
}

export async function requireAdmin() {
  const cookieStore = await cookies()
  const raw = cookieStore.get(COOKIE_NAME)?.value
  const session = readAdminSessionValue(raw)

  if (!session) {
    redirect("/admin/login")
  }

  const { data: admin, error } = await supabase
    .from("admins")
    .select("id, user_id")
    .eq("user_id", session.userId)
    .maybeSingle()

  if (error || !admin?.user_id) {
    redirect("/admin/login")
  }

  return session
}

export { COOKIE_NAME }
