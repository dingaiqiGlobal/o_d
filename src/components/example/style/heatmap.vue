<template>
  <div>
    <div id="map"></div>
    <div class="control">
      <span>半径</span>
      <el-slider v-model="radius" @input="radiusChange"></el-slider>
      <span>模糊值</span>
      <el-slider v-model="blur" @input="blurChange"></el-slider>
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

import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import Heatmap from "ol/layer/Heatmap";

export default {
  name: "Base",
  data() {
    return {
      map: {},
      radius: 5,
      blur: 15,
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
        zoom: 5,
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
    radiusChange(val) {
      this.radius = val;
      this.HeatmapLayer.setRadius(this.radius);
    },
    blurChange(val) {
      this.blur = val;
      this.HeatmapLayer.setBlur(this.blur);
    },
    addHeatmapLayer() {
      this.HeatmapLayer = new Heatmap({
        source: new VectorSource({
          format: new GeoJSON(),
          url:
            "http://192.168.201.162:8088/geoserver/zhjy/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=zhjy%3Apoint_china&maxFeatures=50000&outputFormat=application%2Fjson",
        }),
        radius: this.radius,
        blur: this.blur,
        //(坡度)热图的颜色渐变，指定为CSS颜色字符串数组
        //gradient: ["#BE5C37", "#D78851", "#DBBF92", "#F3E1AF", "#f7f7e6"],
        gradient: [
          "#2d0045",
          "#6f5b9d",
          "#bfb9d3",
          "#f6f6f6",
          "#bfdee1",
          "#36a6a8",
          "#01454e",
        ],
        //gradient: ["#84191f", "#a13d3b","#c26b57","#dca27c","#ebd0b3","#f0ebe5","#e9edf0","#c9d6e6","#9dbcd8","#9dbcd8","#7091c6","#4e70b0","#375093"],
        /**
         *色彩集锦
         *https://zhuanlan.zhihu.com/p/613816974?utm_id=0
         */
      });
      this.map.addLayer(this.HeatmapLayer);
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
