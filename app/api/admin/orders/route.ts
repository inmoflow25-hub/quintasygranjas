import { createClient } from "@supabase/supabase-js"

export async function GET(req: Request) {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 🔐 1. obtener usuario (IMPORTANTE)
  const authHeader = req.headers.get("authorization")

  const token = authHeader?.replace("Bearer ", "")

  const {
    data: { user }
  } = await supabase.auth.getUser(token)

  if (!user) {
    return Response.json({ error: "not logged" }, { status: 401 })
  }

  // 🔥 2. CHEQUEO ADMIN (ACÁ VA TU CÓDIGO)
  const { data: isAdmin } = await supabase
    .from("admins")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!isAdmin) {
    return Response.json({ error: "not authorized" }, { status: 403 })
  }

  // ✅ 3. traer datos
  const { data, error } = await supabase
    .from("dashboard_orders_view")
    .select("*")

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(data)
}
