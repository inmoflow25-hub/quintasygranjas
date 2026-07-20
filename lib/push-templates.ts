export type PushTemplateKey =
  | "welcome"
  | "order_confirmed"
  | "order_on_the_way"
  | "order_delivered"
  | "points_expiring"
  | "abandoned_cart"
  | "weekly_reorder"

const GOOGLE_REVIEW_URL =
  "https://www.google.com/search?client=ms-android-samsung-ss&hs=qLcV&sca_esv=a6c48276f9deda42&sxsrf=APpeQnsMbLdQIVyiNbYOeEvKQnyzMB7u1w:1784427455312&kgmid=/g/11z4d5dgfb&q=Quintas+y+Granjas&shem=epsd1,ltae,rimspwouoe&shndl=30&source=sh/x/loc/act/m1/2&kgs=6a79a43e861c8142&utm_source=epsd1,ltae,rimspwouoe,sh/x/loc/act/m1/2&zx=1784563464841"

type PushTemplateInput = {
  deliveryWindow?: string
  pointsValue?: number
}

function money(value: number) {
  return `$${Math.round(value || 0).toLocaleString("es-AR")}`
}

export function getPushTemplate(
  type: PushTemplateKey,
  input: PushTemplateInput = {}
) {
  const deliveryWindow = input.deliveryWindow?.trim()
  const pointsValue = input.pointsValue || 0

  const templates = {
    welcome: {
      title: "Bienvenido a Quintas y Granjas 🌱",
      message:
        "Te vamos a avisar novedades importantes de tus pedidos y beneficios.",
      url: "/app"
    },

    order_confirmed: {
      title: "Pedido confirmado ✅",
      message: deliveryWindow
        ? `Recibimos tu pedido y ya lo estamos preparando. Llega ${deliveryWindow}.`
        : "Recibimos tu pedido y ya lo estamos preparando. Te avisamos cuando esté en camino.",
      url: "/app/orders"
    },

    order_on_the_way: {
      title: "Tu pedido está en camino 🚚",
      message: deliveryWindow
        ? `Estate atento, llega ${deliveryWindow}.`
        : "Estate atento, llega pronto.",
      url: "/app/orders"
    },

    order_delivered: {
      title: "Pedido entregado ✅",
      message: pointsValue
        ? `Ya acreditamos ${money(pointsValue)} en puntos. ¿Nos puntuás en Google? Nos ayuda muchísimo.`
        : "Ya acreditamos tus puntos. ¿Nos puntuás en Google? Nos ayuda muchísimo.",
      url: GOOGLE_REVIEW_URL
    },

    points_expiring: {
      title: "Tus puntos vencen pronto ⏳",
      message: pointsValue
        ? `Tenés ${money(pointsValue)} por vencer. Usalos en tu próxima compra desde la app.`
        : "Usalos en tu próxima compra desde la app.",
      url: "/app"
    },

    abandoned_cart: {
      title: "Te quedó un pedido pendiente 🥬",
      message: "Podés terminarlo desde la app cuando quieras.",
      url: "/app"
    },

    weekly_reorder: {
      title: "¿Repetimos tu pedido de la semana? 🌱",
      message: "Entrá a la app y armalo en pocos minutos.",
      url: "/app"
    }
  }

  return templates[type]
}
