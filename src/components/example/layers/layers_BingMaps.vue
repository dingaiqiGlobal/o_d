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
import BingMaps from 'ol/source/BingMaps';

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
            let key = "Av63hPkCmH18oGGn5Qg3QhLBJvknZ97xbhyw3utDLRtFv7anHjXNOUQbyWBL5fK5";
            let BingMapsLayer = new TileLayer({
                source: new BingMaps({
                    key: key,
                    imagerySet: 'Road'
                }),
            });
            this.map.addLayer(BingMapsLayer);
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
