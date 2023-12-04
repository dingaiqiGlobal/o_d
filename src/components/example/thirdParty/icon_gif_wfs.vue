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

import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import GeoJSON from 'ol/format/GeoJSON';
import { Icon, Style } from 'ol/style';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import gifImag from '../../../../public/images/icon/warn.gif'//canvas的大小与gif图片的分辨率有关系

export default {
    name: 'Base',
    data() {
        return {
            map: {},
            geojsonObject: {
                "type": "FeatureCollection",
                "features": [{
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [116.83189690000006, 40.369736970000076]
                    },
                    "properties": {
                        "NAME": "奥林匹克公园"
                    }
                },
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [116.82691990000001, 40.370471010000074]
                    },
                    "properties": {
                        "NAME": "密云县第二幼儿园"
                    }
                },
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [116.8339820000001, 40.36825602000005]
                    },
                    "properties": {
                        "NAME": "密云县第四幼儿园"
                    }
                },
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [116.82332100000008, 40.367219040000066]
                    },
                    "properties": {
                        "NAME": "首都经贸大学密云分校"
                    }
                },
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [116.82474520000005, 40.372434000000055]
                    },
                    "properties": {
                        "NAME": "密云县果园小学"
                    }
                },
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [116.83731820000003, 40.37267502000003]
                    },
                    "properties": {
                        "NAME": "密云县第一幼儿园"
                    }
                },
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [116.8362608000001, 40.37012100000004]
                    },
                    "properties": {
                        "NAME": "北京密云县第五小学"
                    }
                }
                ]
            }
        };
    },
    mounted() {
        this.map = new Map({
            target: "map",
            layers: [],
            view: new View({
                projection: "EPSG:3857",
                center: olProj.fromLonLat([116.831120, 40.370500]),
                zoom: 15,
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

        this.addGifLayer();
    },
    methods: {
        addGifLayer() {
            const vectorSource = new VectorSource();
            const vectorLayer = new VectorLayer({
                name: 'gifLayer',
                source: vectorSource
            })
            gifler(gifImag).frames(
                document.createElement('canvas'),
                (ctx, frame) => {
                    for (let f of this.geojsonObject.features) {
                        const feature = new Feature({
                            geometry: new Point(
                                olProj.fromLonLat(f.geometry.coordinates)
                            ),
                        });
                        feature.setProperties(f.properties);
                        feature.setStyle(
                            new Style({
                                image: new Icon({
                                    img: ctx.canvas,
                                    imgSize: [frame.width, frame.height],
                                    opacity: this.gifOpacity,
                                }),
                            })
                        );
                        vectorSource.addFeature(feature);
                        ctx.clearRect(0, 0, frame.width, frame.height);
                        ctx.drawImage(frame.buffer, frame.x, frame.y);
                    }
                    this.map.render()
                },
                true
            )
            this.map.addLayer(vectorLayer)
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
