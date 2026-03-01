import { useState, useCallback } from "react";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

function getGeolocationErrorMessage(err: GeolocationPositionError): string {
  switch (err.code) {
    case err.PERMISSION_DENIED:
      return "Accès à la position refusé. Autorisez la localisation dans votre navigateur.";
    case err.POSITION_UNAVAILABLE:
      return "Position indisponible pour le moment.";
    case err.TIMEOUT:
      return "La localisation a expiré. Réessayez.";
    default:
      return "Impossible d'obtenir votre position.";
  }
}

function getCurrentPosition(options: PositionOptions): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: false,
  });

  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setState((prev) => ({ ...prev, error: "Géolocalisation non supportée" }));
      return;
    }

    if (!window.isSecureContext) {
      setState((prev) => ({
        ...prev,
        error: "La géolocalisation nécessite une connexion sécurisée (HTTPS).",
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const position = await getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 0,
      });

      setState({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        error: null,
        loading: false,
      });
    } catch (firstError) {
      const geoError = firstError as GeolocationPositionError;

      if (geoError.code === geoError.TIMEOUT) {
        try {
          const fallbackPosition = await getCurrentPosition({
            enableHighAccuracy: false,
            timeout: 20000,
            maximumAge: 300000,
          });

          setState({
            latitude: fallbackPosition.coords.latitude,
            longitude: fallbackPosition.coords.longitude,
            error: null,
            loading: false,
          });
          return;
        } catch (fallbackError) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: getGeolocationErrorMessage(fallbackError as GeolocationPositionError),
          }));
          return;
        }
      }

      setState((prev) => ({
        ...prev,
        loading: false,
        error: getGeolocationErrorMessage(geoError),
      }));
    }
  }, []);

  return { ...state, requestLocation };
}


export function getDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
