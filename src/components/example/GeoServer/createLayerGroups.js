import { workSpaces, geoserverAxios } from './config'

/**
 * GeoServer rest 创建图层组（发布图层组）
 * @param {String} layerGroupsName 图层组名称
 * @param [Object] layers 图层组名称
 * @param [Object] styles 样式名称
 * @param {Object} bounds
 * xml：srs坐标wgs，其他选项默认
 */
export function createLayerGroups(layerGroupsName, layers, bounds) {
    var layersXml = "";
    var stylesXml = "";
    for (let item of layers) {
        var layer = `<layer>${item.name}</layer>`;

        if (layersXml.length <= 0) {
            layersXml = layersXml + layer;
        } else {
            layersXml = layersXml + `
            `+ layer;
        }

        var style = `<style></style>`;

        if (stylesXml.length <= 0) {
            stylesXml = stylesXml + style;
        } else {
            stylesXml = stylesXml + `
            `+ style;
        }
    }

    return geoserverAxios({
        method: 'post',
        url: `/workspaces/${workSpaces}/layergroups`,
        data:
            `<?xml version="1.0" encoding="UTF-8"?>
                <layerGroup>
                    <name>${layerGroupsName}</name>
                    <mode>SINGLE</mode>
                    <title>${layerGroupsName}</title>
                    <abstractTxt>${layerGroupsName}</abstractTxt>
                    <workspace>
                        <name>ZHJY</name>
                    </workspace>
                    <layers>
                        ${layersXml}
                    </layers>
                    <styles>
                        ${stylesXml}
                    </styles>
                    <metadataLinks/>
                    <bounds>
                        <minx>${bounds.minx}</minx>
                        <maxx>${bounds.maxx}</maxx>
                        <miny>${bounds.miny}</miny>
                        <maxy>${bounds.maxy}</maxy>
                        <crs>${bounds.crs}</crs>
                    </bounds>
                    <keywords/>
                </layerGroup>`,
        headers: {
            'content-type': 'application/xml'
        },

    })
}   