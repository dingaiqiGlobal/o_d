import { workSpaces, dataStores, geoserverAxios } from './config'

/**
 * GeoServer rest 创建图层（发布图层）
 * @param {String} layerName 图层名称-数据库
 * @param {String} title 标题名称-发布名称（中文），默认为layerName
 * xml：srs坐标wgs，其他选项默认
 */
export function createLayer(layerName, title = layerName) {
    return geoserverAxios({
        method: 'post',
        url: `/workspaces/${workSpaces}/datastores/${dataStores}/featuretypes`,
        data:
            `<?xml version="1.0" encoding="UTF-8"?>
            <featureType>
                <name>${layerName}</name>
                <title>${title}</title>
                <nativeCRS>GEOGCS[&quot;WGS 84&quot;,
                    DATUM[&quot;World Geodetic System 1984&quot;,
                        SPHEROID[&quot;WGS 84&quot;, 6378137.0, 298.257223563, AUTHORITY[&quot;EPSG&quot;,&quot;7030&quot;]],
                        AUTHORITY[&quot;EPSG&quot;,&quot;6326&quot;]],
                    PRIMEM[&quot;Greenwich&quot;, 0.0, AUTHORITY[&quot;EPSG&quot;,&quot;8901&quot;]],
                    UNIT[&quot;degree&quot;, 0.017453292519943295],
                    AXIS[&quot;Geodetic longitude&quot;, EAST],
                    AXIS[&quot;Geodetic latitude&quot;, NORTH],
                    AUTHORITY[&quot;EPSG&quot;,&quot;4326&quot;]]
                </nativeCRS>
            </featureType>`,
        headers: {
            'content-type': 'application/xml'
        },

    })
}   