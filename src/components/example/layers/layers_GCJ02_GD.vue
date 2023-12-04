<template>
    <div>
        <div id="map"></div>
    </div>
</template>

<script>
import gcj02Mecator from '../../ol_Extend/coordinates/gcj02Mecator'
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
            let GDLayer = new TileLayer({
                source: new XYZ({
                    projection: gcj02Mecator,
                    url: "http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}",
                    wrapX: true,
                }),
            });
            this.map.addLayer(GDLayer);
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
