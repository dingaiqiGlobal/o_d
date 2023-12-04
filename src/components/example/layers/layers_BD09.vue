<template>
    <div>
        <div id="map"></div>
    </div>
</template>

<script>
import "ol/ol.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import * as olProj from 'ol/proj';
import TileGrid from 'ol/tilegrid/TileGrid';
import TileImage from 'ol/source/TileImage';

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
        this.addLayer()
    },
    methods: {
        //滚动有偏移问题
        addLayer() {
            let projection = olProj.get("EPSG:3857");
            let resolutions = [];
            for (var i = 0; i < 19; i++) {
                resolutions[i] = Math.pow(2, 18 - i);
            }
            let tilegrid = new TileGrid({
                origin: [-1657, 26456],
                resolutions: resolutions
            });
            let BD09Layer = new TileLayer({
                source: new TileImage({
                    projection: projection,
                    tileGrid: tilegrid,
                    tileUrlFunction: function (tileCoord, pixelRatio, proj) {
                        if (!tileCoord) {
                            return "";
                        }
                        var z = tileCoord[0];
                        var x = tileCoord[1];
                        var y = -tileCoord[2];
                        if (x < 0) {
                            x = "M" + (-x);
                        }
                        if (y < 0) {
                            y = "M" + (-y);
                        }
                        return "http://online3.map.bdimg.com/onlinelabel/?qt=tile&x=" + x + "&y=" + y + "&z=" + z + "&styles=pl&udt=20200630&scaler=1";
                        // return "http://online1.map.bdimg.com/onlinelabel/?qt=tile&x=" + x + "&y=" + y + "&z=" + z + "&styles=pl&scaler=1&p=1";

                    }
                }),
            });
            this.map.addLayer(BD09Layer);
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
