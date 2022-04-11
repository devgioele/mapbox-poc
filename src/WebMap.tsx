import mapboxgl from 'mapbox-gl';
import { useEffect, useRef, useState } from 'react';

type RasterTileset = {
  id: string;
  url: string;
  tilesetId: string;
};

type VectorTileset = RasterTileset & {
  layers: string[];
};

const plantations: VectorTileset = {
  id: 'plantations',
  url: 'mapbox://kultivas.ads1l5jx',
  tilesetId: 'kultivas.ads1l5jx',
  layers: ['plantations-7whx5j'],
};

const meanTemp: RasterTileset = {
  id: 'meanTemp',
  url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
  tilesetId: 'mapbox.mapbox-terrain-dem-v1',
};

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
          // Add vector tileset
          map.current.addSource(plantations.id, {
            type: 'vector',
            url: plantations.url,
          });
          map.current.addLayer({
            id: `${plantations.id}-fill`,
            type: 'fill',
            source: plantations.id,
            'source-layer': plantations.layers[0],
            layout: {},
            paint: {
              'fill-color': '#0080ff',
              'fill-opacity': 0.5,
            },
          });
          map.current.addLayer({
            id: `${plantations.id}-outline`,
            type: 'line',
            source: plantations.id,
            'source-layer': plantations.layers[0],
            layout: {},
            paint: {
              'line-color': '#000000',
              'line-width': 1,
            },
          });
          // Add raster tileset
          map.current.addSource(meanTemp.id, {
            type: 'raster-dem',
            url: meanTemp.url,
          });
          map.current.addLayer({
            id: `${meanTemp.id}-default`,
            type: 'hillshade',
            source: meanTemp.id,
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
