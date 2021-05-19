function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = require('react');
var React__default = _interopDefault(React);
var reactWindow = require('react-window');
var debounce = _interopDefault(require('lodash.debounce'));
var server = require('react-dom/server');

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

var useShareForwardedRef = function useShareForwardedRef(forwardedRef) {
  var innerRef = React.useRef(null);
  React.useEffect(function () {
    if (!forwardedRef) {
      return;
    }

    if (typeof forwardedRef === "function") {
      forwardedRef(innerRef.current);
    } else {
      forwardedRef.current = innerRef.current;
    }
  });
  return innerRef;
};

var Cache = /*#__PURE__*/function () {
  function Cache(initialValues) {
    this.values = _extends({}, initialValues);
  }

  var _proto = Cache.prototype;

  _proto.clearCache = function clearCache() {
    this.values = {};
  };

  return Cache;
}();

var containerStyle = {
  display: "inline-block",
  position: "absolute",
  visibility: "hidden",
  zIndex: -1
};
var createMeasureLayer = function createMeasureLayer(debug) {
  var container = document.createElement("div");
  container.setAttribute("id", "measure-layer");

  if (!debug) {
    container.style = containerStyle;
  }

  var root = document.querySelector('#root');
  root.appendChild(container);
  return container;
};
var destroyMeasureLayer = function destroyMeasureLayer() {
  var container = document.querySelector("#measure-layer");

  if (container) {
    container.parentNode.removeChild(container);
  }
};

var measureElement = function measureElement(element, debug) {
  var container = document.querySelector("#measure-layer") || createMeasureLayer(debug);
  container.innerHTML = server.renderToString(element);
  var child = container.querySelector("#item-container");
  var height = child.offsetHeight;
  var width = child.offsetWidth;

  if (!debug) {
    container.innerHTML = "";
  }

  return {
    height: height,
    width: width
  };
};

var defaultMeasurementContainer = function defaultMeasurementContainer(_ref) {
  var style = _ref.style,
      children = _ref.children;
  return /*#__PURE__*/React__default.createElement("div", {
    style: style
  }, " ", children, " ");
};

var createCache = function createCache(knownSizes) {
  if (knownSizes === void 0) {
    knownSizes = {};
  }

  return new Cache(knownSizes);
};

var DynamicList = function DynamicList(_ref, ref) {
  var children = _ref.children,
      data = _ref.data,
      height = _ref.height,
      width = _ref.width,
      cache = _ref.cache,
      _ref$lazyMeasurement = _ref.lazyMeasurement,
      lazyMeasurement = _ref$lazyMeasurement === void 0 ? true : _ref$lazyMeasurement,
      _ref$recalculateItems = _ref.recalculateItemsOnResize,
      recalculateItemsOnResize = _ref$recalculateItems === void 0 ? {
    width: false,
    height: false
  } : _ref$recalculateItems,
      _ref$measurementConta = _ref.measurementContainerElement,
      measurementContainerElement = _ref$measurementConta === void 0 ? defaultMeasurementContainer : _ref$measurementConta,
      _ref$debug = _ref.debug,
      debug = _ref$debug === void 0 ? false : _ref$debug,
      variableSizeListProps = _objectWithoutPropertiesLoose(_ref, ["children", "data", "height", "width", "cache", "lazyMeasurement", "recalculateItemsOnResize", "measurementContainerElement", "debug"]);

  var listRef = useShareForwardedRef(ref);
  var containerResizeDeps = [];

  if (recalculateItemsOnResize.width) {
    containerResizeDeps.push(width);
  }

  if (recalculateItemsOnResize.height) {
    containerResizeDeps.push(height);
  }

  var measureIndex = function measureIndex(index) {
    var ItemContainer = /*#__PURE__*/React__default.createElement("div", {
      id: "item-container",
      style: {
        overflow: "auto"
      }
    }, children({
      index: index
    }));
    var MeasurementContainer = measurementContainerElement({
      style: {
        width: width,
        height: height,
        overflowY: "scroll"
      },
      children: ItemContainer
    });

    var _measureElement = measureElement(MeasurementContainer, debug),
        measuredHeight = _measureElement.height;

    return measuredHeight;
  };

  var lazyCacheFill = function lazyCacheFill() {
    data.forEach(function (_ref2, index) {
      var id = _ref2.id;
      setTimeout(function () {
        if (!cache.values[id]) {
          var _height = measureIndex(index);

          if (!cache.values[id]) {
            cache.values[id] = _height;
          }
        }
      }, 0);
    });
  };

  var handleListResize = debounce(function () {
    if (listRef.current) {
      cache.clearCache();
      listRef.current.resetAfterIndex(0);
      lazyCacheFill();
    }
  }, 50);
  React.useEffect(function () {
    if (lazyMeasurement) {
      lazyCacheFill();
    }

    return destroyMeasureLayer;
  }, []);
  React.useLayoutEffect(function () {
    if (containerResizeDeps.length > 0) {
      handleListResize();
    }
  }, containerResizeDeps);
  React.useEffect(function () {
    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
    }
  }, [data.length]);

  var itemSize = function itemSize(index) {
    var id = data[index].id;

    if (cache.values[id]) {
      return cache.values[id];
    } else {
      var _height2 = measureIndex(index);

      cache.values[id] = _height2;
      return _height2;
    }
  };

  return /*#__PURE__*/React__default.createElement(reactWindow.VariableSizeList, _extends({
    layout: "vertical",
    ref: listRef,
    itemSize: itemSize,
    height: height,
    width: width,
    itemCount: data.length
  }, variableSizeListProps), children);
};

var index = React.forwardRef(DynamicList);

exports.createCache = createCache;
exports.default = index;
//# sourceMappingURL=index.js.map
