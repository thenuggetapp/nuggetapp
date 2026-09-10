"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useMapCamera } from "@/hooks/useMapCamera";

interface MapboxMapProps {
  coordinates?: [number, number];
  flyToCoordinates?: [number, number];
  fitBounds?: [number, number, number, number];
  /** Reserved space (e.g. an overlapping bottom sheet) that camera moves should treat as hidden. */
  bottomPaddingPx?: number;
  markers?: Array<{
    id: string;
    coordinates: [number, number];
    title: string;
    description?: string;
  }>;
  onMarkerClick?: (id: string) => void;
  onMarkerHover?: (id: string | null) => void;
  hoveredMarkerId?: string | null;
  zoom?: number;
  onViewportChange?: (viewport: {
    center: [number, number];
    bounds: [number, number, number, number];
  }) => void;
  onMapReady?: (map: mapboxgl.Map) => void;
}

export function MapboxMap({
  coordinates = [-0.1278, 51.5074],
  flyToCoordinates,
  fitBounds,
  bottomPaddingPx,
  markers = [],
  onMarkerClick,
  onMarkerHover,
  hoveredMarkerId,
  zoom = 11,
  onViewportChange,
  onMapReady,
}: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const markerPopupsRef = useRef<Map<string, mapboxgl.Popup>>(new Map());
  const geolocateControlRef = useRef<mapboxgl.GeolocateControl | null>(null);
  // Stable refs so event handlers never need to re-register when callback identity changes
  const onViewportChangeRef = useRef(onViewportChange);
  useEffect(() => { onViewportChangeRef.current = onViewportChange; }, [onViewportChange]);
  const onMapReadyRef = useRef(onMapReady);
  useEffect(() => { onMapReadyRef.current = onMapReady; }, [onMapReady]);

  useEffect(() => {
    if (!mapContainer.current) return;

    const token =
      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ||
      "pk.eyJ1Ijoid2lzZXJuIiwiYSI6ImNsczBwcmtoMzAyYTYya21raHBtYXFkdWkifQ.92tySIKG-TSBatGA3--0Wg";
    if (!token || token.includes("example")) {
      console.error(
        "Mapbox token not configured. Please add a valid token to .env",
      );
      return;
    }

    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: coordinates,
      zoom: zoom,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    const geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserHeading: true,
    });

    geolocateControlRef.current = geolocateControl;
    map.current.addControl(geolocateControl, "top-right");

    geolocateControl.on("geolocate", () => {
      const isMobile = window.innerWidth <= 768;
      if (isMobile && map.current) {
        map.current.setZoom(17);
      }
    });

    map.current.on("load", () => {
      setMapLoaded(true);
      if (map.current) onMapReadyRef.current?.(map.current);
    });

    map.current.on("moveend", () => {
      if (!onViewportChangeRef.current || !map.current) return;
      const center = map.current.getCenter();
      const currentBounds = map.current.getBounds();
      if (!currentBounds) return;
      onViewportChangeRef.current({
        center: [center.lng, center.lat],
        bounds: [currentBounds.getWest(), currentBounds.getSouth(), currentBounds.getEast(), currentBounds.getNorth()],
      });
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
    markerPopupsRef.current.clear();

    // Add markers if available
    if (markers.length > 0) {
      markers.forEach((markerData) => {
        const el = document.createElement("div");
        el.className = "custom-marker";
        el.style.width = "32px";
        el.style.height = "44px";
        el.style.cursor = "pointer";
        el.style.backgroundImage = "url(/nugget_map_marker.svg)";
        el.style.backgroundSize = "contain";
        el.style.backgroundRepeat = "no-repeat";
        el.style.backgroundPosition = "center";

        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: false,
          closeOnClick: false,
        }).setHTML(
          `<div class="p-2">
            <h3 class="font-bold text-sm">${markerData.title}</h3>
            ${markerData.description ? `<p class="text-xs text-gray-600 mt-1">${markerData.description}</p>` : ""}
          </div>`,
        );

        const marker = new mapboxgl.Marker(el)
          .setLngLat(markerData.coordinates)
          .setPopup(popup)
          .addTo(map.current!);

        if (onMarkerClick) {
          el.addEventListener("click", () => onMarkerClick(markerData.id));
        }

        if (onMarkerHover) {
          el.addEventListener("mouseenter", () => onMarkerHover(markerData.id));
          el.addEventListener("mouseleave", () => onMarkerHover(null));
        }

        markersRef.current.push(marker);
        markerPopupsRef.current.set(markerData.id, popup);
      });
    }
  }, [markers, mapLoaded, onMarkerClick]);

  useEffect(() => {
    if (!mapLoaded) return;

    markerPopupsRef.current.forEach((popup, markerId) => {
      if (markerId === hoveredMarkerId) {
        popup.addTo(map.current!);
      } else {
        popup.remove();
      }
    });
  }, [hoveredMarkerId, mapLoaded]);

  const markerCoordinates = useMemo(
    () => markers.map((m) => m.coordinates),
    [markers],
  );

  useMapCamera({
    map,
    mapLoaded,
    markerCoordinates,
    coordinates,
    fitBounds,
    flyToCoordinates,
    zoom,
    bottomPaddingPx,
  });

  return (
    <div
      ref={mapContainer}
      className="w-full h-full rounded-lg overflow-hidden"
    />
  );
}
