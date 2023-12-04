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
import CircleStyle from 'ol/style/Circle.js';


export default {
    name: 'Base',
    data() {
        return {
            map: {},
            styleJson:null,
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
                field: "NAME",
                colorMap: {
                    怀柔区: "#fcd4f4",
                    密云区: "#b6f2fc",
                    延庆区: "#fcefbb",
                    平谷区: "#b3c6fc",
                    昌平区: "#fcb3c8",
                    顺义区: "#dcc7fc",
                    通州区: "#b7b6fc",
                    大兴区: "#fcd1c7",
                    房山区: "#b6fcdd",
                    东城区: "#d0fcbd",
                    西城区: "#d4fcef",
                    丰台区: "#e6b3fc",
                    海淀区: "#fceed7",
                    石景山区: "#fcbdec",
                    门头沟区: "#f0fcd7",
                    朝阳区: "#d2e1fc",
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
            let { label, stroke, field } = styleData;
            let color = styleData.colorMap[feature.get(field)];
            if (type.indexOf("polygon") !== -1) {
                this.styleJson = {
                    fill: new Fill({
                        color: color,
                    }),
                    stroke: new Stroke({
                        color: stroke.color,
                        lineDash: stroke.dash,
                        width: stroke.width,
                    }),
                };
            } else if (type.indexOf("linestring") !== -1) {
                this.styleJson = {
                    stroke: new Stroke({
                        color: color,
                        lineDash: stroke.dash,
                        width: stroke.width,
                    }),
                };
            } else {
                this.styleJson = {
                    image: new CircleStyle({
                        radius: 8,
                        fill: new Fill({
                            color: color,
                        }),
                        stroke: new Stroke({
                            color: stroke.color,
                            lineDash: stroke.dash,
                            width: stroke.width,
                        }),
                    }),
                };
            }
            if (label.show) {
                let text = feature.get(label.field);
                let font = label.font ? label.font : "normal 12px 微软雅黑";
                this.styleJson.text = new Text({
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
            return new Style(this.styleJson);
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
