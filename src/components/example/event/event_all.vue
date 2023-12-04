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
import TileWMS from "ol/source/TileWMS";

import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import Style from "ol/style/Style";
import Icon from "ol/style/Icon";
import CircleStyle from "ol/style/Circle";
import Stroke from "ol/style/Stroke";
import Fill from "ol/style/Fill";
import Text from "ol/style/Text";

import Cluster from "ol/source/Cluster";
import { MapUtil, LayerUtil } from "@terrestris/ol-util";

import Popup from "../../ol_Extend/popup/ol-popup";
import "../../ol_Extend/popup/ol-popup.css";

// import Select from "ol/interaction/Select";
/**
 * 重点---
 * crossOrigin: "anonymous", 
 * 只有设置了源的crossOrigin属性，
 * 才能检索图像分块的数据。才能使用getData()
 */

export default {
  name: "Base",
  data() {
    return {
      map: {},
      selectLayer: null,
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

    this.addWMSLayer();
    this.addClusterLayer();
    this.addWFSLayer();

    /**
     * 鼠标状态
     */
    this.map.on("pointermove", (e) => {
      let hitVec = this.map.hasFeatureAtPixel(e.pixel); //Vec
      let WMSLayerArr = MapUtil.getAllLayers(this.map, (layer) => {
        let layerSource = layer.getSource();
        if (LayerUtil.isOlSourceTileWMS(layerSource)) {
          return layer;
        }
      });
      let WMSLayer = WMSLayerArr.find((value, key, arr) => {
        const data = value.getData(e.pixel);
        let hit = data && data[3] > 0;
        if (hit) {
          return value;
        }
      });
      if (hitVec || WMSLayer) {
        this.map.getTargetElement().style.cursor = "pointer";
      } else {
        this.map.getTargetElement().style.cursor = "";
      }
    });

    /**
     * 气泡框事件
     */
    //气泡框
    let popup = new Popup();
    this.map.addOverlay(popup);
    //单击事件
    this.map.on("click", (e) => {
      const coordinate = e.coordinate;
      let hdms="";
      let hasFeature = this.map.hasFeatureAtPixel(e.pixel);
      if (hasFeature) {
        this.map.forEachFeatureAtPixel(e.pixel, (feature, layer) => {
          if (feature) {
            let layerType = layer.get("layerType");
            //聚散---
            if (layerType === "Cluster") {
              let selectFeature = feature.getProperties().features;
              if (!selectFeature || selectFeature.length == 0) return false;
              if (selectFeature.length === 1) {
                // 只有一个元素的情况下
                let feature = selectFeature[0];
                let featureData = feature.getProperties() || {};
                hdms = `<div>${featureData["NAME"]}</div>`;
                popup.show(coordinate, hdms);
              } else if (selectFeature.length > 1) {
                // 多个元素的情况下
                selectFeature.map((item, index) => {
                  let itemFeatureData = item.getProperties() || {};
                  hdms += `<div>序列${index + 1}：${itemFeatureData["NAME"]}</div>`;
                });
                popup.show(coordinate, hdms);
              }
            }
            //WFS---
            if (layerType === "WFS") {
              let WFSFeatureData = feature.getProperties();
              hdms = `<div>${WFSFeatureData["NAME"]}</div>`;
              popup.show(coordinate, hdms);
            }
          }
        });
      } else {
        //getAllLayers(collection, filter?): BaseLayer[]
        //过滤wms图层（从所有图层中）
        let WMSLayerArr = MapUtil.getAllLayers(this.map, (layer) => {
          let layerSource = layer.getSource();
          if (LayerUtil.isOlSourceTileWMS(layerSource)) {
            return layer; //返回是个数组
          }
        });
        //过滤选中的wms图层
        let WMSLayer = WMSLayerArr.find((value, key, arr) => {
          const data = value.getData(e.pixel);
          const hit = data && data[3] > 0;
          if (hit) {
            return value;
          }
        });
        //WMS-getFeatureInfoUrl
        let viewResolution = this.map.getView().getResolution();
        if (WMSLayer) {
          let WMSSource = WMSLayer.getSource();
          let url = WMSSource.getFeatureInfoUrl(coordinate, viewResolution, "EPSG:3857", {
            INFO_FORMAT: "application/json",
          });
          if (url) {
            fetch(url)
              .then((response) => response.json())
              .then((data) => {
                let features = data.features;
                for (let i = 0; i < features.length; i++) {
                  let featureName = features[i].properties.NAME;
                  hdms = `<div>${featureName}</div>`;
                  popup.show(coordinate, hdms);
                }
              })
              .catch((err) => {
                console.log("请求错误", err);
              });
          }
        }
      }
    });
  },
  methods: {
    addWMSLayer() {
      let wmsLayer1 = new TileLayer({
        layerType: "WMS",
        source: new TileWMS({
          url: "http://192.168.201.162:8088/geoserver/wms",
          params: { LAYERS: "zhjy:polyline_miyun", TILED: true },
          serverType: "geoserver",
          crossOrigin: "anonymous", //只有设置了源的crossOrigin属性，才能检索图像分块的数据。才能使用getData()
        }),
      });
      this.map.addLayer(wmsLayer1);

      let wmsLayer2 = new TileLayer({
        layerType: "WMS",
        source: new TileWMS({
          url: "http://192.168.201.162:8088/geoserver/wms",
          params: { LAYERS: "zhjy:polygon_miyun", TILED: true },
          serverType: "geoserver",
          crossOrigin: "anonymous",
        }),
      });
      this.map.addLayer(wmsLayer2);
    },
    addClusterLayer() {
      //实例化矢量数据源
      let vectorSource = new VectorSource({
        format: new GeoJSON(),
        url:
          "http://192.168.201.162:8088/geoserver/zhjy/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=zhjy%3Apoint_miyun&maxFeatures=50000&outputFormat=application%2Fjson",
      });
      //实例化聚散数据源
      this.clusterSource = new Cluster({
        source: vectorSource,
        distance: this.distance,
        minDistance: this.minDistance,
      });
      //添加图层并设置样式
      let styleCache = {};
      let clusterLayer = new VectorLayer({
        layerType: "Cluster",
        source: this.clusterSource,
        style: (feature) => {
          let size = feature.get("features").length;
          let style = styleCache[size];
          if (size === 1) {
            style = new Style({
              image: new Icon({
                src: "images/icon/location.png",
                scale: 0.2,
              }),
            });
          } else {
            if (!style) {
              style = new Style({
                image: new CircleStyle({
                  radius: 10,
                  stroke: new Stroke({
                    color: "#fff",
                  }),
                  fill: new Fill({
                    color: "#3399CC",
                  }),
                }),
                text: new Text({
                  text: size.toString(),
                  fill: new Fill({
                    color: "#fff",
                  }),
                }),
              });
            }
          }
          return style;
        },
      });
      this.map.addLayer(clusterLayer);
    },
    addWFSLayer() {
      const vectorLayer = new VectorLayer({
        layerType: "WFS",
        source: new VectorSource({
          format: new GeoJSON(),
          url:
            "http://192.168.201.162:8088/geoserver/zhjy/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=zhjy%3Apoint_beijing&maxFeatures=5000&outputFormat=application%2Fjson",
        }),
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
        }),
      });
      this.map.addLayer(vectorLayer);
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
