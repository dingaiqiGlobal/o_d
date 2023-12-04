import { workSpaces, dataStores, geoserverAxios } from './config'

/**
 * GeoServer rest 修改点样式
 */
export function updateGeoPointStyle(Options) {
    let options = Options || {};
    let styleName = options.styleName || '';
    let legendName = options.legendName || '';
    let iconUrl = options.iconUrl || '';
    let iconSize = options.iconSize || 20;
    let iconOpacity = options.iconOpacity || 1;
    // Options = Object.assign(
    //     { styleName: '', legendName: '', iconUrl: '', iconSize: 20, iconOpacity: 1 },
    //     Options
    // )
    // let { styleName, legendName, iconUrl, iconSize, iconOpacity } = Options;
    let legendNameUTF = escape(legendName).replace(/(%u)(\w{4})/gi, "&#x$2;")//中文转UTF-8
    geoserverAxios({
        method: 'put',
        url: `/workspaces/${workSpaces}/styles/${styleName}`,
        data:
            `<?xml version="1.0" encoding="UTF-8"?>
            <StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.1.0/StyledLayerDescriptor.xsd" xmlns:ogc="http://www.opengis.net/ogc" xmlns:se="http://www.opengis.net/se" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
            <NamedLayer>
                <se:Name>${styleName}</se:Name>
                <UserStyle>
                <se:Name>${styleName}</se:Name>
                <se:FeatureTypeStyle>
                    <se:Rule>
                    <se:Name>${legendNameUTF}</se:Name>
                    <se:PointSymbolizer>
                        <se:Graphic>
                        <!--Parametric SVG-->
                        <se:ExternalGraphic>
                            <se:OnlineResource xlink:type="simple" xlink:href="${iconUrl}"/>
                            <se:Format>image/png</se:Format>
                        </se:ExternalGraphic>
                        <se:Size>${iconSize}</se:Size>
                        <se:Opacity>${iconOpacity}</se:Opacity>
                        </se:Graphic>
                    </se:PointSymbolizer>
                    </se:Rule>
                    <se:Rule>
                        <se:TextSymbolizer>
                            <se:Font>
                            <se:SvgParameter name="font-family">Microsoft YaHei</se:SvgParameter>
                            <se:SvgParameter name="font-size">14</se:SvgParameter>
                            </se:Font>
                        </se:TextSymbolizer>
                    </se:Rule>
                </se:FeatureTypeStyle>
                </UserStyle>
            </NamedLayer>
            </StyledLayerDescriptor>
            `,
        //params: { recurse: true },
        headers: {
            'content-type': 'application/vnd.ogc.se+xml'
        },
    })
}

/**
 * GeoServer rest 修改线样式
 */
