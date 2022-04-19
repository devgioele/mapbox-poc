import mapboxgl, { Expression, StyleFunction } from 'mapbox-gl';
import { useEffect, useRef, useState } from 'react';

type RasterTileset = {
  id: string;
  url: string;
  tilesetId: string;
};

type VectorTileset = RasterTileset & {
  layers: string[];
};

const styles = {
  it: 'mapbox://styles/kultivas/cl25xsqvu00fm14piw9fcc7by',
  de: 'mapbox://styles/kultivas/cl25ya7qe002o15tcejx3nznb',
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

const elevation: RasterTileset = {
  id: 'elevation',
  url: 'mapbox://kultivas.55eo0pq7',
  tilesetId: 'kultivas.55eo0pq7',
};

type Expressions = {
  [index: string]: string | Expression | StyleFunction;
};

// Documentation of MapBox expressions:
// https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions
const colors: Expressions = {
  appleVarietyFill: [
    'match',
    ['get', 'VarietyNam'],
    ['GOLDEN', 'GOLDEN DELICIOUS B', 'GOLDEN PARSI DA ROSA', 'GOLDEN REINDERS'],
    '#ffd128',
    [
      'BROOKFIELD GALA BAIGENT',
      'GALA',
      'GALA DECARLI - FENDECA',
      'GALA VENUS FENGAL',
      'GALA SCHNITZER SCHNIGA',
      'GALASTAR GALAFAB',
      'GALAVAL',
      'BUCKEYE GALA SIMMONS',
      'GALAXI',
    ],
    '#a50518',
    // Fallback
    '#c5c6d0',
  ],
  elevation: [
    'rgb',
    // red is higher when feature.properties.temperature is higher
    ['get', 'temperature'],
    // green is always zero
    0,
    // blue is higher when feature.properties.temperature is lower
    ['-', 100, ['get', 'temperature']],
  ],
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
        // Style of 'basemap'
        style: styles.de,
        center: [initialLng, initialLat],
        zoom: initialZoom,
      });
      map.current.on('load', () => {
        if (map.current) {
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
            paint: {
              'hillshade-exaggeration': 0.2,
            },
          });
          // Add elevation raster tileset
          map.current.addSource(elevation.id, {
            type: 'raster',
            url: elevation.url,
          });
          const elevationLayerId = `${elevation.id}-default`;
          map.current.addLayer({
            id: elevationLayerId,
            type: 'raster',
            source: elevation.id,
            paint: {
              'raster-opacity': 0.5,
            },
          });
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
              'fill-color': colors.appleVarietyFill,
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
