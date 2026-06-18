"use client"

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet"
import L from "leaflet"

type CustomerPoint = {
  id: string
  customer_key: string
  customer_name: string | null
  customer_email: string | null
  customer_phone: string | null
  address: string | null
  city: string | null
  lat: number
  lng: number
  geocoding_status: string | null
  notes?: string | null
  purchases_count?: number
  total_purchased?: number
  average_ticket?: number
  first_order_at?: string | null
  last_order_at?: string | null
  last_order_label?: string | null
  main_source?: string | null
  main_payment_method?: string | null
}

const AnyMapContainer = MapContainer as any
const AnyTileLayer = TileLayer as any
const AnyMarker = Marker as any
const AnyPopup = Popup as any

const customerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

function money(value: number | null | undefined) {
  return `$${Number(value || 0).toLocaleString("es-AR")}`
}

function coordinateKey(point: CustomerPoint) {
  return `${point.lat.toFixed(6)},${point.lng.toFixed(6)}`
}

function offsetPoint(point: CustomerPoint, index: number, total: number) {
  if (total <= 1) {
    return [point.lat, point.lng] as [number, number]
  }

  const radius = 0.00018
  const angle = (2 * Math.PI * index) / total

  return [
    point.lat + Math.sin(angle) * radius,
    point.lng + Math.cos(angle) * radius
  ] as [number, number]
}

export default function CustomerMap({
  points
}: {
  points: CustomerPoint[]
}) {
  const firstCustomer = points[0]

  const center: [number, number] = firstCustomer
    ? [firstCustomer.lat, firstCustomer.lng]
    : [-34.6037, -58.3816]

  const duplicateGroups = new Map<string, CustomerPoint[]>()

  for (const point of points) {
    const key = coordinateKey(point)
    const current = duplicateGroups.get(key) || []

    current.push(point)
    duplicateGroups.set(key, current)
  }

  const renderPoints = points.map((point) => {
    const key = coordinateKey(point)
    const group = duplicateGroups.get(key) || [point]
    const index = group.findIndex((item) => item.id === point.id)

    return {
      ...point,
      renderPosition: offsetPoint(point, Math.max(index, 0), group.length),
      duplicateCount: group.length
    }
  })

  return (
    <div className="h-[620px] overflow-hidden rounded-3xl border border-[#e3e1dc] bg-white shadow-sm">
      <AnyMapContainer
        center={center}
        zoom={11}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <AnyTileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {renderPoints.map((point) => (
          <AnyMarker
            key={point.id}
            position={point.renderPosition}
            icon={customerIcon}
          >
            <AnyPopup>
              <div className="space-y-1 text-sm">
                <p className="font-bold">
                  {point.customer_name || "Cliente"}
                </p>

                <p>{point.customer_phone || "-"}</p>
                <p>{point.customer_email || "-"}</p>

                <p>
                  {point.address || "-"}
                  <br />
                  {point.city || "-"}
                </p>

                <div className="mt-2 rounded-xl bg-[#f5f5f3] p-2">
                  <p>
                    <strong>Compras:</strong> {point.purchases_count || 0}
                  </p>

                  <p>
                    <strong>Total comprado:</strong> {money(point.total_purchased)}
                  </p>

                  <p>
                    <strong>Ticket prom.:</strong> {money(point.average_ticket)}
                  </p>

                  <p>
                    <strong>Última compra:</strong> {point.last_order_label || "-"}
                  </p>

                  <p>
                    <strong>Canal:</strong> {point.main_source || "-"}
                  </p>

                  <p>
                    <strong>Pago:</strong> {point.main_payment_method || "-"}
                  </p>
                </div>

                {point.duplicateCount > 1 && (
                  <p className="mt-2 rounded-lg bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
                    Coordenada compartida con {point.duplicateCount - 1} cliente(s). Este pin fue separado visualmente.
                  </p>
                )}
              </div>
            </AnyPopup>
          </AnyMarker>
        ))}
      </AnyMapContainer>
    </div>
  )
}
