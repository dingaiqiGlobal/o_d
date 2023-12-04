import { workSpaces, geoserverAxios } from './config'

/**
 * GeoServer rest 获取图层范围
 * @param {String} layerName 图层名称
 */
export function getLayerBounds(layerName) {
    return geoserverAxios({
        method: 'get',
        url: `/workspaces/${workSpaces}/featuretypes/${layerName}`,
    }).then(function (response) {
        if (response.status === 200) {
            let bbox = response.data.featureType.latLonBoundingBox;
            return { success: true, bbox: bbox };
        }
        else {
            return { success: false };
        }
    })
}