"use client";

import "leaflet/dist/leaflet.css";

import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";

/** Map body, loaded only in the browser by `property-map.tsx`. */
export default function PropertyMapInner({
  lat,
  lon,
  label,
}: {
  lat: number;
  lon: number;
  label: string;
}) {
  return (
    <MapContainer
      center={[lat, lon]}
      zoom={16}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
      attributionControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <CircleMarker center={[lat, lon]} radius={9} pathOptions={{ color: "#1d5b4f", fillColor: "#1d5b4f", fillOpacity: 0.85 }}>
        <Popup>{label}</Popup>
      </CircleMarker>
    </MapContainer>
  );
}
