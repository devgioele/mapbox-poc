import mapboxgl, {
  Expression,
  NavigationControl,
  StyleFunction,
} from 'mapbox-gl';
import MapboxLanguage from '@mapbox/mapbox-gl-language';
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
  const [loading, setLoading] = useState(true);

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
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/kultivas/cl25ya7qe002o15tcejx3nznb',
        center: [initialLng, initialLat],
        zoom: initialZoom,
      });
      // Add zoom and rotation controls to the map.
      map.current.addControl(new NavigationControl(), 'top-left');
      const language = new MapboxLanguage();
      map.current.addControl(language);

      map.current.on('load', () => {
        if (map.current) {
          // Set language to German
          map.current.setStyle(
            language.setLanguage(map.current.getStyle(), 'de')
          );
          // Add terrain raster tileset
          map.current.addSource(terrain.id, {
            type: 'raster-dem',
            url: terrain.url,
            tileSize: 512,
            maxzoom: 14,
          });
          map.current.setTerrain({ source: terrain.id, exaggeration: 1.5 });
          // Add a sky layer that is showed when the map is highly pitched
          map.current.addLayer({
            id: 'sky',
            type: 'sky',
            paint: {
              'sky-type': 'atmosphere',
              'sky-atmosphere-sun': [0.0, 0.0],
              'sky-atmosphere-sun-intensity': 15,
            },
          });

          // Use hillshade or 3D raster-dem, but not both
          // const terrainLayerId = `${terrain.id}-default`;
          // map.current.addLayer({
          //   id: terrainLayerId,
          //   type: 'hillshade',
          //   source: terrain.id,
          //   paint: {
          //     'hillshade-exaggeration': 0.2,
          //   },
          // });

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
          setLoading(false);
        }
      });
    }
  }, [accessToken]);

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      <div
        style={{ height: '100%' }}
        ref={mapContainer}
        className="map-container"
      />
      {loading && (
        <div
          id="loader"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            height: '100%',
            width: '100%',
            background: 'white',
            zIndex: 100,
          }}
        >
          <span style={{ color: 'black' }}>Loading...</span>
        </div>
      )}
    </div>
  );
}
