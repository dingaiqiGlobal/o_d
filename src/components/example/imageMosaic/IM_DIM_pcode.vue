<template>
  <div>
    <div id="map"></div>
    <div class="control">
      <button @click="addWMSTile">DIM过滤pcode</button>
    </div>
  </div>
</template>

<script>
import "ol/ol.css";
import { Map, View } from "ol";
import * as olProj from "ol/proj";
import * as olExtent from "ol/extent";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";

import TileWMS from "ol/source/TileWMS";
import TileGrid from "ol/tilegrid/TileGrid";

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
        center: olProj.fromLonLat([116.32234, 39.97495]),
        zoom: 14,
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
  },
  methods: {
    addWMSTile() {
      let wmsLayer = new TileLayer({
        source: new TileWMS({
          url: "http://192.168.201.162:8088/geoserver/wms",
          //wms getMap参数
          params: {
            version: "1.1.1",
            style: "",
            layers: "zhjy:im_dim_pcode",
            //tiled: false,//千万不要加这个参数
            dim_pcode:'b',//必须加上dim_的前缀
            //参数：数据属性-a或者b或者c
          },
          serverType: "geoserver",
        }),
      });
      this.map.addLayer(wmsLayer);
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
