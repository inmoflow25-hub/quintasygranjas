import { NextResponse } from "next/server"
import { COOKIE_NAME, createAdminSessionValue, getAdminUserByEmail } from "@/lib/admin-auth"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = String(body?.email || "").trim().toLowerCase()
    const password = String(body?.password || "")

    if (!email || !password) {
      return NextResponse.json(
        { error: "Faltan email o clave" },
        { status: 400 }
      )
    }

    if (password !== process.env.ADMIN_PORTAL_PASSWORD) {
      return NextResponse.json(
        { error: "Clave incorrecta" },
        { status: 401 }
      )
    }

    const adminUser = await getAdminUserByEmail(email)

    if (!adminUser) {
      return NextResponse.json(
        { error: "Este usuario no tiene acceso al admin" },
        { status: 403 }
      )
    }

    const sessionValue = createAdminSessionValue({
      userId: adminUser.id,
      email: adminUser.email,
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7
    })

    const response = NextResponse.json({ ok: true })

    response.cookies.set({
      name: COOKIE_NAME,
      value: sessionValue,
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    })

    return response
  } catch (error) {
    console.error("admin login error", error)
    return NextResponse.json(
      { error: "No se pudo iniciar sesión" },
      { status: 500 }
    )
  }
}
