<template>
  <div>
    <div id="menu">
      <p class="title">
        <button id="projection" @click="this.changeProject">动态投影转换</button>
      </p>
    </div>
    <div class="container">
      <p>投影坐标系（EPSG:3857）</p>
      <div id="map1" class="map"></div>
    </div>
    <div class="container">
      <p>投影坐标系（EPSG:4548）</p>
      <div id="map2" class="map"></div>
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

import Graticule from "ol/layer/Graticule";
import Stroke from "ol/style/Stroke";

import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";

import proj4 from "proj4";
import { register } from "ol/proj/proj4";
import Projection from "ol/proj/Projection";

export default {
  name: "Base",
  data() {
    return {
      map: {},
      projection4548: null,
    };
  },
  mounted() {
    this.map = new Map({
      target: "map1",
      layers: [],
      view: new View({
        projection: "EPSG:3857",
        center: olProj.fromLonLat([116.39392, 39.916927]),
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
    /**
     * 网格线
     */
    let graticuleLayer = new Graticule({
      //参考系标线
      strokeStyle: new Stroke({
        color: "rgba(255,120,0,0.9)",
        width: 2,
        lineDash: [0.5, 4],
      }),
      showLabels: true,
      wrapX: false,
    });
    this.map.addLayer(graticuleLayer);
    /**
     * 矢量图（北京）
     */
    let vectorSource = new VectorSource({
      format: new GeoJSON(),
      url:
        "http://192.168.201.162:8088/geoserver/zhjy/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=zhjy%3Apolygon_beijing&maxFeatures=50000&outputFormat=application%2Fjson",
    });
    let vectorLayer = new VectorLayer({
      source: vectorSource,
    });
    this.map.addLayer(vectorLayer);
    /**
     * 高斯克吕格投影坐标系
     */
    proj4.defs(
      "EPSG:4548",
      "+proj=tmerc +lat_0=0 +lon_0=117 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs"
    ); //声明
    register(proj4); //注册
    //定义高斯投影坐标系，编号EPSG:4548
    this.projection4548 = new Projection({
      code: "EPSG:4548",
      units: "m",
      extent: [345754.3, 2501017.13, 607809.0, 5528578.96],
    });
  },
  methods: {
    changeProject() {
       new Map({
        layers: [
          new VectorLayer({
            source: new VectorSource({
              url:
                "http://192.168.201.162:8088/geoserver/zhjy/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=zhjy%3Apolygon_beijing&maxFeatures=50000&outputFormat=application%2Fjson",
              format: new GeoJSON(),
              wrapX: false,
            }),
          }),
        ],
        target: "map2",
        view: new View({
          projection: this.projection4548, //投影坐标系
          center: olProj.fromLonLat([3.89, 36.95]),
          zoom: 5,
        }),
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

.container {
  display: inline-block;
  width: 40%;
  height: 650px;
  padding: 10px;
}

.map {
  display: inline-block;
  background: #f8f4f0;
  width: 100%;
  height: 95%;
  border: 1px dashed #ff0000;
}

#menu {
  padding: 10px;
  border-radius: 3px;
  overflow: hidden;
  width: 100%;
  height: auto;
  box-shadow: 0 0 2px 1px #949292;
  text-align: center;
  z-index: 2001;
  border-color: #66ccff;
  border-bottom: 1px solid #949292;
  margin-bottom: 2px;
}

#projection {
  color: #0075c7;
  display: inline-block;
  padding: 3px 5px;
  margin-top: 4px;
  margin-bottom: 4px;
  margin-left: 4px;
  margin-right: 4px;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.42857143;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  border: 1px solid transparent;
  border-color: #0075c7;
  border-radius: 3px;
  background-image: none;
  background-color: transparent;
}
</style>
