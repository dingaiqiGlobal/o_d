<template>
  <div>
    <div id="map"></div>
    <div class="control">
      <el-radio-group v-model="radio" @change="switchClusterLayer(radio)">
        <el-radio :label="1">添加聚合标注</el-radio>
        <el-radio :label="2">移除聚合标注</el-radio>
      </el-radio-group>
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
import Icon from "ol/style/Icon";
import CircleStyle from "ol/style/Circle";
import Stroke from "ol/style/Stroke";
import Fill from "ol/style/Fill";
import Text from "ol/style/Text";

import Cluster from "ol/source/Cluster";

export default {
  name: "Base",
  data() {
    return {
      map: {},
      radio: 1,
      clusterSource: null,
      clusterLayer: null,
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
        minZoom: 2,
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
    this.addClusterLayer();
  },
  methods: {
    addClusterLayer() {
      //实例化矢量数据源
      let vectorSource = new VectorSource({
        format: new GeoJSON(),
        url:
          "http://192.168.201.162:8088/geoserver/zhjy/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=zhjy%3Apoint_china&maxFeatures=50000&outputFormat=application%2Fjson",
      });
      //实例化聚散数据源
      this.clusterSource = new Cluster({
        name: "clusterLayer",
        source: vectorSource,
        distance: 50,
        minDistance: 20,
      });
      //添加图层并设置样式
      this.clusterLayer = new VectorLayer({
        source: this.clusterSource,
        style: this.clusterStyle(),
      });
      this.map.addLayer(this.clusterLayer);

      /**
       * 当地图缩放到最某层级时，取消全部聚合效果
       */
      //   this.map.getView().on("change:resolution", (event) => {
      //     if (this.map.getView().getZoom() === this.map.getView().getMaxZoom()) {
      //       this.clusterSource.setDistance(0);
      //     } else {
      //       this.clusterSource.setDistance(50);
      //     }
      //   });
    },
    clusterStyle() {
      return (feature) => {
        let size = feature.get("features").length;
        let style;
        if (size === 1) {
          style = new Style({
            image: new Icon({
              src: "images/icon/location.png",
              scale: 0.2,
            }),
          });
        } else {
          if (!style) {
            style = new Style({
              image: new CircleStyle({
                radius: 15,
                stroke: new Stroke({
                  color: this.getColor(size),
                }),
                fill: new Fill({
                  color: this.getColor(size),
                }),
              }),
              text: new Text({
                text: size.toString(),
                fill: new Fill({
                  color: "#000",
                }),
                font: "12px Calibri,sans-serif",
                stroke: new Stroke({
                  color: "#fff",
                  width: 5,
                }),
              }),
            });
          }
        }
        return style;
      };
    },
    getColor(val) {
      if (val < 100) return "blue";
      else if (val >= 100 && val < 500) return "yellow";
      else if (val >= 500) return "red";
    },
    switchClusterLayer() {
      this.radio === 1
        ? this.clusterSource.setDistance(50)
        : this.clusterSource.setDistance(0);
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
