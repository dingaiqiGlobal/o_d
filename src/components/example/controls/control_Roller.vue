<template>
  <div>
    <div id="map"></div>
    <div v-show="false">
      <div
        class="ol-control ol-unselectable my-swipe"
        :style="{ pointerEvents: isMoving ? 'auto' : 'none' }"
        ref="mySwipe"
        @mousemove="mouseMove"
        @mouseup="mouseUp"
      >
        <div
          class="my-swipe-line swipe-horizontal"
          :style="{ left: swipeVal + '%', pointerEvents: isMoving ? 'none' : 'auto' }"
        >
          <span
            class="my-swipe-line-btn"
            :style="{ pointerEvents: isMoving ? 'none' : 'auto' }"
            @mousedown="mouseDown"
          >
            <img :src="require('../../../../public/images/icon/roller.jpg')"/>
          </span>
        </div>
      </div>
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
import XYZ from "ol/source/XYZ";

import Control from "ol/control/Control";

export default {
  data() {
    return {
      swipeLayer: null,
      isMoving: false,
      swipeVal: 50,
    };
  },
  mounted() {
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

    let ArcGISLayer = new TileLayer({
      source: new XYZ({
        projection: "EPSG:900913",
        url:
          "https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}",
        wrapX: true,
      }),
    });

    const map = new Map({
      target: "map",
      layers: [TDTLayer, ArcGISLayer],
      view: new View({
        projection: "EPSG:3857",
        center: olProj.fromLonLat([116.83112, 40.3705]),
        zoom: 14,
      }),
    });

    // 为了后续使用方便将map放入this中
    this.map = map;
    this.setSwipeLayer(ArcGISLayer);

    /**
     * control空间
     * openlayers中所有的control都是继承这个类
     * 
     * new Control(options)
     * 这个类接收3个参数 element，target，render
     * element: 控件的dom元素
     * target: 控件创建位置的dom元素，当需要创建在地图元素之外时才需要设置这个,
     * render:函数，在重新呈现控件时调用。这是在requestAnimationFrame回调中调用的
     */


    // 创建卷帘控件
    this.swipeControl = new Control({
      element: this.$refs["mySwipe"],
    });
    map.addControl(this.swipeControl);
  },
  methods: {
    setSwipeLayer(layer) {
      this.unsetSwipeLayer();
      if (layer) {
        layer.on("prerender", this.prerender);
        layer.on("postrender", this.postrender);
        this.swipeLayer = layer;
      }
    },
    unsetSwipeLayer() {
      if (this.swipeLayer) {
        this.swipeLayer.un("prerender", this.prerender);
        this.swipeLayer.un("postrender", this.postrender);
        this.swipeLayer = null;
      }
    },
    prerender(e) {
      const ctx = e.context;
      const hOrw = ctx.canvas.width;
      const nVal = (hOrw * this.swipeVal) / 100; //根据分割线显示
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, nVal, ctx.canvas.height);
      ctx.clip(); // 裁剪
      this.map.render();
    },
    postrender(e) {
      const ctx = e.context;
      ctx.restore();
    },
    mouseMove(e) {
      if (!this.isMoving) return;
      const clientWidth = e.currentTarget.clientWidth;
      const clientHeight = e.currentTarget.clientHeight;
      const x = e.offsetX;
      const y = e.offsetY;
      if (x < 0 || x > clientWidth || y < 0 || y > clientHeight) return;
      this.swipeVal = (x / clientWidth) * 100;
    },
    mouseDown(e) {
      this.isMoving = true;
    },
    mouseUp(e) {
      this.isMoving = false;
    },
  },
};
</script>

<style lang="less">
.my-swipe {
  width: 100%;
  height: 100%;
  z-index: 110;
  background: none !important;
  padding: 0;
  pointer-events: none;
  .my-swipe-line {
    position: absolute;
    width: 1px;
    height: 100%;
    background: white;
    .my-swipe-line-btn {
      position: relative;
      display: block;
      top: 50%;
      width: 20px;
      height: 30px;
      margin-left: -10px;
      background: white;
      border: 1px #efefef solid;
      border-radius: 3px;
      cursor: col-resize;
      img {
        vertical-align: middle;
        border-style: none;
      }
    }
  }
}
</style>
