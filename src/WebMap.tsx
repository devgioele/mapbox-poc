import mapboxgl from 'mapbox-gl';
import { useEffect, useRef, useState } from 'react';

const initialLng = 11.3677;
const initialLat = 46.6131;
const initialZoom = 9;

type WebMapProps = {
  accessToken: string | undefined;
};

export default function WebMap({ accessToken }: WebMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map>();
  const [lng, setLng] = useState(initialLng);
  const [lat, setLat] = useState(initialLat);
  const [zoom, setZoom] = useState(initialZoom);

  // Set access token
  useEffect(() => {
    if (accessToken) {
      mapboxgl.accessToken = accessToken;
    }
  }, [accessToken]);

  // Initialize map
  useEffect(() => {
    // If not initialized yet and
    // access token and map container exists
    if (!map.current && accessToken && mapContainer.current) {
      console.log('Initializing map');
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [initialLng, initialLat],
        zoom: initialZoom,
      });
    }
  }, [accessToken]);

  return (
    <div style={{ height: '100%' }}>
      <div
        style={{ height: '100%' }}
        ref={mapContainer}
        className="map-container"
      />
    </div>
  );
}
