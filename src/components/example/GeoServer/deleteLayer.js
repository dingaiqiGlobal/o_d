import { workSpaces, geoserverAxios } from './config'
import { resetCaches } from "@/js/GeoServer/resetCaches";

/**
 * GeoServer rest 删除图层
 * @param {String} layerName 图层名称
 * @param {Boolean} recurse 递归关联图层
 */
export function deleteLayer(layerName) {
    console.log(layerName)
    geoserverAxios({
        method: 'delete',
        url: `/workspaces/${workSpaces}/layers/${layerName}`,
        params: { recurse: true }

    })
    //     .then(function () {
    //     resetCaches()
    // })
}   