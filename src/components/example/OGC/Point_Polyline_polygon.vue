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
import CircleStyle from "ol/style/Circle";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import Fill from "ol/style/Fill";
import Feature from "ol/Feature";

import Point from "ol/geom/Point";
import LineString from "ol/geom/LineString";
import Polygon from "ol/geom/Polygon";

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
    this.addLayer();
  },
  methods: {
    addLayer() {
      //点
      const pointFeature = new Feature({
        geometry: new Point(olProj.fromLonLat([116.83286, 40.37977])),
        name: "point",
      });
      pointFeature.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 5,
            fill: new Fill({
              color: "rgba(25,245,21,0.5)",
            }),
            stroke: new Stroke({
              color: "rgba(255,245,21,0.5)",
              width: 1,
            }),
          }),
        })
      );
      let pointSource = new VectorSource();
      pointSource.addFeature(pointFeature);
      let pointLayer = new VectorLayer();
      pointLayer.setSource(pointSource);
      this.map.addLayer(pointLayer);

      //线
      const polylineFeature = new Feature({
        geometry: new LineString([
          olProj.transform([116.82059, 40.38787], "EPSG:4326", "EPSG:3857"),
          olProj.transform([116.82042, 40.37718], "EPSG:4326", "EPSG:3857"),
          olProj.transform([116.82346, 40.37624], "EPSG:4326", "EPSG:3857"),
          olProj.transform([116.82874, 40.3764], "EPSG:4326", "EPSG:3857"),
        ]),
        name: "polyline",
      });
      polylineFeature.setStyle(
        new Style({
          stroke: new Stroke({
            color: "rgba(25,24,21,0.5)",
            width: 2,
            lineDash: [20, 10, 40, 20],
          }),
        })
      );
      let polylineSource = new VectorSource();
      polylineSource.addFeature(polylineFeature);
      let polylineLayer = new VectorLayer();
      polylineLayer.setSource(polylineSource);
      this.map.addLayer(polylineLayer);

      //面
      const polygonFeature = new Feature({
        geometry: new Polygon([
          [
            olProj.transform([116.82874, 40.37645], "EPSG:4326", "EPSG:3857"),
            olProj.transform([116.82814, 40.36742], "EPSG:4326", "EPSG:3857"),
            olProj.transform([116.83198, 40.3677], "EPSG:4326", "EPSG:3857"),
            olProj.transform([116.832900,40.372710], "EPSG:4326", "EPSG:3857"),
            olProj.transform([116.833930,40.374880], "EPSG:4326", "EPSG:3857"),
            olProj.transform([116.831100,40.376380], "EPSG:4326", "EPSG:3857"),
          ],
        ]),
        name: "polygon",
      });
      polygonFeature.setStyle(
        new Style({
          fill: new Fill({
            color: "rgba(255,245,21,0.5)",
          }),
          stroke: new Stroke({
            color: "rgba(255,25,21,0.5)",
            width: 2,
          }),
        })
      );
      let polygonSource = new VectorSource();
      polygonSource.addFeature(polygonFeature);
      let polygonLayer = new VectorLayer();
      polygonLayer.setSource(polygonSource);
      this.map.addLayer(polygonLayer);
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
