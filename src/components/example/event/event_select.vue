<template>
    <div>
        <div id="map"></div>
        <div class="control">
        </div>
        <div id="popup" class="ol-popup" ref="popup">
            <a href="#" id="popup-closer" class="ol-popup-closer" ref="popup_closer"></a>
            <div id="popup-content" ref="popup_content">
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

import Overlay from 'ol/Overlay';
import Select from 'ol/interaction/Select';

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
        * 实现popup的html元素
        */
        let container = this.$refs.popup;
        let content = this.$refs.popup_content;
        let closer = this.$refs.popup_closer;

        let popup = new Overlay({
            element: container,
            auto: true,
            positioning: "bottom-center",
            stopEvent: false,
            autoPanAnimation: { duration: 250 },
        });
        this.map.addOverlay(popup);

        closer.onclick = () => {
            popup.setPosition(undefined);
            closer.blur();//失去焦点
            return false;
        }

        /**
         * 地图点击事件
         */
        //鼠标状态
        this.map.on('pointermove', (e) => {
            var hit = this.map.hasFeatureAtPixel(e.pixel);
            this.map.getTargetElement().style.cursor = hit ? 'pointer' : '';
        });
        
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
                content.innerHTML = hdms;
                popup.setPosition(coordinate);

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

.ol-popup {
    position: absolute;
    background-color: white;
    /*滤镜-阴影*/
    -webkit-filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.2));
    filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.2));
    padding: 15px;
    border-radius: 10px;
    border: 1px solid #cccccc;
    bottom: 10px;
    left: -50px;
}

/*.ol-popup之后之前插入的内容和样式*/
.ol-popup:after,
.ol-popup:before {
    top: 100%;
    border: solid transparent;
    content: " ";
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
}

.ol-popup:after {
    border-top-color: white;
    border-width: 10px;
    left: 48px;
    margin-left: -10px;
}

.ol-popup:before {
    border-top-color: #cccccc;
    border-width: 11px;
    left: 48px;
    margin-left: -11px;
}

.ol-popup-closer {
    text-decoration: none;
    position: absolute;
    top: 2px;
    right: 8px;
}

.ol-popup-closer:after {
    content: "✖";
}

#popup-content {
    font-size: 14px;
    font-family: "微软雅黑";
}
</style>
