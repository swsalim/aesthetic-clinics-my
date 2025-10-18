'use client';

import { useCallback, useMemo, useState } from 'react';
import Map, {
  GeolocateControl,
  MapEvent,
  Marker,
  NavigationControl,
  ViewStateChangeEvent,
} from 'react-map-gl';

import Image from 'next/image';

import { LngLatBounds } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Location {
  lat: number;
  long: number;
  name: string;
}

interface MapboxMapProps {
  locations: Location[];
  zoom?: number;
  interactive?: boolean;
  markerSize?: { width: number; height: number };
  onViewStateChange?: (event: ViewStateChangeEvent) => void;
}

export default function MapboxMap({
  locations,
  interactive = true,
  markerSize = { width: 24, height: 32 },
  onViewStateChange,
}: MapboxMapProps) {
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const mapboxStyle = process.env.NEXT_PUBLIC_MAPBOX_STYLE;

  // Filter valid locations and calculate bounds
  const { validLocations, bounds } = useMemo<{
    validLocations: Location[];
    bounds: LngLatBounds | undefined;
  }>(() => {
    const valid = locations.filter(
      (loc) =>
        typeof loc.lat === 'number' &&
        typeof loc.long === 'number' &&
        loc.lat !== 0 &&
        loc.long !== 0 &&
        loc.lat >= -90 &&
        loc.lat <= 90 &&
        loc.long >= -180 &&
        loc.long <= 180,
    );

    if (valid.length === 0) {
      return {
        validLocations: [],
        bounds: undefined,
      };
    }

    // Calculate bounds
    const bbox = new LngLatBounds();
    valid.forEach((loc) => {
      bbox.extend([loc.long, loc.lat]);
    });

    return {
      validLocations: valid,
      bounds: bbox,
    };
  }, [locations]);

  const handleMapLoad = useCallback(() => {
    setMapLoaded(true);
  }, []);

  const handleMapError = useCallback((error: MapEvent) => {
    console.error('Mapbox error:', error);
    setMapError('Failed to load map. Please try again later.');
  }, []);

  if (!mapboxToken) {
    console.error('MapboxMap: Missing API token');
    return (
      <div className="flex h-96 w-full items-center justify-center bg-gray-100">
        <p className="text-red-500">Map configuration error: Missing API token</p>
      </div>
    );
  }

  if (validLocations.length === 0) {
    console.warn('MapboxMap: No valid locations to display');
    return (
      <div className="flex h-96 w-full items-center justify-center bg-gray-100">
        <p className="text-amber-500">No valid location coordinates available</p>
      </div>
    );
  }

  // Calculate initial viewport settings
  const initialViewState = {
    bounds: bounds?.toArray() as [[number, number], [number, number]],
    fitBoundsOptions: {
      padding: validLocations.length > 1 ? 50 : 100, // More padding for single location
      maxZoom: validLocations.length > 1 ? 20 : 14, // Limit zoom for single location
    },
  };

  return (
    <div className="relative h-72 w-full overflow-hidden rounded-lg border border-gray-200">
      {!mapLoaded && !mapError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100">
          <div className="animate-pulse">Loading map...</div>
        </div>
      )}

      {mapError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100">
          <p className="text-red-500">{mapError}</p>
        </div>
      )}

      <div className="h-full w-full">
        <Map
          mapboxAccessToken={mapboxToken}
          mapStyle={mapboxStyle}
          initialViewState={initialViewState}
          maxZoom={20}
          minZoom={3}
          interactiveLayerIds={interactive ? undefined : []}
          attributionControl={true}
          onLoad={handleMapLoad}
          onError={handleMapError}
          onMove={onViewStateChange}
          aria-label="Location map">
          {validLocations.map((location, index) => (
            <Marker
              key={`${location.lat}-${location.long}-${index}`}
              longitude={location.long}
              latitude={location.lat}
              anchor="bottom">
              <div
                className="group relative cursor-pointer"
                style={{
                  width: `${markerSize.width}px`,
                  height: `${markerSize.height}px`,
                }}
                aria-label={`Map marker for ${location.name}`}>
                <Image
                  src="/images/map-pin.png"
                  alt={`Location marker for ${location.name}`}
                  fill={true}
                  className="object-contain"
                  sizes="(max-width: 768px) 24px, 32px"
                  priority
                />
                <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-white px-2 py-1 text-sm font-medium shadow-lg transition-all group-hover:opacity-100 md:opacity-0">
                  {location.name}
                </div>
              </div>
            </Marker>
          ))}

          {interactive && (
            <>
              <GeolocateControl position="top-left" />
              <NavigationControl position="top-left" />
            </>
          )}
        </Map>
      </div>
    </div>
  );
}
