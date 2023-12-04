import { workSpaces, geoserverAxios } from './config'

/**
 * GeoServer rest 图层添加样式
 * @param {String} layerName 图层名称
 * @param {String} styleName 样式名称
 */
export function addStyle(layerName, styleName) {
    return geoserverAxios({
        method: 'put',
        url: `/workspaces/${workSpaces}/layers/${layerName}`,
        data:
            `<?xml version="1.0" encoding="UTF-8"?>
            <layer>
                <defaultStyle>
                    <name>${styleName}</name>
                </defaultStyle>
            </layer>
        `,
        headers: {
            'content-type': 'application/xml'
        },

    })
}   