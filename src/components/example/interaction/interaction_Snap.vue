<template>
  <div>
    <div id="map"></div>
    <div id="container"></div>
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
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import Fill from "ol/style/Fill";
import CircleStyle from "ol/style/Circle";

import Draw from "ol/interaction/Draw";
import { createRegularPolygon } from "ol/interaction/Draw";
import Polygon from "ol/geom/Polygon";

import * as dat from "dat.gui";
import Snap from "ol/interaction/Snap";

export default {
  name: "Base",
  data() {
    return {
      map: {},
      gui: null,
      draw: null,
      source: null,
      vector: null,
      vectorPolygonSource: null,
      selectType: {
        select: "Point",
      },
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

    //GUI
    this.gui = new dat.GUI();
    this.gui.domElement.style = "position:absolute;top:10px;left:10px";
    this.gui
      .add(this.selectType, "select", {
        点: "Point",
        线: "LineString",
        面: "Polygon",
        圆: "Circle",
        正方形: "Square",
        矩形: "Box",
      })
      .name("选择类型")
      .onChange((value) => {
        this.selectType.select = value;
        this.map.removeInteraction(this.draw);
        this.addInteraction();
      });

    this.source = new VectorSource();
    this.vector = new VectorLayer({
      source: this.source,
      style: new Style({
        fill: new Fill({
          color: "rgba(255, 255, 255, 0.2)",
        }),
        stroke: new Stroke({
          color: "#ff0000",
          width: 2,
        }),
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({
            color: "#ff0000",
          }),
        }),
      }),
    });
    this.map.addLayer(this.vector);
    this.addInteraction();
  },
  beforeDestroy() {
    this.gui.destroy();
  },
  methods: {
    addInteraction() {
      let value = this.selectType.select;
      if (value !== "None") {
        if (this.source === null) {
          this.source = new VectorSource();
          this.vector.setSource(source);
        }
        let geometryFunction;
        let maxPoints;
        if (value === "Square") {
          value = "Circle";
          geometryFunction = createRegularPolygon(4);
        }
        if (value === "Box") {
          value = "LineString";
          maxPoints = 2;
          geometryFunction = (coordinates, geometry) => {
            let start = coordinates[0];
            let end = coordinates[1];
            if (!geometry) {
              geometry = new Polygon([
                [start, [start[0], end[1]], end, [end[0], start[1]], start],
              ]);
            }
            geometry.setCoordinates([
              [start, [start[0], end[1]], end, [end[0], start[1]], start],
            ]);
            return geometry;
          };
        }
        this.draw = new Draw({
          source: this.source,
          type: value,
          /**
           *绘制交互有一个 trace 选项参数
           *可以围绕现有的图形要素进行跟踪
           */
          trace: true,
          traceSource: this.source,
          geometryFunction: geometryFunction,
          maxPoints: maxPoints,
        });
        this.map.addInteraction(this.draw);
        /**
         * 吸附作用
         */
        const snap = new Snap({
          source: this.source,
        });
        this.map.addInteraction(snap);
      } else {
        this.source = null;
        this.vector.setSource(source);
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
</style>
