<template>
    <div>
        <div id="map"></div>
        <div class="control">
            <button @click="interaction">绘制空间过滤(Front)</button>
            <button @click="attributeFilter">属性过滤</button>
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
import Icon from 'ol/style/Icon';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import CircleStyle from 'ol/style/Circle';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import WFS from 'ol/format/WFS';

import Draw from 'ol/interaction/Draw.js';
import * as olLoadingstrategy from 'ol/loadingstrategy';
import * as olTilegrid from 'ol/tilegrid';
import { intersects,like } from 'ol/format/filter';


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
        //t0~t7  添加天地图底图
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

        //添加矢量图层
        const style = new Style({
            image: new Icon({
                src: '/images/icon/location.png',
                opacity: 1,
                scale: 0.2,
            }),
        });
        const vectorLayer = new VectorLayer({
            source: new VectorSource({
                format: new GeoJSON(),
                url: `http://192.168.201.162:8088/geoserver/zhjy/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=zhjy%3Apoint_miyun&maxFeatures=5000&outputFormat=application%2Fjson`,
            }),
            style: style,
        });
        this.map.addLayer(vectorLayer);

    },
    methods: {
        interaction() {
            let drawSource = new VectorSource();
            let drawVector = new VectorLayer({
                source: drawSource,
                style: new Style({
                    fill: new Fill({
                        color: 'rgba(255, 255, 255, 0.2)'
                    }),
                    stroke: new Stroke({
                        color: '#ff0000',
                        width: 2
                    }),
                    image: new CircleStyle({
                        radius: 7,
                        fill: new Fill({
                            color: '#ff0000'
                        })
                    })
                })
            });
            this.map.addLayer(drawVector);

            let draw = new Draw({
                source: drawSource,
                type: "Polygon",
            })
            this.map.addInteraction(draw);
            draw.on('drawend', (e) => {
                draw.setActive(false)//绘制完失效
                this._spatialFilter(e.feature);
            })
        },
        _spatialFilter(feature) {
            /**
             * （重要理解）
             * 加载有简单方式也有GetFeature方式
             * 该种方式自由度更大，可以结合一些过滤条件
             */
            let vectorSource = new VectorSource({
                format: new GeoJSON(),
                loader: (extent, resolution, projection) => {
                    let proj = projection.getCode();
                    let url =
                        `http://192.168.201.162:8088/geoserver/wfs?
              service=WFS&version=1.1.0&request=GetFeature&typename=zhjy:point_miyun&outputFormat=application/json
              &srsname=${proj}&bbox=${extent.join(",")},${proj}`
                    let featureRequest = new WFS().writeGetFeature({
                        srsName: "EPSG:3857",
                        featureNS: "www.zhjy.com",
                        featurePrefix: "zhjy",
                        featureTypes: ["point_miyun"],
                        maxFeatures: 5000,
                        outputFormat: "application/json",
                        filter: intersects("the_geom", feature.getGeometry())//相交查询
                        //filter: intersects("the_geom", feature.getGeometry(), 'EPSG:3857')
                    });

                    fetch(url, {
                        method: "POST",
                        body: new XMLSerializer().serializeToString(featureRequest),
                    })
                        .then(function (response) {
                            return response.json();
                        })
                        .then(function (json) {
                            var features = new GeoJSON().readFeatures(json);
                            if (features.length > 0) {
                                vectorSource.clear();
                                vectorSource.addFeatures(features);
                            }
                        })
                        .catch((err) => {
                            console.log("请求错误", err);
                        });
                },

                strategy: olLoadingstrategy.tile(
                    new olTilegrid.createXYZ({
                        maxZoom: 25,
                    })
                ),
                projection: "EPSG4326",
            });
            let vectorLayer = new VectorLayer({
                source: vectorSource,
                style: new Style({
                    image: new Icon({
                        color: 'green',
                        src: '/images/icon/location.png',
                        opacity: 1,
                        scale: 0.2,
                    }),
                }),
            });
            this.map.addLayer(vectorLayer);
        },
        attributeFilter() {
            let vectorSource = new VectorSource({
                format: new GeoJSON(),
                loader: (extent, resolution, projection) => {
                    let proj = projection.getCode();
                    let url =
                        `http://192.168.201.162:8088/geoserver/wfs?
              service=WFS&version=1.1.0&request=GetFeature&typename=zhjy:point_miyun&outputFormat=application/json
              &srsname=${proj}&bbox=${extent.join(",")},${proj}`
                    let featureRequest = new WFS().writeGetFeature({
                        srsName: "EPSG:3857",
                        featureNS: "www.zhjy.com",
                        featurePrefix: "zhjy",
                        featureTypes: ["point_miyun"],
                        maxFeatures: 5000,
                        outputFormat: "application/json",
                        filter: new like('NAME', '*公园')//属性过滤条件
                        //多条件
                        // filter:new and(
                        //   intersects("the_geom", feature.getGeometry()),
                        //   like('NAME', 'lo*')
                        // ),
                    });

                    fetch(url, {
                        method: "POST",
                        body: new XMLSerializer().serializeToString(featureRequest),
                    })
                        .then(function (response) {
                            return response.json();
                        })
                        .then(function (json) {
                            var features = new GeoJSON().readFeatures(json);
                            if (features.length > 0) {
                                vectorSource.clear();
                                vectorSource.addFeatures(features);
                            }
                        })
                        .catch((err) => {
                            console.log("请求错误", err);
                        });
                },

                strategy: olLoadingstrategy.tile(//加载策略
                    new olTilegrid.createXYZ({
                        maxZoom: 25,
                    })
                ),
                projection: "EPSG4326",
            });
            let vectorLayer = new VectorLayer({
                source: vectorSource,
                style: new Style({
                    image: new Icon({
                        color: 'blue',
                        src: '/images/icon/location.png',
                        opacity: 1,
                        scale: 0.2,
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
