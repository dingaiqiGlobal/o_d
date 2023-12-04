<template>
  <div>
    <div id="map"></div>
    <div class="control">
    <button @click="visible">隐藏组</button>
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

import LayerGroup from 'ol/layer/Group';

/**
 * 例如在加载天地图的时候需要加载地图图层和注记图层，
 * 如果不想让地图图层和天地图注记图层不显示，我们需要分别设置，
 * 如果用到group感觉很方便，直接将group图层对象中visible属性设置为false即可。
 */

export default {
  name: "Base",
  data() {
    return {
      map: {},
      layerGroup:null,
    };
  },
  mounted() {
    //t0~t7
    let urlVec =
      "https://t0.tianditu.gov.cn/vec_w/wmts?tk=21c1e34286caecc25fd94be94bfbe119";
    let urlCva =
      "https://t0.tianditu.gov.cn/cva_w/wmts?tk=21c1e34286caecc25fd94be94bfbe119";
    let proj = "EPSG:900913";
    let level = 18;
    let layerNameVec = "vec"; //vec矢量|img影像|cva注记
    let layerNameCva = "cva"; //vec矢量|img影像|cva注记
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

    //矢量
    let TDTVecLayer = new TileLayer({
      source: new WMTS({
        url: urlVec,
        layer: layerNameVec,
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

    //注记
    let TDTCvaLayer = new TileLayer({
      source: new WMTS({
        url: urlCva,
        layer: layerNameCva,
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

    //组
    this.layerGroup = new LayerGroup({
      layers: [TDTVecLayer,TDTCvaLayer],
    });

    this.map = new Map({
      target: "map",
      layers: [this.layerGroup],
      view: new View({
        projection: "EPSG:3857",
        center: olProj.fromLonLat([116.83112, 40.3705]),
        zoom: 14,
      }),
    });
  },
  methods: {
    visible(){
        this.layerGroup.setVisible(false)
    }
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
