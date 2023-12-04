<template>
  <div>
    <div id="map"></div>
    <div class="control"></div>
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

import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import Heatmap from "ol/layer/Heatmap";

export default {
  name: "Base",
  data() {
    return {
      map: {},
      HeatmapLayer: null,
    };
  },
  mounted() {
    this.map = new Map({
      target: "map",
      layers: [],
      view: new View({
        projection: "EPSG:3857",
        center: olProj.fromLonLat([116.83112, 40.3705]),
        zoom: 9,
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
    this.addHeatmapLayer();
  },
  methods: {
    addHeatmapLayer() {
      this.HeatmapLayer = new Heatmap({
        source: new VectorSource({
          format: new GeoJSON(),
          url:
            "http://192.168.201.162:8088/geoserver/zhjy/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=zhjy%3Apoint_china&maxFeatures=50000&outputFormat=application%2Fjson",
        }),
        radius: 2,
      });
      this.map.addLayer(this.HeatmapLayer);
      //radius值这里不是固定写死，
      //是通过监听地图缩放事件动态设置radius不同大小的
      //纯粹觉的为了让热力图渲染更看好一点，别无他意
      this.map.getView().on("change:resolution", this.handleHeatMap);
    },
    handleHeatMap() {
      var radius = this.getRadiusByMapZoom();
      this.HeatmapLayer.setRadius(radius);
    },
    getRadiusByMapZoom() {
      let radius = 2;
      switch (Math.floor(this.map.getView().getZoom())) {
        case 9:
          radius = 2;
          break;
        case 10:
          radius = 3;
          break;
        case 11:
          radius = 4;
          break;
        case 12:
          radius = 5;
          break;
        case 13:
          radius = 6;
          break;
        case 14:
          radius = 7;
          break;
        case 15:
          radius = 8;
          break;
        case 16:
          radius = 9;
          break;
        default:
          if (this.map.getView().getZoom() > 16) {
            radius = 9;
          } else {
            radius = 2;
          }
      }
      return radius;
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
  width: 200px;
  color: white;
}
</style>
