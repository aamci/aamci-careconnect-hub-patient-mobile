import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";
import type { Practitioner } from "@/hooks/usePractitioners";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

// Fix default marker icon issue with webpack/vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const userIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  className: "user-marker-icon",
});

const practitionerIcon = new L.DivIcon({
  html: `<div style="background: hsl(174, 62%, 40%); width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  className: "practitioner-marker",
});

function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  const prevCenter = useRef(center);
  useEffect(() => {
    if (
      center[0] !== prevCenter.current[0] ||
      center[1] !== prevCenter.current[1]
    ) {
      map.flyTo(center, 13, { duration: 1 });
      prevCenter.current = center;
    }
  }, [center, map]);
  return null;
}

interface Props {
  practitioners: Practitioner[];
  userLocation?: { lat: number; lng: number } | null;
  className?: string;
}

export function PractitionerMap({ practitioners, userLocation, className }: Props) {
  const navigate = useNavigate();

  // Default center: Paris
  const defaultCenter: [number, number] = [48.8566, 2.3522];
  const center: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : defaultCenter;

  const practitionersWithLocation = practitioners.filter(
    (p) => p.facility?.lat != null && p.facility?.lng != null
  );

  return (
    <div className={className}>
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: "100%", width: "100%", borderRadius: "0.75rem" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapRecenter center={center} />

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <p className="font-medium text-sm">Votre position</p>
            </Popup>
          </Marker>
        )}

        {practitionersWithLocation.map((p) => (
          <Marker
            key={p.id}
            position={[p.facility!.lat!, p.facility!.lng!]}
            icon={practitionerIcon}
          >
            <Popup>
              <div className="min-w-[180px]">
                <p className="font-semibold text-sm">
                  Dr. {p.first_name} {p.last_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {p.specialty?.name}
                </p>
                {p.rating && (
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-3 w-3 fill-warning text-warning" />
                    <span className="text-xs font-medium">{p.rating}</span>
                  </div>
                )}
                {p.facility?.street && (
                  <p className="text-xs mt-1 text-muted-foreground">
                    {p.facility.street}, {p.facility.city}
                  </p>
                )}
                <Button
                  size="sm"
                  className="mt-2 w-full text-xs h-7"
                  onClick={() => navigate(`/practitioners/${p.id}`)}
                >
                  Voir le profil
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
