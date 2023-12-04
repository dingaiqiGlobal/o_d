<template>
    <div>
        <div id="map"></div>
        <div class="control">
            <div class="title">
                <p>图例</p>
            </div>
            <div class="content">
                <ul class="list">
                    <li class="listItem" v-for="item in legendList" :key="item.key">
                        <i class="el-icon-delete" @click="remove(item)"></i>
                        <el-checkbox v-model="item.checked" @change="handleCheckedChange(item)"></el-checkbox>
                        <span class="listLabel1">{{ item.name }}</span>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>
  
<script>
import "ol/ol.css";
import { Map, View } from "ol";
import * as olProj from 'ol/proj';
import * as olExtent from 'ol/extent';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import WMTS from 'ol/source/WMTS';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import XYZ from 'ol/source/XYZ';
import { get } from 'ol/proj';

import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';

import { MapUtil } from '@terrestris/ol-util';



export default {
    name: 'LegendBox',
    data() {
        return {
            legendList: [
                {
                    key: '1',
                    name: "WMTS",
                    checked: true,
                    type: 'OGC',//OGC|GeoServer
                    url: 'https://t0.tianditu.gov.cn/vec_w/wmts?tk=21c1e34286caecc25fd94be94bfbe119',
                    proj: 'EPSG:900913',
                    level: '18',
                    layers: "vec",//vec矢量|img影像|cva注记,
                    format: 'tiles',
                    tileSize: [256, 256],
                    matrixSet: "w",//w球面墨卡托投影|c经纬度投影
                },
                {
                    key: '2',
                    name: "TMS",
                    checked: true,
                    url: 'http://192.168.201.162:8088/geoserver/gwc/service/tms/1.0.0/zhjy%3Apolygon_miyun@EPSG%3A900913@png/{z}/{x}/{-y}.png',
                }, {
                    key: '3',
                    name: "WMS",
                    checked: true,
                    url: 'http://192.168.201.162:8088/geoserver/wms',
                    layers: 'zhjy:point_miyun'
                }, {
                    key: '4',
                    name: "WFS_Polygon",
                    checked: true,
                    url: 'http://192.168.201.162:8088/geoserver/zhjy/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=zhjy%3Apolygon_miyun&maxFeatures=5000&outputFormat=application%2Fjson',
                }, {
                    key: '5',
                    name: "WFS_Polyline",
                    checked: true,
                    url: 'http://192.168.201.162:8088/geoserver/zhjy/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=zhjy%3Apolyline_miyun&maxFeatures=5000&outputFormat=application%2Fjson',
                }, {
                    key: '6',
                    name: "WFS_Point",
                    checked: true,
                    url: 'http://192.168.201.162:8088/geoserver/zhjy/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=zhjy%3Apoint_miyun&maxFeatures=5000&outputFormat=application%2Fjson',
                },

            ],

        }
    },
    components: {
    },
    created() {

    },
    mounted() {
        this.initMap()
        this.addLayer()
    },
    methods: {
        addLayer() {
            const { legendList } = this;
            for (let i = 0; i < legendList.length; i++) {
                if (legendList[i].name === "TMS") {
                    let { name, url } = legendList[i]
                    this._addTMS({
                        name: name,
                        url: url,
                    })
                }
                if (legendList[i].name === "WFS_Point") {
                    let { name, url } = legendList[i]
                    this._addWFSLayer({
                        name: name,
                        url: url,
                    })
                }
                if (legendList[i].name === "WFS_Polyline") {
                    let { name, url } = legendList[i]
                    this._addWFSLayer({
                        name: name,
                        url: url,
                    })
                }
                if (legendList[i].name === "WFS_Polygon") {
                    let { name, url } = legendList[i]
                    this._addWFSLayer({
                        name: name,
                        url: url,
                    })
                }
                if (legendList[i].name === "WMS") {
                    let { name, url, layers } = legendList[i]
                    this._addWMSTileLayer({
                        name: name,
                        url: url,
                        layers: layers,
                    })
                }
                if (legendList[i].name === "WMTS") {
                    let { name, type, url, proj, level, layers, format, tileSize, matrixSet } = legendList[i]
                    this._addWMTSLayer({
                        name: name,
                        type: type,
                        url: url,
                        proj: proj,
                        level: level,
                        layers: layers,
                        format: format,
                        tileSize: tileSize,
                        matrixSet: matrixSet,
                    })
                }
            }
        },
        remove(item) {
            const { legendList } = this;
            let len = legendList.length;
            if (len > 0) {
                let index = 0;
                for (let i = 0; i < len; i++) {
                    if (legendList[i].key == item.key) {
                        index = i;
                        //通过图层名移除
                        let rmLayer = MapUtil.getLayerByName(this.map, legendList[i].name)
                        this.map.removeLayer(rmLayer)
                    }
                }
                this.legendList.splice(index, 1);
            }
        },
        handleCheckedChange(item) {
            MapUtil.setVisibilityForLayers(this.map, [`${item.name}`], item.checked)
             /**
              * 复杂
              */
            // let n = item.name;
            // let data = {
            //     'WMTS': MapUtil.setVisibilityForLayers(this.map, [`${item.name}`], item.checked),
            //     'TMS': MapUtil.setVisibilityForLayers(this.map, [`${item.name}`], item.checked),
            //     'WMS': MapUtil.setVisibilityForLayers(this.map, [`${item.name}`], item.checked),
            //     'WFS_Polygon': MapUtil.setVisibilityForLayers(this.map, [`${item.name}`], item.checked),
            //     'WFS_Polyline':MapUtil.setVisibilityForLayers(this.map, [`${item.name}`], item.checked),
            //     'WFS_Point':MapUtil.setVisibilityForLayers(this.map, [`${item.name}`], item.checked),
            // }
            // data[n] && data[n]();//存在并且执行函数

            /**
             * 方式1
             */
            // let WFSLayer = MapUtil.getLayerByName(this.map, item.name)
            // WFSLayer.setVisible(item.checked)
            /**
             * 方式2
             */
            // MapUtil.setVisibilityForLayers(this.map, [`${item.name}`], item.checked)
        },
        initMap() {
            let view = new View({
                projection: "EPSG:3857",
                center: olProj.fromLonLat([116.831120, 40.370500]),
                zoom: 14,
            });
            this.map = new Map({
                target: "map",
                layers: [],
                view: view,
            });
        },
        _addWFSLayer(options) {
            let { name, url } = options;
            let WFSLayer = new VectorLayer({
                name: name,
                source: new VectorSource({
                    format: new GeoJSON(),
                    url: url,
                }),
                // style: () => {
                //     return this.changeLayerStyle();
                // },
            });
            this.map.addLayer(WFSLayer);
        },
        _addWMSTileLayer(options) {
            let { name, url, layers } = options;
            let WMSTileLayer = new TileLayer({
                name: name,
                source: new TileWMS({
                    url: url,
                    params: { LAYERS: layers, TILED: true },
                    serverType: "geoserver",
                }),
            });
            this.map.addLayer(WMSTileLayer);
        },
        _addWMTSLayer(options) {
            let { name, type, url, proj, level, layers, format, tileSize, matrixSet } = options;
            let projection = get(proj);
            let projectionExtent = projection.getExtent();
            let size = olExtent.getWidth(projectionExtent) / 256;
            let resolutions = new Array(level);
            let matrixIds = new Array(level);
            if (type == "Geoserver") {
                for (let z = 0; z < level; z++) {
                    resolutions[z] = size / Math.pow(2, z);
                    matrixIds[z] = proj + ":" + z; //geoserver专用
                }
            }
            if (type == "OGC") {
                for (let z = 0; z < level; z++) {
                    resolutions[z] = size / Math.pow(2, z);
                    matrixIds[z] = z;
                }
            }
            let WMTSLayer = new TileLayer({
                name: name,
                source: new WMTS({
                    url: url,
                    layer: layers,
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
                })
            });
            this.map.addLayer(WMTSLayer);
        },
        _addTMS(options) {
            let { name, url } = options
            let TMSLayer = new TileLayer({
                name: name,
                source: new XYZ({
                    projection: "EPSG:900913",
                    url: url,
                    wrapX: true,
                }),
            });
            this.map.addLayer(TMSLayer);
        }


    }
}
</script>
  
<style lang="less">
.ol-attribution,
.ol-zoom {
    display: none;
}

.control {
    width: 230px;
    max-height: 440px;
    background: rgba(255, 255, 255, 0.6);
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.08),
        0px 0px 6px -4px rgba(0, 0, 0, 0.12);
    border-radius: 2px;
    padding-bottom: 10px;
    position: absolute;
    z-index: 10;
    left: 10px;
    top: 10px;

    .title {
        width: 100%;
        height: 40px;
        line-height: 40px;
        padding: 0 10px;

        p {
            font-size: 16px;
            font-weight: 500;
            color: rgba(0, 0, 0, 0.84);
            padding-right: 23px;
        }
    }

    .content {
        padding: 0 10px;

        .list {
            list-style: none;
            margin: unset;
            padding: unset;

            .listItem {
                margin: 5px 0;
                height: 20px;
                text-align: left;
                line-height: 30px;

                .el-icon-delete {
                    padding: 0px 10px;
                }

                .el-checkbox {
                    position: relative;
                    top: 2px;
                }

                .listImg {
                    margin-left: 10px;
                    width: 30px;
                    height: 30px;
                }

                .listLabel1 {
                    margin-left: 20px;
                    max-width: 100px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
            }
        }
    }
}
</style>
    