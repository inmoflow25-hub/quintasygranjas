import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default function VLPage() {
  redirect("/vecinos/mz-vl-001")
}
