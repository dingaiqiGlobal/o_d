<template>
    <div>
        <div id="map"></div>
        <div class="control">
            <div ref="infoBox"></div>
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

import Select from 'ol/interaction/Select';
import DragBox from 'ol/interaction/DragBox';//框选
import { platformModifierKeyOnly } from 'ol/events/condition';
import Translate from 'ol/interaction/Translate';//移动


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
        this.map.addLayer(TDTLayer);

        const vectorSource = new VectorSource({
            format: new GeoJSON(),
            url: "http://192.168.201.162:8088/geoserver/zhjy/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=zhjy%3Apolygon_beijing&maxFeatures=50000&outputFormat=application%2Fjson",
        });
        const vectorLayer = new VectorLayer({
            source: vectorSource,
            style: new Style({
                stroke: new Stroke({
                    color: "#cc3333",
                    width: 2,
                }),
                fill: new Fill({
                    color: 'rgba(14, 249, 230, 0.3)',
                }),
            }),
        });
        this.map.addLayer(vectorLayer);

        //鼠标状态
        this.map.on('pointermove', (e) => {
            var hit = this.map.hasFeatureAtPixel(e.pixel);
            this.map.getTargetElement().style.cursor = hit ? 'pointer' : '';
        });

        //选中样式
        const selectedStyle = new Style({
            fill: new Fill({
                color: 'rgba(255, 255, 255, 0.6)',
            }),
            stroke: new Stroke({
                color: 'rgba(255, 255, 255, 0.7)',
                width: 2,
            }),
        });
        /**
         * 框选移动feature
         */
        const select = new Select({
            style: (feature) => {
                const color = feature.get('COLOR') || '#eeeeee';//获取属性中的颜色
                selectedStyle.getFill().setColor(color);
                return selectedStyle;
            },
        });
        this.map.addInteraction(select);
        const selectedFeatures = select.getFeatures();
        //框选
        const dragBox = new DragBox({
            condition: platformModifierKeyOnly,
            //如果只按了平台修改键(ctrl键)返回true，否则返回false(例如，当另外按了shift键时)
        });
        this.map.addInteraction(dragBox);
        //框选结束
        dragBox.on('boxend',  ()=> {
            const extent = dragBox.getGeometry().getExtent();
            //相交
            const boxFeatures = vectorSource
                .getFeaturesInExtent(extent)
                .filter((feature) => feature.getGeometry().intersectsExtent(extent));
            ///如果视图没有倾斜旋转，那么盒子的几何形状和它的范围是相等的，所以相交的特征可以直接添加到集合中
            const rotation = this.map.getView().getRotation();
            const oblique = rotation % (Math.PI / 2) !== 0;
            //当视图倾斜旋转时，盒子的范围将超过其几何形状，
            //因此盒子和候选特征几何形状都围绕一个共同的锚旋转，
            //以确认盒子几何形状与其范围对齐时，几何形状相交
            if (oblique) {
                const anchor = [0, 0];
                const geometry = dragBox.getGeometry().clone();
                geometry.rotate(-rotation, anchor);
                const extent = geometry.getExtent();
                boxFeatures.forEach(function (feature) {
                    const geometry = feature.getGeometry().clone();
                    geometry.rotate(-rotation, anchor);
                    if (geometry.intersectsExtent(extent)) {
                        selectedFeatures.push(feature);
                    }
                });
            } else {
                selectedFeatures.extend(boxFeatures);
            }
        });
        //清除
        dragBox.on('boxstart', function () {
            selectedFeatures.clear();
        });
        selectedFeatures.on(['add', 'remove'], () =>{
            const names = selectedFeatures.getArray().map( (feature)=> {
                return feature.get('NAME');
            });
            if (names.length > 0) {
                this.$refs.infoBox.innerHTML = names.join(', ');
            } else {
                this.$refs.infoBox.innerHTML = '选择为空';
            }
        });

        /**
         * 移动要素（事件另外写）
         */
        const translate = new Translate({
            features: select.getFeatures(),
        });
        this.map.addInteraction(translate);

    },
    methods: {

    }
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
