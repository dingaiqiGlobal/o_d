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
import * as olExtent from 'ol/extent';
import XYZ from 'ol/source/XYZ';
import TileGrid from 'ol/tilegrid/TileGrid';
//npm install projzh  扩展包
//参考https://github.com/openlayers/openlayers/issues/3522
import projzh from 'projzh'
//let projzh = require('projzh');

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
            let extent = [72.004, 0.8293, 137.8347, 55.8271];
            let baiduMercator = new olProj.Projection({
                code: 'baidu',
                extent: olExtent.applyTransform(extent, projzh.ll2bmerc),
                units: 'm'
            });
            olProj.addProjection(baiduMercator);
            olProj.addCoordinateTransforms('EPSG:4326', baiduMercator, projzh.ll2bmerc, projzh.bmerc2ll);
            olProj.addCoordinateTransforms('EPSG:3857', baiduMercator, projzh.smerc2bmerc, projzh.bmerc2smerc);

            let bmercResolutions = new Array(19);
            for (var i = 0; i < 19; ++i) {
                bmercResolutions[i] = Math.pow(2, 18 - i);
            }

            let urls = [0, 1, 2, 3, 4].map(function (sub) {
                //return 'http://shangetu' + sub + '.map.bdimg.com/it/u=x={x};y={y};z={z};v=009;type=sate&fm=46&udt=20150601';
                return `http://online${sub}.map.bdimg.com/onlinelabel/?qt=tile&x={x}&y={y}&z={z}&styles=pl&udt=20200630&scaler=1`;
            });
            var baidu = new TileLayer({
                source: new XYZ({
                    projection: 'baidu',
                    maxZoom: 18,
                    tileUrlFunction: function (tileCoord) {
                        var x = tileCoord[1];
                        var y = -tileCoord[2];
                        var z = tileCoord[0];
                        var hash = (x << z) + y;
                        var index = hash % urls.length;
                        index = index < 0 ? index + urls.length : index;
                        return urls[index].replace('{x}', x).replace('{y}', y).replace('{z}', z);
                    },
                    tileGrid: new TileGrid({
                        resolutions: bmercResolutions,
                        origin: [0, 0],
                        extent: olExtent.applyTransform(extent, projzh.ll2bmerc),
                        tileSize: [256, 256]
                    })
                })
            });
            this.map.addLayer(baidu);
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
