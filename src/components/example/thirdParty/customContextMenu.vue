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

import Style from "ol/style/Style";
import Icon from "ol/style/Icon";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import CircleStyle from "ol/style/Circle";
import Text from "ol/style/Text";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import WFS from "ol/format/WFS";

import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import * as olCoordinate from "ol/coordinate";

import ContextMenu from "ol-contextmenu";
import "ol-contextmenu/dist/ol-contextmenu.css";

export default {
  name: "Base",
  data() {
    return {
      map: {},
      markerLayer: null,
      /**
       * 自定义右键菜单API
       * "ol-contextmenu": "^5.3.0"
       * API
       * 【Constructor】
       * eventType: contextmenu; 监听事件类型(您可以使用'click'， 'dblclick')
       * defaultItems: true; 是否启用默认项(即:放大/缩小)
       * width: 150; 宽度
       * items: []; An array of object|string
       *
       *【Methods】
       *contextmenu.clear()从菜单中删除所有元素
       *contextmenu.close()关闭菜单
       *contextmenu.extend(arr)向菜单中添加项目。将提供的数组中的每个项推到菜单的末尾。
       *contextmenu.push(item)菜单末尾插入
       *contextmenu.shift()删除菜单上第一项
       *contextmenu.pop()删除菜单上最后一项
       *contextmenu.getDefaultItems()获取默认项的数组
       *contextmenu.isOpen()菜单是否打开
       *contextmenu.updatePosition(pixel)更新菜单位置
       *
       *【Event】
       *contextmenu.on('beforeopen',(e)=>{})
       *contextmenu.on('open',(e)=>{})
       *contextmenu.on('close',(e)=>{})
       * 
       */

      contextmenu_items: [
        {
          text: "地图居中",
          classname: "center",
          icon: "images/icon/center.png",
          callback: this.center, //回调函数
        },
        {
          text: "其他操作", //再分组
          classname: "other",
          icon: "images/icon/view_list.png",
          items: [
            {
              text: "地图居中",
              icon: "images/icon/center.png",
              callback: this.center,
            },
            {
              text: "添加标记",
              icon: "images/icon/pin_drop.png",
              callback: this.addMarker,
            },
          ],
        },
        {
          text: "添加标记",
          icon: "images/icon/pin_drop.png",
          callback: this.addMarker,
        },
        "-", //分隔符
      ],
      removeMarkerItem: {
        text: "移除当前标记",
        icon: "images/icon/pin_drop.png",
        classname: "marker",
        callback: this.removeMarker,
      },
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

    //标记图层
    this.markerLayer = new VectorLayer({
      source: new VectorSource(),
    });
    this.map.addLayer(this.markerLayer);

    //初始化右键控件
    this.initContextMenu();
  },
  methods: {
    initContextMenu() {
      const contextmenu = new ContextMenu({
        defaultItems: false,
        width: 150,
        items: this.contextmenu_items,
      });
      this.map.addControl(contextmenu);

      //移除标记（当点击添加的标记点的时候）
      contextmenu.on("open", (evt) => {
        const feature = this.map.forEachFeatureAtPixel(evt.pixel, (ft, l) => ft);
        if (feature && feature.get("type") === "removable") {
          //获取类型
          contextmenu.clear(); //API 从菜单中删除所有元素
          this.removeMarkerItem.data = {
            marker: feature,
          };
          contextmenu.push(this.removeMarkerItem); // API 在菜单末尾插入所提供的项
        } else {
          contextmenu.clear();
          contextmenu.extend(this.contextmenu_items); //API 向菜单中添加项目。将提供的数组中的每个项推到菜单的末尾
          contextmenu.extend(contextmenu.getDefaultItems()); //API 获取默认项的数组
        }
      });
    },
    //居中
    center(object) {
      let view = this.map.getView();
      view.animate({
        duration: 700,
        easing: this.elastic,
        center: object.coordinate,
      });
    },
    //居中动效
    elastic(t) {
      return 2 ** (-10 * t) * Math.sin(((t - 0.075) * (2 * Math.PI)) / 0.3) + 1;
    },
    //添加标记
    addMarker(object) {
      const coord4326 = olProj.transform(object.coordinate, "EPSG:3857", "EPSG:4326");
      const template = "坐标为:{x} | {y}";
      const iconStyle = new Style({
        image: new Icon({ scale: 0.6, src: "images/icon/pin_drop.png" }),
        text: new Text({
          offsetY: 25,
          text: olCoordinate.format(coord4326, template, 2), //2指定小数点位数
          font: "14px Calibri,sans-serif",
          fill: new Fill({ color: "#111" }),
          stroke: new Stroke({ color: "#eee", width: 2 }),
        }),
      });
      const feature = new Feature({
        type: "removable", //移除标记定义的类型
        geometry: new Point(object.coordinate),
      });
      feature.setStyle(iconStyle);
      this.markerLayer.getSource().addFeature(feature);
    },
    //移除标记
    removeMarker(object) {
      this.markerLayer.getSource().removeFeature(object.data.marker);
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
.center{
  background-color:#f9bcf1;
}
.other{
   background-color:#d2bcf9;
}
</style>
