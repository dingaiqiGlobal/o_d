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
            let ArcGISLayer = new TileLayer({
                source: new XYZ({
                    projection: "EPSG:900913",
                    //https://map.geoq.cn/ArcGIS/rest/services  //services地址
                    url: "https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}",
                    wrapX: true,
                }),
            });
            this.map.addLayer(ArcGISLayer);
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
