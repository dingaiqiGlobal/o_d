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

import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import CircleStyle from "ol/style/Circle";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import Fill from "ol/style/Fill";
import Feature from "ol/Feature";
import Icon from 'ol/style/Icon';

import Point from "ol/geom/Point";
import LineString from "ol/geom/LineString";

export default {
  name: "Base",
  data() {
    return {
      map: {},
      polylineFeature: null,
    };
  },
  mounted() {
    this.map = new Map({
      target: "map",
      layers: [],
      view: new View({
        projection: "EPSG:3857",
        center: olProj.fromLonLat([116.83112, 40.3705]),
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
    this.addLayer();
  },
  methods: {
    addLayer() {
      //线
      this.polylineFeature = new Feature({
        geometry: new LineString([
          olProj.transform([116.82059, 40.38787], "EPSG:4326", "EPSG:3857"),
          olProj.transform([116.82042, 40.37718], "EPSG:4326", "EPSG:3857"),
          olProj.transform([116.82346, 40.37624], "EPSG:4326", "EPSG:3857"),
          olProj.transform([116.82874, 40.3764], "EPSG:4326", "EPSG:3857"),
        ]),
        name: "polyline",
      });
      let polylineSource = new VectorSource();
      polylineSource.addFeature(this.polylineFeature);
      let polylineLayer = new VectorLayer();
      polylineLayer.setSource(polylineSource);
      this.map.addLayer(polylineLayer);

      let resolution = this.map.getView().getResolution();
      let style=this.setLineStyle(resolution);
      this.polylineFeature.setStyle(style);
    },
    setLineStyle(resolution) {
      let geometry = this.polylineFeature.getGeometry();
      let length = geometry.getLength(); //获取线段长度
      let radio = (50 * resolution) / length;
      let dradio = 1; //投影坐标系，如3857等，在EPSG:4326下可以设置dradio=10000
      let styles = [
        new Style({
          stroke: new Stroke({
            color: "#336dff",
            width: 12,
          }),
        }),
      ];
      for (let i = 0; i <= 1; i += radio) {
        //沿行字符串返回所提供分数处的坐标。
        //分数是一个介于0和1之间的数字，其中0是行字符串的开始，1是结束
        let arrowLocation = geometry.getCoordinateAt(i);
        //遍历每个段，调用提供的回调。
        geometry.forEachSegment(function (start, end) {
          if (start[0] == end[0] || start[1] == end[1]) return;
          let dx1 = end[0] - arrowLocation[0];
          let dy1 = end[1] - arrowLocation[1];
          let dx2 = arrowLocation[0] - start[0];
          let dy2 = arrowLocation[1] - start[1];
          if (dx1 != dx2 && dy1 != dy2) {
            if (Math.abs(dradio * dx1 * dy2 - dradio * dx2 * dy1) < 0.001) {
              let dx = end[0] - start[0];
              let dy = end[1] - start[1];
              let rotation = Math.atan2(dy, dx);
              styles.push(
                new Style({
                  geometry: new Point(arrowLocation),
                  image: new Icon({
                    src: "images/icon/arrow.png",
                    anchor: [0.75, 0.5],
                    rotateWithView: false,
                    rotation: -rotation + Math.PI,
                  }),
                })
              );
            }
          }
        });
      }
      return styles;
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
