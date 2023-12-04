<template>
    <div>
        <div id="map"></div>
        <div class="control">
            <button @click="addInteraction">绘制多边形</button>
            <button @click="deleteFeatures">删除多边形</button>
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
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';

import Draw from 'ol/interaction/Draw';
import Select from 'ol/interaction/Select';
import { click } from 'ol/events/condition';
import Modify from 'ol/interaction/Modify';
import WFS from 'ol/format/WFS';
import Feature from 'ol/Feature';
import MultiPolygon from 'ol/geom/MultiPolygon';

export default {
    name: 'Base',
    data() {
        return {
            map: {},
            vectorLayer: null,
            selectFeature: null,
        };
    },
    mounted() {
        /**
         * 问题汇总
         * transaction操作看似简单，但是稍有不慎，可能就会更新失败。可以根据返回的信息来定位问题
         * 
         * 1、操作返回 **is read-only，
         * 这个系geoserver权限问题，可以打开geoserver页面，导航到Security-data，然后添加规则，设置对应数据的write权限
         * 
         * 2、操作返回No such property: geometry
         * 这个前面以前提到，可以几何字段的字段名，使前后台匹配
         * 
         * 3、操作返回Error performing insert: Error inserting features
         * 这个情况比较特殊，有可能是一些属性值不允许插入。比如数据表的某个字段添加了唯一约束，
         * 这时再往这个字段写入重复值，将引发以上错误
         */


        //也可以采用GeoServer rest API 
        this.map = new Map({
            target: "map",
            layers: [],
            view: new View({
                projection: "EPSG:3857",
                center: olProj.fromLonLat([116.831120, 40.370500]),
                zoom: 14,
            }),
        });
        //t0~t7  添加天地图底图
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

        //添加矢量图层
        this.vectorSource = new VectorSource({
            format: new GeoJSON(),
            url: "http://192.168.201.162:8088/geoserver/zhjy/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=zhjy%3Apolygon_miyun&maxFeatures=5000&outputFormat=application%2Fjson",
        });
        let vectorLayer = new VectorLayer({
            source: this.vectorSource,
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

        //改变鼠标样式
        this.map.on("pointermove", (e) => {
            const isHover = this.map.hasFeatureAtPixel(e.pixel);
            this.map.getTargetElement().style.cursor = isHover ? "pointer" : "";
        })

        //Select
        let select = new Select({
            condition: click,
            style: (feature) => {
                return new Style({
                    fill: new Fill({
                        color: 'yellow'
                    }),
                    stroke: new Stroke({
                        color: 'black',
                        width: 5
                    }),
                })
            }
        });
        this.map.addInteraction(select);
        //选中要素
        select.on('select', (e) => {
            let features = e.target.getFeatures().getArray();
            if (features.length > 0) {
                let feature = features[0];//选中要素
                this.selectFeature = feature
            }
        })

        //修改要素
        let modify = new Modify({
            features: select.getFeatures()
        })
        this.map.addInteraction(modify);
        modify.on('modifyend', () => {
            this.selectFeature.set('NAME', 'test')
            this.selectFeature.setGeometryName("the_geom");
            //updateFeatures(selectFeature);
            // setTimeout(() => {//相当于刷新-重要
            //     this.vectorSource.clear();
            //     queryWfs();
            // }, 100);
        })


    },
    methods: {
        WFSTransaction(inserts, updates, deletes) {
            let WFSTSerializer = new WFS()
            let featObject = WFSTSerializer.writeTransaction(inserts, updates, deletes, {
                featurePrefix: "zhjy",//工作空间名称
                featureNS: "www.zhjy.com",//工作空间 URI
                featureType: "polygon_miyun",//图层名称
                srsName: "EPSG:3857",
            })
            //xml序列化
            let serializer = new XMLSerializer();
            let featString = serializer.serializeToString(featObject)
            return fetch("http://192.168.201.162:8088/geoserver/zhjy/ows?", {
                method: 'POST',
                body: featString
            }).then((res) => {
                return res.json()
            }).catch((e) => {
                console.log('addFeature error', e)
            })
        },
        addInteraction() {
            let draw = new Draw({
                source: this.vectorSource,
                type: "Polygon",
                //freehand: true,//手绘
            })
            this.map.addInteraction(draw);
            draw.on('drawend', (e) => {
                this.map.removeInteraction(draw);
                this.insertFeature(e.feature)
            })
        },

        //插入要素
        insertFeature(feature) {
            let features = new Feature({
                //设置加入属性也可以用set方法
                the_geom: new MultiPolygon([feature.getGeometry().getCoordinates()]),//多面，postgresql:geom;shp:the_geom
                NAME: "test",
            });
            this.WFSTransaction([features], null, null)
        },
        //修改要素
        updateFeatures(features) {
            this.WFSTransaction(null, [features], null)
        },
        //删除要素
        deleteFeatures(features) {
            this.WFSTransaction(null, null, [features])
            this.vectorSource.removeFeature(this.selectFeature);
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
