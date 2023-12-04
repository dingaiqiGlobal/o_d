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

import Style from 'ol/style/Style';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';

import Select from 'ol/interaction/Select';
import { pointerMove } from 'ol/events/condition.js';


export default {
    name: 'Base',
    data() {
        return {
            map: {},
            selectLayer: null,
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

        /**
         * 添加矢量图层
         */

        const style = new Style({
            stroke: new Stroke({
                color: "#cc3333",
                width: 2,
            }),
            fill: new Fill({
                color: "#ccffff",
            }),
        });
        const vectorLayer = new VectorLayer({
            source: new VectorSource({
                format: new GeoJSON(),
                url: "http://192.168.201.162:8088/geoserver/zhjy/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=zhjy%3Apolygon_miyun&maxFeatures=5000&outputFormat=application%2Fjson",
            }),
            style: style
        });
        this.map.addLayer(vectorLayer);

        /**
         * 鼠标移入高亮显示
        */
        var select_move = new Select({
            condition: pointerMove,//singleClick(单击),click（点击）
            style: (feature) => {
                return new Style({
                    fill: new Fill({
                        color: 'yellow'
                    }),
                    stroke: new Stroke({
                        color: 'black',
                        width: 5
                    }),
                })
            }
        });
        this.map.addInteraction(select_move);

        this.map.on("pointermove", (e) => {
            const isHover = this.map.hasFeatureAtPixel(e.pixel);
            this.map.getTargetElement().style.cursor = isHover ? "pointer" : "";
        })
        select_move.on("select", (e) => {
            let coordinate = e.mapBrowserEvent.coordinate;
            console.log("坐标：", coordinate);
        });


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
