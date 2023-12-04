<template>
    <div>
        <div id="map"></div>
        <div class="control">
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

import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import Text from 'ol/style/Text';


export default {
    name: 'Base',
    data() {
        return {
            map: {},
            styleData: {
                label: {
                    show: true,
                    field: "NAME",
                    font: "bold 14px 微软雅黑",
                    textColor: "black",
                    strokeWidth: 1,
                    strokeColor: "#feffff",
                },
                stroke: {
                    width: 0.1,
                    color: "#feffff",
                    dash: [0],
                },
                field: "POPU",
                colorMap: {
                    "<50": "#006100",
                    "50-100": "#559100",
                    "100-150": "#a4c400",
                    "150-200": "#ffff00",
                    "200-250": "#ffbb00",
                    "250-300": "#ff7700",
                    ">300": "#ff2600",
                },
            },
        };
    },
    mounted() {
        this.map = new Map({
            target: "map",
            layers: [],
            view: new View({
                projection: "EPSG:3857",
                center: olProj.fromLonLat([116.831120, 40.370500]),
                zoom: 8,
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

        this.addVectorLayer();

    },
    methods: {
        addVectorLayer() {
            let vectorSource = new VectorSource({
                format: new GeoJSON(),
                url: 'http://192.168.201.162:8088/geoserver/zhjy/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=zhjy%3Apolygon_beijing&maxFeatures=50000&outputFormat=application%2Fjson',
            })
            let vectorLayer = new VectorLayer({
                source: vectorSource,
                style: (feature) => {
                    return this.addStyle(feature, this.styleData);
                },
            })
            this.map.addLayer(vectorLayer);
        },
        addStyle(feature, styleData) {
            let geom = feature.getGeometry();
            let type = geom.getType().toLowerCase();
            let { label, stroke, field, colorMap } = styleData;
            let PopuValue = feature.get(field);
            let color;
            let styleJson = {};
            Object.keys(colorMap).map((key) => {
                let min;
                let max;
                if (key.indexOf("<") !== -1) {
                    min = 0;
                    max = parseFloat(key.split("<")[1]);
                }
                if (key.indexOf(">") !== -1) {
                    min = parseFloat(key.split(">")[1]);
                    max = 400;
                }
                if (key.indexOf("-") !== -1) {
                    let range = key.split("-");
                    min = parseFloat(range[0]);
                    max = parseFloat(range[1]);
                }
                if (PopuValue >= min && PopuValue < max) {
                    color = colorMap[key];
                }
            })

            if (type.indexOf("polygon") !== -1) {
                styleJson = {
                    fill: new Fill({
                        color: color,
                    }),
                    stroke: new Stroke({
                        color: stroke.color,
                        lineDash: stroke.dash,
                        width: stroke.width,
                    }),
                };
            }
            if (label.show) {
                let text = feature.get(label.field);
                let font = label.font ? label.font : "normal 12px 微软雅黑";
                styleJson.text = new Text({
                    font: font,
                    text: text.toString(),
                    fill: new Fill({
                        color: label.textColor,
                    }),
                    stroke: new Stroke({
                        color: label.strokeColor,
                        width: label.strokeWidth,
                    }),
                });
            }
            return new Style(styleJson);
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
    left: 10px;
    top: 10px;
}
</style>
