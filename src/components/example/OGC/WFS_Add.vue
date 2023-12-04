<template>
    <div>
        <div id="map"></div>
        <div class="control">
            <button @click="addWFSBase">基础方式</button>
            <button @click="addWFSLoader">loader方式</button>
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

import WFS from 'ol/format/WFS.js';
import * as olTilegrid from 'ol/tilegrid';
import * as olLoadingstrategy from 'ol/loadingstrategy';



export default {
    name: 'Base',
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
                center: olProj.fromLonLat([116.831120, 40.370500]),
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
        addWFSBase() {
            const vectorLayer = new VectorLayer({
                source: new VectorSource({
                    format: new GeoJSON(),
                    url: "http://192.168.201.162:8088/geoserver/zhjy/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=zhjy%3Apolygon_miyun&maxFeatures=5000&outputFormat=application%2Fjson",
                }),
                style: new Style({
                    stroke: new Stroke({
                        color: "#cc3333",
                        width: 2,
                    }),
                    fill: new Fill({
                        color: 'rgba(14, 249, 230, 0.3)',
                    }),
                }),
            });
            this.map.addLayer(vectorLayer);
        },
        addWFSLoader() {
            let vectorSource = new VectorSource({
                format: new GeoJSON(),
                loader: (extent, resolution, projection) => {
                    let proj = projection.getCode();
                    let url =
                        `http://192.168.201.162:8088/geoserver/wfs?
              service=WFS&version=1.1.0&request=GetFeature&typename=zhjy:polyline_miyun&outputFormat=application/json
              &srsname=${proj}&bbox=${extent.join(",")},${proj}`
                    //let url=`http://192.168.201.138:8090/geoserver/wfs`;//简写
                    let featureRequest = new WFS().writeGetFeature({
                        srsName: "EPSG:3857", //坐标系统
                        featureNS: "www.zhjy.com", //命名空间 URI
                        featurePrefix: "zhjy", //工作区名称
                        featureTypes: ["polyline_miyun"], //查询图层，可以是同一个工作区下多个图层，逗号隔开
                        maxFeatures: 50000, //最大访问要素
                        outputFormat: "application/json", //输出格式
                    });

                    fetch(url, {
                        method: "POST",
                        body: new XMLSerializer().serializeToString(featureRequest),
                    })
                        .then(function (response) {
                            return response.json();
                        })
                        .then(function (json) {
                            var features = new GeoJSON().readFeatures(json);
                            if (features.length > 0) {
                                vectorSource.clear();
                                vectorSource.addFeatures(features);
                            }
                        })
                        .catch((err) => {
                            console.log("请求错误", err);
                        });
                },

                strategy: olLoadingstrategy.tile(
                    new olTilegrid.createXYZ({
                        maxZoom: 25,
                    })
                ), //加载策略
                projection: "EPSG4326",
            });
            let vectorLayer = new VectorLayer({
                source: vectorSource,
                style: new Style({
                    stroke: new Stroke({
                        color: 'rgba(27, 68, 9, 1)',
                        width: 2,
                        lineDash: [10, 5, 10, 5]
                    })
                }),
            });
            this.map.addLayer(vectorLayer);
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
