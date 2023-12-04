import Overlay from 'ol/Overlay';

export default class Popup extends Overlay {
    /**
     * @param {ol_Overlay_Options} [opt_options] OpenLayers Overlay options,
     *                                         defaults to `{autoPan: {animation: {duration: 250}}}`    持续时间250
     */
    constructor(opt_options) {

        var options = opt_options || {};

        if (options.autoPan === undefined) {
            options.autoPan = {
                animation: {
                    duration: 250
                }
            }
        }

        var element = document.createElement('div');

        options.element = element;
        super(options);

        this.container = element;
        this.container.className = 'ol-popup';

        this.closer = document.createElement('a');
        this.closer.className = 'ol-popup-closer';
        this.closer.href = '#';
        this.container.appendChild(this.closer);

        var that = this;
        this.closer.addEventListener('click', function(evt) {
            that.container.style.display = 'none';
            that.closer.blur();
            evt.preventDefault();
        }, false);

        this.content = document.createElement('div');
        this.content.className = 'ol-popup-content';
        this.container.appendChild(this.content);

        // 应用解决方案，使触摸设备上的内容div滚动
        Popup.enableTouchScroll_(this.content);

    }

    /**
    * 显示popup.
    * @param {ol_coordinate_Coordinate} coord 
    * @param {String|HTMLElement} html 
    * @returns {Popup} 
    */
    show(coord, html) {
        if (html instanceof HTMLElement) {
            this.content.innerHTML = "";
            this.content.appendChild(html);
        } else {
            this.content.innerHTML = html;
        }
        this.container.style.display = 'block';
        this.content.scrollTop = 0;
        this.setPosition(coord);
        return this;
    }

    /**
    * @private
    * @desc 确定当前浏览器是否支持触摸事件
    */
    static isTouchDevice_() {
        try {
            document.createEvent("TouchEvent");
            return true;
        } catch(e) {
            return false;
        }
    }

    /**
    * @private
    * @desc 应用解决方案以启用元素内溢出内容的滚动
    * @param {HTMLElement} elm 
    */
    static enableTouchScroll_(elm) {
        if(Popup.isTouchDevice_()){
            var scrollStartPos = 0;
            elm.addEventListener("touchstart", function(event) {
                scrollStartPos = this.scrollTop + event.touches[0].pageY;
            }, false);
            elm.addEventListener("touchmove", function(event) {
                this.scrollTop = scrollStartPos - event.touches[0].pageY;
            }, false);
        }
    }

    /**
    * 隐藏popup.
    * @returns {Popup} 
    */
    hide() {
        this.container.style.display = 'none';
        return this;
    }


    /**
    * 指示弹出框是否处于打开状态
    * @returns {Boolean} 
    */
    isOpened() {
        return this.container.style.display == 'block';
    }

}


//如果使用完整的OpenLayers，将Popup暴露为ol.Overlay.Popup
if (window.ol && window.ol.Overlay) {
    window.ol.Overlay.Popup = Popup;
}

/**
 * @typedef {import('ol/Overlay').Options} ol_Overlay_Options
 * @typedef {import('ol/coordinate').Coordinate} ol_coordinate_Coordinate
 */