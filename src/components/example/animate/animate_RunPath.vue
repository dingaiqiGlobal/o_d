<template>
  <div>
    <div id="map"></div>
    <div class="control">
      <button @click="animation(0.1)">开始</button>
      <button @click="stopAnimation">停止</button>
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
import GeoJSON from "ol/format/GeoJSON";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import Fill from "ol/style/Fill";
import Icon from "ol/style/Icon";

import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import LineString from "ol/geom/LineString";

export default {
  name: "Base",
  data() {
    return {
      map: {},
      lineFeature: null,
      pointFeature: null,
      originFeature: null,

      step: 0.1,
      key: 0,
      requestID: null,
    };
  },
  mounted() {
    this.map = new Map({
      target: "map",
      layers: [],
      view: new View({
        projection: "EPSG:3857",
        center: olProj.fromLonLat([116.83112, 40.3705]),
        zoom: 15,
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

    this.initLayer();
  },
  methods: {
    initLayer() {
      let positionArray = [
        [116.8205519, 40.37720598],
        [116.8231939, 40.376394],
        [116.8282829, 40.37653404],
        [116.8307708, 40.37662602],
        [116.8342319, 40.37496399],
        [116.853943, 40.374963],
        [116.8596241, 40.37493303],
        [116.8596749, 40.37416704],
        [116.851775, 40.37096097],
        [116.8478431, 40.36961304],
        [116.8364999, 40.368213],
        [116.8281911, 40.36738302],
        [116.8285439, 40.37367402],
        [116.820413, 40.373892],
        [116.820444704, 40.377206811],
      ];
      let vectorLayer = new VectorLayer({
        source: new VectorSource(),
        style: new Style({
          stroke: new Stroke({
            color: "#0F0",
            width: 2,
          }),
          fill: new Fill({
            color: "#00F",
          }),
        }),
      });
      this.map.addLayer(vectorLayer);
      /**
       * 路径
       */
      let lineGeo = [];
      positionArray.map((item) => {
        lineGeo.push(olProj.fromLonLat(item));
      });
      this.lineFeature = new Feature({
        geometry: new LineString(lineGeo),
      });
      vectorLayer.getSource().addFeature(this.lineFeature);
      /**
       * 初始点
       */
      this.pointFeature = new Feature({
        geometry: new Point(new olProj.fromLonLat(positionArray[0])),
      });
      this.pointFeature.setStyle(
        new Style({
          image: new Icon({
            src: "images/icon/car.png",
          }),
        })
      );
      vectorLayer.getSource().addFeature(this.pointFeature);
      this.originFeature = this.pointFeature.clone();
    },
    animation(step) {
      this.requestID = requestAnimationFrame(() => {
        if (step <= 1) {
          this.key++;
          let second = this.lineFeature.getGeometry().getCoordinateAt(step);
          let first;
          if (this.key === 1) {
            first = this.originFeature.getGeometry().getCoordinates();
          } else {
            first = this.pointFeature.getGeometry().getCoordinates();
          }
          let angle = this.setAngle(first, second);
          this.pointFeature
            .getGeometry()
            .setCoordinates(this.lineFeature.getGeometry().getCoordinateAt(step));
          this.pointFeature.getStyle().getImage().setRotation(angle);
          step = step + 0.003;
          this.animation(step);
        }
      });
    },
    stopAnimation(){
        cancelAnimationFrame(this.requestID);
    },
    setAngle(first, second) {
      let y = second[1] - first[1];
      let x = second[0] - first[0];
      let radAngle = Math.atan(y / x);
      if (y <= 0 && x >= 0) {
        //第二象限
        // console.log("第二象限");
        radAngle = -radAngle;
      } else if (x >= 0 && y >= 0) {
        //第一象限
        radAngle = -radAngle;
        // console.log("第一象限");
      } else if (x <= 0 && y >= 0) {
        //第四象限
        radAngle = Math.PI - radAngle;
        // console.log("第四象限");
      } else if (x <= 0 && y <= 0) {
        //第三象限
        radAngle = Math.PI - radAngle;
        // console.log("第三象限");
      }
      return radAngle;
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
