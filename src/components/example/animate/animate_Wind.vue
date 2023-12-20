<template>
  <div>
    <div id="map"></div>
    <div class="control">
      <div class="close_on">
        <el-button :loading="loading" type="primary" size="mini">
          <span v-if="online" @click="addWind">开启风场</span>
          <span v-else @click="closeWind">关闭风场</span>
        </el-button>
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
import XYZ from "ol/source/XYZ";

import { WindLayer } from "ol-wind";
import Popup from "../../ol_Extend/popup/ol-popup";
import "../../ol_Extend/popup/ol-popup.css";

export default {
  name: "heatmap",
  data() {
    return {
      map: null,
      windLayers: null,
      allgrid: [],

      online: true,
      loading: false,
    };
  },
  mounted() {
    let ArcGISLayer = new TileLayer({
      source: new XYZ({
        url:
          "https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}",
        wrapX: true,
      }),
    });
    this.map = new Map({
      target: "map",
      layers: [ArcGISLayer],
      view: new View({
        projection: "EPSG:4326",
        center: [113.53450137499999, 34.44104525],
        //projection: 'EPSG:3857',
        //center: olProj.fromLonLat([116.83112, 40.3705]),
        zoom: 4,
      }),
    });
    let popup = new Popup();
    this.map.addOverlay(popup);
    this.map.on("singleclick", (e) => {
      let details = this.getWindyDetail(e.coordinate);
      let hdms = `<div>风向:${details.direction}<br>
        风级:${details.level}<br>
        风速:${details.speed}</div>`;
    //   let popup = new Popup();//放在点击里面就是生成多个弹框
    //   this.map.addOverlay(popup);
      popup.show(e.coordinate, hdms);
    });
  },
  methods: {
    addWind() {
      // 开启风场
      let _this = this;
      _this.loading = true;
      fetch("data/wind/wind.json")
        .then((response) => {
          return response.json();
        })
        .then((res) => {
          this.windLayers = new WindLayer(res, {
            forceRender: false,
            windOptions: {
              // particleMultiplier: 1 / 120, // 粒子路径数量的系数，不推荐使用（视野宽度 * 高度 * 系数），没看出差别
              //   velocityScale: 1 / 800, // 对于粒子路径步长的乘积基数,越大越快
              paths: 3000, // 生成的粒子路径数量,越大线条越多
              //   maxAge: 15, // 粒子路径能够生成的最大帧数
              colorScale: [
                "rgb(36,104, 180)",
                "rgb(60,157, 194)",
                "rgb(128,205,193 )",
                "rgb(151,218,168 )",
                "rgb(198,231,181)",
                "rgb(238,247,217)",
                "rgb(255,238,159)",
                "rgb(252,217,125)",
                "rgb(255,182,100)",
                "rgb(252,150,75)",
                "rgb(250,112,52)",
                "rgb(245,64,32)",
                "rgb(237,45,28)",
                "rgb(220,24,32)",
                "rgb(180,0,35)",
              ],
              frameRate: 10,
              lineWidth: 1,
              // generateParticleOption: false
            },
            //projection: "EPSG:3857",
          });

          this.analysisWindyData(res); //分析风向数据

          _this.$nextTick(() => {
            _this.map.addLayer(_this.windLayers);
            _this.online = false;
            _this.loading = false;
            _this.$message({
              type: "success",
              message: "开启风场成功",
            });
          });
        })
        .catch((error) => {
          console.log(error);
        });
    },
    closeWind() {
      // 关闭风场
      this.map.removeLayer(this.windLayers);
      this.online = this.online ? false : true;
      this.$message({
        type: "success",
        message: "关闭风场成功！",
      });
    },
    analysisWindyData(windydata) {
      var p = 0;
      var east, north;
      if (windydata[0].header.parameterNumberName == "eastward_wind") {
        east = windydata[0];
        north = windydata[1];
      } else {
        east = windydata[1];
        north = windydata[0];
      }
      for (var j = 0; j < north.header.ny; j++) {
        var row = [];
        for (var i = 0; i < north.header.nx; i++, p++) {
          row[i] = [east.data[p], north.data[p]];
        }
        this.allgrid[j] = row;
      }
    },
    getWindyDetail(coord) {
      var lng = coord[0];
      var lat = coord[1];
      // 与格网序列的数据转换
      if (lng >= 0) {
        lng = Math.floor(lng);
      } else {
        lng = 360 + Math.floor(lng);
      }
      lat = 90 - Math.floor(lat);
      // 获取对应的格网序列
      var xlength = lng;
      var ylength = lat;
      var xdata, ydata;
      xdata = this.allgrid[Math.abs(ylength)][Math.abs(xlength)][0];
      ydata = this.allgrid[Math.abs(ylength)][Math.abs(xlength)][1];
      if (typeof xdata != "number" || typeof ydata != "number") {
        console.error("暂无该区域风向数据！");
        return;
      }
      var v = Math.sqrt(Math.pow(xdata, 2) + Math.pow(ydata, 2));
      var angle = this.getWindyAngle(xdata, ydata);
      var result = {
        direction: this.getWindyDirection(angle),
        level: this.getWindyLevel(v),
        speed: v.toFixed(2),
      };
      return result;
    },
    getWindyDirection(angle) {
      if ((angle >= 0 && angle <= 22.5) || (angle <= 360 && angle > 337.5)) {
        return "北风";
      }
      if (angle <= 337.5 && angle > 292.5) {
        return "西北风";
      }
      if (angle <= 292.5 && angle > 247.5) {
        return "西风";
      }
      if (angle <= 247.5 && angle > 202.5) {
        return "西南风";
      }
      if (angle <= 202.5 && angle > 157.5) {
        return "南风";
      }
      if (angle <= 157.5 && angle > 112.5) {
        return "东南风";
      }
      if (angle <= 112.5 && angle > 67.5) {
        return "东风";
      }
      if (angle <= 67.5 && angle > 22.5) {
        return "东北风";
      }
    },
    getWindyAngle(u, v) {
      var fx = 0;
      if ((u > 0) & (v > 0)) {
        fx = 270 - (Math.atan(v / u) * 180) / Math.PI;
      } else if ((u < 0) & (v > 0)) {
        fx = 90 - (Math.atan(v / u) * 180) / Math.PI;
      } else if ((u < 0) & (v < 0)) {
        fx = 90 - (Math.atan(v / u) * 180) / Math.PI;
      } else if ((u > 0) & (v < 0)) {
        fx = 270 - (Math.atan(v / u) * 180) / Math.PI;
      } else if ((u == 0) & (v > 0)) {
        fx = 180;
      } else if ((u == 0) & (v < 0)) {
        fx = 0;
      } else if ((u > 0) & (v == 0)) {
        fx = 270;
      } else if ((u < 0) & (v == 0)) {
        fx = 90;
      } else if ((u == 0) & (v == 0)) {
        fx = 999.9;
      }
      return fx;
    },
    getWindyLevel(v) {
      if (v < 0.3) {
        return 0;
      }
      if (v >= 0.3 && v < 1.6) {
        return 1;
      }
      if (v >= 1.6 && v < 3.4) {
        return 2;
      }
      if (v >= 3.4 && v < 5.5) {
        return 3;
      }
      if (v >= 5.5 && v < 8.0) {
        return 4;
      }
      if (v >= 8.0 && v < 10.8) {
        return 5;
      }
      if (v >= 10.8 && v < 13.9) {
        return 6;
      }
      if (v >= 13.9 && v < 17.2) {
        return 7;
      }
      if (v >= 17.2 && v < 20.8) {
        return 8;
      }
      if (v >= 20.8 && v < 24.5) {
        return 9;
      }
      if (v >= 24.5 && v < 28.5) {
        return 10;
      }
      if (v >= 28.5 && v < 32.7) {
        return 11;
      }
      if (v >= 32.7 && v < 37.0) {
        return 12;
      }
      if (v >= 37.0 && v < 41.5) {
        return 13;
      }
      if (v >= 41.5 && v < 46.2) {
        return 14;
      }
      if (v >= 46.2 && v < 51.0) {
        return 15;
      }
      if (v >= 51.0 && v < 56.1) {
        return 16;
      }
      if (v >= 56.1 && v < 61.2) {
        return 17;
      }
      if (v >= 61.2) {
        return 18;
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

.control {
  position: absolute;
  z-index: 10;
  left: 10px;
  top: 10px;
}
</style>
