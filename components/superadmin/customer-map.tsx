"use client"

import { MapContainer, Marker, Polygon, Popup, TileLayer } from "react-leaflet"
import L from "leaflet"

type CustomerPoint = {
  id: string
  customer_name: string | null
  customer_email: string | null
  customer_phone: string | null
  address: string | null
  city: string | null
  lat: number
  lng: number
  geocoding_status: string | null
  purchases_count?: number
  total_purchased?: number
  average_ticket?: number
  first_order_at?: string | null
  last_order_at?: string | null
  last_order_label?: string | null
  main_source?: string | null
  main_payment_method?: string | null
}

type CommercialLocationPoint = {
  id: string
  slug: string
  name: string
  type: string
  address: string | null
  city: string | null
  lat: number | null
  lng: number | null
  polygon: any
  parent_location_id: string | null
}

const AnyMapContainer = MapContainer as any
const AnyTileLayer = TileLayer as any
const AnyMarker = Marker as any
const AnyPopup = Popup as any
const AnyPolygon = Polygon as any

const customerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const towerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [30, 49],
  iconAnchor: [15, 49],
  popupAnchor: [1, -38],
  shadowSize: [41, 41]
})

function money(value: number | null | undefined) {
  return `$${Number(value || 0).toLocaleString("es-AR")}`
}

export default function CustomerMap({
  points,
  commercialLocations = []
}: {
  points: CustomerPoint[]
  commercialLocations?: CommercialLocationPoint[]
}) {
  const towers = commercialLocations.filter(
    (location) => location.type === "tower" && location.lat !== null && location.lng !== null
  )

  const clusters = commercialLocations.filter(
    (location) => location.type === "cluster"
  )

  const firstTower = towers[0]
  const firstCustomer = points[0]

  const center: [number, number] =
    firstTower?.lat && firstTower?.lng
      ? [Number(firstTower.lat), Number(firstTower.lng)]
      : firstCustomer
        ? [firstCustomer.lat, firstCustomer.lng]
        : [-34.6037, -58.3816]

  return (
    <div className="h-[620px] overflow-hidden rounded-3xl border border-[#e3e1dc] bg-white shadow-sm">
      <AnyMapContainer
        center={center}
        zoom={16}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <AnyTileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {clusters.map((cluster) => {
          const polygon = Array.isArray(cluster.polygon)
            ? cluster.polygon.map((point: any) => [Number(point[0]), Number(point[1])])
            : []

          if (!polygon.length) return null

          return (
            <AnyPolygon
              key={cluster.id}
              positions={polygon}
            >
              <AnyPopup>
                <div className="space-y-1 text-sm">
                  <p className="font-bold">{cluster.name}</p>
                  <p>{cluster.address || "-"}</p>
                  <p>{cluster.city || "-"}</p>
                </div>
              </AnyPopup>
            </AnyPolygon>
          )
        })}

        {towers.map((tower) => (
          <AnyMarker
            key={tower.id}
            position={[Number(tower.lat), Number(tower.lng)]}
            icon={towerIcon}
          >
            <AnyPopup>
              <div className="space-y-1 text-sm">
                <p className="font-bold">{tower.name}</p>
                <p>{tower.address || "Domicilio pendiente"}</p>
                <p>{tower.city || "-"}</p>
                <a
                  href={`/vecinos/${tower.slug}`}
                  target="_blank"
                  className="font-semibold underline"
                >
                  Abrir QR/web
                </a>
              </div>
            </AnyPopup>
          </AnyMarker>
        ))}

        {points.map((point) => (
          <AnyMarker
            key={point.id}
            position={[point.lat, point.lng]}
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
              </div>
            </AnyPopup>
          </AnyMarker>
        ))}
      </AnyMapContainer>
    </div>
  )
}
