<template>
  <div>
    <div id="map"></div>
    <div class="control">
      <button @click="overlayMethods([116.83012, 40.37186])">overlay方式</button>
      <button @click="postrenderMethods">postrender方式</button>
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

import Overlay from "ol/Overlay";

import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";

import { transform } from "ol/proj";

import Style from "ol/style/Style";
import CircleStyle from "ol/style/Circle";
import Stroke from "ol/style/Stroke";
import Fill from "ol/style/Fill";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";

import { getVectorContext } from "ol/render";

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
    overlayMethods(coordinates) {
      //缺点就是如果批量生成可能会造成卡顿，因为是直接创建的div页面元素。
      let element = document.createElement("div");
      element.setAttribute("id", "css_animation");
      const point_overlay = new Overlay({
        element: element,
        positioning: "center-center",
      });
      point_overlay.setPosition(olProj.fromLonLat(coordinates));
      this.map.addOverlay(point_overlay);
    },
    postrenderMethods() {
      let coordinates = [
        [116.82932, 40.37213],
        [116.82814, 40.36738],
        [116.83203, 40.36767],
      ];
      let vectorSource = new VectorSource();
      let features = []; //另类方式-features方式
      for (let i = 0; i < coordinates.length; i++) {
        let feature = new Feature({
          geometry: new Point(transform(coordinates[i], "EPSG:4326", "EPSG:3857")), //另类方式
          //geometry: new Point(fromLonLat(coordinates[i])),//传统方式
        });
        feature.setId(i);
        features.push(feature);
      }
      vectorSource.addFeatures(features);

      const vectorLayer = new VectorLayer({
        name: "pointLayer",
        source: vectorSource,
        style: new Style({
          image: new CircleStyle({
            radius: 0,
          }),
        }),
      });
      this.map.addLayer(vectorLayer);

      //动态圆
      let radius = 0;
      vectorLayer.on("postrender", (e) => {
        if (radius >= 20) radius = 0;
        let opacity = (20 - radius) * (1 / 20); //不透明度
        let pointStyle = new Style({
          image: new CircleStyle({
            radius: radius,
            stroke: new Stroke({
              color: "rgba(255,50,22" + opacity + ")",
              width: 3 - radius / 10, //设置宽度
            }),
          }),
        });
        let vectorContext = getVectorContext(e);//获取用于绘制到事件画布的矢量上下文。
        vectorContext.setStyle(pointStyle);
        features.forEach((feature) => {
          vectorContext.drawGeometry(feature.getGeometry());
          //ol​/render​/canvas​/Immediate(立刻)
          //drawGeometry
          //将几何体渲染到画布中
          //首先调用renderer.setStyle（）来设置渲染样式。
        });
        radius = radius + 0.3; //调整闪烁速度
        //请求地图渲染（在下一个动画帧处）
        this.map.render();
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

.control {
  position: absolute;
  z-index: 10;
  left: 10px;
  top: 10px;
}

#css_animation {
  height: 50px;
  width: 50px;
  border-radius: 25px;
  background: rgba(255, 0, 0, 0.9);
  transform: scale(0);
  animation: myfirst 3s;
  animation-iteration-count: infinite;
}
@keyframes myfirst {
  to {
    transform: scale(2);
    background: rgba(0, 0, 0, 0);
  }
}
</style>
