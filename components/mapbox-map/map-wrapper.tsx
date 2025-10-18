'use client';

import dynamic from 'next/dynamic';

const MapboxMap = dynamic(() => import('./mapbox-map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-72 w-full items-center justify-center bg-gray-100">
      <div className="animate-pulse">Loading map...</div>
    </div>
  ),
});

interface MapWrapperProps {
  locations: {
    lat: number;
    long: number;
    name: string;
  }[];
  interactive?: boolean;
  markerSize?: { width: number; height: number };
}

export default function MapWrapper(props: MapWrapperProps) {
  return <MapboxMap {...props} />;
}
