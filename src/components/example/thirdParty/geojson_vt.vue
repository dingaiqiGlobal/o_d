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

import GeoJSON from 'ol/format/GeoJSON';
import Projection from 'ol/proj/Projection';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import { Fill, Style } from 'ol/style';

import geojsonvt from 'geojson-vt';

export default {
    name: 'Base',
    data() {
        return {
            // map: {},
        };
    },
    mounted() {
        let map = new Map({
            target: "map",
            layers: [],
            view: new View({
                projection: "EPSG:3857",
                center: olProj.fromLonLat([116.831120, 40.370500]),
                zoom: 8,
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
        map.addLayer(TDTLayer);


        const replacer = function (key, value) {
            if (value.geometry) {
                let type;
                const rawType = value.type;
                let geometry = value.geometry;

                if (rawType === 1) {
                    type = 'MultiPoint';
                    if (geometry.length == 1) {
                        type = 'Point';
                        geometry = geometry[0];
                    }
                } else if (rawType === 2) {
                    type = 'MultiLineString';
                    if (geometry.length == 1) {
                        type = 'LineString';
                        geometry = geometry[0];
                    }
                } else if (rawType === 3) {
                    type = 'Polygon';
                    if (geometry.length > 1) {
                        type = 'MultiPolygon';
                        geometry = [geometry];
                    }
                }

                return {
                    'type': 'Feature',
                    'geometry': {
                        'type': type,
                        'coordinates': geometry,
                    },
                    'properties': value.tags,
                };
            } else {
                return value;
            }
        };

        const urlGeojson = 'http://192.168.201.162:8088/geoserver/zhjy/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=zhjy%3Apolygon_beijing&maxFeatures=5000&outputFormat=application%2Fjson';
        fetch(urlGeojson)
            .then((response) => {
                return response.json();
            })
            .then((json) => {
                const tileIndex = geojsonvt(json, {
                    extent: 4096,
                    debug: 1,
                });
                const format = new GeoJSON({
                    // 从geojson-vt返回的数据以tile像素为单位
                    dataProjection: new Projection({
                        code: 'TILE_PIXELS',
                        units: 'tile-pixels',
                        extent: [0, 0, 4096, 4096],
                    }),
                });
                const vectorSource = new VectorTileSource({
                    tileUrlFunction: function (tileCoord) {
                        // 将tile坐标用作缓存目的的伪URL
                        return JSON.stringify(tileCoord);
                    },
                    tileLoadFunction: function (tile, url) {
                        const tileCoord = JSON.parse(url);
                        const data = tileIndex.getTile(
                            tileCoord[0],
                            tileCoord[1],
                            tileCoord[2]
                        );
                        const geojson = JSON.stringify(
                            {
                                type: 'FeatureCollection',
                                features: data ? data.features : [],
                            },
                            replacer
                        );
                        const features = format.readFeatures(geojson, {
                            extent: vectorSource.getTileGrid().getTileCoordExtent(tileCoord),
                            featureProjection: map.getView().getProjection(),
                        });
                        tile.setFeatures(features);
                    },
                });
                const vectorLayer = new VectorTileLayer({
                    //这里与mapboxgl的设置一样(style样式不起作用，再研究)
                    source: vectorSource,
                    style: {
                        //'fill-color': ['string', ['get', 'COLOR'], '#eee'],

                        "fill-antialias": true,
                        "fill-color": "rgba(0, 88, 216, 0.5)",
                        "fill-outline-color": "#000000", 

                        // "fill-color": [
                        //     "step",
                        //     ["get", "POPU"],
                        //     "#ffd0a6", 50,
                        //     "#ffaa7f", 100,
                        //     "#ff704e", 150,
                        //     "#f04040", 200,
                        //     "#b50a09"
                        // ]

                        // "fill-color": {
                        //     "property": "NAME",
                        //     "type": "categorical",
                        //     "default": "yellow",
                        //     "stops": [
                        //         [
                        //             "密云区",
                        //             "#e55151"
                        //         ],
                        //         [
                        //             "怀柔区",
                        //             "#538cb7"
                        //         ],
                        //         [
                        //             "延庆区",
                        //             "#e1a7d0"
                        //         ]
                        //     ]
                        // },

                    },
                });
                map.addLayer(vectorLayer);

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
