<template>
  <div>
    <div id="map"></div>
    <div class="control">
      <input type="file" ref="shpFile" />
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

import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import LineString from "ol/geom/LineString";
import Polygon from "ol/geom/Polygon";

//方法1
import { wktToGeoJSON } from "@terraformer/wkt"; //https://github.com/terraformer-js/terraformer?tab=readme-ov-file
import csvToJson from "csvtojson";
//方法2
import csv2geojson from "csv2geojson";

import { bbox } from "@turf/turf";

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

    this.$refs.shpFile.addEventListener("change", (fileChoosed) => {
      let file = fileChoosed.target.files;
      let reader = new FileReader();
      reader.readAsText(file[0]);
      reader.onload = () => {
        const csvContent = reader.result;
        /**
         * 方法1
         * 支持wkt（待写）
         * https://www.jianshu.com/p/6a8d5ab5fd0b
         * 基础平台ImportAbove.vue页面
         */
        //this.dingcsv2geojson(csvContent);

        /**
         * 方法2
         */
        //cnpm i csv2geojson --save   https://github.com/mapbox/csv2geojson
        //点
        csv2geojson.csv2geojson(csvContent, (err, data) => {
          let geojson = data;
          this.addGeojsonLayer(data);
        });
        //线(不支持wkt)
        // csv2geojson.csv2geojson(csvContent, (err, data) => {
        //   let geojson = csv2geojson.toLine(data);
        //   this.addGeojsonLayer(geojson);
        // });
      };
    });
  },
  methods: {
    addGeojsonLayer(dataObj) {
      let vectorSource = new VectorSource();
      let features = new GeoJSON().readFeatures(dataObj, {
        dataProjection: "EPSG:4326",
        featureProjection: "EPSG:3857",
      });
      vectorSource.addFeatures(features);

      let vectorLayer = new VectorLayer({
        source: vectorSource,
        style: new Style({
          image: new CircleStyle({
            radius: 5,
            fill: new Fill({
              color: "blue",
            }),
            stroke: new Stroke({
              color: "red",
              width: 1,
            }),
          }),
          fill: new Fill({
            color: "blue",
          }),
          stroke: new Stroke({
            color: "red",
            width: 1,
          }),
        }),
      });
      this.map.addLayer(vectorLayer);
    },
    /**
     *  csv2json与wktToGeoJSON三方包
     * cnpm i csvtojson --save
     * cnpm i @terraformer/wkt --save
     */
    dingcsv2geojson(csvContent) {
      let result = csvToJson().fromString(csvContent);
      result.then((data) => {
        console.log(data);
      });
      // const [xmin, ymin, xmax, ymax] = turf.bbox(geojson);
      // const bbox = [[xmin, ymin], [xmax, ymax]];
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
