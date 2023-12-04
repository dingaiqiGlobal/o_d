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
import TileLayer from 'ol/layer/Tile';
import WMTS from 'ol/source/WMTS';
import WMTSTileGrid from 'ol/tilegrid/WMTS';

import Feature from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import {
    Circle as CircleStyle,
    Fill,
    Icon,
    Stroke,
    Style,
    Text,
} from 'ol/style';
import { Cluster, Vector as VectorSource } from 'ol/source';
import { LineString, Point, Polygon } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import { createEmpty, extend, getHeight, getWidth, getTopLeft } from 'ol/extent';

import monotoneChainConvexHull from 'monotone-chain-convex-hull';


export default {
    name: 'Base',
    data() {
        return {
            map: {},
            clickFeature: null,
            clickResolution: null,
            hoverFeature: null,
        };
    },
    mounted() {
        this.map = new Map({
            target: "map",
            layers: [],
            view: new View({
                projection: "EPSG:3857",
                center: olProj.fromLonLat([116.831120, 40.370500]),
                zoom: 4,
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
        let size = getWidth(projectionExtent) / 256;
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
                    origin: getTopLeft(projectionExtent),
                    resolutions: resolutions,
                    matrixIds: matrixIds,
                    tileSize: tileSize,
                }),
                zIndex: 1,
            }),
        });
        this.map.addLayer(TDTLayer);

        /**
         * 添加cluster层
         */
        const vectorSource = new VectorSource({
            format: new GeoJSON(),
            url: "http://192.168.201.162:8088/geoserver/zhjy/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=zhjy%3Apoint_china&maxFeatures=50000&outputFormat=application%2Fjson",
        })
        const clusterSource = new Cluster({
            distance: 35,
            source: vectorSource,
        });
        /**
         * 三层
         */
        // 悬停cluster中凸包
        const clusterHulls = new VectorLayer({
            source: clusterSource,
            style: this.clusterHullStyle,
        });
        //显示集群和单个feature
        const clusters = new VectorLayer({
            source: clusterSource,
            style: this.clusterStyle,
        });
        // 重叠集群的展开视图
        const clusterCircles = new VectorLayer({
            source: clusterSource,
            style: this.clusterCircleStyle,
        });

        this.map.addLayer(clusterHulls)
        this.map.addLayer(clusters)
        this.map.addLayer(clusterCircles)

        /**
         * 鼠标悬停事件
         */
        this.map.on('pointermove', (event) => {
            clusters.getFeatures(event.pixel).then((features) => {
                if (features[0] !== this.hoverFeature) {
                    this.hoverFeature = features[0];
                    clusterHulls.setStyle(this.clusterHullStyle);
                    this.map.getTargetElement().style.cursor =
                        this.hoverFeature && this.hoverFeature.get('features').length > 1
                            ? 'pointer'
                            : '';
                }
            });
        });

        /**
         * 鼠标单击事件
         * 点击某个聚合图会放大定位到当前聚合图范围，并且展示包含的图形要素
         */
        this.map.on('click', (event) => {
            clusters.getFeatures(event.pixel).then((features) => {
                if (features.length > 0) {
                    const clusterMembers = features[0].get('features');
                    if (clusterMembers.length > 1) {//成员>1
                        const extent = createEmpty();//createEmpty创建一个空范围
                        //计算集群成员的范围
                        clusterMembers.forEach((feature) =>
                            //extend修改一个区段以包含另一个区段
                            extend(extent, feature.getGeometry().getExtent())
                        );
                        const view = this.map.getView();
                        const resolution = this.map.getView().getResolution();
                        if (
                            view.getZoom() === view.getMaxZoom() ||
                            (getWidth(extent) < resolution && getHeight(extent) < resolution)
                        ) {
                            // 显示集群成员的展开视图(不一定全放开，能包围全部成员即可)
                            clickFeature = features[0];
                            clickResolution = resolution;
                            clusterCircles.setStyle(this.clusterCircleStyle);//样式
                        } else {
                            // 缩放到集群成员的范围
                            view.fit(extent, { duration: 500, padding: [50, 50, 50, 50] });
                        }
                    }
                }
            });
        });
    },
    methods: {
        /**
         * 聚散样式
         */
        clusterStyle(feature) {
            const size = feature.get('features').length;
            if (size > 1) {
                return [
                    new Style({
                        image: new CircleStyle({
                            radius: 20,
                            fill: new Fill({
                                color: 'rgba(255, 153, 102, 0.3)',
                            }),
                        }),
                    }),
                    new Style({
                        image: new CircleStyle({
                            radius: 14,
                            fill: new Fill({
                                color: 'rgba(255, 165, 0, 0.7)',
                            }),
                        }),
                        text: new Text({
                            text: size.toString(),
                            fill: new Fill({
                                color: '#fff',
                            }),
                            stroke: new Stroke({
                                color: 'rgba(0, 0, 0, 0.6)',
                                width: 3,
                            }),
                        }),
                    }),
                ];
            }
            const originalFeature = feature.get('features')[0];//当前feature
            return this.clusterMemberStyle(originalFeature);
        },
        //属性分类图标,属性TYPE>7
        clusterMemberStyle(clusterMember) {
            const darkIcon = new Icon({
                src: 'images/icon/emoticon-cool.svg',
            });
            const lightIcon = new Icon({
                src: 'images/icon/emoticon-cool-outline.svg',
            });
            return new Style({
                geometry: clusterMember.getGeometry(),
                image: clusterMember.get('TYPE') > 7 ? darkIcon : lightIcon,
            });
        },

        /**
         * 在前端领域中，数据的处理和可视化是十分重要的
         * 而计算凸包，即多个点集中围成的最小凸多边形区域
         * 是数据可视化中一项常见的任务
         * 安装：npm i monotone-chain-convex-hull@1.0.0
         * import monotoneChainConvexHull from 'monotone-chain-convex-hull';
         * 使用：
                const result = monotoneChainConvexHull([
                [1, 1],
                [3, 0],
                [2, 1],
                [3, 2],
                [1, 2],
                [0, 2],
                [0, 0],
                ]);

                result is [[0, 0], [0, 2], [3, 2], [3, 0]]
         */
        clusterHullStyle(cluster) {
            if (cluster !== this.hoverFeature) {
                return null;
            }
            const originalFeatures = cluster.get('features');
            const points = originalFeatures.map((feature) =>
                feature.getGeometry().getCoordinates()
            );
            return new Style({
                geometry: new Polygon([monotoneChainConvexHull(points)]),
                fill: new Fill({
                    color: 'rgba(255, 153, 0, 0.4)',
                }),
                stroke: new Stroke({
                    color: 'rgba(204, 85, 0, 1)',
                    width: 1.5,
                }),
            });
        },

        /**
         * 样式用于具有彼此太接近的功能的集群，单击时激活。
         */
        clusterCircleStyle(cluster, resolution) {
            if (cluster !== this.clickFeature || resolution !== this.clickResolution) {
                return null;
            }
            const clusterMembers = cluster.get('features');
            const centerCoordinates = cluster.getGeometry().getCoordinates();
            return this.generatePointsCircle(
                clusterMembers.length,
                cluster.getGeometry().getCoordinates(),
                resolution
            ).reduce((styles, coordinates, i) => {
                //reduce 为数组中的每一个元素依次执行回调函数
                const point = new Point(coordinates);
                const line = new LineString([centerCoordinates, coordinates]);
                styles.unshift(//向开头添加一个元素
                    new Style({
                        geometry: line,
                        stroke: convexHullStroke,
                    })
                );
                styles.push(
                    this.clusterMemberStyle(
                        new Feature({
                            ...clusterMembers[i].getProperties(),
                            geometry: point,
                        })
                    )
                );
                return styles;
            }, []);
        },
        //生成点圆形
        //在集群中心周围布置点，用一条线从中心指向每个点
        generatePointsCircle(count, clusterCenter, resolution) {
            const circleDistanceMultiplier = 1;//倍数
            const circleFootSeparation = 28;//圆脚分离
            const circleStartAngle = Math.PI / 2;//开始角度

            const circumference = circleDistanceMultiplier * circleFootSeparation * (2 + count);//周长
            let legLength = circumference / (Math.PI * 2);//半径
            const angleStep = (Math.PI * 2) / count;//角步
            const res = [];
            let angle;
            //到达集群图标外的最小距离
            legLength = Math.max(legLength, 35) * resolution;

            for (let i = 0; i < count; ++i) {
                angle = circleStartAngle + i * angleStep;
                res.push([
                    clusterCenter[0] + legLength * Math.cos(angle),
                    clusterCenter[1] + legLength * Math.sin(angle),
                ]);
            }
            return res;
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
