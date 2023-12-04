<template>
  <div>
    <div id="map"></div>
    <div class="control"></div>
  </div>
</template>

<script>
import "ol/ol.css";
import { Map, View } from "ol";
import * as olProj from "ol/proj";
import * as olExtent from "ol/extent";
import TileLayer from "ol/layer/Tile";
import WMTS from "ol/source/WMTS";
import WMTSTileGrid from "ol/tilegrid/WMTS";

import axios from "axios";
import X2JS from "x2js";

export default {
  name: "Base",
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
        center: olProj.fromLonLat([116.83112, 40.3705]),
        zoom: 14,
      }),
    });
    //t0~t7
    let url = "https://t0.tianditu.gov.cn/img_w/wmts?tk=21c1e34286caecc25fd94be94bfbe119";
    let proj = "EPSG:900913";
    let level = 18;
    let layerName = "img"; //vec矢量|img影像|cva注记
    let format = "tiles";
    let tileSize = [256, 256];
    let matrixSet = "w"; //w球面墨卡托投影|c经纬度投影

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
    this.getWPS();
    this.postWPS();
  },
  methods: {
    //WPS-Web处理服务
    //Geoserver添加扩展插件geoserver-2.22.0-wps-plugin.zip
    //WPS服务建议使用XML（post）请求，通过GeoServer>演示>WPS请求构建器>构建XML
    //下示例：116.83112 40.3705点的缓冲区分析

    //不建议
    getWPS() {
      axios({
        method: "get",
        url: "http://192.168.201.162:8088/geoserver/ows",
        params: {
          service: "WPS",
          version: "1.0.0",
          request: "Execute",
          identifier: "JTS:buffer",
          datainputs:
            "geom=point(116.83112 40.3705)@mimetype=application/wkt;distance=5;quadrantSegments=1;capStyle=Square",
            
        },
      }).then(function (res) {
        console.log(res); //因为参数中未定义Response Document，RawDataOutput返回xml（看文档）
        //安装x2js，xml与json互转，没什么用
        // const x2js = new X2JS();
        // const jsonObj = x2js.xml2js(res.data);
        // const result =
        //   jsonObj.ExecuteResponse.ProcessOutputs.Output.Data.ComplexData.Polygon.exterior
        //     .LinearRing.posList.__text;
        // console.info(result); //缓冲区结果
      });
    },
    postWPS() {
      axios({
        method: "POST",
        url: "http://192.168.201.162:8088/geoserver/ows",
        //xml字符串注意不能有首尾不能有空格
        //因此，在输入xml格式的参数时，首先需要添加<?xml version="1.0" encoding="UTF-8"?>
        //（注意：这一行必须出现在第一行，并且需要顶格，前面没有任何空格或其他字符），
        //使得输入参数符合xml标准；其次对于转义字符，需要进行改变。
        //![CDATA[point(116.83112 40.3705)]]就是xml转义
        data: `<?xml version="1.0" encoding="UTF-8"?><wps:Execute version="1.0.0" service="WPS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.opengis.net/wps/1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:wcs="http://www.opengis.net/wcs/1.1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd">
  <ows:Identifier>JTS:buffer</ows:Identifier>
  <wps:DataInputs>
    <wps:Input>
      <ows:Identifier>geom</ows:Identifier>
      <wps:Data>
        <wps:ComplexData mimeType="application/wkt"><![CDATA[point(116.83112 40.3705)]]></wps:ComplexData>
      </wps:Data>
    </wps:Input>
    <wps:Input>
      <ows:Identifier>distance</ows:Identifier>
      <wps:Data>
        <wps:LiteralData>5</wps:LiteralData>
      </wps:Data>
    </wps:Input>
    <wps:Input>
      <ows:Identifier>quadrantSegments</ows:Identifier>
      <wps:Data>
        <wps:LiteralData>10</wps:LiteralData>
      </wps:Data>
    </wps:Input>
    <wps:Input>
      <ows:Identifier>capStyle</ows:Identifier>
      <wps:Data>
        <wps:LiteralData>Round</wps:LiteralData>
      </wps:Data>
    </wps:Input>
  </wps:DataInputs>
  <wps:ResponseForm>
    <wps:RawDataOutput mimeType="application/json">
      <ows:Identifier>result</ows:Identifier>
    </wps:RawDataOutput>
  </wps:ResponseForm>
</wps:Execute>`,
        headers: {
          "content-type": "application/xml",
        },
      }).then((res) => {
        console.log(res.data);
      });
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
