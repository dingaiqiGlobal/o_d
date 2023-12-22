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

import Polygon from "ol/geom/Polygon";

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
        center: olProj.fromLonLat([116.392940,39.911320]),
        zoom: 11,
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

    let vectorSource = new VectorSource({
      format: new GeoJSON(),
      url:
        "http://192.168.201.162:8088/geoserver/zhjy/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=zhjy%3Apolygon_beijing&maxFeatures=50000&outputFormat=application%2Fjson",
    });
    let vectorLayer = new VectorLayer({
      source: vectorSource,
    });
    this.map.addLayer(vectorLayer);

    //定义裁剪边界
    let coord = [
      [
        [116.25973, 39.98738],
        [116.26934, 39.82409],
        [116.49147, 39.82726],
        [116.48975, 39.9958],
        [116.25973, 39.98738],
      ],
    ];
    let clipPolygon = new Polygon(coord);
    let clipgeom = clipPolygon.transform("EPSG:4326", "EPSG:3857");
    //map事件（6版本后没更新）
    //precompose:渲染前 (RenderEvent)
    //postcompose：渲染完成 (RenderEvent)
    //postrender:渲染完成  (MapEvent)

    //layer事件：6版本后图层-新的prerender和postrender图层事件
    //替换旧的precompose，render和postcompose事件

    
    /**
     * 裁剪方式：
     * ①功能如果用服务+过滤的方式比较繁
     * ②canvas裁剪
     * 
     * 现阶段支持Polygon，不支持MultiPolygon
     */
    this.creatPolygonClip(vectorLayer, clipgeom);
    this.creatPolygonClip(TDTLayer, clipgeom);
  },
  methods: {
    creatPolygonClip(layer, polygonGeometry) {
      //图层渲染之前触发
      layer.on("prerender", (evt) => {
        const canvas = evt.context;
        canvas.save(); //save()可以保存当前状态
        canvas.beginPath(); //开始绘画
        const coords = polygonGeometry.getCoordinates()[0];
        this.createClip(coords, canvas);
        canvas.clip(); //裁剪
      });
      //图层渲染之后触发
      layer.on("postrender", function (evt) {
        const canvas = evt.context;
        canvas.restore();
      });
    },
    createClip(coords, canvas) {
      for (let i = 0, cout = coords.length; i < cout; i++) {
        //获取屏幕坐标
        let screenCoord = this.map.getPixelFromCoordinate(coords[i]); //地图坐标转换为屏幕坐标
        let x = screenCoord[0];
        let y = screenCoord[1];
        if (i === 0) {
          canvas.moveTo(x, y); //把画笔移动到指定的坐标(x, y)
        } else {
          canvas.lineTo(x, y); //绘制一条从当前位置到指定坐标(x,y)的直线
        }
      }
      canvas.closePath(); //结束绘画
      //设置边框
      canvas.strokeStyle = "red";
      canvas.lineWidth = 2;
      canvas.stroke(); //轮廓
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
