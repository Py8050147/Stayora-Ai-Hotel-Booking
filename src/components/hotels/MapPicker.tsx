"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import type L from "leaflet";

interface MapPickerProps {
  latitude: number | undefined;
  longitude: number | undefined;
  onLocationChange: (lat: number, lng: number) => void;
}

function LocationMarker({ latitude, longitude, onLocationChange }: MapPickerProps) {
  useMapEvents({
    click(e: L.LeafletMouseEvent) {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });

  if (!latitude || !longitude) return null;

  return null; // Marker handled by parent component
}

export default function MapPicker({ latitude, longitude, onLocationChange }: MapPickerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [LeafletIcon, setLeafletIcon] = useState<L.Icon | null>(null);

  useEffect(() => {
    setIsMounted(true);
    import("leaflet").then((L) => {
      const icon = new L.Icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });
      setLeafletIcon(icon);
    });
  }, []);

  if (!isMounted) {
    return <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">Loading map...</div>;
  }

  const center: [number, number] = latitude && longitude ? [latitude, longitude] : [20.5937, 78.9629];

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border border-border">
      <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker latitude={latitude} longitude={longitude} onLocationChange={onLocationChange} />
        {latitude && longitude && LeafletIcon && (
          <Marker position={[latitude, longitude]} icon={LeafletIcon} />
        )}
      </MapContainer>
    </div>
  );
}