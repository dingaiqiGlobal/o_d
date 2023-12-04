<template>
  <div>
    <div id="map"></div>
    <div class="control">
      <button @click="addWMSTile">单景CQL</button>
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
            layers: "zhjy:im_cql",
            //注意发布的时候不设置维度可以用
            //不要设置设置时间维度和自定义维度才能使用location这个字段
            cql_filter: `location='c_3_20160512.tif'`,
            //a_1_20140512.tif
            //b_2_20150512.tif
            //c_3_20160512.tif
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
