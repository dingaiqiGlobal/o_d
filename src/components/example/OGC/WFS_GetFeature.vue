<template>
    <div>
        <div id="map"></div>
        <div class="control">
            <button @click="WFS_GetFeature">addWFS(WFS_GetFeature)</button>
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

import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';


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
        WFS_GetFeature() {
            const baseUrl = "http://192.168.201.162:8088/geoserver/zhjy/ows";
            const service = "WFS";
            const version = "1.0.0";
            const request = "GetFeature";//WFS请求方法
            const typeName = "zhjy:point_miyun";
            const outputFormat = "application/json";

            const style = new Style({
                image: new Icon({
                    src: '/images/icon/location.png',
                    opacity: 1,
                    scale: 0.2,
                }),
            });

            const vectorLayer = new VectorLayer({
                source: new VectorSource({
                    format: new GeoJSON(),
                    url: `${baseUrl}?service=${service}&version=${version}&request=${request}&typeName=${typeName}&outputFormat=${outputFormat}`,
                }),
                style: style,
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
