import { workSpaces, GeoUrl, geoserverAxios } from './config'
/**
 * GeoServer rest 获取OGC(wfs/wms)视图
 * @param {String} layerName 图层名称
 * @param {String} type OGC类型(wfs/wms)
 * @param {String} layerType 是否图层组 5
 */
export function previewLayer(layerName, type, layerType) {
    console.log(layerName, type)
    if (layerType === "5") {
        geoserverAxios({
            method: 'get',
            url: `/workspaces/${workSpaces}/layergroups/${layerName}.json`,
        }).then(function (response) {
            let bbox = response.data.layerGroup.bounds;
            let baseUrl = `${GeoUrl}/geoserver/${workSpaces}/wms?`
            let param = `service=WMS&version=1.1.0&request=GetMap&layers=${workSpaces}:${layerName}&bbox=${bbox.minx},${bbox.miny},${bbox.maxx},${bbox.maxy}&width=1920&height=1080&srs=EPSG:4326&format=application/openlayers`
            let wms = baseUrl + param;
            window.open(wms, "_blank");
        })
    } else {
        if (type === 'WFS') {
            let baseUrl = `${GeoUrl}/geoserver/${workSpaces}/ows?`
            let param = `service=WFS&version=1.0.0&request=GetFeature&typeName=${workSpaces}:${layerName}&maxFeatures=500000&outputFormat=application/json`
            let wfs = baseUrl + param;
            window.open(wfs, "_blank");
        }
        if (type === 'WMS') {
            geoserverAxios({
                method: 'get',
                url: `/workspaces/${workSpaces}/featuretypes/${layerName}`,
            }).then(function (response) {
                let bbox = response.data.featureType.latLonBoundingBox;
                let baseUrl = `${GeoUrl}/geoserver/${workSpaces}/wms?`
                let param = `service=WMS&version=1.1.0&request=GetMap&layers=${workSpaces}:${layerName}&bbox=${bbox.minx},${bbox.miny},${bbox.maxx},${bbox.maxy}&width=1920&height=1080&srs=EPSG:4326&format=image/png`
                let wms = baseUrl + param;
                window.open(wms, "_blank");
            })
        }
    }
}   