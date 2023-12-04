<template>
    <div>
        <div id="map"></div>
        <div class="control">
            <button @click="spaceFilter">空间过滤条件</button>
            <button @click="attributesFilter">属性过滤条件</button>
            <button @click="removeFilter">移除过滤</button>
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

import TileWMS from 'ol/source/TileWMS';
import Polygon from 'ol/geom/Polygon';
import WKT from 'ol/format/WKT';

export default {
    name: 'Base',
    data() {
        return {
            map: {},
            wmsSource: null,
        };
    },
    mounted() {
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

        //添加wms
        this.wmsSource = new TileWMS({
            url: "http://192.168.201.162:8088/geoserver/wms",
            params: { LAYERS: "zhjy:point_miyun", TILED: true },
            serverType: "geoserver",
        });
        let wmsLayer = new TileLayer({
            source: this.wmsSource
        });
        this.map.addLayer(wmsLayer);


    },
    methods: {
        /**
         * CQL_Filter//也可作为空间查询
         * 比较运算符的完整列表是：=，<>，>，> =，<，<=
         * 要选择一个范围值，可以使用BETWEEN运算符：BETWEEN 1000000 AND 3000000
         * LIKE、IN等
         * 空间：EQUALS，DISJOINT，INTERSECTS，TOUCHES，CROSSES，WITHIN，CONTAINS，OVERLAPS，RELATE，DWITHIN，BEYOND。 
        */
        spaceFilter() {
            this.removeFilter();
            let polygon = new Polygon([
                [
                    [116.820500, 40.377020],
                    [116.820290, 40.366300],
                    [116.820290, 40.366300],
                    [116.839860, 40.374670],
                    [116.820500, 40.377020],
                ]
            ]);
            const filterPolygon = new WKT().writeGeometry(polygon);
            this.wmsSource.updateParams({
                CQL_FILTER: `INTERSECTS(the_geom,${filterPolygon})`
            })
        },
        attributesFilter() {
            this.removeFilter();
            let str = "NAME LIKE '%幼儿园%'";
            this.wmsSource.updateParams({
                CQL_FILTER: str
            });
        },
        removeFilter() {
            this.wmsSource.updateParams({
                CQL_FILTER: null
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

.control {
    position: absolute;
    z-index: 10;
    left: 10px;
    top: 10px;
}
</style>
