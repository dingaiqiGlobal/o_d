import LayerGroup from 'ol/layer/Group';
import Feature from 'ol/Feature';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import CircleStyle from 'ol/style/Circle';

/**
 * 通过-layerName-获取图层
 * @param map
 * @param layerName
 * @returns {*}
 */
//getArray处理collection（集合）的方法，图层数组
const getLayerByLayerName = function (map, layerName) {
  let targetLayer = null;
  if (map) {
    const layers = map.getLayers().getArray();
    targetLayer = getLayerInternal(layers, 'layerName', layerName);
  }
  return targetLayer;
};
/**
 * 内部(Internal)处理获取图层方法
 * @param layers
 * @param key
 * @param value
 * @return {*}
 */
//every确定数组中的每一项的结果都满足所写的条件的时候,就会返回true,否则返回false,如果为false，则跳出程序，并返回false
//instanceof用于检测构造函数的 prototype 属性是否出现在某个实例对象的原型链上
//getLayers方法在map和ol/layer/Group中
//递归函数：getLayerInternal
//递归函数：①函数内部，自己调用自己②限定条件：必须得有出口
const getLayerInternal = function (layers, key, value) {
  let _target = null;
  if (layers.length > 0) {
    layers.every(layer => {
      if (layer instanceof LayerGroup) {
        let layers = layer.getLayers().getArray();//layers2
        _target = getLayerInternal(layers, key, value)
        if (_target) {
          return false;
        } else {
          return true;
        }
      } else if (layer.get(key) === value) {
        _target = layer;
        return false;
      } else {
        return true;
      }
    })
  }
  return _target;
}
/**
 * 通过-键名键值-获取图层
 * （注意键名键值必须是set(key,value)）
 * @param map
 * @param key
 * @param value
 */
const getLayerByKeyValue = function (map, key, value) {
  let targetLayer = null;
  if (map) {
    const layers = map.getLayers().getArray;
    targetLayer = getLayerInternal(layers, key, value);
  }
  return targetLayer;
}
/**
 * 创建矢量临时图层
 * @param map
 * @param layerName
 * @param params
 * @returns {*}
 */
const createVectorLayer = function (map, layerName, params) {
  //函数返回vectorLayer
  if (map) {
    let vectorLayer = getLayerByLayerName(map, layerName);
    //如果矢量图层不是矢量图层的原型链上为null
    if (!(vectorLayer instanceof VectorLayer)) {
      vectorLayer = null;
    }
    //如果矢量图层不存在，先构造
    if (!vectorLayer) {
      if (params && params.create) {
        vectorLayer = new VectorLayer({
          layerName: layerName,
          declutter: params['declutter'],
          renderMode: params['renderMode'],
          renderOrder: params['renderOrder'],
          renderBuffer: params['renderBuffer'],
          updateWhileAnimating: params['updateWhileAnimating'],
          updateWhileInteracting: params['updateWhileInteracting'],
          params: params,
          layerType: 'vector',
          source: new VectorSource({
            wrapX: false
          }),
          style: new Style({
            fill: new Fill({
              color: 'rgba(67, 110, 238, 0.4)'
            }),
            stroke: new Stroke({
              color: '#4781d9',
              width: 2
            }),
            image: new CircleStyle({
              radius: 7,
              fill: new Fill({
                color: '#ffcc33'
              })
            })
          }),
          zIndex: params['zIndex']
        });
      }
    }
    //如果map和矢量图层存在，矢量图层添加selectable（可选项）属性并且给地图添加矢量图层
    if (map && vectorLayer) {
      //hasOwnProperty(propertyName)方法是用来检测属性是否为对象的自有属性，如果是，返回true
      if (params && params.hasOwnProperty('selectable')) {
        vectorLayer.set('selectable', params.selectable);
      }
      // 先获取地图中有没有这个矢量图层，图层只添加一次
      let _vectorLayer = getLayerByLayerName(map, layerName);//_vectorLayer2
      if (!_vectorLayer || !(_vectorLayer instanceof VectorLayer)) {
        map.addLayer(vectorLayer);
      }
    }
    return vectorLayer;
  }
}

//-----------------------------------------------------------

/**
 * 获取所有图层
 * （将图层组里面的图层解析出来）
 * @return {Array}
 */
const getAllLayers = function (map) {
  let targetLayers = [];
  if (map) {
    const layers = map.getLayers().getArray();
    targetLayers = getAllLayersInternal(layers);
  }
  return targetLayers;
}
/**
 * 获取所有图层
 * 内部(Internal)处理方法
 * @param layers
 * @returns {Array}
 */
const getAllLayersInternal = function (layers) {
  let _target = [];
  if (layers.length > 0) {
    layers.forEach(layer => {
      //如果是图层组，继续递归遍历否则直接添加到数组
      if (layer instanceof LayerGroup) {
        let layers = layer.getLayers().getArray();//layers2
        let _layer = getAllLayersInternal(layers);
        if (_layer) {
          _target = _target.concat(_layer);
        }
      } else {
        _target.push(layer)
      }
    })
  }
  return _target;
}

//-----------------------------------------------------------

/**
 * 通过-要素-获取图层
 * @param map
 * @param feature
 * @param {*}
 */
const getLayerByFeature = function (map, feature) {
  let targetLayer;
  if (map && feature instanceof Feature) {
    const layers = map.getLayers().getArray();
    targetLayer = _getLayerByFeatureInternal(layers, feature);
  }
  return targetLayer;
}
/**
 * 通过-要素-获取图层方法
 * 内部(Internal)处理方法
 * @param layers
 * @param feature
 * @return {*}
 * @private 私有的
 */
const _getLayerByFeatureInternal = function (layers, feature) {
  let _target;
  layers.every(layer => {
    if (layer && layer instanceof VectorLayer && layer.getSource) {//？？
      let source = layer.getSource();
      if (source.getFeatures) {
        let features = source.getFeatures();
        features.every(feat => {
          if (feat === feature) {
            _target = layer;
            return false;
          } else {
            return true;
          }
        });
      }
      return !_target;
    } else if (layer instanceof LayerGroup) {//如果是图层组
      let layers = layer.getLayers().getArray();
      _target = _getLayerByFeatureInternal(layers, feature);
      if (_target) {
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  });
  return _target;
}

//-----------------------------------------------------------
/**
 * 通过-键名键值-获取图层-集合
 * （注意键名键值必须是set(key,value)）
 * @param map
 * @param key
 * @param value
 */
const getLayersArrayByKeyValue = function (map, key, value) {
  let targetLayers = [];
  if (map) {
    let layers = map.getLayers().getArray();
    targetLayers = getLayersArrayInternal(layers, key, value);
  }
  return targetLayers;
}
/**
 * 根据-键值健名-获取图层-集合
 * @param layers
 * @param key
 * @param value
 * @return {Array}
 */
const getLayersArrayInternal = function (layers, key, value) {
  let _target = [];
  if (layers.length > 0) {
    layers.forEach(layer => {
      if (layer instanceof LayerGroup) {
        let layers = layer.getLayers().getArray();
        let _layer = getLayersArrayInternal(layers, key, value);
        if (_layer) {
          _target = _target.concat(_layer);
        }
      } else if (layer.get(key) === value) {
        _target.push(layer)
      }
    });
  }
  return _target;
}


export {
  getLayerByLayerName,
  getLayerInternal,
  getLayerByKeyValue,
  createVectorLayer,
  getAllLayers,
  getLayerByFeature,
  getLayersArrayInternal,
  getLayersArrayByKeyValue,
};
