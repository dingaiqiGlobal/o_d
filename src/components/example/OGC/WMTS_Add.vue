<template>
    <div>
        <div id="map"></div>
        <div class="control">
            <button @click="addWMTS">WMTS(GeoServer)</button>
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
        addWMTS() {
            //通过范围计算得到分辨率数组
            const projection = olProj.get("EPSG:900913");
            const projectionExtent = projection.getExtent();
            const size = olExtent.getWidth(projectionExtent) / 256;
            const resolutions = new Array(18);
            const matrixIds = new Array(18);
            //生成WMTS分辨率和matrixIds数组
            for (let z = 0; z < 18; z++) {
                resolutions[z] = size / Math.pow(2, z);
                matrixIds[z] = "EPSG:900913:" + z; //geoserver专用
            }
            let wmtsLayer = new TileLayer({
                opacity: 0.7,
                source: new WMTS({
                    attributions: "geoserver_wmts", //数据源信息
                    url: "http://192.168.201.162:8088/geoserver/gwc/service/wmts", //WMTS服务基地址
                    layer: "zhjy:polyline_miyun", //图层
                    matrixSet: "EPSG:900913", //投影坐标系设置矩阵（谷歌地图兼容）
                    format: "image/png", //图片格式
                    projection: projection, //数据的投影坐标系
                    tileGrid: new WMTSTileGrid({
                        //瓦片网格对象
                        origin: olExtent.getTopLeft(projectionExtent), //切片原点（获取坐标范围左上角）
                        resolutions: resolutions, //分辨率数组
                        matrixIds: matrixIds, //矩阵标识列表，与地图级数保持一致
                    }),
                    style: "",
                    wrapX: true,
                }),
                zIndex:3
            });
            this.map.addLayer(wmtsLayer);
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
