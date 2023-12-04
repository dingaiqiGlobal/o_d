<template>
    <div>
        <div id="map"></div>
        <div class="control">
            <button @click="addWMSImage">image WMS方式</button>
            <button @click="addWMSTile">tiled WMS方式</button>
            <button @click="addWMSTileDefine">tile grid 512x256 WMS方式（美国）</button>
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
import ImageLayer from 'ol/layer/Image';
import ImageWMS from 'ol/source/ImageWMS';
import TileWMS from 'ol/source/TileWMS';
import TileGrid from 'ol/tilegrid/TileGrid';

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
        addWMSImage() {
            let wmsLayer = new ImageLayer({
                source: new ImageWMS({
                    url: "http://192.168.201.162:8088/geoserver/wms",
                    params: { LAYERS: "zhjy:polygon_miyun" },
                    serverType: "geoserver",
                }),
            });
            this.map.addLayer(wmsLayer);
        },
        addWMSTile() {
            let wmsLayer = new TileLayer({
                source: new TileWMS({
                    url: "http://192.168.201.162:8088/geoserver/wms",
                    params: { LAYERS: "zhjy:polyline_miyun", TILED: true },
                    serverType: "geoserver",
                }),
            });
            this.map.addLayer(wmsLayer);
        },
        addWMSTileDefine() {
            const projExtent = olProj.get('EPSG:3857').getExtent();
            const startResolution = olExtent.getWidth(projExtent) / 256;
            const resolutions = new Array(22);
            for (let i = 0, ii = resolutions.length; i < ii; ++i) {
                resolutions[i] = startResolution / Math.pow(2, i);
            }
            const tileGrid = new TileGrid({
                extent: [-13884991, 2870341, -7455066, 6338219],
                resolutions: resolutions,
                tileSize: [512, 256],
            });
            let wmsLayer = new TileLayer({
                source: new TileWMS({
                    url: 'https://ahocevar.com/geoserver/wms',
                    params: { 'LAYERS': 'topp:states', 'TILED': true },
                    serverType: 'geoserver',
                    tileGrid: tileGrid,
                }),
            });
            this.map.addLayer(wmsLayer);
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
