"use client"

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet"
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

export default function CustomerMap({
  points
}: {
  points: CustomerPoint[]
}) {
  const center: [number, number] =
    points.length > 0
      ? [points[0].lat, points[0].lng]
      : [-34.6037, -58.3816]

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
              </div>
            </AnyPopup>
          </AnyMarker>
        ))}
      </AnyMapContainer>
    </div>
  )
}
