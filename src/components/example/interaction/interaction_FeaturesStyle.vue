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

import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';

import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import CircleStyle from 'ol/style/Circle';
import Text from 'ol/style/Text';



import * as dat from 'dat.gui';


export default {
    name: 'Base',
    data() {
        return {
            map: {},
            vectorPoints: null,
            gui: null,
            point: {
                points_size: 40,
                points_fill_color: '#f70e31',
                points_stroke_color: '#ffae23',
                points_stroke_width: 2,
                points_text_align: 'center',
                points_text_baseline: 'middle',
                points_text_rotation: '0',
                points_text_font: 'serif',
                points_text_weight: 'normal',
                points_text_size: 20,
                points_text_offset_x: 0,
                points_text_offset_y: 0,
                points_text_color: '#f70e31',
                points_text_outline_color: '#ffffff',
                points_text_outline_width: 1,
            },
        };
    },
    mounted() {
        //GUI
        this.gui = new dat.GUI();
        this.gui.domElement.style = 'position:absolute;top:10px;left:10px';
        //点(线面同理)
        const pointStyle = this.gui.addFolder('点要素样式');
        //图形样式
        const pointStyleGeom = pointStyle.addFolder('图形样式');
        pointStyleGeom.add(this.point, 'points_size',).min(1).max(100).step(1).name('点大小(radius)').onChange((value) => {
            this.createPointStyle()
        })
        pointStyleGeom.addColor(this.point, 'points_fill_color',).name('填充颜色(color)').onChange((value) => {
            this.createPointStyle()
        })
        pointStyleGeom.addColor(this.point, 'points_stroke_color',).name('边框样式(color)').onChange((value) => {
            this.createPointStyle()
        })
        pointStyleGeom.add(this.point, 'points_stroke_width',).name('边框宽度(width)').onChange((value) => {
            this.createPointStyle()
        })
        //文字样式
        const pointStyleText = pointStyle.addFolder('文字样式');
        pointStyleText.add(this.point, 'points_text_align', ['center', 'end', 'left', 'right', 'start']).name('位置(align)').onChange((value) => {
            this.createPointStyle()
        })
        pointStyleText.add(this.point, 'points_text_baseline', ['alphabetic', 'bottom', 'hanging', 'ideographic', 'middle', 'top']).name('基线(baseline)').onChange((value) => {
            this.createPointStyle()
        })
        pointStyleText.add(this.point, 'points_text_rotation', ['0', '45', '90',]).name('旋转角度(rotation)').onChange((value) => {
            this.createPointStyle()
        })
        pointStyleText.add(this.point, 'points_text_font', ['serif', 'Cursive',  'Fantasy']).name('字体(font)').onChange((value) => {
            this.createPointStyle()
        })
        pointStyleText.add(this.point, 'points_text_weight', ['bold', 'normal']).name('字体粗细(weight)').onChange((value) => {
            this.createPointStyle()
        })
        pointStyleText.add(this.point, 'points_text_size').name('字体大小(size)').onChange((value) => {
            this.createPointStyle()
        })
        pointStyleText.add(this.point, 'points_text_offset_x').name('X偏移量(offset x)').onChange((value) => {
            this.createPointStyle()
        })
        pointStyleText.add(this.point, 'points_text_offset_y').name('Y偏移量(offset y)').onChange((value) => {
            this.createPointStyle()
        })
        pointStyleText.addColor(this.point, 'points_text_color').name('字体颜色(color)').onChange((value) => {
            this.createPointStyle()
        })
        pointStyleText.addColor(this.point, 'points_text_outline_color').name('文字外框颜色').onChange((value) => {
            this.createPointStyle()
        })
        pointStyleText.add(this.point, 'points_text_outline_width').name('文字外框宽度').onChange((value) => {
            this.createPointStyle()
        })

        pointStyle.open()
        pointStyleGeom.open()
        pointStyleText.open()




        /**
         * 底图
         */
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

        //添加图层
        let point = olProj.transform([116.831120, 40.370500], "EPSG:4326", "EPSG:3857");

        let pointFeature = new Feature({
            name: '点要素',
            geometry: new Point(point),
        });
        this.vectorPoints = new VectorLayer({
            source: new VectorSource({
                features: [pointFeature]
            }),
            style: () => {
                return this.createPointStyle();
            },

        });
        this.map.addLayer(this.vectorPoints)

        //鼠标样式
        this.map.on("pointermove", (e) => {
            const isHover = this.map.hasFeatureAtPixel(e.pixel);
            this.map.getTargetElement().style.cursor = isHover ? "pointer" : "";
        })



    },
    beforeDestroy() {
        this.gui.destroy();
    },
    methods: {
        createPointStyle() {
            let features = this.vectorPoints.getSource().getFeatures();
            let {
                points_size,
                points_fill_color,
                points_stroke_color,
                points_stroke_width
            } = this.point;
            for (let i = 0; i < features.length; i++) {
                let style = new Style({
                    image: new CircleStyle({
                        radius: points_size,
                        fill: new Fill({ color: points_fill_color }),
                        stroke: new Stroke({ color: points_stroke_color, width: points_stroke_width })
                    }),
                    text: this.createTextStyle(features[i].get('name'))
                })
                features[i].setStyle(style)
            }
        },
        createTextStyle(field) {
            let {
                points_text_align,
                points_text_baseline,
                points_text_rotation,
                points_text_font,
                points_text_weight,
                points_text_size,
                points_text_offset_x,
                points_text_offset_y,
                points_text_color,
                points_text_outline_color,
                points_text_outline_width,
            } = this.point;

            let align = points_text_align;
            let baseline = points_text_baseline;
            let size = points_text_size;
            let offsetX = parseInt(points_text_offset_x, 10);
            let offsetY = parseInt(points_text_offset_y, 10);
            let weight = points_text_weight;
            let rotation = (points_text_rotation * Math.PI) / 180.0;
            let font = `${weight} ${size}px ${points_text_font}`;
            let fillColor = points_text_color;
            let outlineColor = points_text_outline_color;
            let outlineWidth = parseInt(points_text_outline_width, 10);
            return new Text({
                textAlign: align,
                textBaseline: baseline,
                font: font,
                text: field,
                fill: new Fill({ color: fillColor }),
                stroke: new Stroke({ color: outlineColor, width: outlineWidth }),
                offsetX: offsetX,
                offsetY: offsetY,
                rotation: rotation
            });
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
</style>
