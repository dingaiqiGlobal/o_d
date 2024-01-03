<template>
  <div>
    <div id="map"></div>
    <div class="control"></div>
  </div>
</template>

<script>
import "ol/ol.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { fromLonLat } from "ol/proj";
import XYZ from "ol/source/XYZ";

import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import Fill from "ol/style/Fill";

import proj4 from "proj4";
import { createXYZ } from "ol/tilegrid";

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
        center: fromLonLat([116.83112, 40.3705]),
        zoom: 4,
      }),
    });
    this.addLayer();
  },
  methods: {
    addLayer() {
      // 定义海图坐标
      proj4.defs(
        "EPSG:3395",
        "+proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs"
      );
      const seaLayer = new TileLayer({
        source: new XYZ({
          url: "http://m12.shipxy.com/tile.c?l=Na&m=o&y={y}&x={x}&z={z}",
          projection: "EPSG:3395",
          tileGrid: createXYZ({
            extent: [
              -20037508.342789244,
              -20037508.342789244,
              20037508.342789244,
              20037508.342789244,
            ],
          }),
        }),
      });
      this.map.addLayer(seaLayer);

      const vectorLayer = new VectorLayer({
        source: new VectorSource({
          format: new GeoJSON(),
          url:
            "http://192.168.201.162:8088/geoserver/zhjy/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=zhjy%3Apolygon_beijing&maxFeatures=500000&outputFormat=application%2Fjson",
        }),
        style: new Style({
          stroke: new Stroke({
            color: "#cc3333",
            width: 1,
          }),
          fill: new Fill({
            color: "rgba(14, 249, 230, 0.3)",
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
