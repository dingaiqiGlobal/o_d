import { workSpaces, geoserverAxios } from './config'

/**
 * GeoServer rest 删除图层组
 * @param {String} layerName 图层组名称
 * @param {Boolean} recurse 递归关联图层
 */
export function deleteLayerGroup(layerName) {
    console.log(layerName)
    geoserverAxios({
        method: 'delete',
        url: `/workspaces/${workSpaces}/layergroups/${layerName}`,
        params: { recurse: true }

    })
}   