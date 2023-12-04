<!--
   * 中科地图
-->
<template>
    <div>
        <div id="map" :style=styleObject>
            <!-- <p style="color:red;font-size:40px">9999999  </p> -->
        </div>

    </div>
</template>

<script>

import Map from 'ol/Map';
import { TileWMS, WMTS, XYZ, VectorTile } from "ol/source";
import VectorSource from "ol/source/Vector";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorTileLayer from "ol/layer/VectorTile";
import { GeoJSON, MVT } from "ol/format";
import WMTSTileGrid from "ol/tilegrid/WMTS";
import View from 'ol/View';
import { fromLonLat, transform, get } from 'ol/proj';
import { Icon, Style, Stroke, Fill, Text } from 'ol/style';
import { getWidth, getTopLeft } from 'ol/extent';
import Select from 'ol/interaction/Select';

import { stylefunction } from "ol-mapbox-style";
import PubSub from 'pubsub-js'
//import stylefunction from "ol-mapbox-style/dist/stylefunction";

export default {
    name: "spacetimeMap",
    props: {
        option: Object,
        stepScale: {
            type: Number,
        },
        contain:Object
    },
    data: {
        map: null,
        WFSLayer: null,
        WMSLayer: null,
        WMTSLayer: null,
        MVTTileLayer: null,
        TMSLayer: null,

        WFSSource: null,
        WMSSource: null,
        WMTSSource: null,
        MVTTileSource: null,
        TMSSource: null,
        lineDash: [],

    },
    watch: {
        "option.basemapType": {
            handler(value) {
                this.changeBasemapType();
            }
        },
        "option.basemapInterface": {
            handler(value) {
                this.changeBasemapInterface();
            }
        },
        "option.mapScale": {
            handler(value) {
                this.changeMapScale();
            }
        },
        "option.centerPoint": {
            handler(value) {
                this.changeCenterPoint();
            }
        },
        //WMTS参数设置
        "option.proj": {
            handler(value) {
                this.changeWMTSParam()
            }
        },
        "option.level": {
            handler(value) {
                this.changeWMTSParam()
            }
        },
        "option.layerName": {
            handler(value) {
                this.changeWMTSParam()
            }
        },
        "option.format": {
            handler(value) {
                this.changeWMTSParam()
            }
        },
        "option.tileSize": {
            handler(value) {
                //this.changeWMTSParam()
            }
        },
        "option.matrixSet": {
            handler(value) {
                this.changeWMTSParam()
            }
        },
        "option.LiftingArrayType": {
            handler(value) {
                this.changeWMTSParam()
            }
        },
        /**
         * 图层设置
         */
        "option.layerServiceType": {
            handler(value) {
                this.changeLayerServiceType();
            }
        },
        "option.layerStyle": {
            handler(value) {
                this.changeLayerStyle();
            }
        },
        "option.layerInterface": {
            handler(value) {
                this.changeLayerInterface();
            }
        },
        /**
         * 点样式设置
         */
        "option.pointStyle": {
            handler(value) {
                this.changeLayerStyle();
            }
        },
        "option.pointColor": {
            handler(value) {
                this.changeLayerStyle();
            }
        },
        "option.pointSize": {
            handler(value) {
                this.changeLayerStyle();
            }
        },
        "option.pointOpacity": {
            handler(value) {
                this.changeLayerStyle();
            }
        },
        /**
         * 线样式设置
         */
        "option.lineStyle": {
            handler(value) {
                this.changeLayerStyle();
            }
        },
        "option.lineColor": {
            handler(value) {
                this.changeLayerStyle();
            }
        },
        "option.lineSize": {
            handler(value) {
                this.changeLayerStyle();
            }
        },
        "option.lineOpacity": {
            handler(value) {
                this.changeLineOpacity();
                this.changeLayerStyle();
            }
        },
        /**
         * 面样式设置
         */
        "option.polygonColor": {
            handler(value) {
                this.changeLayerStyle();
            }
        },
        "option.polygonOpacity": {
            handler(value) {
                this.changePolygonOpacity();
            }
        },
        "option.borderColor": {
            handler(value) {
                this.changeLayerStyle();
            }
        },
        "option.borderWidth": {
            handler(value) {
                this.changeLayerStyle();
            }
        },
        /**
         * 标注设置
         */
        "option.showTexe": {
            handler(value) {
                this.changeLayerStyle();
            }
        },
        "option.position": {
            handler(value) {
                this.changeLayerStyle();
            }
        },
        "option.baseline": {
            handler(value) {
                this.changeLayerStyle();
            }
        },
        "option.rotationAngle": {
            handler(value) {
                this.changeLayerStyle();
            }
        },
        "option.typeface": {
            handler(value) {
                this.changeLayerStyle();
            }
        },
        "option.labelColor": {
            handler(value) {
                this.changeLayerStyle();
            }
        },
        "option.fontThickness": {
            handler(value) {
                this.changeLayerStyle();
            }
        },
        "option.labelFontSize": {
            handler(value) {
                this.changeLayerStyle();
            }
        },
        "option.xDeviation": {
            handler(value) {
                this.changeLayerStyle();
            }
        },
        "option.yDeviation": {
            handler(value) {
                this.changeLayerStyle();
            }
        },
        "option.labelOutline": {
            handler(value) {
                this.changeLayerStyle();
            }
        },
        "option.outlineWidth": {
            handler(value) {
                this.changeLayerStyle();
            }
        },

    },
    methods: {
        initMap() {
            let { mapScale, centerPoint } = this.option;
            let centerArr = centerPoint.split(",")
            this.map = new Map({
                layers: [],
                target: 'map',
                view: new View({
                    maxZoom: 18,
                    center: transform(centerArr, 'EPSG:4326', 'EPSG:3857'),
                    zoom: mapScale,
                }),
            });
            let selectClick = new Select();
            this.map.addInteraction(selectClick);
            selectClick.on('select', (e) => {
                let features = e.target.getFeatures().getArray();
                if (features.length > 0) {
                    // window.open('https://www.baidu.com/index.html')
                    window.open(this.option.layerInterface1)
                }
            })

            // this.map.on("singleclick", (e) => {
            //     let features = this.map.getFeaturesAtPixel(e.pixel, { hitTolerance: 1 })
            //     if (features) { 
            //         // window.open('https://www.baidu.com/index.html')
            //     }
            // })

            this.map.on("singleclick", (e) => {
                let list = e.pixel
                let stepScale = 1;
                if(isNaN(this.stepScale)){
                    stepScale = this.contain.config.width / document.body.clientWidth;
                }else {
                    stepScale = this.stepScale;
                }
                if(e.pixel.length){
                    list[0] = e.pixel[0] * stepScale
                    list[1] = e.pixel[1] * stepScale
                }
                let features = this.map.getFeaturesAtPixel(list, { hitTolerance: 1 })
                if (features.length) { 
                    window.open(this.option.layerInterface1)
                }  
            })

            PubSub.subscribe('width', (msg, widthHeight) => {		//msg 指'appData'方法， pubsubTest 指传过来的参数
                let { width, height } = widthHeight
                let div = document.getElementById('map');
                div.style.height = height;
                div.style.width = width;
                this.map.updateSize();
            })
        },
        /**
         * 底图引入样式
         */
        changeBasemapType() {
            let { basemapType } = this.option;
            if (basemapType == '1') {
                if (this.MVTTileLayer) {
                    this.map.removeLayer(this.MVTTileLayer)
                }
                if (this.TMSLayer) {
                    this.map.removeLayer(this.TMSLayer)
                }
                this.addWMTSLayer()
            }
            if (basemapType == '2') {
                if (this.WMTSLayer) {
                    this.map.removeLayer(this.WMTSLayer)
                }
                if (this.TMSLayer) {
                    this.map.removeLayer(this.TMSLayer)
                }
                this.addMVTLayer()
            }
            if (basemapType == '3') {
                if (this.WMTSLayer) {
                    this.map.removeLayer(this.WMTSLayer)
                }
                if (this.MVTTileLayer) {
                    this.map.removeLayer(this.MVTTileLayer)
                }
                this.addTMSLayer()
            }
        },
        addWMTSLayer() {
            let { LiftingArrayType, basemapInterface, proj, level, layerName, format, tileSize, matrixSet } = this.option;
            let projection = get(proj);
            let projectionExtent = projection.getExtent();
            let size = getWidth(projectionExtent) / 256;
            let resolutions = new Array(level);
            let matrixIds = new Array(level);
            if (LiftingArrayType == "Geoserver") {
                for (let z = 0; z < level; z++) {
                    resolutions[z] = size / Math.pow(2, z);
                    matrixIds[z] = proj + ":" + z; //geoserver专用
                }
            } else {
                for (let z = 0; z < level; z++) {
                    resolutions[z] = size / Math.pow(2, z);
                    matrixIds[z] = z;
                }
            }
            this.WMTSSource = new WMTS({
                url: basemapInterface,
                layer: layerName,
                matrixSet: matrixSet,
                format: format,
                projection: projection,
                tileGrid: new WMTSTileGrid({
                    origin: getTopLeft(projectionExtent),
                    resolutions: resolutions,
                    matrixIds: matrixIds,
                    tileSize: tileSize,
                }),
                zIndex: 1,
            });
            this.WMTSLayer = new TileLayer({
                source: this.WMTSSource,
            });
            this.map.addLayer(this.WMTSLayer);
        },
        addMVTLayer() {
            let { basemapInterface } = this.option;
            this.MVTTileSource = new VectorTile({
                url: basemapInterface,
                format: new MVT(),
            });
            this.MVTTileLayer = new VectorTileLayer({
                source: this.MVTTileSource,
                name: "MVT",
                zIndex: 1,
            });
            fetch("http://192.168.51.11:8004/style/style.json")
                .then((r) => r.json())
                .then((glStyle) => {
                    //引入ol-mapbox-style
                    //stylefunction(layer, glStyle, 'Source');
                    stylefunction(this.MVTTileLayer, glStyle, "dongcheng");
                });
            this.map.addLayer(this.MVTTileLayer);
        },
        addTMSLayer() {
            let { basemapInterface } = this.option;
            this.TMSSource = new XYZ({
                url: basemapInterface,
            });
            this.TMSLayer = new TileLayer({
                source: this.TMSSource,
                name: "TMS",
                zIndex: 1,
            });
            this.map.addLayer(this.TMSLayer);
        },
        changeBasemapInterface() {
            let { basemapType, basemapInterface } = this.option;
            if (basemapType === "1") {
                this.WMTSSource.setUrl(basemapInterface);
                this.WMTSSource.refresh();
            }
            if (basemapType === "2") {
                this.MVTTileSource.setUrl(basemapInterface);
                this.MVTTileSource.refresh();
            }
            if (basemapType === "3") {
                this.TMSSource.setUrl(basemapInterface);
                this.TMSSource.refresh();
            }
        },
        changeMapScale() {
            let { mapScale } = this.option;
            this.map.getView().setZoom(mapScale);
        },
        changeCenterPoint() {
            let { centerPoint } = this.option;
            let centerArr = centerPoint.split(",");
            let transformCenter = transform(centerArr, 'EPSG:4326', 'EPSG:3857');
            this.map.getView().setCenter(transformCenter);
        },
        //wmts设置
        changeWMTSParam() {
            if (this.WMTSLayer) {
                this.map.removeLayer(this.WMTSLayer)
            }
            this.addWMTSLayer()
        },


        /**
         * 图层设置
         */
        changeLayerServiceType() {
            let { layerServiceType } = this.option;
            if (layerServiceType === "1") {
                if (this.WFSLayer) {
                    this.map.removeLayer(this.WFSLayer)
                }
                if (this.WMSLayer) {
                    this.map.removeLayer(this.WMSLayer)
                }
                this.addWFSLayer()
            }
            if (layerServiceType === "2") {
                if (this.WFSLayer) {
                    this.map.removeLayer(this.WFSLayer)
                }
                if (this.WMSLayer) {
                    this.map.removeLayer(this.WMSLayer)
                }
                this.addWMSLayer()
            }
        },
        changeLayerStyle() {
            let { layerStyle } = this.option;
            let features = this.WFSLayer.getSource().getFeatures();
            if (layerStyle === "点") {
                this.addPointStyle(features);
            }
            if (layerStyle === "线") {
                this.addLineStyle(features);
            }
            if (layerStyle === "面") {
                this.addPolygonStyle(features);
            }
            //消息发布
            let fieled = {};
            Object.keys(features[0].getProperties()).map((key, i) => {
                fieled[key] = key
            })
            PubSub.publish('fieled', fieled)
        },
        changeLayerInterface() {
            let { layerServiceType, layerInterface } = this.option;
            if (layerServiceType === "1") {
                this.WFSSource.setUrl(layerInterface);
                this.WFSSource.refresh();
            }
            if (layerServiceType === "2") {
                console.log(layerInterface)
                this.WMSSource.setUrl(layerInterface);
                this.WMSSource.refresh();
            }
        },

        addWFSLayer() {
            //let { showTexe, polygonColor, borderColor, borderWidth } = this.option;
            let { layerInterface } = this.option;
            this.WFSSource = new VectorSource({
                url: layerInterface,
                format: new GeoJSON(),
            })
            this.WFSLayer = new VectorLayer({
                source: this.WFSSource,
                style: () => {
                    return this.changeLayerStyle();
                },
                name: "WFS",
                zIndex: 2,
            })
            this.map.addLayer(this.WFSLayer);
        },
        addWMSLayer() {
            let { layerInterface } = this.option;
            this.WMSSource = new TileWMS({
                url: layerInterface,
            })
            this.WMSLayer = new TileLayer({
                source: this.WMSSource,
                name: "WMS",
                zIndex: 2,
            })
            this.map.addLayer(this.WMSLayer);
        },
        /**
         * 点样式设置
         */
        addPointStyle(features) {
            let { showTexe, pointStyle, pointColor, pointSize, pointOpacity } = this.option;
            for (let i = 0; i < features.length; i++) {
                let style = new Style({
                    image: new Icon({
                        src: pointStyle,
                        color: pointColor,
                        scale: pointSize,
                        opacity: pointOpacity,
                    }),
                    text: this.createTextStyle(features[i].get(`${showTexe}`)),
                })
                features[i].setStyle(style)
            }
        },
        /**
         * 线样式设置
         */
        addLineStyle(features) {
            let { showTexe, lineColor, lineSize } = this.option;
            for (let i = 0; i < features.length; i++) {
                let style = new Style({
                    stroke: new Stroke({
                        color: lineColor,
                        width: lineSize,
                        lineDash: this.lineDash,
                    }),
                    text: this.createTextStyle(features[i].get(`${showTexe}`)),
                })
                features[i].setStyle(style)
            }
        },
        changeLineStyle() {
            //this.WFSLayer.getStyle().getStroke().setLineDash([20, 10, 20, 10]);
            let { lineStyle } = this.option;
            if (lineStyle === "1") {
                this.lineDash = [0, 0, 0, 0];
            }
            if (lineStyle === "2") {
                this.lineDash = [3, 3, 3, 3];
            }
            if (lineStyle === "3") {
                this.lineDash = [10, 5, 10, 5];
            }
            if (lineStyle === "4") {
                this.lineDash = [5, 5, 5, 5];
            }
            if (lineStyle === "5") {
                this.lineDash = [20, 10, 20, 10];
            }
            if (lineStyle === "6") {
                this.lineDash = [20, 10, 5, 10];
            }
            if (lineStyle === "7") {
                this.lineDash = [0, 0, 0, 0];
            }
            if (lineStyle === "8") {
                this.lineDash = [30, 20, 30, 20];
            }
        },
        changeLineOpacity() {
            let { lineOpacity } = this.option;
            this.WFSLayer.setOpacity(lineOpacity)
        },
        /**
         * 面样式设置
         */
        addPolygonStyle(features) {
            let { showTexe, polygonColor, borderColor, borderWidth } = this.option;
            for (let i = 0; i < features.length; i++) {
                let style = new Style({
                    stroke: new Stroke({
                        color: borderColor,
                        width: borderWidth,
                    }),
                    fill: new Fill({
                        color: polygonColor,
                    }),
                    text: this.createTextStyle(features[i].get(`${showTexe}`)),
                })
                features[i].setStyle(style)
            }
        },
        changePolygonOpacity() {
            let { polygonOpacity } = this.option;
            this.WFSLayer.setOpacity(polygonOpacity)
        },

        /**
         * 标注设置
         */
        createTextStyle(field) {
            let { position, baseline, rotationAngle, typeface, labelColor, fontThickness, labelFontSize, xDeviation, yDeviation, labelOutline, outlineWidth } = this.option;
            let font = fontThickness + ' ' + labelFontSize + 'px' + ' ' + typeface;
            rotationAngle = (rotationAngle * Math.PI) / 180.0
            // font: 'normal 14px 微软雅黑',
            return new Text({
                textAlign: position,//位置                
                textBaseline: baseline,//基准线                
                font: font,//文字样式                   
                text: field,//文本内容                   
                fill: new Fill({//文本填充样式（即文字颜色）   
                    color: labelColor
                }),
                stroke: new Stroke({ //文本外框样式（颜色与宽度） 
                    color: labelOutline,
                    width: outlineWidth
                }),
                offsetX: xDeviation,//偏移量X                    
                offsetY: yDeviation,//偏移量Y  
                rotation: rotationAngle//角度

            })
        },


    },
    mounted() {
        setTimeout(() => {
            this.initMap()
            this.changeBasemapType()
            this.addWMTSLayer()
            this.addMVTLayer()
            this.addTMSLayer()
            this.changeBasemapInterface()
            this.changeMapScale()
            this.changeCenterPoint()
            this.changeWMTSParam()
            this.changeLayerServiceType()
            this.changeLayerStyle()
            this.changeLayerInterface()
            this.addWFSLayer()
            this.addWMSLayer()
            this.addPointStyle(features)
            this.addLineStyle(features)
            this.changeLineStyle()
            this.changeLineOpacity()
            this.addPolygonStyle(features)
            this.changePolygonOpacity()
            this.createTextStyle(field)
        }, 0)
    }
};
</script>

<style scoped>
/deep/.BMap_cpyCtrl {
    display: none;
}

/deep/ .anchorBL {
    display: none;
}

#map {
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
    position: relative;
    background: #1f3064;

}
</style>
