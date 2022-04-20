import {
  BBox,
  Feature,
  Geometry,
  MultiPolygon,
  Polygon,
  Position,
} from 'geojson';
import mapboxgl, {
  Expression,
  LngLatLike,
  NavigationControl,
  StyleFunction,
} from 'mapbox-gl';
import LegendControl from 'mapboxgl-legend';
import { useEffect, useRef, useState } from 'react';

type RasterTileset = {
  id: string;
  url: string;
  tilesetId: string;
};

type VectorTileset = RasterTileset & {
  layers: string[];
};

type Expressions = {
  [index: string]: string | Expression | StyleFunction;
};

const basemapStyles = {
  it: 'mapbox://styles/kultivas/cl269uv2c000n14oc56rgxaae',
  de: 'mapbox://styles/kultivas/cl25ya7qe002o15tcejx3nznb',
};

const plantations: VectorTileset = {
  id: 'plantations',
  url: 'mapbox://kultivas.ads1l5jx',
  tilesetId: 'kultivas.ads1l5jx',
  layers: ['plantations-7whx5j'],
};

const plantationsFillLayerId = `${plantations.id}-fill`;

const terrain: RasterTileset = {
  id: 'terrain',
  url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
  tilesetId: 'mapbox.mapbox-terrain-dem-v1',
};

const elevation: RasterTileset = {
  id: 'elevation',
  url: 'mapbox://kultivas.8fihsy5a',
  tilesetId: 'kultivas.8fihsy5a',
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
      console.log('Initializing map');
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: basemapStyles.de,
        center: [initialLng, initialLat],
        zoom: initialZoom,
      });
      // Add zoom and rotation controls to the map.
      map.current.addControl(new NavigationControl(), 'top-left');
      // Add legend
      // Customize changing CSS variables defined here:
      // https://github.com/markusand/mapboxgl-legend/blob/master/src/_variables.scss
      map.current.addControl(
        new LegendControl({ layers: [plantationsFillLayerId] }),
        'bottom-left'
      );

      map.current.on('load', () => {
        if (map.current) {
          // Use hillshade or 3D terrain, but not both
          map.current.addSource(terrain.id, {
            type: 'raster-dem',
            url: terrain.url,
            tileSize: 512,
            maxzoom: 14,
          });
          map.current.setTerrain({ source: terrain.id, exaggeration: 1.5 });
          // Anchor light source to the rotation of the map
          // TODO: Warning appears nonetheless!
          map.current.setLight({ anchor: 'map' });

          // Hillshade disabled, because using 3D terrain
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
          map.current.addLayer({
            id: `${elevation.id}-default`,
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
            id: plantationsFillLayerId,
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
          console.log('Map loaded');
        }
      });

      const centroidOf = (feature: Feature): LngLatLike | undefined => {
        const centroidStr: string = feature.properties?.Centroid;
        if (centroidStr) {
          const numberStrs = centroidStr
            .replace(/[A-Za-z()]/g, '')
            .trimStart()
            .split(' ');
          console.log('numberStrs =', numberStrs);
          const coordinates = numberStrs.map((numberStr) =>
            parseFloat(numberStr)
          );
          console.log('coordinates =', coordinates);
          return coordinates as [long: number, lat: number];
        }
        return undefined;
      };

      map.current.on('click', plantationsFillLayerId, (e) => {
        const feature = e?.features?.[0];
        console.log('feature =', feature);
        if (feature) {
          const pos = centroidOf(feature);
          if (map.current) {
            map.current.flyTo({
              center: pos,
              zoom: 17,
            });
          }
        }
      });

      // Change the cursor to a pointer when it enters a polygon
      map.current.on('mouseenter', plantationsFillLayerId, () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer';
        }
      });

      // Change the cursor back when it leaves a polygon
      map.current.on('mouseleave', plantationsFillLayerId, () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = '';
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
      <div className="map-overlay" id="legend" />
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
            display: 'grid',
          }}
        >
          <span style={{ color: 'black', margin: 'auto', fontSize: '20px' }}>
            Loading...
          </span>
        </div>
      )}
    </div>
  );
}
