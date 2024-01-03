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
import XYZ from "ol/source/XYZ";

import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import Fill from "ol/style/Fill";

import WFS from "ol/format/WFS.js";
import * as olTilegrid from "ol/tilegrid";
import * as olLoadingstrategy from "ol/loadingstrategy";

import Select from "ol/interaction/Select";
import { pointerMove } from "ol/events/condition";
import { easeOut } from "ol/easing";

import { MapUtil } from "@terrestris/ol-util";
import { equalTo } from "ol/format/filter";

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
        zoom: 9,
      }),
    });
    let ArcGISLayer = new TileLayer({
      source: new XYZ({
        projection: "EPSG:900913",
        //https://map.geoq.cn/ArcGIS/rest/services  //services地址
        url:
          "https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}",
        wrapX: true,
      }),
    });
    this.map.addLayer(ArcGISLayer);

    /**
     * 添加图层
     */
    this.addWFSLoader({
      layer: "polygon_beijing",
      layerName: "BJ",
      zIndex: 1,
      visible: true,
    });
    this.addWFSLoader({
      layer: "HDJD",
      layerName: "HDJD",
      zIndex: 1,
      visible: false,
    });
    this.addWFSLoader({
      layer: "HDSQ",
      layerName: "HDSQ",
      zIndex: 1,
      visible: false,
    });
    const BJlLayer = MapUtil.getLayerByName(this.map, "BJ");
    const HDJDLayer = MapUtil.getLayerByName(this.map, "HDJD");
    const HDSQLayer = MapUtil.getLayerByName(this.map, "HDSQ");

    /**
     * 显示图层
     */
    this.map.getView().on("change:resolution", () => {
      let zoom = this.map.getView().getZoom();
      // console.log(zoom);
      if (zoom < 9) {
        this.setLayerVisible(["BJ"], true);
        this.setLayerVisible(["HDJD", "HDSQ"], false);
      } else if (zoom > 9 && zoom < 13) {
        this.setLayerVisible(["HDJD"], true);
        this.setLayerVisible(["BJ", "HDSQ"], false);
      } else if (zoom > 13) {
        this.setLayerVisible(["HDSQ"], true);
        this.setLayerVisible(["BJ", "HDJD"], false);
      }
    });

    /**
     * 事件
     */
    //鼠标状态
    this.map.on("pointermove", (e) => {
      var hit = this.map.hasFeatureAtPixel(e.pixel);
      this.map.getTargetElement().style.cursor = hit ? "pointer" : "";
    });
    //改变样式
    var select_move = new Select({
      condition: pointerMove,
      style: (feature) => {
        return new Style({
          stroke: new Stroke({
            color: "rgba(109, 233, 0, 1)",
            width: 2,
          }),
          fill: new Fill({
            color: "rgba(255, 255, 255, 0.5)",
          }),
        });
      },
    });
    this.map.addInteraction(select_move);

    /**
     * 单击事件
     */
    this.map.on("click", (e) => {
      let feature = this.map.forEachFeatureAtPixel(e.pixel, (feature, layer) => {
        if (feature) {
          let geometry = feature.getGeometry();
          let featureName = feature.getProperties()["ZH_NAME"];
          this.map.getView().fit(geometry, {
            padding: [20, 20, 20, 20], // 如果需要，可以在四个方向上添加填充
            size: this.map.getSize(), // 考虑地图的大小
            nearest: true, // 如果设置为true，则缩放级别将被舍入到最近的整数
            duration: 1000, // 动画持续时间（毫秒），默认为1000
            easing: easeOut, // 可以选择缓动函数
          }); //飞行
          let layerName = layer.getProperties()["name"];
          if (layerName === "BJ") {
            if (HDJDLayer) {
              HDJDLayer.setSource(new VectorSource());
            }
            let source = this.filterLayer("HDJD", new equalTo("COUNTY", featureName));
            HDJDLayer.setSource(source);
            HDJDLayer.getSource().refresh(); //刷新资源
          } else if (layerName === "HDJD") {
            if (HDSQLayer) {
              HDSQLayer.setSource(new VectorSource());
            }
            let source = this.filterLayer("HDSQ", new equalTo("JDNAME", featureName));
            HDSQLayer.setSource(source);
            HDSQLayer.getSource().refresh();
          } else if (layerName === "HDSQ") {
            if (HDSQLayer) {
              HDSQLayer.setSource(new VectorSource());
            }
            let source = this.filterLayer("HDSQ", new equalTo("ZH_NAME", featureName));
            HDSQLayer.setSource(source);
            HDSQLayer.getSource().refresh();
          }
        }
      });
      //console.log(this.map.getLayers());
    });
  },
  methods: {
    setLayerVisible(layerNames, visible) {
      MapUtil.setVisibilityForLayers(this.map, layerNames, visible);
    },
    addWFSLoader(options) {
      let { layer, filter = "", layerName, zIndex, visible } = options;
      let vectorSource = new VectorSource({
        format: new GeoJSON(),
        loader: (extent, resolution, projection) => {
          let proj = projection.getCode();
          let url = `http://192.168.201.162:8088/geoserver/wfs?
              service=WFS&version=1.1.0&request=GetFeature&typename=zhjy:${layer}&outputFormat=application/json
              &srsname=${proj}&bbox=${extent.join(",")},${proj}`;
          let featureRequest = new WFS().writeGetFeature({
            srsName: "EPSG:3857",
            featureNS: "www.zhjy.com",
            featurePrefix: "zhjy",
            featureTypes: [layer],
            maxFeatures: 50000,
            outputFormat: "application/json",
            filter: filter, //过滤条件
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
        ), //加载策略
        projection: "EPSG4326",
      });
      let vectorLayer = new VectorLayer({
        name: layerName,
        source: vectorSource,
        style: new Style({
          stroke: new Stroke({
            color: "rgba(0, 0, 0, 1)",
            width: 1,
            //lineDash: [2, 2, 2, 2],
          }),
          fill: new Fill({
            color: "rgba(255, 255, 255, 0.5)",
          }),
        }),
        zIndex: zIndex,
        visible: visible,
      });
      this.map.addLayer(vectorLayer);
    },
    //WFS
    filterLayer(layer, filter) {
      let vectorSource = new VectorSource({
        format: new GeoJSON(),
        loader: (extent, resolution, projection) => {
          let proj = projection.getCode();
          let url = `http://192.168.201.162:8088/geoserver/wfs?
              service=WFS&version=1.1.0&request=GetFeature&typename=zhjy:${layer}&outputFormat=application/json
              &srsname=${proj}&bbox=${extent.join(",")},${proj}`;
          let featureRequest = new WFS().writeGetFeature({
            srsName: "EPSG:3857",
            featureNS: "www.zhjy.com",
            featurePrefix: "zhjy",
            featureTypes: [layer],
            maxFeatures: 50000,
            outputFormat: "application/json",
            filter: filter, //过滤条件
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
        ), //加载策略
        projection: "EPSG4326",
      });
      return vectorSource;
    },

    //WMS
    // filterLayer(layer, filterKey, filterValue) {
    //   if (layer) {
    //     const source = layer.getSource(); // 图层资源
    //     let param = source.getParams(); // 资源参数
    //     let filter = new equalTo(filterKey, filterValue);
    //     param.CQL_FILTER = filter;
    //     source.updateParams(param);
    //     source.refresh(); //刷新资源
    //   }
    // },
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
