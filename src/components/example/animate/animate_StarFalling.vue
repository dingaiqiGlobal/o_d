<template>
  <div>
    <div id="map"></div>
    <div class="control">
      <button @click="this.addStar">星星坠落</button>
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
import RegularShape from "ol/style/RegularShape";

import Feature from "ol/Feature";
import Point from "ol/geom/Point";

import * as olEasing from "ol/easing"; //缓动函数
import { unByKey } from "ol/Observable";

export default {
  name: "Base",
  data() {
    return {
      map: {},
      vectorSource: null,
      vectorLayer: null,
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

    /**
     * 创建点的星星图层
     */
    this.vectorSource = new VectorSource();
    let style = new Style({
      image: new RegularShape({
        points: 5,
        radius1: 20,
        radius2: 10,
        fill: new Fill({
          color: "#ffff00",
        }),
        stroke: new Stroke({
          width: 1,
          color: "00ffff",
        }),
      }),
    });
    this.vectorLayer = new VectorLayer({
      source: this.vectorSource,
      style: style,
    });

    this.map.addLayer(this.vectorLayer);
  },
  methods: {
    addStar() {
      let extent = this.map.getView().calculateExtent(this.map.getSize());
      for (let i = 0; i < 1; i++) {
        let dx = extent[2] - extent[0];
        let dy = extent[3] - extent[1];
        //也可以这么写
        //setTimeout的回调函数里面传参
        //setTimeout(func,interval,args)
        setTimeout(this.addFeature, 200 * (i + 1), [
          extent[0] + dx * Math.random(1),
          extent[1] + dy * Math.random(1),
        ]);
      }
    },
    addFeature(coordinates) {
      //unByKey-使用on()或once()返回的键删除事件侦听器
      //postcompose-图层合成后触发 InAndOut开始缓慢，加速，然后再减速
      let feature = new Feature({
        geometry: new Point(coordinates),
      });
      let geom = feature.getGeometry();
      let xy = geom.getCoordinates();
      let extent = this.map.getView().calculateExtent(this.map.getSize());

      let dy = extent[3] - xy[1];
      let c = 0.01;
      let key = this.map.on("postcompose", (e) => {
        if (c >= 1) {
          unByKey(key);//重要
        }
        c += 0.01;
        geom.setCoordinates([xy[0], xy[1] + dy * (1 - olEasing.inAndOut(c))]);
      });
      geom.setCoordinates([xy[0], xy[1] + dy * (1 - olEasing.inAndOut(c))]);
      this.vectorSource.addFeature(feature);
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
