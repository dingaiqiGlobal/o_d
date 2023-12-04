<template>
  <div>
    <div id="map"></div>
    <div class="control">
      <vue-slider :data="data" :marks="true" @change="handerChange"></vue-slider>
    </div>
  </div>
</template>

<script>
import "ol/ol.css";
import { Map, View } from "ol";
import * as olProj from 'ol/proj';
import * as olExtent from 'ol/extent';
import TileLayer from 'ol/layer/Tile';
import WMTS from 'ol/source/WMTS';
import WMTSTileGrid from 'ol/tilegrid/WMTS';

import TileWMS from "ol/source/TileWMS";
import TileGrid from "ol/tilegrid/TileGrid";

import VueSlider from "vue-slider-component";
import "vue-slider-component/theme/default.css";

export default {
  name: "Base",
  components: {
    VueSlider,
  },
  data() {

    return {
      map: {},
      wmsLayer:null,
      data: ["2014-05-12", "2015-05-12", "2016-05-12", "2017-05-12", "2018-05-12", "2019-05-12", "2020-05-12","2021-05-12", "2022-05-12"],
    };
  },
    mounted() {
        this.map = new Map({
            target: "map",
            layers: [],
            view: new View({
                projection: "EPSG:3857",
                center: olProj.fromLonLat([116.323930,39.975670]),
                zoom: 14,
            }),
        });
        //t0~t7
        let url = "https://t0.tianditu.gov.cn/img_w/wmts?tk=21c1e34286caecc25fd94be94bfbe119";
        let proj = "EPSG:900913";
        let level = 18;
        let layerName = "img";//vec矢量|img影像|cva注记
        let format = "tiles";
        let tileSize = [256, 256];
        let matrixSet = "w"//w球面墨卡托投影|c经纬度投影

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
    handerChange(value, index){
      if(this.wmsLayer){
        this.map.removeLayer(this.wmsLayer);
      }
      this.addWMSLayer(value)
    },
    addWMSLayer(timeDate){
       this.wmsLayer = new TileLayer({
        source: new TileWMS({
          url: "http://192.168.201.162:8088/geoserver/wms",
          params: {
            layers: "zhjy:im_animator",
            time: timeDate,
            //图斑历史时空播放
            //数据中必须有time字段，也可以用cql方式
          },
          serverType: "geoserver",
        }),
      });
      this.map.addLayer(this.wmsLayer);
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
  left: 20%;
  top: 700px;
  width: 70%;
}
</style>
