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
import XYZ from "ol/source/XYZ";

import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import CircleStyle from "ol/style/Circle";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import Fill from "ol/style/Fill";
import Feature from "ol/Feature";
import Icon from "ol/style/Icon";
import Text from "ol/style/Text";

import Point from "ol/geom/Point";
import LineString from "ol/geom/LineString";

export default {
  name: "Base",
  data() {
    return {
      map: {},
      polylineFeature: null,
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
    let ArcGISLayer = new TileLayer({
      source: new XYZ({
        projection: "EPSG:900913",
        url:
          "https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}",
        wrapX: true,
      }),
    });
    this.map.addLayer(ArcGISLayer);
    this.addLayer();
  },
  methods: {
    addLayer() {
      //线
      this.polylineFeature = new Feature({
        geometry: new LineString([
          olProj.transform([116.82059, 40.38787], "EPSG:4326", "EPSG:3857"),
          olProj.transform([116.82042, 40.37718], "EPSG:4326", "EPSG:3857"),
          olProj.transform([116.82346, 40.37624], "EPSG:4326", "EPSG:3857"),
          olProj.transform([116.82874, 40.3764], "EPSG:4326", "EPSG:3857"),
        ]),
        name: "polyline",
      });
      let polylineSource = new VectorSource();
      polylineSource.addFeature(this.polylineFeature);
      let polylineLayer = new VectorLayer({
        source: polylineSource,
        style: (feature) => {
          return this.styleFunc(feature);
        },
      });
      this.map.addLayer(polylineLayer);
    },
    //①用ol.layer.Vector的styleFunction，返回一个styleCollection；
    //②ol.geom.LineString的getCoordinateAt接口实现线上等距的箭头展示；
    //③箭头方向通过rotation参数来控制，其计算公式是const angle = (Math.atan2(point0[0] - point[0], point0[1] - point[1])) - Math.PI / 2
    styleFunc(feature) {
      let styles = [];
      styles.push(
        new Style({
          stroke: new Stroke({
            color: "#089519",
            width: 6,
          }),
          image: new Icon({
            src:
              "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAADFklEQVRYR8WXS2gTURSG/zPt3BQF8bHx0UwixmZSH1AVVNqFVDeKC134Qhd1JbVuRBFBwQqKIIobFV2pYPHRhS5ENyouxAf4ALFNakWTadWV2lVp7tg5Mm0jSTqZV4vN8t7z/+ebc8+5lxCm+EdTnB8TAvhcG0nYH5Doz38O+yGBALKxafOG+M9BMJaCsBrA7LHEv8B4DcLHGqq+EM8N/vAL5BvgkxbZbIGvApjvYf5dAe2rM/IP/ED4Akhrop2AE34MCzEEtCcNedJL4wnQG1MbhpneeRk57VcRr1icM9+7aV0BvsYxU1riOQNLHEw6mPmxvU5EGwDsLo8hoEsosmlhFgOVIFwB0lH1HBEdchBv1w3ZWbye0cQ2AHfLY5n5fKrPPBwKIKOpTwBqLhYzeFXKMN86GaY1dSWB3pTu8VPdMNeHBBC/AcwsEnfqhtzudqYZTdhVsKtR+A3ohpwVGKAnLnS2kC4WEnNbss+87AbQE1X3M9GlEp2CVDIrM066ij3QFZ8+t8oySy4UZt6b6jOvuwGko2oLEV0rjlGrldiiL0NGIAA7OKOJFwDWFgk7dEPu8TiCm2UT0asbsi7wEdiCtCaOEnCmTDxuAgr7zpNAV3Qj3xoKoDuurlEsejlutBwmwXkCAAa3pAzzRiiAsWOwG1F3MOgk5mf2OhOtK+v8f+EmoX5ZTpY0c0mDup3nCEBUHAPhlFdchf07uiF3umm934IEZgxL8QpAKiBEvhrcmKhwaRW8PAFGq6C2gsh1/sfBEU7rOXncC9oXwGgvRJ4D3OhlaO/bj9CgIpsaXB6hQBWwg7ujYodCuO0HwM+FFRhgpAoxcQ+MLa4QhPt6Tm71AzpWLb+hQKZWLIeCpwDmVFD9hIVmvV9+8OvquwcKht2xSJvCfNEpgUV0oD6XL3mIvEACA9iGPTFxixkl802E28mc3OWVsHw/FMDXOGrylrD/CywYM/wWUWRiYRZD/wVgtAqRjcz8cKSRiDYlc/lHQZMHbsLyBBlNnLXXdEMeCZN8wgBhkxbrQvXAZCQOdRFNZuKC119mavcheswzygAAAABJRU5ErkJggg==",
          }),
        })
      );
      const geometry = feature.get("geometry");
      if (geometry.getType().toLowerCase() === "linestring") {
        const coords = geometry.getCoordinates();
        const length = geometry.getLength();
        const res = this.map.getView().getResolution() * 80;
        const count = Math.ceil(length / res);
        // 添加间断点
        for (let i = 1; i < count; i++) {
          const frag = i / count;
          const point = geometry.getCoordinateAt(frag);
          const point0 = geometry.getCoordinateAt(frag + frag * 0.05);
          const angle =
            Math.atan2(point0[0] - point[0], point0[1] - point[1]) - Math.PI / 2;
          styles.push(
            new Style({
              geometry: new Point(point),
              image: new Icon({
                scale: 0.5,
                rotation: angle,
                snapToPixel: true,
                src:
                  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAnElEQVQ4T63TsQ0CMQyF4f/NgMQQ0CBR0FIx190cFIiWhhFoKdgEiRUeSoF0gO8cjkub+Evs2OLPpc9422dgBRwlNZn/BtjeApdOUJsh0QuuwKYWiYAFcAKWHaSR1EbpfAHlkO0ICdMJgV+QXmAAmUu6v9IZA8wkPVKgtg7TF7H25t4UbN+A9ahGmqqVD8AO2GdzUF45+I3ZJJb9JxbwRhEhB66xAAAAAElFTkSuQmCC",
              }),
            })
          );
        }
        // 添加起始点
        styles.push(
          new Style({
            geometry: new Point(coords[0]),
            image: new CircleStyle({
              radius: 12,
              fill: new Fill({
                color: "#1677d8",
              }),
            }),
            text: new Text({
              offsetX: 0,
              offsetY: 0,
              textAlign: "center",
              textBaseline: "middle",
              text: "起",
              font: "12px sans-serif",
              fill: new Fill({
                color: "white",
              }),
            }),
          })
        );
        styles.push(
          new Style({
            geometry: new Point(coords[coords.length - 1]),
            image: new CircleStyle({
              radius: 12,
              fill: new Fill({
                color: "#bb1422",
              }),
            }),
            text: new Text({
              offsetX: 0,
              offsetY: 0,
              textAlign: "center",
              textBaseline: "middle",
              text: "终",
              font: "12px sans-serif",
              fill: new Fill({
                color: "white",
              }),
            }),
          })
        );
      }
      return styles;
      console.log(styles);
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
