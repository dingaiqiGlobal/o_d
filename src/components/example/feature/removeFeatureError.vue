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

import { transform } from "ol/proj";
import { fromLonLat } from "ol/proj";

import Style from "ol/style/Style";
import Icon from "ol/style/Icon";
import CircleStyle from "ol/style/Circle";
import Stroke from "ol/style/Stroke";
import Fill from "ol/style/Fill";
import Text from "ol/style/Text";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";

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
    this.addVectorLayer();
  },
  methods: {
    addVectorLayer() {
      let coordinates = [
        [116.82932, 40.37213],
        [116.82814, 40.36738],
        [116.83203, 40.36767],
      ];
      let vectorSource = new VectorSource();
      let features = []; //另类方式-features方式
      for (let i = 0; i < coordinates.length; i++) {
        let feature = new Feature({
          geometry: new Point(transform(coordinates[i], "EPSG:4326", "EPSG:3857")), //另类方式
          //geometry: new Point(fromLonLat(coordinates[i])),//传统方式
        });
        feature.setId(i);
        feature.setStyle(this.getIcon());//另类方式
        features.push(feature);
      }
      vectorSource.addFeatures(features);

      const vectorLayer = new VectorLayer({
        name: "pointLayer",
        source: vectorSource,
      });
      this.map.addLayer(vectorLayer);

      this.map.on("click", (e) => {
        this.map.forEachFeatureAtPixel(e.pixel, (feature, layer) => {
          let isFeature = this.map.hasFeatureAtPixel(e.pixel); //另类方式
          if (isFeature) {
            vectorSource.removeFeature(feature);//传统方式有可能报错，但是没发现
            console.log(features);
            // vectorSource.getFeatures().forEach(() => {//另类方式
            //   vectorSource.removeFeature(feature);
            // });
            // console.log(features);
          }
        });
      });
    },
    getIcon() {
      let style = new Style({
        image: new Icon({
          src: "/images/icon/location.png",
          opacity: 1,
          scale: 0.2,
        }),
      });
      return style;
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
