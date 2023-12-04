<template>
    <div>
        <div id="map"></div>
    </div>
</template>

<script>
import "ol/ol.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { fromLonLat } from 'ol/proj';
import XYZ from 'ol/source/XYZ';

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
                center: fromLonLat([116.831120, 40.370500]),
                zoom: 14,
            }),
        });
        this.addLayer()
    },
    methods: {
        addLayer() {
            let xyzLayer = new TileLayer({
                source: new XYZ({
                    projection: "EPSG:900913",
                    //t0~t7
                    url: "https://t6.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=21c1e34286caecc25fd94be94bfbe119",
                    wrapX: true,
                }),
            });
            this.map.addLayer(xyzLayer);
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
</style>
