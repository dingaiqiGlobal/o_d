<template>
    <div>
        <div id="map"></div>
        <div class="control">
            <el-input v-model="input"></el-input>
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

import TileWMS from 'ol/source/TileWMS';
import { degreesToStringHDMS } from "ol/coordinate";

export default {
    name: 'Base',
    data() {
        return {
            map: {},
            input: ''
        };
    },
    mounted() {
        let view = new View({
            projection: "EPSG:3857",
            center: olProj.fromLonLat([116.831120, 40.370500]),
            zoom: 14,
        });
        this.map = new Map({
            target: "map",
            layers: [],
            view: view,
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

        //添加wms
        let wmsSource = new TileWMS({
            url: "http://192.168.201.162:8088/geoserver/wms",
            params: { LAYERS: "zhjy:polyline_miyun", TILED: true },
            serverType: "geoserver",
        });
        let wmsLayer = new TileLayer({
            source: wmsSource
        });
        this.map.addLayer(wmsLayer);

        //单击事件
        this.map.on('singleclick', (e) => {
            let viewResolution = view.getResolution()
            let url = wmsSource.getFeatureInfoUrl(e.coordinate, viewResolution, 'EPSG:3857', { 'INFO_FORMAT': 'application/json' })
            if (url) {
                fetch(url)
                    .then(response => response.json())
                    .then((data) => {
                        this.getFeatureProperties(data);
                    })
                    .catch((err) => {
                        console.log("请求错误", err);
                    });
            }
        })

    },
    methods: {
        getFeatureProperties(obj) {
            let features = obj.features;
            for (let i = 0; i < features.length; i++) {
                let featureName = features[i].properties.NAME;
                this.input = featureName;
            }
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
