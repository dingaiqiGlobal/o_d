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

//ol 7.x 以后请使用 ol-echarts v4.x，ol 7.x 之前请使用 ol-echarts v3.x(ol3-echarts)
//npm install echarts --save  //ol-echarts需要依赖echarts，项目中要安装此包
//npm install ol-echarts --save
import EChartsLayer from "ol-echarts";
import * as echarts from "echarts";
import axios from "axios";

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
        center: olProj.fromLonLat([116.377830,39.889720]),
        zoom: 8,
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
    this.addFlowLineLayer();
  },
  methods: {
    async addFlowLineLayer() {
        /*
        首先lines-bus.json是一个二维数组，里面每一个一维数组存储一辆公交车的轨迹，其中第一个和第二个元素为初始坐标（经纬度*10000），往后每两个元素为一组表示经纬度的偏移量（*10000）。
        var busLines = [].concat.apply([], data.map(function (busLine, idx) {}))
        是将data数组映射到一个新的数组里，即将lines-bus.json转换为真实的经纬度坐标。
        var pt = [busLine[i], busLine[i + 1]];为起始点坐标。
        if (i > 0) {
            pt = [prevPt[0] + pt[0], prevPt[1] + pt[1] ];
            }
        计算加上偏移量后的经纬度*10000prevPt = pt;
        将当前坐标赋值给上一个点坐标，继续循环；
        points.push([pt[0]/1e4, pt[1]/1e4]);
        坐标小数点前移四位得到真实的经纬度值，存储到points数组里。 
        return {
            coords: points,
            lineStyle: {
                normal: { color: echarts.color.modifyHSL('#5A94DF', Math.round(hStep * idx))
                }
            }
        };
        为新数组的存储格式，新的数组每一个元素是一个对象
         */
      let { data } = await axios.get(`data/echarts/lines-bus.json`);

      let hStep = 300 / (data.length - 1);
      let busLines = [].concat.apply(
        [],
        data.map(function (busLine, idx) {
          let prevPt = [];
          let points = [];
          for (let i = 0; i < busLine.length; i += 2) {
            let pt = [busLine[i], busLine[i + 1]];
            if (i > 0) {
              pt = [prevPt[0] + pt[0], prevPt[1] + pt[1]];
            }
            prevPt = pt;
            points.push([pt[0] / 1e4, pt[1] / 1e4]);
          }
          return {
            coords: points,
            lineStyle: {
              normal: {
                color: echarts.color.modifyHSL("#5A94DF", Math.round(hStep * idx)),
              },
            },
          };
        })
      );
      //设置颜色
      let option = {
        series: [
          {
            type: "lines",
            polyline: true,
            data: busLines,
            lineStyle: {
              normal: {
                width: 0,
              },
            },
            effect: {
              constantSpeed: 20,
              show: true,
              trailLength: 0.5,
              symbolSize: 1.5,
            },
            zlevel: 1,
          },
        ],
      };

      //echarts图层
      let echartslayer = new EChartsLayer(option, {
        stopEvent: false,
        hideOnMoving: false,
        hideOnZooming: false,
        forcedPrecomposeRerender: true,
      });
      echartslayer.appendTo(this.map);
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
