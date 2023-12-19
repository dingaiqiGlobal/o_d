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

import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import CircleStyle from "ol/style/Circle.js";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import Fill from "ol/style/Fill";

export default {
  name: "Base",
  data() {
    return {
      map: {},
      geojsonObject: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [
                [116.82044500000006, 40.37724500000007],
                [116.82028300000002, 40.366565010000045],
                [116.82806290000008, 40.367284020000056],
                [116.82878800000003, 40.37653701000005],
                [116.82292390000009, 40.37643999000005],
                [116.82089600000006, 40.37708502000004],
              ],
            },
            properties: {
              OBJECTID: 5,
              SHAPE_Leng: 0.0357685465211,
            },
          },
        ],
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
    this.addGeojsonLayer();
  },
  methods: {
    addGeojsonLayer() {
      let vectorSource = new VectorSource();
      let features = new GeoJSON().readFeatures(this.geojsonObject, {
        dataProjection: "EPSG:4326",
        featureProjection: "EPSG:3857",
      });
      vectorSource.addFeatures(features);

      let geojsonLayer = new VectorLayer({
        source: vectorSource,
        style: [
          new Style({
            stroke: new Stroke({
              color: "rgba(255,0,0,0.7)",
              width: 2,
              lineDash: [0],
            }),
          }),
          new Style({
            stroke: new Stroke({
              color: [250, 250, 250, 1],
              width: 2,
              lineDash: [20, 27], //一组线段和间距交互的数组，可以控制虚线长度
            }),
          }),
        ],
      });
      this.map.addLayer(geojsonLayer);
      geojsonLayer.getSource().on("featuresloadstart", (evt) => {
        geojsonLayer
          .getSource()
          .getFeatures()
          .forEach((item) => {
            setInterval(() => {
              let style = item.getStyle();
              if (style == undefined) {
                item.setStyle([
                  new Style({
                    stroke: new Stroke({
                      color: "rgba(255,0,0,0.7)",
                      width: 2,
                    }),
                  }),
                  new Style({
                    stroke: new Stroke({
                      color: [255, 250, 250, 1],
                      width: 2,
                      lineDash: [20, 27],
                      lineDashOffset: 0,
                    }),
                  }),
                ]);
              } else {
                let lineDashOffset = item.getStyle()[1].getStroke().getLineDashOffset();
                item.setStyle([
                  new Style({
                    stroke: new Stroke({
                      color: "rgba(255,0,0,0.7)",
                      width: 2,
                    }),
                  }),
                  new Style({
                    stroke: new Stroke({
                      color: [255, 250, 250, 1],
                      width: 2,
                      lineDash: [2, 7],
                      lineDashOffset: lineDashOffset == 8 ? 0 : lineDashOffset + 1,
                    }),
                  }),
                ]);
              }
            }, 100);
          });
      });
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
