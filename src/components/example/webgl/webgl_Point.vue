<template>
  <div>
    <div id="map"></div>
    <div class="control"></div>
  </div>
</template>

<script>
/**
 * openlayers6该版本的主要功能是能够组合具有不同渲染器类型的图层。
 * 以前，地图只使用一种渲染策略，并且地图中的所有图层都必须实施该策略。
 * 现在，可以使用包含使用不同渲染技术的图层的地图。
 * 例如，这使得可以在同一地图中将Canvas（2D）图层与基于WebGL的图层组合在一起。
 * 也可以使用自定义渲染器创建图层。
 * 因此，可以拥有一个使用另一个库（例如d3）的地图来渲染一个图层，并使用OpenLayers来渲染其他图层的地图。
 * 此外，6.0版还对矢量图块渲染进行了许多改进，并且总体上应该具有较低的内存占用量。
 * WebGL抛弃了实验室阶段，正式成为图层，目前openlayers6.1.1版本有webgl点图层。
 */
import "ol/ol.css";
import { Map, View } from "ol";
import * as olProj from "ol/proj";
import * as olExtent from "ol/extent";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";

import Style from "ol/style/Style";
import CircleStyle from "ol/style/Circle";
import Stroke from "ol/style/Stroke";
import Fill from "ol/style/Fill";

import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import WebGLPointsLayer from "ol/layer/WebGLPoints";
import Popup from "../../ol_Extend/popup/ol-popup";
import "../../ol_Extend/popup/ol-popup.css";

export default {
  name: "Base",
  data() {
    return {
      map: {},
      geojsonLayer: null,
    };
  },
  mounted() {
    this.map = new Map({
      target: "map",
      layers: [],
      view: new View({
        projection: "EPSG:3857",
        center: olProj.fromLonLat([116.32234, 39.97495]),
        zoom: 12,
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
    this.add_WebGL_Layer();

    /**
     * 预制样式图层
     */
    this.geojsonLayer = new VectorLayer({
      source: new VectorSource(),
      style: new Style({
        image: new CircleStyle({
          radius: 6,
          fill: null,
          stroke: new Stroke({ color: "#00BFFF", width: 3 }),
        }),
      }),
    });
    this.map.addLayer(this.geojsonLayer);
    /**
     * 鼠标状态
     */
    this.map.on("pointermove", (e) => {
      var hit = this.map.hasFeatureAtPixel(e.pixel);
      this.map.getTargetElement().style.cursor = hit ? "pointer" : "";
    });

    /**
     * 单击事件
     */
    let popup = new Popup();
    this.map.addOverlay(popup);
    this.map.on("singleclick", (e) => {
      if (e.dragging) {
        //当前是否正在拖动地图
        return;
      }
      let feature = this.map.forEachFeatureAtPixel(e.pixel, (feature) => {
        return feature;
      });
      if (feature) {
        //弹框
        let coordinate = e.coordinate;
        let hdms = `名称：${feature.get("NAME")}`;
        popup.show(coordinate, hdms);
        /**
         * 封装好的弹框没有清除buildGeojson的样式，可以自己写弹框
         * 关闭按钮清空样式
         * closer.onclick = ()=> {
            overlay.setPosition(undefined);
            closer.blur();
            clearGeojsonLayer();
            return false;
            };
            */
        //改变样式
        let geojson = this.buildGeojson(feature.getGeometry().getCoordinates());
        if (geojson) {
          this.clearGeojsonLayer();
          this.loadGeojsonLayer(geojson);
        }
      }
    });
  },
  methods: {
    buildGeojson(flatCoordinates) {
      let geojson = null;
      if (flatCoordinates && flatCoordinates.length > 0) {
        geojson = {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: {},
              geometry: {
                type: "Point",
                coordinates: null,
              },
            },
          ],
        };
        geojson.features[0].geometry.coordinates = flatCoordinates;
      }
      return geojson;
    },
    loadGeojsonLayer(geojson) {
      this.geojsonLayer.setSource(
        new VectorSource({
          features: new GeoJSON().readFeatures(geojson),
        })
      );
    },
    clearGeojsonLayer() {
      if (this.geojsonLayer && this.geojsonLayer.getSource()) {
        this.geojsonLayer.getSource().clear();
      }
    },
    add_WebGL_Layer() {
      let vectorSource = new VectorSource({
        url: "data/webgl/webglPoint.json",
        format: new GeoJSON(),
      });
      let style = {
        symbol: {
          symbolType: "circle",
          size: ["interpolate", ["exponential", 2.5], ["zoom"], 2, 1, 12, 8, 16, 12],
          color: "#ffed02",
          offset: [0, 0],
          opacity: 0.95,
        },
      };
      let pointsLayer = new WebGLPointsLayer({
        source: vectorSource,
        style: style,
        disableHitDetection: false,
      });
      this.map.addLayer(pointsLayer);
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
