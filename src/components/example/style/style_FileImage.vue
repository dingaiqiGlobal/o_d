<template>
  <div>
    <div id="map"></div>
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
        center: fromLonLat([116.29749, 40.00737]),
        zoom: 11,
      }),
    });
    let ArcGISLayer = new TileLayer({
      source: new XYZ({
        projection: "EPSG:900913",
        //https://map.geoq.cn/ArcGIS/rest/services  //services地址
        url:
          "https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}",
        wrapX: true,
      }),
    });
    this.map.addLayer(ArcGISLayer);
    this.addLayer();
  },
  methods: {
    addLayer() {
      const vectorLayer = new VectorLayer({
        source: new VectorSource({
          format: new GeoJSON(),
          url:
            "http://192.168.201.162:8088/geoserver/zhjy/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=zhjy%3AHDJD&maxFeatures=500000&outputFormat=application%2Fjson",
        }),
      });
      this.map.addLayer(vectorLayer);

      let cnv = document.createElement("canvas");
      let ctx = cnv.getContext("2d");
      let img = new Image();
      img.src = "images/icon/fill.png";
      img.onload = function () {
        let pattern = ctx.createPattern(img, "repeat");
        vectorLayer.setStyle(
          new Style({
            stroke: new Stroke({
              color: "red",
              lineDash: [5],
              width: 2,
            }),
            fill: new Fill({
              color: pattern,
            }),
          })
        );
      };
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
</style>
