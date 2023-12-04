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

import { apply, applyStyle, stylefunction, setFeatureState } from 'ol-mapbox-style';

import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON.js';

import VectorTileLayer from 'ol/layer/VectorTile'
import VectorTile from 'ol/source/VectorTile';
import MVT from 'ol/format/MVT';

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
                zoom: 2,
            }),
        });

        /**
         * 加载maxbox矢量样式的插件（注意是样式style）
         * 个人理解：
         * apply直接调用封装的矢量切片底图或者图层的style（当然也可以通过apply方法直接添加图层，不用单独添加图层再applyStyle）
         * applyStyle直接调用style文件，因为style文件中已经有source源了
         * stylefunction函数形式调用mapbox中的style
         * 
         * 更多使用-参考github中ol-mapbox-style中的examples
         */

        //例子1：下面的代码创建了一个OpenLayers地图从Mapbox的v9样式
        //apply('map', 'https://api.mapbox.com/styles/v1/mapbox/bright-v9?access_token=pk.eyJ1Ijoic2tiZXlvbmQiLCJhIjoiY2s5MmU1Y2RiMDR4aTNtcDh0MmgwaHQzcyJ9._tMktptrxVL-QNN5s2plzg');

        //例子2：要为一个图层分配样式和源，使用applyStyle()
        // let layer = new VectorTileLayer({ declutter: true });
        // applyStyle(layer, 'mapbox://styles/mapbox/bright-v9', { accessToken: 'pk.eyJ1Ijoic2tiZXlvbmQiLCJhIjoiY2s5MmU1Y2RiMDR4aTNtcDh0MmgwaHQzcyJ9._tMktptrxVL-QNN5s2plzg' });
        // this.map.addLayer(layer)

        //例子3：要为单个OpenLayers矢量或矢量贴图层创建样式函数，请使用stylefunction模块:
        // const vectorLayer = new VectorLayer({
        //     source: new VectorSource({
        //         format: new GeoJSON(),
        //         url: 'data/integration/states.geojson'
        //     })
        // });
        // fetch('data/integration/states.json').then(function (response) {
        //     response.json().then(function (glStyle) {
        //         //矢量地图url模板与样式文件地址，以及applyStyle第三个参数从GL Style中读取
        //         stylefunction(vectorLayer, glStyle, 'states');
        //     });
        // });
        // this.map.addLayer(vectorLayer)

        //例子4：自定义mapbox底图
        //（1）添加mvt（pbf）
        // let vectorTileLayer = new VectorTileLayer({
        //     source: new VectorTile({
        //         format: new MVT(),
        //         url: 'https://ahocevar.com/geoserver/gwc/service/tms/1.0.0/' +
        //             'ne:ne_10m_admin_0_countries@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf'
        //     }),
        // });
        // this.map.addLayer(vectorTileLayer);

        //(2)同时设置mapbox的style文件(未成功，因为style中的source不成功)
        //这里用maptiler server创建的矢量切片服务（付费软件）
        // let vectorTileLayer = new VectorTileLayer({
        //     source: new VectorTile({
        //         format: new MVT(),
        //         url: 'http://localhost:3650/api/tiles/maptiler-openmaptiles/{z}/{x}/{y}.pbf'
        //     }),
        // });
        // fetch('http://localhost:3650/api/maps/streets/style.json')
        //     .then((response) => response.json())
        //     .then((glStyle) => {
        //         stylefunction(vectorTileLayer, glStyle, 'Streets');
        //     })
        // this.map.addLayer(vectorTileLayer);

        //例子5：点击事件
        const vectorLayer = new VectorLayer({
            source: new VectorSource({
                format: new GeoJSON(),
                url: 'data/integration/states.geojson'
            })
        });
        fetch('data/integration/states.json')
            .then((response) => response.json())
            .then((glStyle) => {
                glStyle.layers.push({
                    'id': 'state-hover',
                    'type': 'fill',
                    'source': 'states',
                    'paint': {
                        'fill-color': 'red',
                        'fill-opacity': [
                            'case',
                            ['boolean', ['feature-state', 'hover'], false],
                            0.5,
                            0,
                        ],
                    },
                });
                return stylefunction(vectorLayer, glStyle, 'states');
            })
            .then(() => {
                let hoveredStateId = null;
                this.map.on('singleclick', (evt) => {
                    const features = this.map.getFeaturesAtPixel(evt.pixel);
                    if (features.length > 0) {
                        if (hoveredStateId !== null) {
                            setFeatureState(vectorLayer, { source: 'states', id: hoveredStateId }, null);
                        }
                        hoveredStateId = features[0].getId();
                        setFeatureState(
                            vectorLayer,
                            { source: 'states', id: hoveredStateId },
                            { hover: true }
                        );
                    } else if (hoveredStateId !== null) {
                        setFeatureState(vectorLayer, { source: 'states', id: hoveredStateId }, null);
                        hoveredStateId = null;
                    }
                });
            });
        this.map.addLayer(vectorLayer)



    },
    methods: {

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
