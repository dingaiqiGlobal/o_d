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

import { transform } from "ol/proj";
import ImageLayer from "ol/layer/Image";
import Static from "ol/source/ImageStatic";

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

    //添加SVG图层
    this.addSVGLayer();
  },
  methods: {
    addSVGLayer() {
      //bounds(x1, y2, x2, y1)//（左，下，右，上）左上x，右下y，右下x，左上y
      let bounds = [
        13005263.52665908,
        4919542.113746734,
        13005650.91848704,
        4919940.994993472,
      ];
      this.map.renderSync(); //以同步方式请求立即呈现
      let imgaeLayer = new ImageLayer();
      this.map.addLayer(imgaeLayer);
      let imageSource = new Static({
        url: "images/icon/emoticon-cool-outline.svg",
        imageExtent: bounds,
        imageSize: this.getImageSize(bounds),
      });
      imgaeLayer.setSource(imageSource);
    },
    /**
     * 通过静态加载图片的方式加载svg，
     * 给定初始化范围，更重要的是给定imageSize，
     * 关于imageSize是通过给定的范围求出图片的大小，
     * 用xmax-xmin得到宽度，用ymax-ymin得出来高度，作为imageSize的值
     */
    getImageSize(bounds) {
      let _min = [bounds[0], bounds[1]];
      let _max = [bounds[2], bounds[3]];
      let _topLeft = [bounds[0], bounds[3]];
      let _scrMin = this.map.getPixelFromCoordinate(_min);
      let _scrMax = this.map.getPixelFromCoordinate(_max);
      let _w = Math.round(_scrMax[0] - _scrMin[0]);
      let _h = Math.round(_scrMin[1] - _scrMax[1]);
      return [_w, _h];
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
