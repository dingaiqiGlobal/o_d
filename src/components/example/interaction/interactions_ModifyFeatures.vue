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

import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import Polygon from 'ol/geom/Polygon';
import Feature from 'ol/Feature';

import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import CircleStyle from 'ol/style/Circle';

import Select from 'ol/interaction/Select';
import Modify from 'ol/interaction/Modify';

export default {
    name: 'Base',
    data() {
        return {
            map: {},
            select: null,
            modify: null,

        };
    },
    mounted() {
        this.map = new Map({
            target: "map",
            layers: [],
            view: new View({
                projection: "EPSG:3857",
                center: olProj.fromLonLat([116.391220, 39.907370]),
                zoom: 11,
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

        /**
        * 绘制的几何图形要素
        */
        let point = olProj.transform([116.359239347, 39.910755218], "EPSG:4326", "EPSG:3857");
        let lineString = new LineString([
            [116.332321636, 39.976605507],
            [116.444453736, 39.915631819]
        ]);
        let polygon = new Polygon([
            [
                [116.393890189, 39.910278031],
                [116.419469395, 39.889160315],
                [116.412033579, 39.872504088],
                [116.372772473, 39.873396386],
                [116.358793139, 39.894216669]
            ]
        ])
        lineString.applyTransform(olProj.getTransform('EPSG:4326', 'EPSG:3857'));
        polygon.applyTransform(olProj.getTransform('EPSG:4326', 'EPSG:3857'));

        let pointFeature = new Feature({
            geometry: new Point(point),
            name: '点要素',
        });
        let lineFeature = new Feature({
            geometry: lineString,
            name: '线要素',
        });
        let polygonFeature = new Feature({
            geometry: polygon,
            name: '面要素',
        })


        /**
         * 实例化点、线、区图层对象
         */
        let vectorLayer = new VectorLayer({
            source: new VectorSource({
                features: [pointFeature, lineFeature, polygonFeature]
            }),
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
        this.map.addLayer(vectorLayer)

        //鼠标样式
        this.map.on("pointermove", (e) => {
            const isHover = this.map.hasFeatureAtPixel(e.pixel);
            this.map.getTargetElement().style.cursor = isHover ? "pointer" : "";
        })

        /**
        * 定义修改几何图形功能控件对象
        */
        this.init();
        this.setActive(true);
    },
    methods: {
        init() {
            this.select = new Select();
            this.map.addInteraction(this.select);

            this.modify = new Modify({
                features: this.select.getFeatures(),
            });
            this.map.addInteraction(this.modify);
            this.setEvent();
        },
        setEvent() {
            let selectFeatures = this.select.getFeatures();
            this.select.on('change:active', () => {
                console.log(selectFeatures)
            })
        },
        setActive(active) {
            this.select.setActive(active);
            this.modify.setActive(active);
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
