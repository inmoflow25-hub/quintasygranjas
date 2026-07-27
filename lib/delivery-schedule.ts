export type DeliverySchedule = {
  scheduledDeliveryDate: string
  scheduledDeliveryLabel: string
  scheduledDeliveryWindow: "post_mediodia"
  orderCutoffBucket:
    | "miercoles_22_a_sabado_22"
    | "sabado_22_a_miercoles_22"
}

const ARGENTINA_TIMEZONE = "America/Argentina/Buenos_Aires"

function getArgentinaParts(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: ARGENTINA_TIMEZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  })

  const parts = formatter.formatToParts(date)

  const weekday = parts.find((part) => part.type === "weekday")?.value || ""
  const hour = Number(parts.find((part) => part.type === "hour")?.value || 0)
  const minute = Number(parts.find((part) => part.type === "minute")?.value || 0)

  return {
    weekday,
    hour,
    minute
  }
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

function formatArgentinaDate(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: ARGENTINA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  })

  return formatter.format(date)
}

function getDaysUntilTarget(fromWeekday: string, targetWeekday: string) {
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const fromIndex = weekdays.indexOf(fromWeekday)
  const targetIndex = weekdays.indexOf(targetWeekday)

  if (fromIndex === -1 || targetIndex === -1) return 0

  return (targetIndex - fromIndex + 7) % 7
}

function isAtOrAfter22(hour: number, minute: number) {
  return hour > 22 || (hour === 22 && minute >= 0)
}

export function getScheduledDelivery(createdAt: Date = new Date()): DeliverySchedule {
  const { weekday, hour, minute } = getArgentinaParts(createdAt)

  const isWednesdayAfter22 = weekday === "Wed" && isAtOrAfter22(hour, minute)
  const isThursday = weekday === "Thu"
  const isFriday = weekday === "Fri"
  const isSaturdayBefore22 =
    weekday === "Sat" && !isAtOrAfter22(hour, minute)

  const goesToMonday =
    isWednesdayAfter22 || isThursday || isFriday || isSaturdayBefore22

  if (goesToMonday) {
    const daysUntilMonday = getDaysUntilTarget(weekday, "Mon") || 7
    const deliveryDate = addDays(createdAt, daysUntilMonday)

    return {
      scheduledDeliveryDate: formatArgentinaDate(deliveryDate),
      scheduledDeliveryLabel: "Lunes post mediodía",
      scheduledDeliveryWindow: "post_mediodia",
      orderCutoffBucket: "miercoles_22_a_sabado_22"
    }
  }

  const daysUntilFriday = getDaysUntilTarget(weekday, "Fri") || 7
  const deliveryDate = addDays(createdAt, daysUntilFriday)

  return {
    scheduledDeliveryDate: formatArgentinaDate(deliveryDate),
    scheduledDeliveryLabel: "Viernes post mediodía",
    scheduledDeliveryWindow: "post_mediodia",
    orderCutoffBucket: "sabado_22_a_miercoles_22"
  }
}
