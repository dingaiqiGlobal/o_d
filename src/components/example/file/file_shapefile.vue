<template>
  <div>
    <div id="map"></div>
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
import GeoJSON from "ol/format/GeoJSON";
import Style from "ol/style/Style";
import Icon from "ol/style/Icon";
import CircleStyle from "ol/style/Circle";
import Stroke from "ol/style/Stroke";
import Fill from "ol/style/Fill";
import Text from "ol/style/Text";

import shp from "shpjs";

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
        center: olProj.fromLonLat([116.83112, 40.3705]),
        zoom: 8,
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
    this.addSHPLayer("data/shp/counties/counties.shp")
  },
  methods: {
    /**
     * 三方包：cnpm i shpjs --save
     * 项目中需要后端解析文件
     * 
     */
    addSHPLayer(url) {
      const loadSHPData = async (url) => {
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        return shp.parseShp(buffer);
      };
      loadSHPData(url).then((data) => {
        if (data && data.length > 0) {
          let layers = this.map.getLayers().getArray();
          let remolayers = [];
          for (let i = 0; i < layers.length; i++) {
            let layer = layers[i];
            if (layer.get("id") && layer.get("id").indexOf("zipshp") != -1) {
              remolayers.push(layer);
            }
          }
          for (let j = 0; j < remolayers.length; j++) {
            this.map.removeLayer(remolayers[j]);
          }
          let image = new CircleStyle({
            radius: 5,
            fill: null,
            stroke: new Stroke({ color: "red", width: 1 }),
          });
          let styles = {
            Point: new Style({
              image: image,
            }),
            LineString: new Style({
              stroke: new Stroke({
                color: "red",
                width: 6,
              }),
            }),
            MultiLineString: new Style({
              stroke: new Stroke({
                color: "red",
                width: 6,
              }),
            }),
            MultiPoint: new Style({
              image: image,
            }),
            MultiPolygon: new Style({
              stroke: new Stroke({
                color: "yellow",
                width: 1,
              }),
              fill: new Fill({
                color: "rgba(255, 255, 0, 0.1)",
              }),
            }),
            Polygon: new Style({
              stroke: new Stroke({
                color: "blue",
                lineDash: [4],
                width: 3,
              }),
              fill: new Fill({
                color: "rgba(0, 0, 255, 0.1)",
              }),
            }),
          };
          let styleFunction = function (feature) {
            return styles[feature.getGeometry().getType()];
          };
          for (let i = 0; i < data.length; i++) {
            let vectorSource = new VectorSource({
              features: new GeoJSON().readFeatures(data[i]),
            });
            let features = vectorSource.getFeatures();
            for (let j = 0; j < features.length; j++) {
              let feature = features[j];
              let geom = feature.getGeometry().transform("EPSG:4326", "EPSG:3857");
              feature.setGeometry(geom);
            }
            let vectorLayer = new VectorLayer({
              source: vectorSource,
              style: styleFunction,
            });
            vectorLayer.set("id", "zipshp" + i);
            this.map.addLayer(vectorLayer);
          }
        }
      });
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
