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
import GeoJSON from "ol/format/GeoJSON";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import Fill from "ol/style/Fill";
import Text from "ol/style/Text";

import Feature from "ol/Feature";
import Circle from "ol/geom/Circle.js";
import MultiPolygon from "ol/geom/MultiPolygon";

export default {
  name: "Base",
  data() {
    return {
      map: {},
      polygonLayer: null,
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

    this.addCenterPointLayer();
    this.pointermove();
  },
  methods: {
    // 监听地图移动
    pointermove() {
      this.map.on("pointermove", (e) => {
        let pixel = this.map.getEventPixel(e.originalEvent);
        let feature = this.map.forEachFeatureAtPixel(pixel, (feature) => {
          return feature;
        });
        if (feature != null && typeof feature != "undefined") {
          let geoCoordinates = feature.get("coordinates");
          this.addPolygonLayer(geoCoordinates);
        } else {
          this.map.removeLayer(this.polygonLayer); //移除删除区域数据
        }
      });
    },
    addCenterPointLayer() {
      //属性中获取的方法
      let CenterPointLayer = new VectorLayer({
        source: new VectorSource(),
        zIndex: 2,
      });
      fetch(
        "http://192.168.201.162:8088/geoserver/zhjy/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=zhjy%3Apolygon_beijing&maxFeatures=50000&outputFormat=application%2Fjson"
      )
        .then((res) => {
          return res.json();
        })
        .then((res) => {
          res.features.forEach((feat) => {
            let lon = feat.properties.LON;
            let lat = feat.properties.LAT;
            let feature = new Feature({
              geometry: new Circle(olProj.fromLonLat([lon, lat]), 10000),
            }); 
            feature.set("coordinates", feat.geometry.coordinates); //设置该区域的区域数据,鼠标悬浮的时候使用
            feature.setStyle(
              new Style({
                fill: new Fill({ color: "rgba(113, 175, 16, 0.7)" }),
                text: new Text({
                  text: `${feat.properties.POPU}万人`,
                  font: "10px font-size",
                  fill: new Fill({
                    color: "#fff",
                  }),
                }),
                stroke: new Stroke({
                  width: 2,
                  color: [113, 175, 16],
                }),
              })
            );
            CenterPointLayer.getSource().addFeatures([feature]); //添加要素
          });
        });
      this.map.addLayer(CenterPointLayer);
    },
    addPolygonLayer(geoCoordinates) {
      if (!geoCoordinates) return;
      //先移除
      if (this.polygonLayer) {
        this.map.removeLayer(this.polygonLayer);
      }
      let feature = new Feature({
        geometry: new MultiPolygon(geoCoordinates).transform("EPSG:4326", "EPSG:3857"),
      });
      let polygonSource = new VectorSource();
      polygonSource.addFeature(feature);
      this.polygonLayer = new VectorLayer({
        source: polygonSource,
      });
      this.map.addLayer(this.polygonLayer);
    }
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
