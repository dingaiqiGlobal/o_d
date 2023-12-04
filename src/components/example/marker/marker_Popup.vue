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
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import CircleStyle from 'ol/style/Circle';
import Text from 'ol/style/Text';

import Select from 'ol/interaction/Select';

import Popup from '../../ol_Extend/popup/ol-popup';
import '../../ol_Extend/popup/ol-popup.css'

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
        this.addWFSBase();

        /**
         * 地图点击事件
         */
        //鼠标状态
        this.map.on('pointermove', (e) => {
            var hit = this.map.hasFeatureAtPixel(e.pixel);
            this.map.getTargetElement().style.cursor = hit ? 'pointer' : '';
        });

        //封装Popup
        //在外面实例化，单一气泡框，在里面实例化多个气泡框
        let popup = new Popup();
        this.map.addOverlay(popup);

        let selectClick = new Select();
        this.map.addInteraction(selectClick);
        //事件绑定式（change和select两个事件）
        selectClick.on('select', (e) => {
            let features = e.target.getFeatures().getArray();//重要ol​/Collection
            if (features.length > 0) {
                let feature = features[0];
                let property = feature.getProperties();
                let coordinate = olExtent.getCenter(feature.getGeometry().getExtent());

                let hdms = `
                    名称：${property["NAME"]}
                    <br/>
                    位置：${coordinate[0]}-${coordinate[1]}
                `
                popup.show(coordinate, hdms);//添加气泡框

                let pt_style = (feature) => {
                    return new Style({
                        image: new CircleStyle({
                            radius: 5,
                            fill: new Fill({
                                color: 'red'
                            }),
                            stroke: new Stroke({
                                color: 'black',
                                width: 1
                            })
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
                feature.setStyle(pt_style(feature));
            }
        })
    },
    methods: {
        addWFSBase() {
            const vectorLayer = new VectorLayer({
                source: new VectorSource({
                    format: new GeoJSON(),
                    url: "http://192.168.201.162:8088/geoserver/zhjy/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=zhjy%3Apoint_miyun&maxFeatures=5000&outputFormat=application%2Fjson",
                }),
                style: new Style({
                    image: new CircleStyle({
                        radius: 5,
                        fill: new Fill({
                            color: 'yellow'
                        }),
                        stroke: new Stroke({
                            color: 'blue',
                            width: 1
                        })
                    }),
                }),
            });
            this.map.addLayer(vectorLayer);
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

.control {
    position: absolute;
    z-index: 10;
    left: 10px;
    top: 10px;
}
</style>
