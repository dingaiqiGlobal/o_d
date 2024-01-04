import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/webgl_Point',
    name: 'webgl_Point',
    component: () => import("../components/example/webgl/webgl_Point.vue")
  },
  {
    path: '/IM_Animator_TimeLine',
    name: 'IM_Animator_TimeLine',
    component: () => import("../components/example/imageMosaic/IM_Animator_TimeLine.vue")
  },
  {
    path: '/IM_DIM_all',
    name: 'IM_DIM_all',
    component: () => import("../components/example/imageMosaic/IM_DIM_all.vue")
  },
  {
    path: '/IM_DIM_pcode',
    name: 'IM_DIM_pcode',
    component: () => import("../components/example/imageMosaic/IM_DIM_pcode.vue")
  },
  {
    path: '/IM_CQL',
    name: 'IM_CQL',
    component: () => import("../components/example/imageMosaic/IM_CQL.vue")
  },
  {
    path: '/other_kriging_3857',
    name: 'other_kriging_3857',
    component: () => import("../components/example/other/other_kriging_3857.vue")
  },
  {
    path: '/other_kriging',
    name: 'other_kriging',
    component: () => import("../components/example/other/other_kriging.vue")
  },
  {
    path: '/other_cover',
    name: 'other_cover',
    component: () => import("../components/example/other/other_cover.vue")
  },
  {
    path: '/other_Asymptotic',
    name: 'other_Asymptotic',
    component: () => import("../components/example/other/other_Asymptotic.vue")
  },
  {
    path: '/other_PointSelectPolygon',
    name: 'other_PointSelectPolygon',
    component: () => import("../components/example/other/other_PointSelectPolygon.vue")
  },
  {
    path: '/animate_Wind',
    name: 'animate_Wind',
    component: () => import("../components/example/animate/animate_Wind.vue")
  },
  {
    path: '/animate_DynamicPoints',
    name: 'animate_DynamicPoints',
    component: () => import("../components/example/animate/animate_DynamicPoints.vue")
  },
  {
    path: '/animate_RunPath2',
    name: 'animate_RunPath2',
    component: () => import("../components/example/animate/animate_RunPath2.vue")
  },
  {
    path: '/animate_RunPath',
    name: 'animate_RunPath',
    component: () => import("../components/example/animate/animate_RunPath.vue")
  },
  {
    path: '/animate_StarFalling',
    name: 'animate_StarFalling',
    component: () => import("../components/example/animate/animate_StarFalling.vue")
  },
  {
    path: '/proj_DynamicTransform',
    name: 'proj_DynamicTransform',
    component: () => import("../components/example/proj/proj_DynamicTransform.vue")
  },
  {
    path: '/proj_defs',
    name: 'proj_defs',
    component: () => import("../components/example/proj/proj_defs.vue")
  },
  {
    path: '/addFeatureType',
    name: 'addFeatureType',
    component: () => import("../components/example/feature/addFeatureType.vue")
  },
  {
    path: '/removeFeatureError',
    name: 'removeFeatureError',
    component: () => import("../components/example/feature/removeFeatureError.vue")
  },
  {
    path: '/interaction_Snap',
    name: 'interaction_Snap',
    component: () => import("../components/example/interaction/interaction_Snap.vue")
  },
  {
    path: '/interaction_DragAndDrop',
    name: 'interaction_DragAndDrop',
    component: () => import("../components/example/interaction/interaction_DragAndDrop.vue")
  },
  {
    path: '/interaction_DragBox_Translate',
    name: 'interaction_DragBox_Translate',
    component: () => import("../components/example/interaction/interaction_DragBox_Translate.vue")
  },
  {
    path: '/interaction_FeaturesStyle',
    name: 'interaction_FeaturesStyle',
    component: () => import("../components/example/interaction/interaction_FeaturesStyle.vue")
  },
  {
    path: '/interactions_ModifyFeatures',
    name: 'interactions_ModifyFeatures',
    component: () => import("../components/example/interaction/interactions_ModifyFeatures.vue")
  },
  {
    path: '/interaction_Draw',
    name: 'interaction_Draw',
    component: () => import("../components/example/interaction/interaction_Draw.vue")
  },
  {
    path: '/marker_Popup',
    name: 'marker_Popup',
    component: () => import("../components/example/marker/marker_Popup.vue")
  },
  {
    path: '/echarts_Pie',
    name: 'echarts_Pie',
    component: () => import("../components/example/thirdParty/echarts/echarts_Pie.vue")
  },
  {
    path: '/echarts_migrateMap',
    name: 'echarts_migrateMap',
    component: () => import("../components/example/thirdParty/echarts/echarts_migrateMap.vue")
  },
  {
    path: '/echarts_flowLine',
    name: 'echarts_flowLine',
    component: () => import("../components/example/thirdParty/echarts/echarts_flowLine.vue")
  },
  {
    path: '/customContextMenu',
    name: 'customContextMenu',
    component: () => import("../components/example/thirdParty/customContextMenu.vue")
  },
  {
    path: '/turf_Split',
    name: 'turf_Split',
    component: () => import("../components/example/thirdParty/turf/turf_Split.vue")
  },
  {
    path: '/turf_Buffer',
    name: 'Buffer',
    component: () => import("../components/example/thirdParty/turf/turf_Buffer.vue")
  },
  {
    path: '/turf_Intersect',
    name: 'turf_Intersect',
    component: () => import("../components/example/thirdParty/turf/turf_Intersect.vue")
  },
  {
    path: '/osmbuildings',
    name: 'osmbuildings',
    component: () => import("../components/example/thirdParty/osmbuildings.vue")
  },
  {
    path: '/layers_Mapbox',
    name: 'layers_Mapbox',
    component: () => import("../components/example/thirdParty/layers_Mapbox.vue")
  },
  {
    path: '/geojson_vt',
    name: 'geojson_vt',
    component: () => import("../components/example/thirdParty/geojson_vt.vue")
  },
  {
    path: '/icon_gif_wfs',
    name: 'icon_gif_wfs',
    component: () => import("../components/example/thirdParty/icon_gif_wfs.vue")
  },
  {
    path: '/icon_gif',
    name: 'icon_gif',
    component: () => import("../components/example/thirdParty/icon_gif.vue")
  },
  {
    path: '/style_FlowLine',
    name: 'style_FlowLine',
    component: () => import("../components/example/style/style_FlowLine.vue")
  },
  {
    path: '/style_ArrowLine',
    name: 'style_ArrowLine',
    component: () => import("../components/example/style/style_ArrowLine.vue")
  },
  {
    path: '/style_ArrowLine2',
    name: 'style_ArrowLine2',
    component: () => import("../components/example/style/style_ArrowLine2.vue")
  },
  {
    path: '/style_FileImage',
    name: 'style_FileImage',
    component: () => import("../components/example/style/style_FileImage.vue")
  },
  {
    path: '/themeGraduatedSymbol',
    name: 'themeGraduatedSymbol',
    component: () => import("../components/example/style/themeGraduatedSymbol.vue")
  },
  {
    path: '/dynamicClusters',
    name: 'dynamicClusters',
    component: () => import("../components/example/style/dynamicClusters.vue")
  },
  {
    path: '/uniqueValue',
    name: 'uniqueValue',
    component: () => import("../components/example/style/uniqueValue.vue")
  },
  {
    path: '/breakPointValue',
    name: 'breakPointValue',
    component: () => import("../components/example/style/breakPointValue.vue")
  },
  {
    path: '/heatmap_Resolution',
    name: 'heatmap_Resolution',
    component: () => import("../components/example/style/heatmap_Resolution.vue")
  },
  {
    path: '/heatmap',
    name: 'heatmap',
    component: () => import("../components/example/style/heatmap.vue")
  },
  {
    path: '/clusterColor',
    name: 'clusterColor',
    component: () => import("../components/example/style/clusterColor.vue")
  },
  {
    path: '/clusteredFeatures',
    name: 'clusteredFeatures',
    component: () => import("../components/example/style/clusteredFeatures.vue")
  },
  {
    path: '/MapUtil',
    name: 'MapUtil',
    component: () => import("../components/example/ol_util/MapUtil.vue")
  },
  {
    path: '/control_LayerAuthority',
    name: 'control_LayerAuthority',
    component: () => import("../components/example/controls/control_LayerAuthority.vue")
  },
  {
    path: '/control_Roller',
    name: 'control_Roller',
    component: () => import("../components/example/controls/control_Roller.vue")
  },
  {
    path: '/control_Measure',
    name: 'control_Measure',
    component: () => import("../components/example/controls/control_Measure.vue")
  },
  {
    path: '/control_LayerSwitch',
    name: 'control_LayerSwitch',
    component: () => import("../components/example/controls/control_LayerSwitch.vue")
  },
  {
    path: '/event_all',
    name: 'event_all',
    component: () => import("../components/example/event/event_all.vue")
  },
  {
    path: '/event_select_move',
    name: 'event_select_move',
    component: () => import("../components/example/event/event_select_move.vue")
  },
  {
    path: '/event_forEachFeatureAtPixel_move',
    name: 'event_forEachFeatureAtPixel_move',
    component: () => import("../components/example/event/event_forEachFeatureAtPixel_move.vue")
  },
  {
    path: '/event_WFS_GetFeature',
    name: 'event_WFS_GetFeature',
    component: () => import("../components/example/event/event_WFS_GetFeature.vue")
  },
  {
    path: '/event_WMS_GetFeatureInfo',
    name: 'event_WMS_GetFeatureInfo',
    component: () => import("../components/example/event/event_WMS_GetFeatureInfo.vue")
  },
  {
    path: '/event_getFeaturesAtPixel',
    name: 'event_getFeaturesAtPixel',
    component: () => import("../components/example/event/event_getFeaturesAtPixel.vue")
  },
  {
    path: '/event_forEachFeatureAtPixel',
    name: 'event_forEachFeatureAtPixel',
    component: () => import("../components/example/event/event_forEachFeatureAtPixel.vue")
  },
  {
    path: '/event_select',
    name: 'event_select',
    component: () => import("../components/example/event/event_select.vue")
  },
  {
    path: '/Point_Polyline_polygon',
    name: 'Point_Polyline_polygon',
    component: () => import("../components/example/OGC/Point_Polyline_polygon.vue")
  },
  {
    path: '/WPS_Geoserver',
    name: 'WPS_Geoserver',
    component: () => import("../components/example/OGC/WPS_Geoserver.vue")
  },
  {
    path: '/Json_Add',
    name: 'Json_Add',
    component: () => import("../components/example/OGC/Json_Add.vue")
  },
  {
    path: '/Geojson_Add',
    name: 'Geojson_Add',
    component: () => import("../components/example/OGC/Geojson_Add.vue")
  },
  {
    path: '/WMS_GetLegendGraphic',
    name: 'WMS_GetLegendGraphic',
    component: () => import("../components/example/OGC/WMS_GetLegendGraphic.vue")
  },
  {
    path: '/WMS_GetLegend',
    name: 'WMS_GetLegend',
    component: () => import("../components/example/OGC/WMS_GetLegend.vue")
  },
  {
    path: '/WMS_CQL_Filter',
    name: 'WMS_CQL_Filter',
    component: () => import("../components/example/OGC/WMS_CQL_Filter.vue")
  },
  {
    path: '/WMS_GetFeatureInfo',
    name: 'WMS_GetFeatureInfo',
    component: () => import("../components/example/OGC/WMS_GetFeatureInfo.vue")
  },
  {
    path: '/WFS_Transaction',
    name: 'WFS_Transaction',
    component: () => import("../components/example/OGC/WFS_Transaction.vue")
  },
  {
    path: '/WFS_writeGetFeature',
    name: 'WFS_writeGetFeature',
    component: () => import("../components/example/OGC/WFS_writeGetFeature.vue")
  },
  {
    path: '/WFS_CQL_Filter',
    name: 'WFS_CQL_Filter',
    component: () => import("../components/example/OGC/WFS_CQL_Filter.vue")
  },
  {
    path: '/WFS_Filter',
    name: 'WFS_Filter',
    component: () => import("../components/example/OGC/WFS_Filter.vue")
  },
  {
    path: '/WFS_GetFeature',
    name: 'WFS_GetFeature',
    component: () => import("../components/example/OGC/WFS_GetFeature.vue")
  },
  {
    path: '/TMS_Add',
    name: 'TMS_Add',
    component: () => import("../components/example/OGC/TMS_Add.vue")
  },
  {
    path: '/WMTS_Add',
    name: 'WMTS_Add',
    component: () => import("../components/example/OGC/WMTS_Add.vue")
  },
  {
    path: '/WMS_Add',
    name: 'WMS_Add',
    component: () => import("../components/example/OGC/WMS_Add.vue")
  },
  {
    path: '/WFS_Add',
    name: 'WFS_Add',
    component: () => import("../components/example/OGC/WFS_Add.vue")
  },
  {
    path: '/layers_ship_3395',
    name: 'layers_ship_3395',
    component: () => import("../components/example/layers/layers_ship_3395.vue")
  },
  {
    path: '/layers_MVT_Geojson',
    name: 'layers_MVT_Geojson',
    component: () => import("../components/example/layers/layers_MVT_Geojson.vue")
  },
  {
    path: '/layers_SVG',
    name: 'layers_SVG',
    component: () => import("../components/example/layers/layers_SVG.vue")
  },
  {
    path: '/layers_Group',
    name: 'layers_Group',
    component: () => import("../components/example/layers/layers_Group.vue")
  },
  {
    path: '/layers_BD09_Web',
    name: 'layers_BD09_Web',
    component: () => import("../components/example/layers/layers_BD09_Web.vue")
  },
  {
    path: '/layers_BD09',
    name: 'layers_BD09',
    component: () => import("../components/example/layers/layers_BD09.vue")
  },
  {
    path: '/layers_GCJ02_GD',
    name: 'layers_GCJ02_GD',
    component: () => import("../components/example/layers/layers_GCJ02_GD.vue")
  },
  {
    path: '/layers_ArcGIS_Rest',
    name: 'layers_ArcGIS_Rest',
    component: () => import("../components/example/layers/layers_ArcGIS_Rest.vue")
  },
  {
    path: '/layers_ArcGIS_XYZ',
    name: 'layers_ArcGIS_XYZ',
    component: () => import("../components/example/layers/layers_ArcGIS_XYZ.vue")
  },
  {
    path: '/layers_BingMaps',
    name: 'layers_BingMaps',
    component: () => import("../components/example/layers/layers_BingMaps.vue")
  },
  {
    path: '/layers_TDT_WMTS',
    name: 'layers_TDT_WMTS',
    component: () => import("../components/example/layers/layers_TDT_WMTS.vue")
  },
  {
    path: '/layers_TDT_XYZ',
    name: 'layers_TDT_XYZ',
    component: () => import("../components/example/layers/layers_TDT_XYZ.vue")
  },
  {
    path: '/',
    name: 'baseMAP',
    component: () => import("../components/baseMap.vue")
  }
]

const router = new VueRouter({
  routes
})

export default router
