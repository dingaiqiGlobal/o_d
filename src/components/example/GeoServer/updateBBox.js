import { workSpaces, dataStores, geoserverAxios } from './config'

/**
 * GeoServer rest 更新Box
 * @param {String} layerName 图层名称
 */
export function updateBox(layerName) {
    geoserverAxios({
        method: 'put',
        url: `/workspaces/${workSpaces}/datastores/${dataStores}/featuretypes/${layerName}`,
        params: {
            recalculate: 'nativebbox,latlonbbox',
        },
        data:
            `<?xml version="1.0" encoding="UTF-8"?>
                    <featureType>
                            <nativeBoundingBox>
                            </nativeBoundingBox>
                            <latLonBoundingBox>
                            </latLonBoundingBox>
                    </featureType>`,
        headers: {
            'content-type': 'application/xml'
        },
    })
}   