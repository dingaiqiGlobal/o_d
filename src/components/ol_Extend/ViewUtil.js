import * as olExtent from 'ol/extent';

/**
 * 视图工具
 */
class ViewUitl {
    constructor() {
        this.map = null;
        this.view = null;
    }
    /**
     * 1.获取当前视图范围
     * @param size,可选
     * @return {ol.Extent|*}
     */
    //calculateExtent(opt_size)
    //计算当前视图状态的范围和传递的大小。大小是计算的范围应该适合的盒子的像素尺寸。在大多数情况下，您希望获得整个地图的范围，即map. getsize()
    getExtent(size) {
        if (size) {
            return this.view.calculateExtent(size);
        } else {
            return this.view.calculateExtent(this.map.getSize());
        }
    }

    /**
     * 2.获取当前地图的范围
     * @returns {ol.Extent}
     */
    getMapCurrentExtent() {
        if (this.map) {
            return this.view.calculateExtent(this.map.getSize())
        }
    }

    /**
     * 3.缩放到全图(以当前视图中心缩放)===setZoom()
     */
    zoomMaxExtent(zoom) {
        let view = this.map.getView();
        zoom = typeof zoom === 'number' ? zoom : 2;
        if (this.map && view) {
            let center = view.getCenter();
            if (center) {
                this.view.setCenter(center);
                this.view.setZoom(zoom);
            }
        }
    }

    /**
     * 4.设置视图中心点===setCenter()
     * @param coordinate （传入坐标）
     */
    setViewCenter(coordinate) {
        if (coordinate && Array.isArray(coordinate) && this.map) {
            this.map.getView().animate({
                center: coordinate,
                duration: 800//动画持续时间
            });
        }
    }

    /**
     * 5.判断点是否在视图内，如果不在地图将自动平移
     * @param coordinator（当前点坐标）
     */
    //containsXY检查传递的坐标是否包含在范围内或在范围边缘
    movePointToView(coordinate) {
        if (this.map) {
            let extent = this.getMapCurrentExtent();
            if (!olExtent.containsXY(extent, coordinate[0], coordinate[1])) {
                this.map.getView().animate({
                    center: [coordinate[0], coordinate[1]],
                    duration: 400
                });
            }
        }
    }

    /**
     * 6.调整当前要素范围
     * @param extent
     * @param params [Object]
     * @returns {*}
     */
    //中括号运算符总是能代替点运算符。但点运算符却不一定能全部代替中括号运算符。
    //中括号运算符可以用字符串变量的内容作为属性名。点运算符不能。（记得加''）
    //中括号运算符可以用纯数字为属性名。点运算符不能。
    //中括号运算符可以用js的关键字和保留字作为属性名。点运算符不能。
    adjustExtent(extent, params) {
        if (this.map) {
            params = params || {};
            let size = olExtent.getSize(extent);//获取当前范围的大小(宽度、高度)
            let adjust = typeof params['adjust'] === 'number' ? params['adjust'] : 0.2;
            let minWidth = typeof params['minWidth'] === 'number' ? params['minWidth'] : 0.05;
            let minHeight = typeof params['minHeight'] === 'number' ? params['minHeight'] : 0.05;
            if (size[0] <= minWidth || size[1] <= minHeight) {
                let bleft = olExtent.getBottomLeft(extent); //获取范围的左下角坐标,xmin,ymin
                let tright = olExtent.getTopRight(extent);//获取范围的右上角坐标,xmax,ymax
                let xmin = bleft[0] - adjust;
                let ymin = bleft[1] - adjust;
                let xmax = tright[0] + adjust;
                let ymax = tright[1] + adjust;
                extent = olExtent.buffer([xmin, ymin, xmax, ymax], adjust)//
            }
            return extent;
        }
    }

    /**
     * 7.缩放到当前范围
     * @param extent
     * @param isanimation
     * @param duration //动画持续时间
     */
    /*
    JS中的|| 符号：（逻辑或）
        只要“||”前面为false, 不管“||”后面是true还是false，都返回“||”后面的值。
        只要“||”前面为true, 不管“||”后面是true还是false，都返回“||”前面的值。
        总结：真前假后，只有前后都是false的时候才返回false，否则返回true。
    JS中的 && 符号：（逻辑与）
        只要“&&”前面是false，无论“&&”后面是true还是false，结果都将返“&&”前面的值;
        只要“&&”前面是true，无论“&&”后面是true还是false，结果都将返“&&”后面的值;
        总结：假前真后，只有前后都是true的时候才返回true，否则返回false。
    */
    zoomToExtent(extent, isanimation, duration) {
        if (this.map) {
            let view = this.map.getView();
            let size = this.map.getSize();
            if (!isanimation) {
                view.fit(extent, {
                    size: size,
                    padding: [0, 0, 0, 0],
                    duration: 0,
                    maxZoom: view.getMaxZoom() || undefined
                })
            } else {
                view.fit(extent, {
                    size: size,
                    padding: [0, 0, 0, 0],
                    duration: duration || 800,
                    maxZoom: view.getMaxZoom() || undefined
                });
            }
        }
    }

    /**
     * 
     */

}
export default ViewUtil;