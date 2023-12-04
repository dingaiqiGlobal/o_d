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

import OSMBuildings from '../../../../public/js/OSMBuildings-OL5';

export default {
    name: 'Base',
    data() {
        return {
            map: {},
        };
    },
    mounted() {
        //ol3有完成
        //ol5有bug未解决
        //耗性能不建议使用-https://github.com/kekscom/osmbuildings
        this.map = new Map({
            target: "map",
            layers: [
            ],
            view: new View({
                projection: "EPSG:3857",
                center: olProj.fromLonLat([116.429200, 39.938590]),
                zoom: 15,
            }),
        });
        //测试添加Geojson
        fetch('data/integration/buildings.json')
            .then((response) => response.json())
            .then((response) => {
                //修改了一处源码
                let osmBuildings = new OSMBuildings(this.map);
                osmBuildings.set(response)
            })

        // Building example(在线-翻墙)
        // let osmBuildings = new OSMBuildings(this.map);
        // osmBuildings.date(new Date(2017, 5, 15, 17, 30))
        // osmBuildings.load();
        // osmBuildings.click(function (e) {
        //     let result = osmBuildings.getDataItems().filter(obj => {
        //         return obj.id === e.feature
        //     })
        //     alert("Height (m): " + result[0].realHeight);
        //     //console.log(result);
        // });
    },
    methods: {

    },
};
</script>

<style>

.control {
    position: absolute;
    z-index: 10;
    left: 10px;
    top: 10px;
}
</style>