export function updateGeoLineStyle(Options) {
    let options = Options || {};
    let styleName = options.styleName || '';
    let legendName = options.legendName || '';
    let lineType = options.lineType || '';
    let lineColor = options.lineColor || '';
    let lineWidth = options.lineWidth || '';
    let lineOpacity = options.lineOpacity || '';
    // Options = Object.assign(
    //     { styleName: '', legendName: '', lineType: '', lineColor: '', lineWidth: '', lineOpacity: '' },
    //     Options
    // )
    // let { styleName, legendName, lineType, lineColor, lineWidth, lineOpacity } = Options;
    let legendNameUTF = escape(legendName).replace(/(%u)(\w{4})/gi, "&#x$2;")
    let featureTypeStyle = '';
    if (lineType === '实线') {
        featureTypeStyle =
            `<se:FeatureTypeStyle>
            <se:Rule>
            <se:Name>${legendNameUTF}</se:Name>
            <se:LineSymbolizer>
                <se:Stroke>
                    <se:SvgParameter name="stroke">${lineColor}</se:SvgParameter>
                    <se:SvgParameter name="stroke-width">${lineWidth}</se:SvgParameter>
                    <se:SvgParameter name="stroke-linejoin">round</se:SvgParameter>
                    <se:SvgParameter name="stroke-linecap">round</se:SvgParameter>
                    <se:SvgParameter name="stroke-opacity">${lineOpacity}</se:SvgParameter>
                </se:Stroke>
            </se:LineSymbolizer>
            </se:Rule>
            <se:Rule>
                <se:TextSymbolizer>
                    <se:Font>
                    <se:SvgParameter name="font-family">Microsoft YaHei</se:SvgParameter>
                    <se:SvgParameter name="font-size">14</se:SvgParameter>
                    </se:Font>
                </se:TextSymbolizer>
            </se:Rule>
        </se:FeatureTypeStyle>
        `
    }
    if (lineType === '虚线') {
        featureTypeStyle = `
        <se:FeatureTypeStyle>
            <se:Rule>
            <se:Name>${legendNameUTF}</se:Name>
            <se:LineSymbolizer>
                <se:Stroke>
                    <se:SvgParameter name="stroke">${lineColor}</se:SvgParameter>
                    <se:SvgParameter name="stroke-width">${lineWidth}</se:SvgParameter>
                    <se:SvgParameter name="stroke-linejoin">round</se:SvgParameter>
                    <se:SvgParameter name="stroke-linecap">round</se:SvgParameter>
                    <se:SvgParameter name="stroke-dasharray">2 7</se:SvgParameter>
                    <se:SvgParameter name="stroke-opacity">${lineOpacity}</se:SvgParameter>
                </se:Stroke>
            </se:LineSymbolizer>
            </se:Rule>
            <se:Rule>
                <se:TextSymbolizer>
                    <se:Font>
                    <se:SvgParameter name="font-family">Microsoft YaHei</se:SvgParameter>
                    <se:SvgParameter name="font-size">14</se:SvgParameter>
                    </se:Font>
                </se:TextSymbolizer>
            </se:Rule>
        </se:FeatureTypeStyle>
        `
    }
    if (lineType === '发光线') {
        featureTypeStyle = `
        <se:FeatureTypeStyle>
            <se:Rule>
            <se:Name>${legendNameUTF}</se:Name>
            <se:LineSymbolizer>
                <se:Stroke>
                    <se:SvgParameter name="stroke">${lineColor}</se:SvgParameter>
                    <se:SvgParameter name="stroke-width">${lineWidth}</se:SvgParameter>
                    <se:SvgParameter name="stroke-linejoin">round</se:SvgParameter>
                    <se:SvgParameter name="stroke-linecap">round</se:SvgParameter>
                    <se:SvgParameter name="stroke-opacity">${lineOpacity}</se:SvgParameter>
                </se:Stroke>
            </se:LineSymbolizer>
            <se:LineSymbolizer>
                <se:Stroke>
                    <se:SvgParameter name="stroke">#ffffff</se:SvgParameter>
                    <se:SvgParameter name="stroke-width">${lineWidth - 5}</se:SvgParameter>
                    <se:SvgParameter name="stroke-linejoin">round</se:SvgParameter>
                    <se:SvgParameter name="stroke-linecap">round</se:SvgParameter>
                    <se:SvgParameter name="stroke-opacity">${lineOpacity}</se:SvgParameter>
                </se:Stroke>
            </se:LineSymbolizer>
            </se:Rule>
            <se:Rule>
                <se:TextSymbolizer>
                    <se:Font>
                    <se:SvgParameter name="font-family">Microsoft YaHei</se:SvgParameter>
                    <se:SvgParameter name="font-size">14</se:SvgParameter>
                    </se:Font>
                </se:TextSymbolizer>
            </se:Rule>
        </se:FeatureTypeStyle>
        `
    }
    return geoserverAxios({
        method: 'put',
        url: `/workspaces/${workSpaces}/styles/${styleName}`,
        data:
            `<?xml version="1.0" encoding="UTF-8"?>
            <StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.1.0/StyledLayerDescriptor.xsd" xmlns:ogc="http://www.opengis.net/ogc" xmlns:se="http://www.opengis.net/se" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
            <NamedLayer>
                <se:Name>${styleName}</se:Name>
                <UserStyle>
                <se:Name>${styleName}</se:Name>
                ${featureTypeStyle}
                </UserStyle>
            </NamedLayer>
            </StyledLayerDescriptor>
            `,
        headers: {
            'content-type': 'application/vnd.ogc.se+xml'
        },

    })
}

/**
 * GeoServer rest 修改面样式
 */
