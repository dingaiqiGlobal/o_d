<template>
  <div>
    <div id="map"></div>
    <div class="control">
      <button @click="interaction">绘制线</button>
      <button @click="split">分割</button>
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
import CircleStyle from "ol/style/Circle";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import Fill from "ol/style/Fill";

import Feature from "ol/Feature";
import GeoJSON from "ol/format/GeoJSON";
import LineString from "ol/geom/LineString";
import Polygon from "ol/geom/Polygon";

import Draw from "ol/interaction/Draw";
import * as turf from "@turf/turf";
import Coords2TurfGeom from "../../../ol_Extend/turf/Coords2TurfGeom";

export default {
  name: "Base",
  data() {
    return {
      map: {},
      polygonFeature: null,
      drawFeature: null,
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

    //面
    this.polygonFeature = new Feature({
      geometry: new Polygon([
        [
          olProj.transform([116.82874, 40.37645], "EPSG:4326", "EPSG:3857"),
          olProj.transform([116.82814, 40.36742], "EPSG:4326", "EPSG:3857"),
          olProj.transform([116.83198, 40.3677], "EPSG:4326", "EPSG:3857"),
          olProj.transform([116.8329, 40.37271], "EPSG:4326", "EPSG:3857"),
          olProj.transform([116.83393, 40.37488], "EPSG:4326", "EPSG:3857"),
          olProj.transform([116.8311, 40.37638], "EPSG:4326", "EPSG:3857"),
          olProj.transform([116.82874, 40.37645], "EPSG:4326", "EPSG:3857"),
        ],
      ]),
      name: "polygon",
    });
    this.polygonFeature.setStyle(
      new Style({
        fill: new Fill({
          color: "rgba(29,200,63,0.5)",
        }),
        stroke: new Stroke({
          color: "rgba(0,25,21,0.5)",
          width: 2,
        }),
      })
    );
    let polygonSource = new VectorSource();
    polygonSource.addFeature(this.polygonFeature);
    // polygonSource.setProperties({'type':'面'})
    let polygonLayer = new VectorLayer();
    polygonLayer.setSource(polygonSource);
    this.map.addLayer(polygonLayer);
  },
  methods: {
    /**
     * 交互绘制
     */
    interaction() {
      let drawSource = new VectorSource();
      let drawVector = new VectorLayer({
        source: drawSource,
        style: new Style({
          fill: new Fill({
            color: "rgba(255, 255, 255, 0.2)",
          }),
          stroke: new Stroke({
            color: "#ff0000",
            width: 2,
          }),
        }),
      });
      this.map.addLayer(drawVector);
      let draw = new Draw({
        source: drawSource,
        type: "LineString",
      });
      this.map.addInteraction(draw);
      draw.on("drawend", (e) => {
        draw.setActive(false); //绘制完失效
        this.drawFeature = e.feature;
      });
    },
    /**
     * 转换分割
     */
    split() {
      //line转换
      const lineGeometry = this.drawFeature.getGeometry();
      const type = lineGeometry.getType();
      lineGeometry.transform("EPSG:3857", "EPSG:4326");
      const coords = lineGeometry.getCoordinates();
      let line = Coords2TurfGeom[type](coords);

      //面转换
      const polygonGeometry = this.polygonFeature.getGeometry();
      const type1 = polygonGeometry.getType();
      polygonGeometry.transform("EPSG:3857", "EPSG:4326");
      const coords1 = polygonGeometry.getCoordinates();
      let polygon = Coords2TurfGeom[type1](coords1);

      //分割后集合
      let featureCollection = this.polygonSplit(polygon, line);
      let olFeatureCollection = this.turf2ol(featureCollection); //是个数组
      olFeatureCollection.map((item) => {//遍历转换
        item.getGeometry().transform("EPSG:4326", "EPSG:3857");
      });
      lineGeometry.transform("EPSG:4326", "EPSG:3857"); //绘制的线-如果不转换就不显示
      let Vector = new VectorLayer({
        source: new VectorSource(),
        style: new Style({
          fill: new Fill({
            color: "rgba(29,200,63,0.5)",
          }),
          stroke: new Stroke({
            color: "rgba(0,25,21,0.5)",
            width: 2,
          }),
        }),
        zIndex: 2,
      });
      Vector.getSource().addFeatures(olFeatureCollection); //单个要素
      this.map.addLayer(Vector);
    },

    /**
     * 分割方法
     */
    polygonSplit(poly, line, tolerance = 0.001, toleranceType = "kilometers") {
      // 1. 条件判断
      if (poly.geometry === void 0 || poly.geometry.type !== "Polygon")
        //void 0就是undefined
        throw "传入的必须为polygon";
      if (
        line.geometry === void 0 ||
        line.geometry.type.toLowerCase().indexOf("linestring") === -1
      )
        throw "传入的必须为linestring";
      if (line.geometry.type === "LineString") {
        if (
          //booleanPointInPolygon判断点在多边形内部
          turf.booleanPointInPolygon(turf.point(line.geometry.coordinates[0]), poly) ||
          turf.booleanPointInPolygon(
            turf.point(line.geometry.coordinates[line.geometry.coordinates.length - 1]),
            poly
          )
        )
          throw "起点和终点必须在多边形之外";
      }
      // 2. 计算交点，并把线的点合并
      let lineIntersect = turf.lineIntersect(line, poly);
      const lineExp = turf.explode(line);
      for (let i = 0; i < lineExp.features.length - 1; i++) {
        lineIntersect.features.push(turf.point(lineExp.features[i].geometry.coordinates));
      }
      // 3. 计算线的缓冲区
      const lineBuffer = turf.buffer(line, tolerance, {
        units: toleranceType,
      });
      // 4. 计算线缓冲和多边形的difference，返回"MultiPolygon"，所以将其拆开
      const _body = turf.difference(poly, lineBuffer);
      let pieces = [];
      if (_body.geometry.type === "Polygon") {
        pieces.push(turf.polygon(_body.geometry.coordinates));
      } else {
        _body.geometry.coordinates.forEach(function (a) {
          pieces.push(turf.polygon(a));
        });
      }
      // 5. 处理点数据
      for (let p in pieces) {
        const piece = pieces[p];
        for (let c in piece.geometry.coordinates[0]) {
          const coord = piece.geometry.coordinates[0][c];
          const p = turf.point(coord);
          for (let lp in lineIntersect.features) {
            const lpoint = lineIntersect.features[lp];
            if (turf.distance(lpoint, p, toleranceType) <= tolerance * 2) {
              piece.geometry.coordinates[0][c] = lpoint.geometry.coordinates;
            }
          }
        }
      }
      // 6. 过滤掉重复点
      for (let p in pieces) {
        const coords = pieces[p].geometry.coordinates[0];
        pieces[p].geometry.coordinates[0] = [...new Set(coords)]; //[...new Set(coords)]数组去重
      }
      // 7. 将属性赋予每一个polygon，并处理id
      pieces.forEach((a, index) => {
        a.properties = Object.assign({}, poly.properties);
        a.properties.id += `-${index}`;
      });
      return turf.featureCollection(pieces);
    },
    /**
     * 转换
     */
    ol2turf(olData) {
      let format = new GeoJSON();
      if (olData instanceof Feature) {
        return format.writeFeatureObject(olData);
      } else if (olData instanceof Geometry) {
        return format.writeGeometryObject(olData);
      } else if (olData instanceof Collection) {
        let dataList = olData.getArray();
        if (dataList[0] instanceof Feature) {
          return format.writeFeaturesObject(dataList);
        }
      }
      return null;
    },
    turf2ol(turfData) {
      let format = new GeoJSON();
      if (turfData.type === "Feature") {
        return format.readFeature(turfData);
      } else if (
        [
          "Point",
          "MultiPoint",
          "LineString",
          "MultiLineString",
          "Polygon",
          "MultiPolygon",
        ].indexOf(turfData.type) > -1
      ) {
        return format.readGeometry(turfData);
      } else if (turfData.type === "FeatureCollection") {
        return format.readFeatures(turfData);
      } else if (turfData.type === "GeometryCollection") {
        return turfData.geometries.map((geom) => {
          return format.readGeometry(geom);
        });
      } else {
        return null;
      }
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
