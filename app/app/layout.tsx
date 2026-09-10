import PwaUsageTracker from "@/components/app/pwa-usage-tracker"

export default function AppLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <PwaUsageTracker />
      {children}
    </>
  )
}
