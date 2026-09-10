import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

const EASE_IN_OUT_QUAD = (t: number) =>
  t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

interface UseMapCameraArgs {
  map: React.RefObject<mapboxgl.Map | null>;
  mapLoaded: boolean;
  markerCoordinates: Array<[number, number]>;
  coordinates?: [number, number];
  fitBounds?: [number, number, number, number];
  flyToCoordinates?: [number, number];
  zoom: number;
  bottomPaddingPx?: number;
}

/**
 * Owns every camera move for MapboxMap so only one effect ever issues a
 * flyTo/fitBounds/jumpTo per render, in a fixed priority order:
 *   fitBounds > flyToCoordinates > initial marker/coordinate snap.
 * Without this, effects that each move the camera independently can fire in
 * the same commit and produce a double-animation ("flies twice").
 */
export function useMapCamera({
  map,
  mapLoaded,
  markerCoordinates,
  coordinates,
  fitBounds,
  flyToCoordinates,
  zoom,
  bottomPaddingPx = 0,
}: UseMapCameraArgs) {
  const hasInitiallyPositioned = useRef(false);

  // Baseline so anything that moves the camera without its own padding
  // (e.g. built-in controls) still respects the sheet. Real camera moves
  // below pass their own merged padding, since fitBounds/flyTo/jumpTo
  // overwrite this global value as a side effect otherwise (retainPadding
  // defaults to true) — a plain `padding: 80` there would silently wipe out
  // the sheet's bottom padding on the very next search.
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    map.current.setPadding({
      top: 0,
      bottom: bottomPaddingPx,
      left: 0,
      right: 0,
    });
  }, [bottomPaddingPx, mapLoaded]);

  // Highest priority: an explicit bounding box (e.g. new search results).
  // bottomPaddingPx is intentionally left out of the deps below — dragging
  // the sheet shouldn't itself re-fly the camera, only the next real move should.
  useEffect(() => {
    if (!map.current || !mapLoaded || !fitBounds) return;

    const [swLng, swLat, neLng, neLat] = fitBounds;
    map.current.fitBounds(
      [
        [swLng, swLat],
        [neLng, neLat],
      ],
      {
        padding: { top: 80, bottom: 80 + bottomPaddingPx, left: 80, right: 80 },
        maxZoom: 14,
        minZoom: 8,
        duration: 1800,
        easing: EASE_IN_OUT_QUAD,
        linear: true,
      },
    );
    hasInitiallyPositioned.current = true;
  }, [fitBounds, mapLoaded]);

  // Next priority: an explicit single-point fly-to. Skipped when fitBounds is
  // also set this render so the two never fight over the same move.
  useEffect(() => {
    if (!map.current || !mapLoaded || !flyToCoordinates || fitBounds) return;

    map.current.flyTo({
      center: flyToCoordinates,
      zoom: 11,
      duration: 2200,
      easing: EASE_IN_OUT_QUAD,
      padding: { top: 0, bottom: bottomPaddingPx, left: 0, right: 0 },
    });
    hasInitiallyPositioned.current = true;
  }, [flyToCoordinates, mapLoaded, fitBounds]);

  // Fallback: the very first time the map has anything to show and neither
  // of the above has claimed this render, snap to it instantly (no arc).
  useEffect(() => {
    if (
      !map.current ||
      !mapLoaded ||
      hasInitiallyPositioned.current ||
      fitBounds ||
      flyToCoordinates
    ) {
      return;
    }

    if (markerCoordinates.length > 1) {
      const bounds = markerCoordinates.reduce(
        (b, c) => b.extend(c),
        new mapboxgl.LngLatBounds(),
      );
      map.current.fitBounds(bounds, {
        padding: {
          top: 100,
          bottom: 100 + bottomPaddingPx,
          left: 100,
          right: 100,
        },
        maxZoom: 13,
        duration: 0,
      });
      hasInitiallyPositioned.current = true;
    } else if (markerCoordinates.length === 1) {
      map.current.jumpTo({
        center: markerCoordinates[0],
        zoom,
        padding: { top: 0, bottom: bottomPaddingPx, left: 0, right: 0 },
      });
      hasInitiallyPositioned.current = true;
    } else if (coordinates) {
      map.current.jumpTo({
        center: coordinates,
        zoom,
        padding: { top: 0, bottom: bottomPaddingPx, left: 0, right: 0 },
      });
      hasInitiallyPositioned.current = true;
    }
  }, [
    markerCoordinates,
    coordinates,
    zoom,
    mapLoaded,
    fitBounds,
    flyToCoordinates,
  ]);
}
