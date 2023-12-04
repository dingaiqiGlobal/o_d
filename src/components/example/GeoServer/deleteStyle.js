import { workSpaces, geoserverAxios } from './config'
import { resetCaches } from "@/js/GeoServer/resetCaches";

/**
 * GeoServer rest 删除样式
 * @param {String} StyleName 样式名称
 */
export function deleteGeoStyle(StyleName) {
    geoserverAxios({
        method: 'delete',
        url: `workspaces/${workSpaces}/styles/${StyleName}`,
        params: { recurse: true }

    })
    //     .then(function () {
    //     resetCaches()
    // })
}   