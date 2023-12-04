<template>
  <div>
    <div id="map"></div>
    <div class="control"></div>
  </div>
</template>

<script>
import "ol/ol.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";

import * as olProj from "ol/proj";
import proj4 from "proj4";
import { register } from "ol/proj/proj4";
import Projection from "ol/proj/Projection";

import Polygon from "ol/geom/Polygon";

import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { bbox } from "ol/loadingstrategy";

import TileWMS from "ol/source/TileWMS";

export default {
  name: "Base",
  data() {
    return {
      map: {},
    };
  },
  mounted() {
    let center = [116.83112, 40.3705];
    //使用proj4.defs()定义投影
    proj4.defs("EPSG:4490", "+proj=longlat +ellps=GRS80 +no_defs");
    //使proj4中定义的投影在OpenLayers中可用
    register(proj4);

    //创建"EPSG:4490"的Projection实例，Openlayers将可以从Peoj4js中获取转换函数
    let cgcs2000 = new Projection({
      code: "EPSG:4490", //EPSG code
      extent: [-180, -90, 180, 90],
      worldExtent: [-180, -90, 180, 90],
      units: "degrees", //Projection units: `'degrees'`, `'ft'`, `'m'`, `'pixels'`, `'tile-pixels'` or `'us-ft'.
    });
    olProj.addProjection(cgcs2000);

    this.map = new Map({
      target: "map",
      layers: [],
      view: new View({
        projection: cgcs2000,
        center: olProj.fromLonLat(center, cgcs2000),
        zoom: 11,
      }),
    });
    let ArcGISLayer = new TileLayer({
      source: new XYZ({
        projection: "EPSG:900913",
        url:
          "https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}",
        wrapX: true,
      }),
    });
    this.map.addLayer(ArcGISLayer);

    /**
     * 单个coordinate的转换
     */
    //将坐标coordinate从“EPSG:3857”转换到“EPSG:4490”
    let test1 = olProj.transform(
      [12686109.88955285, 2572810.705991532],
      "EPSG:3857",
      "EPSG:4490"
    );
    //添加坐标转换函数
    olProj.addCoordinateTransforms(
      "EPSG:3857",
      "EPSG:4490",
      (coordinate) => {
        return proj4("EPSG:3857", "EPSG:4490", coordinate);
      },
      (coordinate) => {
        return proj4("EPSG:4490", "EPSG:3857", coordinate);
      }
    );
    //将经纬度的coordinate转换到目标空间参考下的坐标
    let test2 = olProj.fromLonLat([116.83112, 40.3705], cgcs2000);
    //将coordinate转换成经纬度
    let test3 = olProj.toLonLat([12686109.88955285, 2572810.705991532]);

    /**
     * 对于几何要素Geometry及其子类（点、线、面等）
     * 可以使用ol.geom.Geometry中的transform()方法转换几何对象中的每组坐标
     */
    let test4 = new Polygon([
      [
        [116.262961128, 39.956198804],
        [116.33053782, 39.956198804],
        [116.33053782, 39.899567632],
        [116.262961128, 39.899567632],
        [116.262961128, 39.956198804],
      ],
    ]);
    test4.transform("EPSG:4326", "EPSG:3857");
    //console.log(test4);
    //或者
    let test5 = new Polygon([
      [
        [116.262961128, 39.956198804],
        [116.33053782, 39.956198804],
        [116.33053782, 39.899567632],
        [116.262961128, 39.899567632],
        [116.262961128, 39.956198804],
      ],
    ]);
    test5.applyTransform(olProj.getTransform("EPSG:4326", "EPSG:3857"));

    /**
     * GeoJSON、KML、gpx类型的文件可以选择在解析器解析完成得到要素集合后，对每个要素进行转化。
     */
    let SZSource = new VectorSource();
    fetch("data/proj/shenZhen.json")
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        var features = new GeoJSON().readFeatures(res);
        for (var i = 0; i < features.length; i++) {
          features[i].getGeometry().transform("EPSG:3857", "EPSG:4490");
        }
        SZSource.addFeatures(features);
      });

    let SZLayer = new VectorLayer({
      source: SZSource,
    });
    this.map.addLayer(SZLayer);

    /**
     * 对于服务类型的数据，
     * 像WFS、WMS服务可以在请求中
     * 使用srsname或CRS参数指定返回要素的空间参考，
     * 将坐标转换的工作在服务端完成。
     */
    //WFS
    let wfsLayer = new VectorLayer({
      source: new VectorSource({
        format: new GeoJSON(),
        url: (extent) => {
          return `http://192.168.201.162:8088/geoserver/zhjy/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=zhjy%3Apolyline_miyun&maxFeatures=5000&outputFormat=application%2Fjson&srsname=EPSG:4490&bbox=${extent.join(
            ","
          )},EPSG:4490`;
        },
        strategy: bbox,
        //加载策略，可选值：
        //all，一次性加载所有的要素；
        //bbox，加载地图当前视图范围内的要素；
        //tile，基于瓦片格网加载要素
      }),
    });
    this.map.addLayer(wfsLayer);

    //WMS
    let wmsLayer = new TileLayer({
      source: new TileWMS({
        url: "http://192.168.201.162:8088/geoserver/wms",
        params: {
          LAYERS: "zhjy:polygon_miyun",
          TILED: true,
          VERSION: "1.1.0",
          TRANSPARENT: true,
          CRS: "EPSG:4490", //重要
        },
        serverType: "geoserver",
        transition: 0, //用于渲染的不透明度过渡的持续时间。要禁用不透明过渡，设置transition为: 0
        //tileGrid: tileGrid,
      }),
    });
    this.map.addLayer(wmsLayer);
  },
  methods: {},
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
