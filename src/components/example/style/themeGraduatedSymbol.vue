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
import WFS from "ol/format/WFS";

import Style from "ol/style/Style";
import Icon from "ol/style/Icon";
import CircleStyle from "ol/style/Circle";
import Stroke from "ol/style/Stroke";
import Fill from "ol/style/Fill";
import Text from "ol/style/Text";

import Feature from "ol/Feature";
import Point from "ol/geom/Point";

import * as olLoadingstrategy from "ol/loadingstrategy";
import * as olTilegrid from "ol/tilegrid";
import { intersects, like } from "ol/format/filter";

import LayerGroup from "ol/layer/Group";

export default {
  name: "Base",
  data() {
    return {
      map: {},
      styleData: {
        label: {
          show: true,
          field: "NAME",
          font: "bold 14px 微软雅黑",
          textColor: "black",
          strokeWidth: 1,
          strokeColor: "#feffff",
        },
        stroke: {
          width: 0.1,
          color: "#feffff",
          dash: [0],
        },
        field: "POPU",
        colorMap: {
          "<50": "#006100",
          "50-100": "#559100",
          "100-150": "#a4c400",
          "150-200": "#ffff00",
          "200-250": "#ffbb00",
          "250-300": "#ff7700",
          ">300": "#ff2600",
        },
      },
      centerFeature: null,
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
    /**
     * 鼠标状态
     */
    this.map.on("pointermove", (e) => {
      var hit = this.map.hasFeatureAtPixel(e.pixel);
      this.map.getTargetElement().style.cursor = hit ? "pointer" : "";
    });

    this.addPolygonLayer();
    this.addThemeGraduated();
    this.addMapClickEvent();

    //监听地图缩放级别显示themeGraduated图层
    this.map.getView().on("change", (e) => {
      if (e.target.getZoom() < 9) {
        let ThemeGraduatedLayer = this.getLayerByLayerName(this.map, "themeGraduated");
        ThemeGraduatedLayer.setVisible(true);
      }
    });
  },
  methods: {
    /**
     * 地图点击事件
     */
    addMapClickEvent() {
      //必须用forEachFeatureAtPixel事件方法
      this.map.on("click", (e) => {
        let feature = this.map.forEachFeatureAtPixel(e.pixel, (feature, layer) => {
          //移除过滤图层
          let rmPointLayer = this.getLayerByLayerName(this.map, "pointLayer");
          if (rmPointLayer && layer.get("name") === "themeGraduated") {
            this.map.removeLayer(rmPointLayer);
          }
          //隐藏等级符合图层
          let visibleThemeGraduated = this.getLayerByLayerName(
            this.map,
            "themeGraduated"
          );
          if (visibleThemeGraduated && layer.get("name") === "themeGraduated") {
            visibleThemeGraduated.setVisible(false);
          }
          //定位
          if (layer.get("name") === "county") {
            let polygon = feature.getGeometry();
            this.map.getView().fit(polygon);
          }
          //添加过滤图层
          if (layer.get("name") === "themeGraduated") {
            let property = feature.getProperties().NAME;
            this.addPointLayer(property);
          }
        });
      });
    },
    getLayerByLayerName(map, layerName) {
      let targetLayer = null;
      if (map) {
        const layers = map.getLayers().getArray();
        targetLayer = this.getLayerInternal(layers, `name`, layerName);
      }
      return targetLayer;
    },
    getLayerInternal(layers, key, value) {
      let _target = null;
      if (layers.length > 0) {
        layers.every((layer) => {
          if (layer instanceof LayerGroup) {
            let layers = layer.getLayers().getArray();
            _target = getLayerInternal(layers, key, value);
            if (_target) {
              return false;
            } else {
              return true;
            }
          } else if (layer.get(key) === value) {
            _target = layer;
            return false;
          } else {
            return true;
          }
        });
      }
      return _target;
    },
    addPolygonLayer() {
      let vectorSource = new VectorSource({
        format: new GeoJSON(),
        url:
          "http://192.168.201.162:8088/geoserver/zhjy/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=zhjy%3Apolygon_beijing&maxFeatures=50000&outputFormat=application%2Fjson",
      });
      let vectorLayer = new VectorLayer({
        name: "county",
        source: vectorSource,
        style: (feature) => {
          return this.addStyle(feature, this.styleData);
        },
      });
      this.map.addLayer(vectorLayer);
    },
    addStyle(feature, styleData) {
      let geom = feature.getGeometry();
      let type = geom.getType().toLowerCase();
      let { label, stroke, field, colorMap } = styleData;
      let PopuValue = feature.get(field);
      let color;
      let styleJson = {};
      Object.keys(colorMap).map((key) => {
        let min;
        let max;
        if (key.indexOf("<") !== -1) {
          min = 0;
          max = parseFloat(key.split("<")[1]);
        }
        if (key.indexOf(">") !== -1) {
          min = parseFloat(key.split(">")[1]);
          max = 400;
        }
        if (key.indexOf("-") !== -1) {
          let range = key.split("-");
          min = parseFloat(range[0]);
          max = parseFloat(range[1]);
        }
        if (PopuValue >= min && PopuValue < max) {
          color = colorMap[key];
        }
      });

      if (type.indexOf("polygon") !== -1) {
        styleJson = {
          fill: new Fill({
            color: color,
          }),
          stroke: new Stroke({
            color: stroke.color,
            lineDash: stroke.dash,
            width: stroke.width,
          }),
        };
      }
      if (label.show) {
        let text = feature.get(label.field);
        let font = label.font ? label.font : "normal 12px 微软雅黑";
        styleJson.text = new Text({
          font: font,
          text: text.toString(),
          fill: new Fill({
            color: label.textColor,
          }),
          stroke: new Stroke({
            color: label.strokeColor,
            width: label.strokeWidth,
          }),
        });
      }
      return new Style(styleJson);
    },
    /**
     * 添加点图层
     */
    addPointLayer(filterAttr) {
      let vectorSource = new VectorSource({
        format: new GeoJSON(),
        loader: (extent, resolution, projection) => {
          let proj = projection.getCode();
          let url = `http://192.168.201.162:8088/geoserver/wfs?
              service=WFS&version=1.1.0&request=GetFeature&typename=zhjy:point_beijin&outputFormat=application/json
              &srsname=${proj}&bbox=${extent.join(",")},${proj}`;
          let featureRequest = new WFS().writeGetFeature({
            srsName: "EPSG:3857",
            featureNS: "www.zhjy.com",
            featurePrefix: "zhjy",
            featureTypes: ["point_beijing"],
            maxFeatures: 5000,
            outputFormat: "application/json",
            filter: new like("COUNTY", filterAttr), //属性过滤条件
          });

          fetch(url, {
            method: "POST",
            body: new XMLSerializer().serializeToString(featureRequest),
          })
            .then(function (response) {
              return response.json();
            })
            .then(function (json) {
              var features = new GeoJSON().readFeatures(json);
              if (features.length > 0) {
                vectorSource.clear();
                vectorSource.addFeatures(features);
              }
            })
            .catch((err) => {
              console.log("请求错误", err);
            });
        },
        strategy: olLoadingstrategy.tile(
          new olTilegrid.createXYZ({
            maxZoom: 25,
          })
        ),
        projection: "EPSG4326",
      });
      let vectorLayer = new VectorLayer({
        name: "pointLayer",
        source: vectorSource,
        style: new Style({
          image: new Icon({
            src: "/images/icon/location.png",
            opacity: 1,
            scale: 0.2,
          }),
        }),
      });
      this.map.addLayer(vectorLayer);
    },
    /**
     * 添加分级渲染图层
     */
    addThemeGraduated() {
      let centerVecSource = new VectorSource();
      //获取添加feature
      fetch(
        "http://192.168.201.162:8088/geoserver/zhjy/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=zhjy%3Apolygon_beijing&maxFeatures=50000&outputFormat=application%2Fjson"
      )
        .then((res) => {
          return res.json();
        })
        .then((res) => {
          this.centerFeatures = new GeoJSON().readFeatures(res, {
            // 用readFeatures方法可以自定义坐标系
            dataProjection: "EPSG:4326", // 设定JSON数据使用的坐标系
            featureProjection: "EPSG:3857", // 设定当前地图使用的feature的坐标系
          });
          this.centerFeatures.map((feat) => {
            let coordinate = this.getPolygonAreaCenter(
              feat.getGeometry().flatCoordinates
            );
            //添加质心点要素
            let feature = new Feature({
              geometry: new Point(coordinate),
            });

            let PropertiesData = feat.getProperties(); //获取请求数据中的属性
            let { COLOR, NAME, POPU, STROKE } = PropertiesData;
            let pointProperties = {
              COLOR: COLOR,
              NAME: NAME,
              POPU: POPU,
              STROKE: STROKE,
            };
            feature.setProperties(pointProperties); //赋值给中心点数据属性
            centerVecSource.addFeature(feature);
          });
        });
      //添加图层
      let centerVecLayer = new VectorLayer({
        name: "themeGraduated",
        source: centerVecSource,
        style: (feature) => {
          let style = new Style({
            image: new CircleStyle({
              fill: new Fill({
                color: "rgba(0,112,225,0.7)",
              }),
              stroke: new Stroke({
                color: "rgba(216,203,62,1)",
                width: 0.5,
              }),
              radius: feature.getProperties().POPU * 0.15, //人口决定圈大小
            }),
            text: new Text({
              textAlign: "center",
              textBaseline: "middle",
              font: "bold 15px serif",
              text: `${feature.getProperties().POPU}万人`,
              fill: new Fill({ color: "#f70e31" }),
              stroke: new Stroke({ color: "#f4280c", width: 0.5 }),
              offsetX: 0,
              offsetY: 0,
              rotation: 0,
            }),
          });
          return style;
        },
      });
      this.map.addLayer(centerVecLayer);
    },
    /**
     * 计算polygon的质心,也可使truf.js
     * 也可以直接在面数据中添加center属性
     */
    getPolygonAreaCenter(points) {
      let result = [];
      let resArr = [];
      for (var i = 0, len = points.length; i < len; i += 2) {
        resArr = [points[i], points[i + 1]];
        result.push(resArr);
      }
      var sum_x = 0;
      var sum_y = 0;
      var sum_area = 0;
      var p1 = result[1];
      let p2 = [];
      let area = 0;
      for (var i = 2; i < result.length; i++) {
        p2 = result[i];
        area = this.Area(result[0], p1, p2);
        sum_area += area;
        sum_x += (result[0][0] + p1[0] + p2[0]) * area;
        sum_y += (result[0][1] + p1[1] + p2[1]) * area;
        p1 = p2;
      }
      var xx = sum_x / sum_area / 3;
      var yy = sum_y / sum_area / 3;
      return [xx, yy];
    },
    Area(p0, p1, p2) {
      var area = 0.0;
      area =
        p0[0] * p1[1] +
        p1[0] * p2[1] +
        p2[0] * p0[1] -
        p1[0] * p0[1] -
        p2[0] * p1[1] -
        p0[0] * p2[1];
      return area / 2;
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
