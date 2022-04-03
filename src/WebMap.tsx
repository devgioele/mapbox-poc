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
      map.current.on('load', () => {
        if (map.current) {
          map.current.addSource('plantings-combined', {
            type: 'vector',
            url: 'mapbox://devgioele.3r62yymc',
          });
          map.current.addLayer({
            id: 'plantings-combined-fill',
            type: 'fill',
            source: 'plantings-combined',
            'source-layer': 'polygons_combined-9iacsm',
            layout: {},
            paint: {
              'fill-color': '#0080ff',
              'fill-opacity': 0.5,
            },
          });
          map.current.addLayer({
            id: 'plantings-combined-outline',
            type: 'line',
            source: 'plantings-combined',
            'source-layer': 'polygons_combined-9iacsm',
            layout: {},
            paint: {
              'line-color': '#000000',
              'line-width': 1,
            },
          });
        }
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
