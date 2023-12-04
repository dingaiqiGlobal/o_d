<template>
  <div>
    <div id="map"></div>
    <div class="control">
      <button @click="addMVTMethod">MVT方式</button>
      <button @click="addGeojsonMethod">Geojson方式</button>
    </div>
  </div>
</template>

<script>
import "ol/ol.css";
import { Map, View } from "ol";
import * as olProj from "ol/proj";
import Projection from "ol/proj/Projection";
import * as olExtent from "ol/extent";
import TileLayer from "ol/layer/Tile";
import WMTS from "ol/source/WMTS";
import WMTSTileGrid from "ol/tilegrid/WMTS";

import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import Fill from "ol/style/Fill";

import VectorTileLayer from "ol/layer/VectorTile";
import VectorTileSource from "ol/source/VectorTile";
import MVT from "ol/format/MVT";
import { createXYZ } from "ol/tilegrid";
import GeoJSON from "ol/format/GeoJSON";

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
  },
  methods: {
    /**
     * 切片图层的url与tileUrlfunction
     * tileUrlfunction可选函数，用于获取给定平铺坐标和投影的平铺URL。
     * 如果未提供url，则为必填项。
     * 
     * 平铺数据的层源，其中URL采用在URL模板中定义的集合XYZ格式。默认情况下，这遵循广泛使用的谷歌网格，
     * 其中x 0和y 0位于左上角。像TMS这样x 0和y 0位于左下角的网格可以通过使用URL模板中的｛-y｝占位符来使用，
     * 只要源没有自定义平铺网格即可。在这种情况下，可以使用tileUrlFunction，
     */


    /**
     * 加载Geosever版矢量切片
     * 安装Geoserver对应版本插件geoserver-2.20.0-vectortiles-plugin
     * pbf格式或者geojson格式，其中pbf格式数据加密性较好，读取速度快：
     */
    addMVTMethod() {
      let MVTLayer = new VectorTileLayer({
        //declutter: true,//整理
        //renderMode: "vector",//渲染模式：（"hybrid"，"vector"）
        source: new VectorTileSource({
          //   crossOrigin: "anonymous",
          //   overlaps: true,//重叠：该源可能具有重叠的几何形状
          projection: new Projection({
            //构造写法
            code: "EPSG:900913",
            units: "m",
          }),
          tileGrid: createXYZ({
            //   extent: ,
            //   tileSize: ,
            //   resolutions: ,
            maxZoom: 19,
          }),
          format: new MVT(),
          url:
            "http://192.168.201.162:8088/geoserver/gwc/service/tms/1.0.0/zhjy:polygon_miyun@EPSG:900913@pbf/{z}/{x}/{-y}.pbf",
        }),
        style: (feature) => {
          let style = new Style({
            fill: new Fill({
              color: "rgba(225,225,225,0.2)",
            }),
            stroke: new Stroke({
              color: "#880000",
              width: 1,
            }),
          });
          return style;
        },
      });
      this.map.addLayer(MVTLayer);
    },
    //没走通，geoserver也是预览不出来的
    //Geoserver4326的能出来，900913的出不来
    addGeojsonMethod() {
      let GVTLayer = new VectorTileLayer({
        source: new VectorTileSource({
          projection: new Projection({
            code: "EPSG:900913",
            units: "m",
          }),
          tileGrid: createXYZ({
            maxZoom: 31,
          }),
          format: new GeoJSON(),
          url:
            "http://192.168.201.162:8088/geoserver/gwc/service/tms/1.0.0/zhjy:polygon_miyun@EPSG:900913@geojson/{z}/{x}/{-y}.geojson",
        }),
        style: (feature) => {
          let style = new Style({
            fill: new Fill({
              color: "rgba(6,41,225,0.2)",
            }),
            stroke: new Stroke({
              color: "#29ff06",
              width: 1,
            }),
          });
          return style;
        },
      });
      this.map.addLayer(GVTLayer);
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
