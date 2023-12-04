import axios from 'axios'
import { Message } from 'element-ui';
/**
 * GeoServer rest请求基础配置
 */
const workSpaces = 'ZHJY';
const dataStores = 'GIS';
const GeoUrl = 'http://192.168.201.162:8080'
const geoserverAxios = axios.create({
    baseURL: `${GeoUrl}/geoserver/rest`,
    timeout: 3000,
    auth: {
        username: 'admin',
        password: 'zkdn@geoserver'
    },
})
geoserverAxios.interceptors.response.use(function (response) {
    return response;
}, function (error) {
    if (error && error.response) {
        switch (error.response.status) {
            case 400:
                Message.error(error.response.data.error.details);
                break;
            case 401:
                Message.error("未授权");
                break;
            case 403:
                Message.error("已重复发布");
                break;
            case 404:
                Message.error("未连接");
                break;
            case 405:
                Message.error("请求方法错误");
                break;
            case 408:
                Message.error("请求超时");
                break;
            case 409:
                Message.error("冲突");
                break;
            case 500:
                Message.error("内部错误");
                break;
            case 501:
                Message.error("尚未实施");
                break;
            case 502:
                Message.error("网关错误");
                break;
            case 503:
                Message.error("服务不可用");
                break;
            case 504:
                Message.error("超时");
                break;
            case 505:
                Message.error("不受支持");
                break;
            default:
        }
    }
    return Promise.reject(error);
});

export { workSpaces, dataStores, GeoUrl, geoserverAxios };
