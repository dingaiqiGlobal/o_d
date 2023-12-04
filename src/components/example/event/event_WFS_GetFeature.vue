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

import Style from 'ol/style/Style';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { transform } from 'ol/proj';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import Text from 'ol/style/Text';


export default {
    name: 'Base',
    data() {
        return {
            map: {},
            selectLayer:null,
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
        const vectorLayer = new VectorLayer({
            source: new VectorSource({
                format: new GeoJSON(),
                url: "http://192.168.201.162:8088/geoserver/zhjy/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=zhjy%3Apolygon_miyun&maxFeatures=5000&outputFormat=application%2Fjson",
            }),
        });
        this.map.addLayer(vectorLayer);

        this.map.on('pointermove', (e) => {
            var hit = this.map.hasFeatureAtPixel(e.pixel);
            this.map.getTargetElement().style.cursor = hit ? 'pointer' : '';
        });

        /**
         * 注意这里直接将点坐标提交，与图层做intersrct分析，对于面图层是没关系的。如果是查询，点或者线图形，
         * 一定要将coor先设置一个容差，经行buffer之后的图形，再去与图层叠加分析。不设置容差几乎就找不到了
         * 图层的图形字段是geom，不同图层的图形字段都要自己先看下自己的，
         * 有的是the_geom，有的是shape等等，具体分析即可。
         */
        this.map.on('singleclick', (e) => {
            if (this.selectLayer) { 
                this.map.removeLayer(this.selectLayer)
            }//清除
            const baseUrl = "http://192.168.201.162:8088/geoserver/zhjy/ows";
            const service = "WFS";
            const version = "1.0.0";
            const request = "GetFeature";//WFS请求方法
            const typeName = "zhjy:polygon_miyun";
            const outputFormat = "application/json";

            //https://www.osgeo.cn/mapserver/ogc/filter_encoding.html#currently-supported-features
            //没走通

            // let coor = e.coordinate;
            // const filter = `
            //     <Filter xmlns="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml">
            //         <Intersects>
            //             <PropertyName>the_geom</PropertyName>
            //             <gml:Point>
            //                 <gml:coordinates>${coor[0]} ${coor[1]}</gml:coordinates>
            //             </gml:Point>
            //         </Intersects>
            //     </Filter>
            // `
            //  let url = `${baseUrl}?service=${service}&version=${version}&request=${request}&typeName=${typeName}&outputFormat=${outputFormat}&Filter=${filter}`;

            /**
             * GeoServer支持的CQL_FILTER
             */
            let coor = e.coordinate;
            coor = transform(coor, 'EPSG:3857', 'EPSG:4326')
            const CQL_FILTER = `INTERSECTS(the_geom, POINT (${coor[0]} ${coor[1]}))`;
            const CQL_FILTER_URL = encodeURI(CQL_FILTER);
            let url = `${baseUrl}?service=${service}&version=${version}&request=${request}&typeName=${typeName}&outputFormat=${outputFormat}&CQL_FILTER=${CQL_FILTER_URL}`;

            if (url) {
                fetch(url)
                    .then(response => response.json())
                    .then((data) => {
                        //设置style
                        if (data) {//返回FeatureCollection(也就是geojson)
                            let vectorSource = new VectorSource();
                            let features = new GeoJSON().readFeatures(data, {
                                dataProjection: 'EPSG:4326', 
                                featureProjection: 'EPSG:3857' 
                            });
                            vectorSource.addFeatures(features);
                            this.selectLayer = new VectorLayer({
                                source: vectorSource,
                                style: (feature) => {
                                    return new Style({
                                        fill: new Fill({
                                            color: 'red'
                                        }),
                                        stroke: new Stroke({
                                            color: 'black',
                                            width: 1
                                        }),
                                        text: new Text({
                                            textAlign: 'center',
                                            offsetX: '8',
                                            offsetY: '8',
                                            font: '13px Microsoft YaHei',
                                            text: feature.get('NAME'),
                                            fill: new Fill({
                                                color: 'red'
                                            }),
                                            stroke: new Stroke({
                                                color: 'black',
                                                width: 1
                                            })
                                        })
                                    })
                                }
                            });
                            this.map.addLayer(this.selectLayer)

                        }

                    })
                    .catch((err) => {
                        console.log("请求错误", err);
                    });

            }
        })


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
