<!-- 下面导航栏  -->
<template>
  <div class="nav-wrap" ref="scrollContainer" @mousewheel="MouseWheel">
    <div class="column-wrap" v-for="(item, index) in list" :key="index">
      <router-link :to="item.path">
        {{ item.text }}
        <img :src="item.img" alt="" />
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  components: {},

  data() {
    return {
      list: [
        {
          id: 9,
          img: "/images/webgl/webgl_point.jpg",
          text: "webgl渲染点",
          path: "/webgl_point",
        },
        {
          id: 9,
          img: "/images/imageMosaic/IM_Animator_TimeLine.jpg",
          text: "WMS动画时间轴",
          path: "/IM_Animator_TimeLine",
        },
        {
          id: 9,
          img: "/images/imageMosaic/IM_DIM_all.jpg",
          text: "DIM筛选三个参数",
          path: "/IM_DIM_all",
        },
        {
          id: 9,
          img: "/images/imageMosaic/IM_DIM_pcode.jpg",
          text: "DIM筛选pcode",
          path: "/IM_DIM_pcode",
        },
        {
          id: 9,
          img: "/images/imageMosaic/IM_CQL.jpg",
          text: "单景CQL",
          path: "/IM_CQL",
        },
        {
          id: 9,
          img: "/images/other/other_kriging.jpg",
          text: "kriging（克里金）3857",
          path: "/other_kriging_3857",
        },
        {
          id: 9,
          img: "/images/other/other_kriging.jpg",
          text: "kriging（克里金）",
          path: "/other_kriging",
        },
        {
          id: 9,
          img: "/images/other/other_cover.jpg",
          text: "遮盖层",
          path: "/other_cover",
        },
        {
          id: 9,
          img: "/images/other/other_Asymptotic.jpg",
          text: "逐级下钻",
          path: "/other_Asymptotic",
        },
        {
          id: 9,
          img: "/images/other/other_PointSelectPolygon.jpg",
          text: "点找面",
          path: "/other_PointSelectPolygon",
        },
        {
          id: 9,
          img: "/images/animate/animate_Wind.jpg",
          text: "风场图",
          path: "/animate_Wind",
        },
        {
          id: 9,
          img: "/images/animate/animate_DynamicPoints.jpg",
          text: "扩散圆",
          path: "/animate_DynamicPoints",
        },
        {
          id: 9,
          img: "/images/animate/animate_RunPath2.jpg",
          text: "轨迹回放2",
          path: "/animate_RunPath2",
        },
        {
          id: 9,
          img: "/images/animate/animate_RunPath.jpg",
          text: "轨迹回放",
          path: "/animate_RunPath",
        },
        {
          id: 9,
          img: "/images/animate/animate_StarFalling.jpg",
          text: "星星坠落",
          path: "/animate_StarFalling",
        },
        {
          id: 9,
          img: "/images/proj/proj_DynamicTransform.jpg",
          text: "proj_DynamicTransform",
          path: "/proj_DynamicTransform",
        },
        {
          id: 9,
          img: "/images/proj/proj_defs.jpg",
          text: "proj_defs&transfrom",
          path: "/proj_defs",
        },
        {
          id: 9,
          img: "/images/feature/addFeatureType.jpg",
          text: "Feature类型",
          path: "/addFeatureType",
        },
        {
          id: 9,
          img: "/images/feature/removeFeatureError.jpg",
          text: "错误移除要素",
          path: "/removeFeatureError",
        },
        {
          id: 9,
          img: "/images/interaction/interaction_Snap.jpg",
          text: "吸附、追踪",
          path: "/interaction_Snap",
        },
        {
          id: 9,
          img: "/images/interaction/interaction_DragAndDrop.jpg",
          text: "拖拽加载数据",
          path: "/interaction_DragAndDrop",
        },
        {
          id: 9,
          img: "/images/interaction/interaction_DragBox_Translate.jpg",
          text: "框选、移动",
          path: "/interaction_DragBox_Translate",
        },
        {
          id: 9,
          img: "/images/interaction/interaction_FeaturesStyle.jpg",
          text: "FeaturesStyle",
          path: "/interaction_FeaturesStyle",
        },
        {
          id: 9,
          img: "/images/interaction/interactions_ModifyFeatures.jpg",
          text: "ModifyFeatures",
          path: "/interactions_ModifyFeatures",
        },
        {
          id: 9,
          img: "/images/interaction/interaction_Draw.jpg",
          text: "Draw",
          path: "/interaction_Draw",
        },
        {
          id: 9,
          img: "/images/marker/marker_Popup.jpg",
          text: "marker_Popup",
          path: "/marker_Popup",
        },
        {
          id: 9,
          img: "/images/thirdParty/echarts/echarts_Pie.jpg",
          text: "echarts_饼状图",
          path: "/echarts_Pie",
        },
        {
          id: 9,
          img: "/images/thirdParty/echarts/echarts_migrateMap.jpg",
          text: "echarts_迁徙图",
          path: "/echarts_migrateMap",
        },
        {
          id: 9,
          img: "/images/thirdParty/echarts/echarts_flowLine.jpg",
          text: "echarts_流动线",
          path: "/echarts_flowLine",
        },
        {
          id: 9,
          img: "/images/thirdParty/customContextMenu.jpg",
          text: "自定义右键菜单",
          path: "/customContextMenu",
        },
        {
          id: 9,
          img: "/images/thirdParty/turf/turf_Split.jpg",
          text: "turf_Split",
          path: "/turf_Split",
        },
        {
          id: 9,
          img: "/images/thirdParty/turf/turf_Buffer.jpg",
          text: "turf_Buffer",
          path: "/turf_Buffer",
        },
        {
          id: 9,
          img: "/images/thirdParty/turf/turf_Intersect.jpg",
          text: "turf_Intersect",
          path: "/turf_Intersect",
        },
        {
          id: 9,
          img: "/images/thirdParty/osmbuildings.jpg",
          text: "osmbuildings",
          path: "/osmbuildings",
        },
        {
          id: 9,
          img: "/images/thirdParty/layers_Mapbox.jpg",
          text: "ol-Mapbox-style",
          path: "/layers_Mapbox",
        },
        {
          id: 9,
          img: "/images/thirdParty/geojson_vt.jpg",
          text: "集成geojson-vt",
          path: "/geojson_vt",
        },
        {
          id: 9,
          img: "/images/thirdParty/icon_gif_wfs.jpg",
          text: "GIF动图WFS",
          path: "/icon_gif_wfs",
        },
        {
          id: 9,
          img: "/images/thirdParty/icon_gif.jpg",
          text: "GIF动图",
          path: "/icon_gif",
        },
        {
          id: 9,
          img: "/images/style/style_FlowLine.jpg",
          text: "流动线",
          path: "/style_FlowLine",
        },
        {
          id: 9,
          img: "/images/style/style_ArrowLine2.jpg",
          text: "箭头线2",
          path: "/style_ArrowLine2",
        },
        {
          id: 9,
          img: "/images/style/style_ArrowLine.jpg",
          text: "箭头线",
          path: "/style_ArrowLine",
        },
        {
          id: 9,
          img: "/images/style/style_FileImage.jpg",
          text: "图片填充",
          path: "/style_FileImage",
        },
        {
          id: 9,
          img: "/images/style/themeGraduatedSymbol.jpg",
          text: "等级符合",
          path: "/themeGraduatedSymbol",
        },
        {
          id: 9,
          img: "/images/style/dynamicClusters.jpg",
          text: "动态聚合",
          path: "/dynamicClusters",
        },
        {
          id: 9,
          img: "/images/style/uniqueValue.jpg",
          text: "唯一值",
          path: "/uniqueValue",
        },
        {
          id: 9,
          img: "/images/style/breakPointValue.jpg",
          text: "断点值",
          path: "/breakPointValue",
        },
        {
          id: 9,
          img: "/images/style/heatmap_Resolution.jpg",
          text: "热力图(分辨率)",
          path: "/heatmap_Resolution",
        },
        {
          id: 9,
          img: "/images/style/heatmap.jpg",
          text: "热力图",
          path: "/heatmap",
        },
        {
          id: 9,
          img: "/images/style/clusterColor.jpg",
          text: "聚散图颜色",
          path: "/clusterColor",
        },
        {
          id: 9,
          img: "/images/style/clusteredFeatures.jpg",
          text: "聚散图",
          path: "/clusteredFeatures",
        },

        //工具测试
        {
          id: 9,
          img: "/images/ol_util/MapUtil.jpg",
          text: "MapUtil",
          path: "/MapUtil",
        },
        {
          id: 9,
          img: "/images/controls/control_LayerAuthority.jpg",
          text: "control_LayerAuthority",
          path: "/control_LayerAuthority",
        },
        {
          id: 9,
          img: "/images/controls/control_Roller.jpg",
          text: "control_Roller",
          path: "/control_Roller",
        },
        {
          id: 9,
          img: "/images/controls/control_Measure.jpg",
          text: "测量",
          path: "/control_Measure",
        },
        {
          id: 9,
          img: "/images/controls/control_LayerSwitch.jpg",
          text: "图层开关",
          path: "/control_LayerSwitch",
        },
        /**
         * 事件
         */
        {
          id: 9,
          img: "/images/event/event_all.jpg",
          text: "evnet_多类型",
          path: "/event_all",
        },
        {
          id: 9,
          img: "/images/event/event_select_move.jpg",
          text: "event_select_move",
          path: "/event_select_move",
        },
        {
          id: 9,
          img: "/images/event/event_forEachFeatureAtPixel_move.jpg",
          text: "event_forEachFeatureAtPixel_move",
          path: "/event_forEachFeatureAtPixel_move",
        },
        {
          id: 9,
          img: "/images/event/event_WFS_GetFeature.jpg",
          text: "event_WFS_GetFeature",
          path: "/event_WFS_GetFeature",
        },
        {
          id: 9,
          img: "/images/event/event_WMS_GetFeatureInfo.jpg",
          text: "event_WMS_GetFeatureInfo",
          path: "/event_WMS_GetFeatureInfo",
        },
        {
          id: 9,
          img: "/images/event/event_getFeaturesAtPixel.jpg",
          text: "event_getFeaturesAtPixel",
          path: "/event_getFeaturesAtPixel",
        },
        {
          id: 9,
          img: "/images/event/event_forEachFeatureAtPixel.jpg",
          text: "event_forEachFeatureAtPixel",
          path: "/event_forEachFeatureAtPixel",
        },
        {
          id: 9,
          img: "/images/event/event_select.jpg",
          text: "event_select",
          path: "/event_select",
        },
        /**
         * OGC规范
         */
        {
          id: 9,
          img: "/images/OGC/Point_Polyline_polygon.jpg",
          text: "经纬度点线面",
          path: "/Point_Polyline_polygon",
        },
        {
          id: 9,
          img: "/images/OGC/WPS_Geoserver.jpg",
          text: "WPS与Geoserver",
          path: "/WPS_Geoserver",
        },
        {
          id: 9,
          img: "/images/OGC/Json_Add.jpg",
          text: "Json_Add",
          path: "/Json_Add",
        },
        {
          id: 9,
          img: "/images/OGC/Geojson_Add.jpg",
          text: "Geojson_Add",
          path: "/Geojson_Add",
        },
        {
          id: 9,
          img: "/images/OGC/WMS_GetLegendGraphic.jpg",
          text: "WMS_GetLegendGraphic",
          path: "/WMS_GetLegendGraphic",
        },
        {
          id: 9,
          img: "/images/OGC/WMS_GetLegend.jpg",
          text: "WMS_GetLegend",
          path: "/WMS_GetLegend",
        },
        {
          id: 9,
          img: "/images/OGC/WMS_CQL_Filter.jpg",
          text: "WMS_CQL_Filter",
          path: "/WMS_CQL_Filter",
        },
        {
          id: 9,
          img: "/images/OGC/WMS_GetFeatureInfo.jpg",
          text: "WMS_GetFeatureInfo",
          path: "/WMS_GetFeatureInfo",
        },
        {
          id: 9,
          img: "/images/OGC/WFS_Transaction.jpg",
          text: "WFS_Transaction",
          path: "/WFS_Transaction",
        },
        {
          id: 9,
          img: "/images/OGC/WFS_writeGetFeature.jpg",
          text: "WFS_writeGetFeature",
          path: "/WFS_writeGetFeature",
        },
        {
          id: 9,
          img: "/images/OGC/WFS_CQL_Filter.jpg",
          text: "WFS_CQL_Filter",
          path: "/WFS_CQL_Filter",
        },
        {
          id: 9,
          img: "/images/OGC/WFS_Filter.jpg",
          text: "WFS_Filter",
          path: "/WFS_Filter",
        },
        {
          id: 9,
          img: "/images/OGC/WFS_GetFeature.jpg",
          text: "WFS_GetFeature",
          path: "/WFS_GetFeature",
        },
        {
          id: 9,
          img: "/images/OGC/TMS_Add.jpg",
          text: "TMS添加",
          path: "/TMS_Add",
        },
        {
          id: 9,
          img: "/images/OGC/WMTS_Add.jpg",
          text: "WMTS添加",
          path: "/WMTS_Add",
        },
        {
          id: 9,
          img: "/images/OGC/WMS_Add.jpg",
          text: "WMS添加",
          path: "/WMS_Add",
        },
        {
          id: 9,
          img: "/images/OGC/WFS_Add.jpg",
          text: "WFS添加",
          path: "/WFS_Add",
        },
        /**
         * 地图示例
         */
        {
          id: 9,
          img: "/images/layers/layers_ship_3395.jpg",
          text: "海图修正(偏移)",
          path: "/layers_ship_3395",
        },
        {
          id: 9,
          img: "/images/layers/layers_MVT_Geojson.jpg",
          text: "矢量切片图层",
          path: "/layers_MVT_Geojson",
        },
        {
          id: 9,
          img: "/images/layers/layers_SVG.jpg",
          text: "SVG图层",
          path: "/layers_SVG",
        },
        {
          id: 9,
          img: "/images/layers/layers_Group.jpg",
          text: "组概念",
          path: "/layers_Group",
        },
        {
          id: 9,
          img: "/images/layers/layers_BD09_Web.jpg",
          text: "BD纠偏",
          path: "/layers_BD09_Web",
        },
        {
          id: 8,
          img: "/images/layers/layers_BD09.jpg",
          text: "BD未纠偏",
          path: "/layers_BD09",
        },
        {
          id: 7,
          img: "/images/layers/layers_GCJ02_GD.jpg",
          text: "GCJ02纠偏",
          path: "/layers_GCJ02_GD",
        },
        {
          id: 6,
          img: "/images/layers/layers_ArcGIS_Rest.jpg",
          text: "ArcGIS_Rest",
          path: "/layers_ArcGIS_Rest",
        },
        {
          id: 5,
          img: "/images/layers/layers_ArcGIS_XYZ.jpg",
          text: "ArcGIS_XYZ",
          path: "/layers_ArcGIS_XYZ",
        },
        {
          id: 4,
          img: "/images/layers/layers_BingMaps.jpg",
          text: "BingMaps",
          path: "/layers_BingMaps",
        },
        {
          id: 3,
          img: "/images/layers/layers_TDT_WMTS.jpg",
          text: "天地图WMTS",
          path: "/layers_TDT_WMTS",
        },
        {
          id: 2,
          img: "/images/layers/layers_TDT_XYZ.jpg",
          text: "天地图XYZ",
          path: "/layers_TDT_XYZ",
        },
        {
          id: 1,
          img: "/images/layers/baseMap.jpg",
          text: "基础",
          path: "/",
        },
      ],
    };
  },

  computed: {},

  mounted() {},

  methods: {
    //鼠标滚轮上下滑动时div左右滑动
    MouseWheel(e) {
      let eventDelta = -e.wheelDelta || -e.deltaY * 40;
      let $scrollWrapper = this.$refs.scrollContainer;
      // console.log($scrollWrapper.scrollLeft)
      // 0到scrollLeft为滚动区域隐藏部分
      $scrollWrapper.scrollLeft = $scrollWrapper.scrollLeft + eventDelta / 4;
    },
  },
};
</script>
<style lang="less" scoped>
.nav-wrap {
  text-align: left;
  overflow: auto;
  white-space: nowrap;

  .column-wrap {
    font-size: 16px;
    display: inline-block;
    text-align: center;
    width: 170px;
    height: 130px;
    margin-top: 4px;
    margin-left: 10px;
    border: 1px solid #759dc0;
    padding: 2px 4px 4px 4px;
    background-color: #bcd8f4;
    background-image: linear-gradient(
      #ffffff 0px,
      rgba(255, 255, 255, 0) 3px,
      rgba(255, 255, 255, 0.75) 100%
    );
    box-sizing: content-box;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      background-color: #86bdf2;
    }

    img {
      width: 150px;
      margin: 5px auto;
      height: 100px;
      display: block;
    }
  }

  /*包含以下四种的链接*/
  a {
    color: #000;
  }

  /*正常的未被访问过的链接*/
  a:link {
    text-decoration: none;
  }

  /*已经访问过的链接*/
  a:visited {
    text-decoration: none;
  }

  /*鼠标划过(停留)的链接*/
  a:hover {
    text-decoration: none;
  }

  /* 正在点击的链接*/
  a:active {
    text-decoration: none;
  }
}
</style>
