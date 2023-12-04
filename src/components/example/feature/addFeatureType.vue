<template>
  <div>
    <div id="map"></div>
    <div class="control">
      <button @click="addPointLayer">点</button>
      <button @click="addPolylineLayer">线</button>
      <button @click="addPolygonLayer">多边形</button>
      <button @click="addCircleLayer">圆形</button>
      <button @click="addRectangleLayer">矩形</button>
    </div>
  </div>
</template>

<script>
import "ol/ol.css";
import { Map, View } from "ol";
import * as olProj from "ol/proj";
import * as olExtent from "ol/extent";
import TileLayer from "ol/layer/Tile";
import WMTS from "ol/source/WMTS";
import WMTSTileGrid from "ol/tilegrid/WMTS";

import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";

import { transform } from "ol/proj";
import { fromLonLat } from "ol/proj";

import Style from "ol/style/Style";
import CircleStyle from "ol/style/Circle";
import Stroke from "ol/style/Stroke";
import Fill from "ol/style/Fill";
import Text from "ol/style/Text";
import Feature from "ol/Feature";

import Point from "ol/geom/Point";
import LineString from "ol/geom/LineString";
import Polygon from "ol/geom/Polygon";
import Circle from "ol/geom/Circle";
import {fromExtent} from 'ol/geom/Polygon';

export default {
  name: "Base",
  data() {
    return {
      map: {},
    };
  },
  mounted() {
    this.map = new Map({
      target: "map",
      layers: [],
      view: new View({
        projection: "EPSG:3857",
        center: olProj.fromLonLat([116.39156, 39.91513]),
        zoom: 14,
      }),
    });
    //t0~t7
    let url = "https://t0.tianditu.gov.cn/img_w/wmts?tk=21c1e34286caecc25fd94be94bfbe119";
    let proj = "EPSG:900913";
    let level = 18;
    let layerName = "img"; //vec矢量|img影像|cva注记
    let format = "tiles";
    let tileSize = [256, 256];
    let matrixSet = "w"; //w球面墨卡托投影|c经纬度投影

    let projection = olProj.get(proj);
    let projectionExtent = projection.getExtent();
    let size = olExtent.getWidth(projectionExtent) / 256;
    let resolutions = new Array(level);
    let matrixIds = new Array(level);
    for (let z = 0; z < level; z++) {
      resolutions[z] = size / Math.pow(2, z);
      matrixIds[z] = z;
    }

    let TDTLayer = new TileLayer({
      source: new WMTS({
        url: url,
        layer: layerName,
        matrixSet: matrixSet,
        format: format,
        projection: projection,
        tileGrid: new WMTSTileGrid({
          origin: olExtent.getTopLeft(projectionExtent),
          resolutions: resolutions,
          matrixIds: matrixIds,
          tileSize: tileSize,
        }),
        zIndex: 1,
      }),
    });
    this.map.addLayer(TDTLayer);
  },
  methods: {
    addPointLayer() {
      let point = [116.39431, 39.91421];
      let feature = new Feature({
        geometry: new Point(point).transform("EPSG:4326", "EPSG:3857"),
      });
      let vectorSource = new VectorSource();
      vectorSource.addFeature(feature);

      let vectorLayer = new VectorLayer({
        source: vectorSource,
        style: new Style({
          image: new CircleStyle({
            radius: 10,
            fill: new Fill({
              color: "yellow",
            }),
            stroke: new Stroke({
              color: "blue",
              width: 1,
            }),
          }),
        }),
      });
      this.map.addLayer(vectorLayer);
    },
    addPolylineLayer() {
      let line = [
        [116.35084, 39.90565],
        [116.42941, 39.90658],
      ];

      let feature = new Feature({
        geometry: new LineString(line).transform("EPSG:4326", "EPSG:3857"),
      });
      let vectorSource = new VectorSource();
      vectorSource.addFeature(feature);
      let vectorLayer = new VectorLayer({
        source: vectorSource,
        style: new Style({
          fill: new Fill({
            color: "yellow",
          }),
          stroke: new Stroke({
            color: "blue",
            width: 5,
          }),
        }),
      });
      this.map.addLayer(vectorLayer);
    },
    addPolygonLayer() {
      let polygon = [
        [
          [116.37719, 39.92116],
          [116.37959, 39.90766],
          [116.39427, 39.90546],
          [116.40697, 39.91622],
          [116.40066, 39.9257],
        ],
      ];
      let feature = new Feature({
        geometry: new Polygon(polygon).transform("EPSG:4326", "EPSG:3857"),
      });
      let vectorSource = new VectorSource();
      vectorSource.addFeature(feature);
      let vectorLayer = new VectorLayer({
        source: vectorSource,
        style: new Style({
          fill: new Fill({
            color: "rgba(237, 193, 166, 0.5)",
          }),
          stroke: new Stroke({
            color: "#e54ced",
            width: 2,
          }),
        }),
      });
      this.map.addLayer(vectorLayer);
    },
    addCircleLayer() {
      let circleCenter = [116.39096, 39.91583];
      let feature = new Feature({
        geometry: new Circle(circleCenter, 0.01).transform("EPSG:4326", "EPSG:3857"), //0.01表示1公里
      });
      let vectorSource = new VectorSource();
      vectorSource.addFeature(feature);
      let vectorLayer = new VectorLayer({
        source: vectorSource,
        style: new Style({
          fill: new Fill({
            color: "rgba(237, 193, 166, 0.5)",
          }),
          stroke: new Stroke({
            color: "#e54ced",
            width: 2,
          }),
        }),
      });
      this.map.addLayer(vectorLayer);
    },
    addRectangleLayer() {
      let rectangle = [116.38577, 39.91151, 116.39594, 39.92188]; //西南角坐标，东北角坐标
      let feature = new Feature({
        geometry: fromExtent(rectangle).transform("EPSG:4326", "EPSG:3857"), //0.01表示1公里
      });
      let vectorSource = new VectorSource();
      vectorSource.addFeature(feature);
      let vectorLayer = new VectorLayer({
        source: vectorSource,
        style: new Style({
          fill: new Fill({
            color: "rgba(237, 193, 166, 0.5)",
          }),
          stroke: new Stroke({
            color: "#e54ced",
            width: 2,
          }),
        }),
      });
      this.map.addLayer(vectorLayer);
    },
  },
};
</script>

<style>
/*隐藏ol的一些自带元素*/
.ol-attribution,
.ol-zoom {
  display: none;
}

.control {
  position: absolute;
  z-index: 10;
  left: 10px;
  top: 10px;
}
</style>
