<template>
  <div>
    <div id="map"></div>
    <div class="control">
      <button @click="addWMSTile">DIM过滤三参数</button>
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
            //三个参数必须是正确的对应关系，自定义参数必须加上dim_的前缀
            time: "2016-05-12",
            dim_pcode: "c",
            dim_sid: 3,
            /**
             *time:"2014-05-12",
             *dim_pcode:'a',
             *dim_sid:1,
             *
             *time:"2015-05-12",
             *dim_pcode:'b',
             *dim_sid:2,
             */
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
