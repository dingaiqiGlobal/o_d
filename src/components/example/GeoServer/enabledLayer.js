import { workSpaces, dataStores, geoserverAxios } from './config'
import { Message } from 'element-ui';

/**
 * GeoServer rest 启用/禁用图层服务
 * @param {String} layerName 图层名称
 * @param {Boolean} enable 启用/禁用
 */
export function enabledLayer(layerName, enabled = true) {
    geoserverAxios({
        method: 'put',
        url: `/workspaces/${workSpaces}/datastores/${dataStores}/featuretypes/${layerName}`,
        data:
            `<?xml version="1.0" encoding="UTF-8"?>
            <featureType>
                <enabled>${enabled}</enabled>
            </featureType>`,
        headers: {
            'content-type': 'application/xml'
        },
    }).then(function (response) {
        if (enabled === true) {
            Message({
                message: `图层启用`,
                type: 'success'
            })
        } else {
            Message({
                message: `图层禁用`,
            })
        }

    })
}   