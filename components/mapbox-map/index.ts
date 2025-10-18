import dynamic from 'next/dynamic';

const MapboxMap = dynamic(() => import('./mapbox-map'));

export default MapboxMap;