export function updateGeoPolygonStyle(Options) {
    let options = Options || {};
    let styleName = options.styleName || '';
    let legendName = options.legendName || '';
    let lineType = options.lineType || '';
    let lineColor = options.lineColor || '';
    let lineWidth = options.lineWidth || '';
    let polygonColor = options.polygonColor || '';
    let polygonOpacity = options.polygonOpacity || '';
    // Options = Object.assign(
    //     { styleName: '', legendName: '', lineType: '', lineColor: '', lineWidth: '', polygonColor: '', polygonOpacity: '' },
    //     Options
    // )
    // let { styleName, legendName, lineType, lineColor, lineWidth, polygonColor, polygonOpacity } = Options;
    let legendNameUTF = escape(legendName).replace(/(%u)(\w{4})/gi, "&#x$2;")
    let featureTypeStyle = '';
    if (lineType === '实线') {
        featureTypeStyle =
            `<se:FeatureTypeStyle>
            <se:Rule>
            <se:Name>${legendNameUTF}</se:Name>
            <se:PolygonSymbolizer>
                <se:Fill>
                    <se:SvgParameter name="fill">${polygonColor}</se:SvgParameter>
                     <se:SvgParameter name="fill-opacity">${polygonOpacity}</se:SvgParameter>
                </se:Fill>
                <se:Stroke>
                    <se:SvgParameter name="stroke">${lineColor}</se:SvgParameter>
                    <se:SvgParameter name="stroke-width">${lineWidth}</se:SvgParameter>
                    <se:SvgParameter name="stroke-linejoin">round</se:SvgParameter>
                    <se:SvgParameter name="stroke-linecap">round</se:SvgParameter>
                    <se:SvgParameter name="stroke-opacity">${polygonOpacity}</se:SvgParameter>
                </se:Stroke>
            </se:PolygonSymbolizer>
            </se:Rule>
            <se:Rule>
                <se:TextSymbolizer>
                    <se:Font>
                    <se:SvgParameter name="font-family">Microsoft YaHei</se:SvgParameter>
                    <se:SvgParameter name="font-size">14</se:SvgParameter>
                    </se:Font>
                </se:TextSymbolizer>
            </se:Rule>
        </se:FeatureTypeStyle>
        `
    }
    if (lineType === '虚线') {
        featureTypeStyle = `
        <se:FeatureTypeStyle>
            <se:Rule>
            <se:Name>${legendNameUTF}</se:Name>
            <se:PolygonSymbolizer>
                <se:Fill>
                    <se:SvgParameter name="fill">${polygonColor}</se:SvgParameter>
                    <se:SvgParameter name="fill-opacity">${polygonOpacity}</se:SvgParameter>
                </se:Fill>
                <se:Stroke>
                    <se:SvgParameter name="stroke">${lineColor}</se:SvgParameter>
                    <se:SvgParameter name="stroke-width">${lineWidth}</se:SvgParameter>
                    <se:SvgParameter name="stroke-linejoin">round</se:SvgParameter>
                    <se:SvgParameter name="stroke-linecap">round</se:SvgParameter>
                    <se:SvgParameter name="stroke-dasharray">2 7</se:SvgParameter>
                    <se:SvgParameter name="stroke-opacity">${polygonOpacity}</se:SvgParameter>
                </se:Stroke>
            </se:PolygonSymbolizer>
            </se:Rule>
            <se:Rule>
                <se:TextSymbolizer>
                    <se:Font>
                    <se:SvgParameter name="font-family">Microsoft YaHei</se:SvgParameter>
                    <se:SvgParameter name="font-size">14</se:SvgParameter>
                    </se:Font>
                </se:TextSymbolizer>
            </se:Rule>
        </se:FeatureTypeStyle>
        `
    }
    if (lineType === '发光线') {
        featureTypeStyle = `
        <se:FeatureTypeStyle>
            <se:Rule>
            <se:Name>${legendNameUTF}</se:Name>
            <se:PolygonSymbolizer>
                <se:Fill>
                    <se:SvgParameter name="fill">${polygonColor}</se:SvgParameter>
                    <se:SvgParameter name="fill-opacity">${polygonOpacity}</se:SvgParameter>
                </se:Fill>
                <se:Stroke>
                    <se:SvgParameter name="stroke">${lineColor}</se:SvgParameter>
                    <se:SvgParameter name="stroke-width">${lineWidth}</se:SvgParameter>
                    <se:SvgParameter name="stroke-linejoin">round</se:SvgParameter>
                    <se:SvgParameter name="stroke-linecap">round</se:SvgParameter>
                    <se:SvgParameter name="stroke-opacity">${polygonOpacity}</se:SvgParameter>
                </se:Stroke>
            </se:PolygonSymbolizer>
            <se:PolygonSymbolizer>
                <se:Stroke>
                    <se:SvgParameter name="stroke">#ffffff</se:SvgParameter>
                    <se:SvgParameter name="stroke-width">${lineWidth - 5}</se:SvgParameter>
                    <se:SvgParameter name="stroke-linejoin">round</se:SvgParameter>
                    <se:SvgParameter name="stroke-linecap">round</se:SvgParameter>
                    <se:SvgParameter name="stroke-opacity">${polygonOpacity}</se:SvgParameter>
                </se:Stroke>
            </se:PolygonSymbolizer>
            </se:Rule>
            <se:Rule>
                <se:TextSymbolizer>
                    <se:Font>
                    <se:SvgParameter name="font-family">Microsoft YaHei</se:SvgParameter>
                    <se:SvgParameter name="font-size">14</se:SvgParameter>
                    </se:Font>
                </se:TextSymbolizer>
            </se:Rule>
        </se:FeatureTypeStyle>
        `
    }
    return geoserverAxios({
        method: 'put',
        url: `/workspaces/${workSpaces}/styles/${styleName}`,
        data:
            `<?xml version="1.0" encoding="UTF-8"?>
            <StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.1.0/StyledLayerDescriptor.xsd" xmlns:ogc="http://www.opengis.net/ogc" xmlns:se="http://www.opengis.net/se" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
            <NamedLayer>
                <se:Name>${styleName}</se:Name>
                <UserStyle>
                <se:Name>${styleName}</se:Name>
                ${featureTypeStyle}
                </UserStyle>
            </NamedLayer>
            </StyledLayerDescriptor>
            `,
        headers: {
            'content-type': 'application/vnd.ogc.se+xml'
        },

    })
}
