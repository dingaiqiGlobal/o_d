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

import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import Style from "ol/style/Style";
import CircleStyle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Polygon from "ol/geom/Polygon";
import GeoJSON from "ol/format/GeoJSON";
import * as turf from "@turf/turf";

import kriging from "@sakitam-gis/kriging";
import ImageLayer from "ol/layer/Image";
import ImageCanvasSource from "ol/source/ImageCanvas";

export default {
  name: "Base",
  data() {
    return {
      map: {},
      canvasLayer: null,
      //kriging.js 插值需要插值点，包括点坐标以及插值权重字段值，还需要插值范围边界，
      //这里的模拟插值点以及插值边界分别存储在 point 以及 world 文件。
      //TN_为权重
      world: [
        [
          [116.818156, 40.388326],
          [116.829518, 40.387564],
          [116.859548, 40.387534],
          [116.8598099, 40.37419503],
          [116.847504, 40.36952601],
          [116.836503, 40.368281],
          [116.8188941, 40.36633596],
          [116.8112261, 40.36385997],
          [116.799242, 40.35813498],
          [116.799027, 40.366003],
          [116.818156, 40.388326],
        ],
      ],
      points: [
        {
          attributes: {
            FID: 0,
            NAME: "滨河公园",
            TN_: 22.3,
          },
          geometry: {
            x: 116.8374089,
            y: 40.38231204,
          },
        },
        {
          attributes: {
            FID: 1,
            NAME: "密虹公园",
            TN_: 24.6,
          },
          geometry: {
            x: 116.8287638,
            y: 40.37366304,
          },
        },
        {
          attributes: {
            FID: 2,
            NAME: "奥林匹克公园",
            TN_: 25.6,
          },
          geometry: {
            x: 116.8318969,
            y: 40.36973697,
          },
        },
        {
          attributes: {
            FID: 3,
            NAME: "密西公园",
            TN_: 22.1,
          },
          geometry: {
            x: 116.8411291,
            y: 40.38740397,
          },
        },
        {
          attributes: {
            FID: 4,
            NAME: "玉兰公园",
            TN_: 21.3,
          },
          geometry: {
            x: 116.845097,
            y: 40.37991201,
          },
        },
        {
          attributes: {
            FID: 5,
            NAME: "阳光公园",
            TN_: 21.8,
          },
          geometry: {
            x: 116.8395289,
            y: 40.37462703,
          },
        },
        {
          attributes: {
            FID: 6,
            NAME: "时光公园",
            TN_: 22.6,
          },
          geometry: {
            x: 116.839301,
            y: 40.38055596,
          },
        },
        {
          attributes: {
            FID: 7,
            NAME: "法制公园",
            TN_: 25.3,
          },
          geometry: {
            x: 116.856932,
            y: 40.38309999,
          },
        },
        {
          attributes: {
            FID: 8,
            NAME: "密云县第二幼儿园",
            TN_: 23.5,
          },
          geometry: {
            x: 116.8269199,
            y: 40.37047101,
          },
        },
        {
          attributes: {
            FID: 9,
            NAME: "唐庄小学幼儿园",
            TN_: 24.1,
          },
          geometry: {
            x: 116.8280831,
            y: 40.38509601,
          },
        },
        {
          attributes: {
            FID: 10,
            NAME: "密云六中",
            TN_: 20.1,
          },
          geometry: {
            x: 116.8151242,
            y: 40.37265801,
          },
        },
        {
          attributes: {
            FID: 11,
            NAME: "密云县第四幼儿园",
            TN_: 24.1,
          },
          geometry: {
            x: 116.833982,
            y: 40.36825602,
          },
        },
        {
          attributes: {
            FID: 12,
            NAME: "首都经贸大学密云分校",
            TN_: 23.3,
          },
          geometry: {
            x: 116.823321,
            y: 40.36721904,
          },
        },
        {
          attributes: {
            FID: 13,
            NAME: "密云县果园小学",
            TN_: 25.6,
          },
          geometry: {
            x: 116.8247452,
            y: 40.372434,
          },
        },
        {
          attributes: {
            FID: 14,
            NAME: "密云第二小学",
            TN_: 20.1,
          },
          geometry: {
            x: 116.8416821,
            y: 40.37126004,
          },
        },
        {
          attributes: {
            FID: 15,
            NAME: "首都师范大学附属密云中学",
            TN_: 23.3,
          },
          geometry: {
            x: 116.813475,
            y: 40.37057604,
          },
        },
        {
          attributes: {
            FID: 16,
            NAME: "密云县第六小学",
            TN_: 24.8,
          },
          geometry: {
            x: 116.813412,
            y: 40.37027103,
          },
        },
        {
          attributes: {
            FID: 17,
            NAME: "密云第一小学",
            TN_: 23.5,
          },
          geometry: {
            x: 116.8498372,
            y: 40.37822199,
          },
        },
        {
          attributes: {
            FID: 18,
            NAME: "密云县第五中学",
            TN_: 27.1,
          },
          geometry: {
            x: 116.8567898,
            y: 40.38460398,
          },
        },
        {
          attributes: {
            FID: 19,
            NAME: "北京市密云县第二中学",
            TN_: 24.6,
          },
          geometry: {
            x: 116.8411219,
            y: 40.37754996,
          },
        },
        {
          attributes: {
            FID: 20,
            NAME: "密云县第三小学",
            TN_: 26.5,
          },
          geometry: {
            x: 116.8431149,
            y: 40.37759397,
          },
        },
        {
          attributes: {
            FID: 21,
            NAME: "密云第三幼儿园",
            TN_: 22.3,
          },
          geometry: {
            x: 116.8147559,
            y: 40.36706496,
          },
        },
        {
          attributes: {
            FID: 22,
            NAME: "密云县第一幼儿园",
            TN_: 20.3,
          },
          geometry: {
            x: 116.8373182,
            y: 40.37267502,
          },
        },
        {
          attributes: {
            FID: 23,
            NAME: "育新幼儿园",
            TN_: 26.1,
          },
          geometry: {
            x: 116.8280618,
            y: 40.37401701,
          },
        },
        {
          attributes: {
            FID: 24,
            NAME: "北京密云蓝天幼儿园",
            TN_: 23.5,
          },
          geometry: {
            x: 116.844817,
            y: 40.38193503,
          },
        },
        {
          attributes: {
            FID: 25,
            NAME: "信远阳光幼儿园",
            TN_: 23.3,
          },
          geometry: {
            x: 116.828203,
            y: 40.374369,
          },
        },
        {
          attributes: {
            FID: 26,
            NAME: "北京密云县第五小学",
            TN_: 22.1,
          },
          geometry: {
            x: 116.8362608,
            y: 40.370121,
          },
        },
        {
          attributes: {
            FID: 27,
            NAME: "密云县职业学校",
            TN_: 26.3,
          },
          geometry: {
            x: 116.820751,
            y: 40.38569802,
          },
        },
        {
          attributes: {
            FID: 28,
            NAME: "北京市密云汇佳幼儿园",
            TN_: 23.5,
          },
          geometry: {
            x: 116.809195,
            y: 40.36641903,
          },
        },
        {
          attributes: {
            FID: 29,
            NAME: "天使国际幼儿园",
            TN_: 27.1,
          },
          geometry: {
            x: 116.804686,
            y: 40.36544901,
          },
        },
        {
          attributes: {
            FID: 30,
            NAME: "北京市密云县第三中学",
            TN_: 23.3,
          },
          geometry: {
            x: 116.8491989,
            y: 40.37876298,
          },
        },
        {
          attributes: {
            FID: 31,
            NAME: "密云县第四小学",
            TN_: 20.1,
          },
          geometry: {
            x: 116.8557689,
            y: 40.38102,
          },
        },
        {
          attributes: {
            FID: 32,
            NAME: "密云第五幼儿园",
            TN_: 20.6,
          },
          geometry: {
            x: 116.854312,
            y: 40.37865399,
          },
        },
      ],
    };
  },
  mounted() {
    this.map = new Map({
      target: "map",
      layers: [],
      view: new View({
        projection: "EPSG:4326",
        center: [116.83112, 40.3705],
        zoom: 14,
      }),
    });
    this.addKrigingLayer();
  },
  methods: {
    addKrigingLayer() {
      let n = this.points.length;
      let t = Array(n);
      let x = Array(n);
      let y = Array(n);

      /**
       * 添加点图层
       */
      let pointSource = new VectorSource();
      for (let i = 0; i < n; i++) {
        t[i] = this.points[i].attributes.TN_;
        x[i] = this.points[i].geometry.x;
        y[i] = this.points[i].geometry.y;
        var featurePoint = new Feature({
          geometry: new Point(olProj.transform([x[i], y[i]], "EPSG:4326", "EPSG:4326")),
          value: t[i],
        });
        featurePoint.setStyle(
          new Style({
            image: new CircleStyle({
              radius: 6,
              fill: new Fill({ color: "#00F" }),
            }),
          })
        );
        pointSource.addFeature(featurePoint);
      }
      let pointLayer = new VectorLayer();
      pointLayer.setSource(pointSource);
      this.map.addLayer(pointLayer);

      /**
       * 添加面图层
       */
      let polygon = turf.polygon(this.world); //使用turf转换
      let polygonSource = new VectorSource({
        features: new GeoJSON().readFeatures(polygon),
      });
      let polygonfeatures = polygonSource.getFeatures();
      for (var i = 0; i < polygonfeatures.length; i++) {
        //坐标转换
        polygonfeatures[i].getGeometry().transform("EPSG:4326", "EPSG:4326");
      }
      let polygonLayer = new VectorLayer({
        source: polygonSource,
        style: new Style({
          stroke: new Stroke({
            color: "blue",
            lineDash: [4],
            width: 3,
          }),
          fill: new Fill({
            color: "rgba(0, 0, 255, 0)",
          }),
        }),
      });
      this.map.addLayer(polygonLayer);

      /**
       *kriging插值图
       */
      let params = {
        krigingModel: "exponential", //model还可选'gaussian','spherical'
        krigingSigma2: 0,
        krigingAlpha: 100,
        canvasAlpha: 0.9, //canvas图层透明度
        colors: [
          "#00A600",
          "#01A600",
          "#03A700",
          "#04A700",
          "#05A800",
          "#07A800",
          "#08A900",
          "#09A900",
          "#0BAA00",
          "#0CAA00",
          "#0DAB00",
          "#0FAB00",
          "#10AC00",
          "#12AC00",
          "#13AD00",
          "#14AD00",
          "#16AE00",
          "#17AE00",
          "#19AF00",
          "#1AAF00",
          "#1CB000",
          "#1DB000",
          "#1FB100",
          "#20B100",
          "#22B200",
          "#23B200",
          "#25B300",
          "#26B300",
          "#28B400",
          "#29B400",
          "#2BB500",
          "#2CB500",
          "#2EB600",
          "#2FB600",
          "#31B700",
          "#33B700",
          "#34B800",
          "#36B800",
          "#37B900",
          "#39B900",
          "#3BBA00",
          "#3CBA00",
          "#3EBB00",
          "#3FBB00",
          "#41BC00",
          "#43BC00",
          "#44BD00",
          "#46BD00",
          "#48BE00",
          "#49BE00",
          "#4BBF00",
          "#4DBF00",
          "#4FC000",
          "#50C000",
          "#52C100",
          "#54C100",
          "#55C200",
          "#57C200",
          "#59C300",
          "#5BC300",
          "#5DC400",
          "#5EC400",
          "#60C500",
          "#62C500",
          "#64C600",
          "#66C600",
          "#67C700",
          "#69C700",
          "#6BC800",
          "#6DC800",
          "#6FC900",
          "#71C900",
          "#72CA00",
          "#74CA00",
          "#76CB00",
          "#78CB00",
          "#7ACC00",
          "#7CCC00",
          "#7ECD00",
          "#80CD00",
          "#82CE00",
          "#84CE00",
          "#86CF00",
          "#88CF00",
          "#8AD000",
          "#8BD000",
          "#8DD100",
          "#8FD100",
          "#91D200",
          "#93D200",
          "#95D300",
          "#97D300",
          "#9AD400",
          "#9CD400",
          "#9ED500",
          "#A0D500",
          "#A2D600",
          "#A4D600",
          "#A6D700",
          "#A8D700",
          "#AAD800",
          "#ACD800",
          "#AED900",
          "#B0D900",
          "#B2DA00",
          "#B5DA00",
          "#B7DB00",
          "#B9DB00",
          "#BBDC00",
          "#BDDC00",
          "#BFDD00",
          "#C2DD00",
          "#C4DE00",
          "#C6DE00",
          "#C8DF00",
          "#CADF00",
          "#CDE000",
          "#CFE000",
          "#D1E100",
          "#D3E100",
          "#D6E200",
          "#D8E200",
          "#DAE300",
          "#DCE300",
          "#DFE400",
          "#E1E400",
          "#E3E500",
          "#E6E600",
          "#E6E402",
          "#E6E204",
          "#E6E105",
          "#E6DF07",
          "#E6DD09",
          "#E6DC0B",
          "#E6DA0D",
          "#E6D90E",
          "#E6D710",
          "#E6D612",
          "#E7D414",
          "#E7D316",
          "#E7D217",
          "#E7D019",
          "#E7CF1B",
          "#E7CE1D",
          "#E7CD1F",
          "#E7CB21",
          "#E7CA22",
          "#E7C924",
          "#E8C826",
          "#E8C728",
          "#E8C62A",
          "#E8C52B",
          "#E8C42D",
          "#E8C32F",
          "#E8C231",
          "#E8C133",
          "#E8C035",
          "#E8BF36",
          "#E9BE38",
          "#E9BD3A",
          "#E9BC3C",
          "#E9BB3E",
          "#E9BB40",
          "#E9BA42",
          "#E9B943",
          "#E9B945",
          "#E9B847",
          "#E9B749",
          "#EAB74B",
          "#EAB64D",
          "#EAB64F",
          "#EAB550",
          "#EAB552",
          "#EAB454",
          "#EAB456",
          "#EAB358",
          "#EAB35A",
          "#EAB35C",
          "#EBB25D",
          "#EBB25F",
          "#EBB261",
          "#EBB263",
          "#EBB165",
          "#EBB167",
          "#EBB169",
          "#EBB16B",
          "#EBB16C",
          "#EBB16E",
          "#ECB170",
          "#ECB172",
          "#ECB174",
          "#ECB176",
          "#ECB178",
          "#ECB17A",
          "#ECB17C",
          "#ECB17E",
          "#ECB27F",
          "#ECB281",
          "#EDB283",
          "#EDB285",
          "#EDB387",
          "#EDB389",
          "#EDB38B",
          "#EDB48D",
          "#EDB48F",
          "#EDB591",
          "#EDB593",
          "#EDB694",
          "#EEB696",
          "#EEB798",
          "#EEB89A",
          "#EEB89C",
          "#EEB99E",
          "#EEBAA0",
          "#EEBAA2",
          "#EEBBA4",
          "#EEBCA6",
          "#EEBDA8",
          "#EFBEAA",
          "#EFBEAC",
          "#EFBFAD",
          "#EFC0AF",
          "#EFC1B1",
          "#EFC2B3",
          "#EFC3B5",
          "#EFC4B7",
          "#EFC5B9",
          "#EFC7BB",
          "#F0C8BD",
          "#F0C9BF",
          "#F0CAC1",
          "#F0CBC3",
          "#F0CDC5",
          "#F0CEC7",
          "#F0CFC9",
          "#F0D1CB",
          "#F0D2CD",
          "#F0D3CF",
          "#F1D5D1",
          "#F1D6D3",
          "#F1D8D5",
          "#F1D9D7",
          "#F1DBD8",
          "#F1DDDA",
          "#F1DEDC",
          "#F1E0DE",
          "#F1E2E0",
          "#F1E3E2",
          "#F2E5E4",
          "#F2E7E6",
          "#F2E9E8",
          "#F2EBEA",
          "#F2ECEC",
          "#F2EEEE",
          "#F2F0F0",
          "#F2F2F2",
        ],
        //colors:["#006837", "#1a9850", "#66bd63", "#a6d96a", "#d9ef8b", "#ffffbf","#fee08b", "#fdae61", "#f46d43", "#d73027", "#a50026"]
      };
      let extent = polygonLayer.getSource().getExtent(); //圈定范围
      if (t.length > 3) {
        //样本训练
        let variogram = kriging.train(
          t,
          x,
          y,
          params.krigingModel,
          params.krigingSigma2,
          params.krigingAlpha
        );
        //生成插值网格
        let grid = kriging.grid(this.world, variogram, (extent[2] - extent[0]) / 200);
        //console.log((extent[2] - extent[0]) / 200);//0.000303
        if (this.canvasLayer !== null) {
          map.removeLayer(this.canvasLayer);
        }
        //创建新图层
        this.canvasLayer = new ImageLayer({
          source: new ImageCanvasSource({
            canvasFunction: (extent, resolution, pixelRatio, size, projection) => {
              let canvas = document.createElement("canvas");
              canvas.width = size[0];
              canvas.height = size[1];
              canvas.style.display = "block";
              //设置canvas透明度
              canvas.getContext("2d").globalAlpha = params.canvasAlpha;
              //使用分层设色渲染
              kriging.plot(
                canvas,
                grid,
                [extent[0], extent[2]],
                [extent[1], extent[3]],
                params.colors
              );

              return canvas;
            },
            projection: "EPSG:4326",
          }),
        });
        this.map.addLayer(this.canvasLayer);
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

.control {
  position: absolute;
  z-index: 10;
  left: 10px;
  top: 10px;
}
</style>
