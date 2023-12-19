<template>
  <div id="olMap">
    <div style="position: absolute; left: 5%; top: 5%; z-index: 9">
      <button @click="startMove">开始</button>
      <button @click="stopMove">销毁</button>
    </div>
  </div>
</template>

<script>
import "ol/ol.css";
import { Map, View } from "ol";
import OSM from "ol/source/OSM";
import TileLayer from "ol/layer/Tile";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { Icon, Stroke, Style } from "ol/style";
import LineString from "ol/geom/LineString";
import Point from "ol/geom/Point";
import Feature from "ol/Feature";
import proj4 from "proj4";

import XYZ from "ol/source/XYZ";

export default {
  name: "ol移动轨迹",
  data() {
    return {
      map: null,
      view: null,
      testPath: [
        [116.820370,40.387870],
        [116.820550,40.366360],
        [116.845180,40.369170],
        [116.852990,40.371270],
        [116.860370,40.374540],
        [116.859510,40.387090],
        [116.830070,40.387220],
      ],
      moveLineLayer: null, //移动轨迹线图层，包含轨迹线和起始点
      movedLineLayer: null, //实时移动轨迹图层
      movePointLayer: null, //移动点图层
      featurePolyLine: null, //轨迹线
      featuredPolyLine: null, //实时轨迹线
      startPoint: null,
      endPoint: null,
      movePoint: null,
      curPosition: null,
      endIdx: 1,
      startIdx: 0,
      angle: 0,
      deltaX: 0,
      deltaY: 0,
      speed: 167, //默认速度，167m/100ms，约为60km/h 代码里的setInterval的参数是100
      time: null,
    };
  },
  mounted() {
    this.initMap();
  },
  methods: {
    initMap() {
      let ArcGISLayer = new TileLayer({
        source: new XYZ({
          url:
            "https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}",
          wrapX: true,
        }),
      });
      this.view = new View({
        center: [116.840890,40.378520],
        zoom: 13,
        projection: "EPSG:4326",
      });
      this.map = new Map({
        layers: [ArcGISLayer],
        view: this.view,
        target: "olMap",
      });
    },
    /**
     * 初始化移动轨迹
     */
    initMove() {
      if (!this.moveLineLayer) {
        this.moveLineLayer = new VectorLayer({
          className: "moveLineLayer",
          source: new VectorSource({
            wrapX: false,
          }),
        });
        this.map.addLayer(this.moveLineLayer);
      }
      if (!this.movedLineLayer) {
        this.movedLineLayer = new VectorLayer({
          className: "movedLineLayer",
          source: new VectorSource({
            wrapX: false,
          }),
        });
        this.map.addLayer(this.movedLineLayer);
      }
      if (!this.movePointLayer) {
        this.movePointLayer = new VectorLayer({
          className: "movePointLayer",
          source: new VectorSource({
            wrapX: false,
          }),
        });
        this.map.addLayer(this.movePointLayer);
      }

      //画线
      let geoPolyline = new LineString(this.testPath);
      this.featurePolyLine = new Feature({
        geometry: geoPolyline,
      });
      this.featurePolyLine.setStyle((feature) => {
        const styles = [
          new Style({
            stroke: new Stroke({
              zIndex: 2,
              color: "rgba(34,136,255,1)",
              width: 6,
              lineCap: "butt", // 折线两端线帽的绘制样式，默认值为'butt'无头，其他可选值：'round'圆头、'square'方头
              lineJoin: "round", // 折线拐点的绘制样式，默认值为'miter'尖角，其他可选值：'round'圆角、'bevel'斜角
              lineDash: [0, 0], // 线间隔模式 这个变化与分辨率有关 默认为undefined Internet Explorer 10和更低版本不支持
              lineDashOffset: 0, // 线段间隔偏移 默认0
              miterLimit: 0, // 默认10
            }),
          }),
        ];
        //箭头样式
        styles.push(...this.createArrowPolylineStyle(this.testPath, 6));
        return styles;
      });
      this.startPoint = new Feature({
        geometry: new Point(this.testPath[0]),
        name: "startIcon",
      });
      this.startPoint.setStyle(
        new Style({
          image: new Icon({
            anchor: [0.5, 48],
            anchorXUnits: "fraction",
            anchorYUnits: "pixels",
            src: "images/icon/start-point.png",
          }),
        })
      );
      this.endPoint = new Feature({
        geometry: new Point(this.testPath[this.testPath.length - 1]),
        name: "endPoint",
      });
      this.endPoint.setStyle(
        new Style({
          image: new Icon({
            anchor: [0.5, 48],
            anchorXUnits: "fraction",
            anchorYUnits: "pixels",
            src: "images/icon/end-point.png",
          }),
        })
      );
      this.moveLineLayer
        .getSource()
        .addFeatures([this.featurePolyLine, this.startPoint, this.endPoint]);
      //移动点符号movepointImg
      this.movePoint = new Feature({
        geometry: new Point(this.testPath[0]),
        name: "moveIcon",
      });
      this.movePoint.setStyle(
        new Style({
          image: new Icon({
            anchor: [0.5, 48],
            anchorXUnits: "fraction",
            anchorYUnits: "pixels",
            src: "images/icon/movepoint.png",
          }),
        })
      );
      this.movePointLayer.getSource().addFeature(this.movePoint);
      this.map.getView().fit(this.featurePolyLine.getGeometry().getExtent(), {
        duration: 1000, //动画的持续时间,
        callback: function () {},
      });
    },
    createArrowPolylineStyle(coords, lineWidth) {
      // 内部箭头间隔距离（像素）
      let that = this;
      const step = 40;
      let distance = step / 2; //首个点放置在距离起点1/2间隔的位置
      let styles = [];
      // 获取起始像素坐标
      let pixStart = that.map.getPixelFromCoordinate(coords[0]);
      let pixEnd;

      for (let i = 1; i < coords.length; i++) {
        let coord, coordPix, style;

        // 获取当前第一个箭头位置
        pixEnd = that.map.getPixelFromCoordinate(coords[i]);
        let distanceStart2end = Math.sqrt(
          Math.pow(pixStart[0] - pixEnd[0], 2) + Math.pow(pixStart[1] - pixEnd[1], 2)
        ); //计算收尾在屏幕上的距离
        if (distanceStart2end > distance) {
          //距离大于间隔
          //计算距离开始点位的像素值
          coordPix = [
            (distance * (pixEnd[0] - pixStart[0])) / distanceStart2end + pixStart[0],
            (distance * (pixEnd[1] - pixStart[1])) / distanceStart2end + pixStart[1],
          ];
          //计算经纬度
          coord = that.map.getCoordinateFromPixel(coordPix);

          style = new Style({
            geometry: new Point(coord),
            image: new Icon({
              src: "images/icon/arrowright.svg",
              rotateWithView: true,
              // rotation: Math.PI + Math.atan2(pixEnd[1] - pixStart[1], pixEnd[0] - pixStart[0]),
              rotation: Math.atan2(pixEnd[1] - pixStart[1], pixEnd[0] - pixStart[0]),
              scale: lineWidth / 12,
            }),
          });
          //下次循环开始点为当前点
          pixStart = coordPix;
          distance = step;
          i--;
        } else if (distanceStart2end == distance) {
          //距离等于间隔
          style = new Style({
            geometry: new Point(coords[i]),
            image: new Icon({
              src: arrowRightImg,
              rotateWithView: true,
              rotation: Math.atan2(pixEnd[1] - pixStart[1], pixEnd[0] - pixStart[0]),
              scale: lineWidth / 12,
            }),
          });
          pixStart = pixEnd;
          distance = step;
        } else {
          //距离小于间隔
          distance = distance - distanceStart2end;
          pixStart = pixEnd;
        }
        style && styles.push(style);
      }
      return styles;
    },
    startMove() {
      this.initMove();
      this.curPosition = new Point(this.testPath[0]);
      let a = this.WGS842Mector(
        this.testPath[this.endIdx][0],
        this.testPath[this.endIdx][1]
      );
      let b = this.WGS842Mector(
        this.testPath[this.startIdx][0],
        this.testPath[this.startIdx][1]
      );
      let vec = {
        x: a[0] - b[0],
        y: a[1] - b[1],
      };
      var tmpAngle = Math.atan2(vec.y, vec.x);
      this.angle = -(((tmpAngle - Math.PI / 2) / Math.PI) * 180);
      this.movePoint
        .getStyle()
        .getImage()
        .setRotation((Math.PI / 180) * this.angle);
      this.timer = setInterval(() => {
        //画已跑轨迹图
        if (this.startIdx != 0) {
          this.addLined(this.endIdx);
        }

        if (this.deltaX != 0 || this.deltaY != 0) {
          let xyPointTemp = this.WGS842Mector(
            this.curPosition.flatCoordinates[0],
            this.curPosition.flatCoordinates[1]
          );
          let lonLatPointTemp = this.Mector2WGS84(
            xyPointTemp[0] + this.deltaX,
            xyPointTemp[1] + this.deltaY
          );
          this.curPosition = new Point(lonLatPointTemp);
          if (
            this.testPath[this.endIdx][0] > this.testPath[this.startIdx][0] &&
            this.curPosition.flatCoordinates[0] > this.testPath[this.endIdx][0]
          ) {
            this.changeAngle();
          } else if (
            this.testPath[this.endIdx][0] < this.testPath[this.startIdx][0] &&
            this.curPosition.flatCoordinates[0] < this.testPath[this.endIdx][0]
          ) {
            this.changeAngle();
          } else if (
            this.testPath[this.endIdx][1] > this.testPath[this.startIdx][1] &&
            this.curPosition.flatCoordinates[1] > this.testPath[this.endIdx][1]
          ) {
            this.changeAngle();
          } else if (
            this.testPath[this.endIdx][1] < this.testPath[this.startIdx][1] &&
            this.curPosition.flatCoordinates[1] < this.testPath[this.endIdx][1]
          ) {
            this.changeAngle();
          }
          this.movePoint.setGeometry(this.curPosition);
          this.movePoint
            .getStyle()
            .getImage()
            .setRotation((Math.PI / 180) * this.angle);
        } else {
          let xyPointTemp = this.WGS842Mector(
            this.curPosition.flatCoordinates[0],
            this.curPosition.flatCoordinates[1]
          );
          let lonLatPointTemp = this.Mector2WGS84(
            xyPointTemp[0] + this.deltaX,
            xyPointTemp[1] + this.deltaY
          );
          this.curPosition = new Point(lonLatPointTemp);
          let a = this.WGS842Mector(
            this.testPath[this.endIdx][0],
            this.testPath[this.endIdx][1]
          );
          let b = this.WGS842Mector(
            this.testPath[this.startIdx][0],
            this.testPath[this.startIdx][1]
          );
          let vec = {
            x: a[0] - b[0],
            y: a[1] - b[1],
          };
          let tmpAngle = Math.atan2(vec.y, vec.x);
          this.deltaX = Math.cos(tmpAngle) * this.speed;
          this.deltaY = Math.sin(tmpAngle) * this.speed;
          this.angle = -(((tmpAngle - Math.PI / 2) / Math.PI) * 180);
          this.movePoint.setGeometry(this.curPosition);
          this.movePoint
            .getStyle()
            .getImage()
            .setRotation((Math.PI / 180) * this.angle);
        }
      }, 100);
    },
    //84转投影坐标
    WGS842Mector(lon, lat) {
      lon = parseFloat(lon);
      lat = parseFloat(lat);
      proj4.defs([
        [
          "EPSG:4523",
          "+proj=tmerc +lat_0=0 +lon_0=105 +k=1 +x_0=35500000 +y_0=0 +ellps=GRS80 +units=m +no_defs",
        ],
        [
          "EPSG:4526",
          "+proj=tmerc +lat_0=0 +lon_0=114 +k=1 +x_0=38500000 +y_0=0 +ellps=GRS80 +units=m +no_defs;",
        ],
        [
          "EPSG:4549",
          "+proj=tmerc +lat_0=0 +lon_0=120 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs",
        ],
        [
          "EPSG:4527",
          "+proj=tmerc +lat_0=0 +lon_0=117 +k=1 +x_0=39500000 +y_0=0 +ellps=GRS80 +units=m +no_defs",
        ],
      ]);
      return proj4("EPSG:4326", "EPSG:4523", [lon, lat]);
    },
    //84转投影坐标 2000-35
    Mector2WGS84(lon, lat) {
      lon = parseFloat(lon);
      lat = parseFloat(lat);
      proj4.defs([
        [
          "EPSG:4523",
          "+proj=tmerc +lat_0=0 +lon_0=105 +k=1 +x_0=35500000 +y_0=0 +ellps=GRS80 +units=m +no_defs",
        ],
        [
          "EPSG:4526",
          "+proj=tmerc +lat_0=0 +lon_0=114 +k=1 +x_0=38500000 +y_0=0 +ellps=GRS80 +units=m +no_defs",
        ],
        [
          "EPSG:4549",
          "+proj=tmerc +lat_0=0 +lon_0=120 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs",
        ],
        [
          "EPSG:4527",
          "+proj=tmerc +lat_0=0 +lon_0=117 +k=1 +x_0=39500000 +y_0=0 +ellps=GRS80 +units=m +no_defs",
        ],
      ]);
      return proj4("EPSG:4523", "EPSG:4326", [lon, lat]);
    },
    /**
     * 计算角度
     * @private
     */
    changeAngle() {
      this.curPosition = new Point(this.testPath[this.endIdx]);
      if (this.endIdx == this.testPath.length - 1) {
        clearInterval(this.timer);
      } else {
        this.startIdx++;
        this.endIdx++;
        //判断下一个点是否与上一个点一致
        if (
          this.testPath[this.startIdx][0] == this.testPath[this.endIdx][0] &&
          this.testPath[this.startIdx][1] == this.testPath[this.endIdx][1]
        ) {
          this.startIdx++;
          this.endIdx++;
        }
      }
      let a = this.WGS842Mector(
        this.testPath[this.endIdx][0],
        this.testPath[this.endIdx][1]
      );
      let b = this.WGS842Mector(
        this.testPath[this.startIdx][0],
        this.testPath[this.startIdx][1]
      );
      let vec = {
        x: a[0] - b[0],
        y: a[1] - b[1],
      };
      var tmpAngle = Math.atan2(vec.y, vec.x);
      this.deltaX = Math.cos(tmpAngle) * this.speed;
      this.deltaY = Math.sin(tmpAngle) * this.speed;
      this.angle = -(((tmpAngle - Math.PI / 2) / Math.PI) * 180);
    },

    /**
     * 添加实时轨迹
     * @param end
     */
    addLined(end) {
      this.movedLineLayer.getSource().clear();
      let path = null;
      path = this.testPath.slice(0, end);
      path.push(this.movePoint.getGeometry().flatCoordinates);
      let geoPolyline1 = new LineString(path);
      this.featuredPolyline = new Feature({
        geometry: geoPolyline1,
      });
      this.featuredPolyline.setStyle((feature) => {
        const styles = [
          new Style({
            stroke: new Stroke({
              zIndex: 2,
              color: "rgba(254,166,0,1)",
              width: 6,
              lineCap: "butt", // 折线两端线帽的绘制样式，默认值为'butt'无头，其他可选值：'round'圆头、'square'方头
              lineJoin: "round", // 折线拐点的绘制样式，默认值为'miter'尖角，其他可选值：'round'圆角、'bevel'斜角
              lineDash: [0, 0], // 线间隔模式 这个变化与分辨率有关 默认为undefined Internet Explorer 10和更低版本不支持
              lineDashOffset: 0, // 线段间隔偏移 默认0
              miterLimit: 0, // 默认10
            }),
          }),
        ];
        //箭头样式
        styles.push(...this.createArrowPolylineStyle(this.testPath, 6));
        return styles;
      });
      this.movedLineLayer.getSource().addFeature(this.featuredPolyline);
    },
    stopMove() {
      this.curPosition = null;
      this.movePoint = null;
      this.featurePolyline = null;
      this.featuredPolyline = null;
      this.startPoint = null;
      this.endPoint = null;
      this.startIdx = 0;
      this.endIdx = 1;
      this.angle = 0;
      this.deltaX = 0;
      this.deltaY = 0;
      this.speed = 167; //默认速度，167m/100ms，约为60km/h 代码里的setInterval的参数是100;
      this.map.removeLayer(this.moveLineLayer);
      this.map.removeLayer(this.movedLineLayer);
      this.map.removeLayer(this.movePointLayer);
      this.moveLineLayer = null;
      this.movedLineLayer = null;
      this.movePointLayer = null;
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },
  },
  components: {},
};
</script>

<style scoped>
#olMap {
  height: 100%;
  width: 100%;
}
</style>
