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
import TileArcGISRest from 'ol/source/TileArcGISRest';

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
                zoom: 5,
            }),
        });
        this.addLayer()
    },
    methods: {
        addLayer() {
            let ArcGISLayer = new TileLayer({
                source: new TileArcGISRest({
                    url: "https://server.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer",
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
