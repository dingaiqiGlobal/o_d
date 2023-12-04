<template>
    <div>
        <div id="map"></div>
        <div class="control">
            <span>样本距离</span>
            <el-slider v-model="distance" @input="changeDistance"></el-slider>
            <span>最小距离</span>
            <el-slider v-model="minDistance" @input="changeMinDistance"></el-slider>
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
import Icon from 'ol/style/Icon';
import CircleStyle from 'ol/style/Circle';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import Text from 'ol/style/Text';

import Cluster from 'ol/source/Cluster';


export default {
    name: 'Base',
    data() {
        return {
            map: {},
            distance:50,
            minDistance:20,
            clusterSource: null,
        };
    },
    mounted() {
        this.map = new Map({
            target: "map",
            layers: [],
            view: new View({
                projection: "EPSG:3857",
                center: olProj.fromLonLat([116.831120, 40.370500]),
                zoom: 5,
                minZoom: 2,
                maxZoom: 7,//关联当地图缩放到最某层级时，取消全部聚合效果
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

        this.addClusterLayer()
    },
    methods: {
        changeDistance(val) {
            this.distance = val;
            this.clusterSource.setDistance(this.distance);
        },
        changeMinDistance(val) {
            this.minDistance = val;
            this.clusterSource.setMinDistance(this.minDistance);
        },
        addClusterLayer() {
            //实例化矢量数据源
            let vectorSource = new VectorSource({
                format: new GeoJSON(),
                url: "http://192.168.201.162:8088/geoserver/zhjy/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=zhjy%3Apoint_china&maxFeatures=50000&outputFormat=application%2Fjson",
            })
            //实例化聚散数据源
            this.clusterSource = new Cluster({
                source: vectorSource,
                distance: this.distance,
                minDistance: this.minDistance,
            })
            //添加图层并设置样式
            let styleCache = {};
            let clusterLayer = new VectorLayer({
                source: this.clusterSource,
                style: (feature) => {
                    let size = feature.get('features').length;
                    let style = styleCache[size];
                    if (size === 1) {
                        style = new Style({
                            image: new Icon({
                                src: 'images/icon/location.png',
                                scale: 0.2,
                            })
                        })
                    } else {
                        if (!style) {
                            style = new Style({
                                image: new CircleStyle({
                                    radius: 10,
                                    stroke: new Stroke({
                                        color: '#fff',
                                    }),
                                    fill: new Fill({
                                        color: '#3399CC',
                                    }),
                                }),
                                text: new Text({
                                    text: size.toString(),
                                    fill: new Fill({
                                        color: '#fff',
                                    }),
                                }),
                            });
                        }
                    }
                    return style;
                }
            })
            this.map.addLayer(clusterLayer)

            /**
             * 当地图缩放到最某层级时，取消全部聚合效果
             */
            this.map.getView().on('change:resolution',  (event)=> {
                if (this.map.getView().getZoom() === this.map.getView().getMaxZoom()) {
                    this.clusterSource.setDistance(0);
                }
                else {
                    this.clusterSource.setDistance(this.distance);
                }
            })
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
    width: 200px;
    color: white
}
</style>
