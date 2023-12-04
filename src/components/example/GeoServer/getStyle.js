import { workSpaces, geoserverAxios } from './config'

/**
 * GeoServer rest 获取工作区所有的样式
 */
export function getStyle() {

    geoserverAxios({
        method: 'get',
        url: `/workspaces/${workSpaces}/styles`,
    }).then(function (response) {
        if (response.status === 200) {
            const data = response.data.styles.style
            return data
        }

    })
}   
