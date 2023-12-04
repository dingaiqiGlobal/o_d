<template>
    <div>
        <div id="map"></div>
        <div id="container"></div>
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
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import CircleStyle from 'ol/style/Circle';

import Draw from 'ol/interaction/Draw';
import { createRegularPolygon } from 'ol/interaction/Draw';
import Polygon from 'ol/geom/Polygon';

import * as dat from 'dat.gui';


export default {
    name: 'Base',
    data() {
        return {
            map: {},
            gui: null,
            draw: null,
            source: null,
            vector: null,
            selectType: {
                select: "Point"
            },
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

        //GUI
        this.gui = new dat.GUI();
        this.gui.domElement.style = 'position:absolute;top:10px;left:10px';
        this.gui.add(this.selectType, 'select', {
            "点": "Point",
            "线": "LineString",
            "面": "Polygon",
            "圆": "Circle",
            "正方形": "Square",
            "矩形": "Box",
        }).name('选择类型').onChange((value) => {
            this.selectType.select = value
            this.map.removeInteraction(this.draw);
            this.addInteraction()
        })

        //实例化一个矢量图层Vector作为绘制层
        this.source = new VectorSource();
        this.vector = new VectorLayer({
            source: this.source,
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
        this.map.addLayer(this.vector);
        this.addInteraction()
    },
    beforeDestroy() {
        this.gui.destroy();//源码中的方法
    },
    methods: {
        addInteraction() {
            let value = this.selectType.select;
            //清空绘制图形（先清空在添加）
            if (value !== "None") {
                if (this.source === null) {
                    this.source = new VectorSource();
                    this.vector.setSource(source)
                }
                //通过圆扩展正方形
                let geometryFunction;
                let maxPoints;;
                if (value === 'Square') {
                    value = 'Circle';
                    geometryFunction = createRegularPolygon(4);
                    /**
                     * 特殊方法
                     */
                    // var metersPerUnit = map.getView().getProjection().getMetersPerUnit();
                    // var circleRadius = radius / metersPerUnit;
                    // var circle = new ol.geom.Circle(center, circleRadius);
                    // var polygon = new ol.geom.Polygon.fromCircle(circle);//转换为polygon，用于空间查询
                    // var circleFeature = new ol.Feature({
                    //     geometry: polygon,
                    // });
                }
                //通过线扩展长方形--6版本以后geometryFunction = createBox()就可以创建矩形;
                if (value === 'Box') {
                    value = 'LineString';
                    maxPoints = 2;
                    geometryFunction = (coordinates, geometry) => {
                        let start = coordinates[0];
                        let end = coordinates[1];
                        if (!geometry) {
                            geometry = new Polygon([//面坐标
                                [start, [start[0], end[1]], end, [end[0], start[1]], start]
                            ])
                        }
                        //线坐标
                        geometry.setCoordinates([
                            [start, [start[0], end[1]], end, [end[0], start[1]], start]
                        ]);
                        return geometry;
                    }
                }
                //实例化交互绘制类对象并添加到地图容器中
                this.draw = new Draw({
                    source: this.source,
                    type: value,
                    geometryFunction: geometryFunction,
                    maxPoints: maxPoints,
                })
                this.map.addInteraction(this.draw);

            } else {
                this.source = null;
                this.vector.setSource(source);
            }
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
</style>
