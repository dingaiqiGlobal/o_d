<template>
    <div>
        <div id="map"></div>
        <div class="control">
            <img id="legend" />
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


export default {
    name: 'Base',
    data() {
        return {
            map: {},
            wmsSource: null,
        };
    },
    mounted() {
        let view = new View({
            projection: "EPSG:3857",
            center: olProj.fromLonLat([-99.228520, 40.446950]),
            zoom: 5,
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
        this.wmsSource = new TileWMS({
            url: "http://192.168.201.162:8088/geoserver/wms",
            params: { LAYERS: "topp:states", TILED: true },
            serverType: "geoserver",
        });
        let wmsLayer = new TileLayer({
            source: this.wmsSource
        });
        this.map.addLayer(wmsLayer);

        /**
         * 获取图例常用参数解析
         */
        let REQUEST = "REQUEST=GetLegendGraphic";//请求图例
        let VERSION = "VERSION=1.0.0";//版本
        let FORMAT = "FORMAT=image/png";//输出格式
        let WIDTH = "WIDTH=20";//宽度（间接设置图标的宽度）
        let HEIGHT = "HEIGHT=20";//高度（间接设置图标的高度）
        let LAYER = "LAYER=topp:states"//图层
        //图例设置
        //字体、字体抗锯齿、字体颜色、字体大小、背景颜色、分辨率
        let legend_options = "legend_options=fontName:Times New Roman;fontAntiAliasing:true;fontColor:0x000033;fontSize:14;bgColor:0xFFFFEE;dpi:180";
        let LGurl = `http://192.168.201.138:8090/geoserver/wms?${REQUEST}&${VERSION}&${FORMAT}&${WIDTH}&${HEIGHT}&${LAYER}&${legend_options}`
        const img = document.getElementById('legend');
        img.src = LGurl;

    },
    methods: {

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
