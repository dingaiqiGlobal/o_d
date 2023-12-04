import { geoserverAxios } from './config'

/**
 * GeoServer rest 重置所有存储、栅格和模式缓存
 */
export function resetCaches() {
    geoserverAxios({
        method: 'post',
        url: `/reset`,
    })
}   