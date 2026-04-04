"use client"

import { MapContainer, TileLayer, GeoJSON } from "react-leaflet"
import "leaflet/dist/leaflet.css"

export function DeliveryZones() {
  const whatsappLink =
    "https://wa.me/5491133614865?text=Hola%20quiero%20coordinar%20una%20entrega"

  const zona = {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [[
        [-58.70, -34.45],
        [-58.20, -34.45],
        [-58.10, -34.55],
        [-58.10, -34.75],
        [-58.30, -34.90],
        [-58.55, -34.90],
        [-58.70, -34.75],
        [-58.70, -34.45]
      ]]
    }
  }

  return (
    <section id="zonas" className="py-24 bg-card">
      <div className="container mx-auto px-4 text-center max-w-5xl">

        <h2 className="text-3xl md:text-4xl font-bold">
          Entregamos en tu zona
        </h2>

        <p className="mt-4 text-muted-foreground">
          Cubrimos toda CABA y Gran Buenos Aires
        </p>

        <div className="mt-12 rounded-2xl overflow-hidden border shadow-sm">
          <MapContainer
            center={[-34.6, -58.45] as any}
            zoom={10}
            className="h-[400px] w-full"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <GeoJSON
              data={zona as any}
              style={{
                color: "#16a34a",
                fillColor: "#16a34a",
                fillOpacity: 0.25,
                weight: 2
              }}
            />
          </MapContainer>
        </div>

        <p className="mt-8 text-muted-foreground">
          Coordinamos la entrega directamente por WhatsApp según tu ubicación
        </p>

        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-6 px-8 py-4 bg-primary text-white rounded-xl font-semibold"
        >
          Consultar entrega
        </a>

      </div>
    </section>
  )
}
