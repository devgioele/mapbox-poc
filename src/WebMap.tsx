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

const terrain: RasterTileset = {
  id: 'terrain',
  url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
  tilesetId: 'mapbox.mapbox-terrain-dem-v1',
};

const meanTemp: RasterTileset = {
  id: 'meanTemp',
  url: 'mapbox://kultivas.5lkpbnjt',
  tilesetId: 'kultivas.5lkpbnjt',
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
          // Add terrain raster tileset
          map.current.addSource(terrain.id, {
            type: 'raster-dem',
            url: terrain.url,
          });
          const terrainLayerId = `${terrain.id}-default`;
          map.current.addLayer({
            id: terrainLayerId,
            type: 'hillshade',
            source: terrain.id,
          });
          // Add mean temperature raster tileset
          map.current.addSource(meanTemp.id, {
            type: 'raster',
            url: meanTemp.url,
          });
          const meanTempLayerId = `${meanTemp.id}-default`;
          map.current.addLayer({
            id: meanTempLayerId,
            type: 'raster',
            source: meanTemp.id,
          });
          // Set paint properties
          map.current.setPaintProperty(meanTempLayerId, 'raster-opacity', 0.5);
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
