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

import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import CircleStyle from 'ol/style/Circle.js';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';

export default {
    name: 'Base',
    data() {
        return {
            map: {},
            geojsonObject: {
                "type": "FeatureCollection",
                "features": [{
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [116.83189690000006, 40.369736970000076]
                    },
                    "properties": {
                        "NAME": "奥林匹克公园"
                    }
                },
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [116.82691990000001, 40.370471010000074]
                    },
                    "properties": {
                        "NAME": "密云县第二幼儿园"
                    }
                },
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [116.8339820000001, 40.36825602000005]
                    },
                    "properties": {
                        "NAME": "密云县第四幼儿园"
                    }
                },
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [116.82332100000008, 40.367219040000066]
                    },
                    "properties": {
                        "NAME": "首都经贸大学密云分校"
                    }
                },
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [116.82474520000005, 40.372434000000055]
                    },
                    "properties": {
                        "NAME": "密云县果园小学"
                    }
                },
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [116.83731820000003, 40.37267502000003]
                    },
                    "properties": {
                        "NAME": "密云县第一幼儿园"
                    }
                },
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [116.8362608000001, 40.37012100000004]
                    },
                    "properties": {
                        "NAME": "北京密云县第五小学"
                    }
                }
                ]
            }
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
        this.addGeojsonLayer()
    },
    methods: {
        addGeojsonLayer() { 
            let vectorSource = new VectorSource();
            let features = new GeoJSON().readFeatures(this.geojsonObject, {// 用readFeatures方法可以自定义坐标系
                dataProjection: 'EPSG:4326', // 设定JSON数据使用的坐标系
                featureProjection: 'EPSG:3857' // 设定当前地图使用的feature的坐标系
            });
            vectorSource.addFeatures(features);

            let vectorLayer = new VectorLayer({
                source: vectorSource,
                style: new Style({
                    image: new CircleStyle({
                        radius: 5,
                        fill: new Fill({
                            color: 'blue'
                        }),
                        stroke: new Stroke({
                            color: 'red',
                            width: 1
                        })
                    }),
                }),
            });
            this.map.addLayer(vectorLayer);
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
