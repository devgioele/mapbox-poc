# Mapbox and React proof of concept

The goal of this POC is to demonstrate the feasibility and performance of displaying thousands of polygon features on a map using [Mapbox](https://mapbox.com/) with [React](https://reactjs.org/).

## Usage

To specify the MapBox access token, create a `.env.local` file at the root with the following content:
```
VITE_MAP_BOX=<token>
```

I compare Mapbox with ArcGIS during the development, to conclude what GIS service is best suited for modern applications that deal with big data and need automated workflows.
Points that are going to make me decide between the two:
* **API**s for programmatic upload/edit of feature and raster layers (aka. vector and raster tilesets).
* **Performance** while displaying 10k-60k polygons.
* **Ease of use** with React of the JS library.

Apart from that, the following features must be implementable with MapBox:
* **Basemap toggle**
* **Custom basemaps**
* **Paint** feature polygon based on its properties
* **Highlight** and **zoom-to** a polygon on click
* **Move** the map such that a specific polygon is on a certain posisition on the screen (e.g. in the upper left corner)
* **Loading** indicator while the map is loading
* **Legend** based on the meaning of the shown colors
