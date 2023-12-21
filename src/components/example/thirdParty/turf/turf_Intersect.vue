<template>
    <div>
        <div id="map"></div>
        <div class="control">
            <button @click="interaction">绘制工具</button>
            <button @click="intersect">相交查询</button>
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
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import CircleStyle from 'ol/style/Circle';

import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';
import Collection from 'ol/Collection';
import Draw from 'ol/interaction/Draw';

import {fromCircle} from 'ol/geom/Polygon';

import { pointsWithinPolygon } from '@turf/turf';

export default {
    name: 'Base',
    data() {
        return {
            map: {},
            queryLayer:null,
            drawFeature: null,
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

        this.queryLayer = new VectorLayer({
            source: new VectorSource({
                format: new GeoJSON(),
                url: "http://192.168.201.162:8088/geoserver/zhjy/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=zhjy%3Apoint_miyun&maxFeatures=5000&outputFormat=application%2Fjson",
                useSpatialIndex: false,//这个必须添加，重要
                //当设置为false时，将在一个集合中维护这些特性，可以通过getFeaturesCollection来检索
            })
        });
        this.map.addLayer(this.queryLayer);

    },
    methods: {
        ol2turf(olData) {
            let format = new GeoJSON()
            if (olData instanceof Feature) {
                return format.writeFeatureObject(olData)
            } else if (olData instanceof Geometry) {
                return format.writeGeometryObject(olData)
            } else if (olData instanceof Collection) {
                let dataList = olData.getArray()
                if (dataList[0] instanceof Feature) {
                    return format.writeFeaturesObject(dataList)
                }
            }
            return null
        },
        turf2ol(turfData) {
            let format = new GeoJSON()
            if (turfData.type === 'Feature') {
                return format.readFeature(turfData)
            } else if (['Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon'].indexOf(turfData.type) > -1) {
                return format.readGeometry(turfData)
            } else if (turfData.type === 'FeatureCollection') {
                return format.readFeatures(turfData)
            } else if (turfData.type === 'GeometryCollection') {
                return turfData.geometries.map((geom) => {
                    return format.readGeometry(geom)
                })
            } else {
                return null
            }
        },
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
                //type: "Polygon",
                type:"Circle",//圆的方式比较特殊
            })
            this.map.addInteraction(draw);
            draw.on('drawend', (e) => {
                draw.setActive(false)//绘制完失效
                //this.drawFeature = e.feature;
                this.drawFeature=fromCircle(e.feature.getGeometry())
            })
        },
        intersect() {
            let queryFeatures = this.queryLayer.getSource().getFeaturesCollection();
            let turfPoint = this.ol2turf(queryFeatures);
            let turfPolygon = this.ol2turf(this.drawFeature);
            let intersectTFeature = pointsWithinPolygon(turfPoint, turfPolygon);
            let intersectFeature = this.turf2ol(intersectTFeature);
            let IntersectLayer = new VectorLayer({
                source: new VectorSource()
            });
            IntersectLayer.getSource().addFeatures(intersectFeature)

            let IntersectStyle = new Style({
                image: new CircleStyle({
                    stroke: new Stroke({
                        color: "blue",
                        width: 3
                    }),
                    fill: new Fill({
                        color: "rgba(202, 12, 22, 0.5)"
                    }),
                    radius: 5,
                }),
                stroke: new Stroke({
                    color: "blue",
                    width: 3
                }),
                fill: new Fill({
                    color: "rgba(202, 12, 22, 0.5)"
                })
            });
            IntersectLayer.setStyle(IntersectStyle);
            this.map.addLayer(IntersectLayer);
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
