!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Slideout=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/**
 * Module dependencies
 */

var decouple = _interopRequire(require("decouple"));

var Emitter = _interopRequire(require("emitter"));

/**
 * Privates
 */
var scrollTimeout = undefined;
var scrolling = false;
var doc = window.document;
var html = doc.documentElement;
var msPointerSupported = window.navigator.msPointerEnabled;
var touch = {
  start: msPointerSupported ? "MSPointerDown" : "touchstart",
  move: msPointerSupported ? "MSPointerMove" : "touchmove",
  end: msPointerSupported ? "MSPointerUp" : "touchend"
};
var prefix = (function () {
  var regex = /^(Webkit|Khtml|Moz|ms|O)(?=[A-Z])/;
  var styleDeclaration = doc.getElementsByTagName("script")[0].style;
  for (var prop in styleDeclaration) {
    if (regex.test(prop)) {
      return "-" + prop.match(regex)[0].toLowerCase() + "-";
    }
  }
  // Nothing found so far? Webkit does not enumerate over the CSS properties of the style object.
  // However (prop in style) returns the correct value, so we'll have to test for
  // the precence of a specific property
  if ("WebkitOpacity" in styleDeclaration) {
    return "-webkit-";
  }
  if ("KhtmlOpacity" in styleDeclaration) {
    return "-khtml-";
  }
  return "";
})();
var extend = function (destination, from) {
  for (var prop in from) {
    if (from[prop]) {
      destination[prop] = from[prop];
    }
  }
  return destination;
};

/**
 * Slideout constructor
 */

var Slideout = (function (_Emitter) {
  function Slideout() {
    var _ref = arguments[0] === undefined ? {} : arguments[0];

    var panel = _ref.panel;
    var menu = _ref.menu;
    var _ref$fx = _ref.fx;
    var fx = _ref$fx === undefined ? "ease" : _ref$fx;
    var _ref$duration = _ref.duration;
    var duration = _ref$duration === undefined ? 300 : _ref$duration;
    var _ref$tolerance = _ref.tolerance;
    var tolerance = _ref$tolerance === undefined ? 70 : _ref$tolerance;
    var _ref$padding = _ref.padding;
    var padding = _ref$padding === undefined ? 256 : _ref$padding;

    _classCallCheck(this, Slideout);

    // Sets default values
    this._startOffsetX = 0;
    this._currentOffsetX = 0;
    this._opening = false;
    this._moved = false;
    this._opened = false;
    this._preventOpen = false;

    // Sets panel
    this.panel = panel;
    this.menu = menu;

    // Sets  classnames
    this.panel.className += " slideout-panel";
    this.menu.className += " slideout-menu";

    // Sets options
    this._fx = fx;
    this._duration = parseInt(duration, 10);
    this._tolerance = parseInt(tolerance, 10);
    this._padding = parseInt(padding, 10);

    // Init touch events
    this._initTouchEvents();
  }

  _inherits(Slideout, _Emitter);

  _createClass(Slideout, {
    open: {

      /**
       * Opens the slideout menu.
       */

      value: function open() {
        var _this = this;

        this.emit("beforeopen");
        if (html.className.search("slideout-open") === -1) {
          html.className += " slideout-open";
        }
        this._setTransition();
        this._translateXTo(this._padding);
        this._opened = true;
        setTimeout(function () {
          _this.panel.style.transition = _this.panel.style["-webkit-transition"] = "";
          _this.emit("open");
        }, this._duration + 50);
        return this;
      }
    },
    close: {

      /**
       * Closes slideout menu.
       */

      value: function close() {
        var _this = this;

        if (!this.isOpen() && !this._opening) {
          return this;
        }
        this.emit("beforeclose");
        this._setTransition();
        this._translateXTo(0);
        this._opened = false;
        setTimeout(function () {
          html.className = html.className.replace(/ slideout-open/, "");
          _this.panel.style.transition = _this.panel.style["-webkit-transition"] = "";
          _this.emit("close");
        }, this._duration + 50);
        return this;
      }
    },
    toggle: {

      /**
       * Toggles (open/close) slideout menu.
       */

      value: function toggle() {
        return this.isOpen() ? this.close() : this.open();
      }
    },
    isOpen: {

      /**
       * Returns true if the slideout is currently open, and false if it is closed.
       */

      value: function isOpen() {
        return this._opened;
      }
    },
    _translateXTo: {

      /**
       * Translates panel and updates currentOffset with a given X point
       */

      value: function _translateXTo(translateX) {
        this._currentOffsetX = translateX;
        this.panel.style["" + prefix + "transform"] = this.panel.style.transform = "translate3d(" + translateX + "px, 0, 0)";
      }
    },
    _setTransition: {

      /**
       * Set transition properties
       */

      value: function _setTransition() {
        this.panel.style["" + prefix + "transition"] = this.panel.style.transition = "" + prefix + "transform " + this._duration + "ms " + this._fx;
      }
    },
    _initTouchEvents: {

      /**
       * Initializes touch event
       */

      value: function _initTouchEvents() {
        var _this = this;

        /**
         * Decouple scroll event
         */
        decouple(doc, "scroll", function () {
          if (!_this._moved) {
            clearTimeout(scrollTimeout);
            scrolling = true;
            scrollTimeout = setTimeout(function () {
              return scrolling = false;
            }, 250);
          }
        });

        /**
         * Prevents touchmove event if slideout is moving
         */
        doc.addEventListener(touch.move, function (eve) {
          if (self._moved) {
            eve.preventDefault();
          }
        });

        /**
         * Resets values on touchstart
         */
        this.panel.addEventListener(touch.start, function (eve) {
          _this._moved = false;
          _this._opening = false;
          _this._startOffsetX = eve.touches[0].pageX;
          _this._preventOpen = !_this.isOpen() && _this.menu.clientWidth !== 0;
        });

        /**
         * Resets values on touchcancel
         */
        this.panel.addEventListener("touchcancel", function () {
          _this._moved = false;
          _this._opening = false;
        });

        /**
         * Toggles slideout on touchend
         */
        this.panel.addEventListener(touch.end, function () {
          if (self._moved) {
            self._opening && Math.abs(self._currentOffsetX) > self._tolerance ? self.open() : self.close();
          }
          self._moved = false;
        });

        /**
         * Translates panel on touchmove
         */
        this.panel.addEventListener(touch.move, function (eve) {

          if (scrolling || _this._preventOpen) {
            return;
          }

          var dif_x = eve.touches[0].clientX - _this._startOffsetX;
          var translateX = _this._currentOffsetX = dif_x;

          if (Math.abs(translateX) > _this._padding) {
            return;
          }

          if (Math.abs(dif_x) > 20) {
            _this._opening = true;

            if (_this._opened && dif_x > 0 || !_this._opened && dif_x < 0) {
              return;
            }

            if (!_this._moved && html.className.search("slideout-open") === -1) {
              html.className += " slideout-open";
            }

            if (dif_x <= 0) {
              translateX = dif_x + _this._padding;
              _this._opening = false;
            }

            _this.panel.style["" + prefix + "transform"] = _this.panel.style.transform = "translate3d(" + translateX + "px, 0, 0)";
            _this.emit("translate", translateX);
            _this._moved = true;
          }
        });
      }
    }
  });

  return Slideout;
})(Emitter);

/**
 * Expose Slideout
 */
module.exports = Slideout;

},{"decouple":2,"emitter":3}],2:[function(require,module,exports){
"use strict";

var requestAnimFrame = (function () {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || function (callback) {
    window.setTimeout(callback, 1000 / 60);
  };
})();

function decouple(node, event, fn) {
  var eve,
      tracking = false;

  function captureEvent(e) {
    eve = e;
    track();
  }

  function track() {
    if (!tracking) {
      requestAnimFrame(update);
      tracking = true;
    }
  }

  function update() {
    fn.call(node, eve);
    tracking = false;
  }

  node.addEventListener(event, captureEvent, false);
}

/**
 * Expose decouple
 */
module.exports = decouple;

},{}],3:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/**
 * Creates a new instance of Emitter.
 * @class
 * @returns {Object} Returns a new instance of Emitter.
 * @example
 * // Creates a new instance of Emitter.
 * var Emitter = require('emitter');
 *
 * var emitter = new Emitter();
 */

var Emitter = (function () {
  function Emitter() {
    _classCallCheck(this, Emitter);
  }

  _createClass(Emitter, {
    on: {

      /**
       * Adds a listener to the collection for the specified event.
       * @memberof! Emitter.prototype
       * @function
       * @param {String} event - The event name.
       * @param {Function} listener - A listener function to add.
       * @returns {Object} Returns an instance of Emitter.
       * @example
       * // Add an event listener to "foo" event.
       * emitter.on('foo', listener);
       */

      value: function on(event, listener) {
        // Use the current collection or create it.
        this._eventCollection = this._eventCollection || {};

        // Use the current collection of an event or create it.
        this._eventCollection[event] = this._eventCollection[event] || [];

        // Appends the listener into the collection of the given event
        this._eventCollection[event].push(listener);

        return this;
      }
    },
    once: {

      /**
       * Adds a listener to the collection for the specified event that will be called only once.
       * @memberof! Emitter.prototype
       * @function
       * @param {String} event - The event name.
       * @param {Function} listener - A listener function to add.
       * @returns {Object} Returns an instance of Emitter.
       * @example
       * // Will add an event handler to "foo" event once.
       * emitter.once('foo', listener);
       */

      value: function once(event, listener) {
        var self = this;

        function fn() {
          self.off(event, fn);
          listener.apply(this, arguments);
        }

        fn.listener = listener;

        this.on(event, fn);

        return this;
      }
    },
    off: {

      /**
       * Removes a listener from the collection for the specified event.
       * @memberof! Emitter.prototype
       * @function
       * @param {String} event - The event name.
       * @param {Function} listener - A listener function to remove.
       * @returns {Object} Returns an instance of Emitter.
       * @example
       * // Remove a given listener.
       * emitter.off('foo', listener);
       */

      value: function off(event, listener) {

        var listeners = undefined;

        // Defines listeners value.
        if (!this._eventCollection || !(listeners = this._eventCollection[event])) {
          return this;
        }

        listeners.forEach(function (fn, i) {
          if (fn === listener || fn.listener === listener) {
            // Removes the given listener.
            listeners.splice(i, 1);
          }
        });

        // Removes an empty event collection.
        if (listeners.length === 0) {
          delete this._eventCollection[event];
        }

        return this;
      }
    },
    emit: {

      /**
       * Execute each item in the listener collection in order with the specified data.
       * @memberof! Emitter.prototype
       * @function
       * @param {String} event - The name of the event you want to emit.
       * @param {...Object} data - Data to pass to the listeners.
       * @returns {Object} Returns an instance of Emitter.
       * @example
       * // Emits the "foo" event with 'param1' and 'param2' as arguments.
       * emitter.emit('foo', 'param1', 'param2');
       */

      value: function emit(event) {
        var _this = this;

        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        var listeners = undefined;

        // Defines listeners value.
        if (!this._eventCollection || !(listeners = this._eventCollection[event])) {
          return this;
        }

        // Clone listeners
        listeners = listeners.slice(0);

        listeners.forEach(function (fn) {
          return fn.apply(_this, args);
        });

        return this;
      }
    }
  });

  return Emitter;
})();

/**
 * Exports Emitter
 */
module.exports = Emitter;

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvZGFuL1Byb2plY3RzL3NsaWRlb3V0L2luZGV4LmpzIiwiL1VzZXJzL2Rhbi9Qcm9qZWN0cy9zbGlkZW91dC9ub2RlX21vZHVsZXMvZGVjb3VwbGUvaW5kZXguanMiLCIvVXNlcnMvZGFuL1Byb2plY3RzL3NsaWRlb3V0L25vZGVfbW9kdWxlcy9lbWl0dGVyL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsWUFBWSxDQUFDOzs7Ozs7Ozs7Ozs7OztJQUtOLFFBQVEsMkJBQU0sVUFBVTs7SUFDeEIsT0FBTywyQkFBTSxTQUFTOzs7OztBQUs3QixJQUFJLGFBQWEsWUFBQSxDQUFDO0FBQ2xCLElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQztBQUN0QixJQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO0FBQzVCLElBQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxlQUFlLENBQUM7QUFDakMsSUFBTSxrQkFBa0IsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDO0FBQzdELElBQU0sS0FBSyxHQUFHO0FBQ1osU0FBUyxrQkFBa0IsR0FBRyxlQUFlLEdBQUcsWUFBWTtBQUM1RCxRQUFRLGtCQUFrQixHQUFHLGVBQWUsR0FBRyxXQUFXO0FBQzFELE9BQU8sa0JBQWtCLEdBQUcsYUFBYSxHQUFHLFVBQVU7Q0FDdkQsQ0FBQztBQUNGLElBQU0sTUFBTSxHQUFJLENBQUEsWUFBTTtBQUNwQixNQUFNLEtBQUssR0FBRyxtQ0FBbUMsQ0FBQztBQUNsRCxNQUFNLGdCQUFnQixHQUFHLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFDckUsT0FBSyxJQUFJLElBQUksSUFBSSxnQkFBZ0IsRUFBRTtBQUNqQyxRQUFJLEtBQUssQ0FB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O2FBQUEsY0FBQyxLQUFLLEVBQVc7OzswQ0FBTixJQUFJO0FBQUosY0FBSTs7O0FBQ2pCLFlBQUksU0FBUyxZQUFBLENBQUM7OztBQUdkLFlBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLElBQUksRUFBRSxTQUFTLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFBLEFBQUMsRUFBRTtBQUN6RSxpQkFBTyxJQUFJLENBQUM7U0FDYjs7O0FBR0QsaUJBQVMsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUUvQixpQkFBUyxDQUFDLE9BQU8sQ0FBQyxVQUFBLEVBQUU7aUJBQUksRUFBRSxDQUFDLEtBQUssUUFBTyxJQUFJLENBQUM7U0FBQSxDQUFDLENBQUM7O0FBRTlDLGVBQU8sSUFBSSxDQUFDO09BQ2I7Ozs7U0FoSEcsT0FBTzs7Ozs7O2lCQXVIRSxPQUFPIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzXG4gKi9cbmltcG9ydCBkZWNvdXBsZSBmcm9tICdkZWNvdXBsZSc7XG5pbXBvcnQgRW1pdHRlciBmcm9tICdlbWl0dGVyJztcblxuLyoqXG4gKiBQcml2YXRlc1xuICovXG5sZXQgc2Nyb2xsVGltZW91dDtcbmxldCBzY3JvbGxpbmcgPSBmYWxzZTtcbmNvbnN0IGRvYyA9IHdpbmRvdy5kb2N1bWVudDtcbmNvbnN0IGh0bWwgPSBkb2MuZG9jdW1lbnRFbGVtZW50O1xuY29uc3QgbXNQb2ludGVyU3VwcG9ydGVkID0gd2luZG93Lm5hdmlnYXRvci5tc1BvaW50ZXJFbmFibGVkO1xuY29uc3QgdG91Y2ggPSB7XG4gICdzdGFydCc6IG1zUG9pbnRlclN1cHBvcnRlZCA/ICdNU1BvaW50ZXJEb3duJyA6ICd0b3VjaHN0YXJ0JyxcbiAgJ21vdmUnOiBtc1BvaW50ZXJTdXBwb3J0ZWQgPyAnTVNQb2ludGVyTW92ZScgOiAndG91Y2htb3ZlJyxcbiAgJ2VuZCc6IG1zUG9pbnRlclN1cHBvcnRlZCA/ICdNU1BvaW50ZXJVcCcgOiAndG91Y2hlbmQnXG59O1xuY29uc3QgcHJlZml4ID0gKCgpID0+IHtcbiAgY29uc3QgcmVnZXggPSAvXihXZWJraXR8S2h0bWx8TW96fG1zfE8pKD89W0EtWl0pLztcbiAgY29uc3Qgc3R5bGVEZWNsYXJhdGlvbiA9IGRvYy5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0JylbMF0uc3R5bGU7XG4gIGZvciAobGV0IHByb3AgaW4gc3R5bGVEZWNsYXJhdGlvbikge1xuICAgIGlmIChyZWdleC50ZXN0KHByb3ApKSB7XG4gICAgICByZXR1cm4gYC0ke3Byb3AubWF0Y2gocmVnZXgpWzBdLnRvTG93ZXJDYXNlKCl9LWA7XG4gICAgfVxuICB9XG4gIC8vIE5vdGhpbmcgZm91bmQgc28gZmFyPyBXZWJraXQgZG9lcyBub3QgZW51bWVyYXRlIG92ZXIgdGhlIENTUyBwcm9wZXJ0aWVzIG9mIHRoZSBzdHlsZSBvYmplY3QuXG4gIC8vIEhvd2V2ZXIgKHByb3AgaW4gc3R5bGUpIHJldHVybnMgdGhlIGNvcnJlY3QgdmFsdWUsIHNvIHdlJ2xsIGhhdmUgdG8gdGVzdCBmb3JcbiAgLy8gdGhlIHByZWNlbmNlIG9mIGEgc3BlY2lmaWMgcHJvcGVydHlcbiAgaWYgKCdXZWJraXRPcGFjaXR5JyBpbiBzdHlsZURlY2xhcmF0aW9uKSB7IHJldHVybiAnLXdlYmtpdC0nOyB9XG4gIGlmICgnS2h0bWxPcGFjaXR5JyBpbiBzdHlsZURlY2xhcmF0aW9uKSB7IHJldHVybiAnLWtodG1sLSc7IH1cbiAgcmV0dXJuICcnO1xufSgpKTtcbmNvbnN0IGV4dGVuZCA9IChkZXN0aW5hdGlvbiwgZnJvbSkgPT4ge1xuICBmb3IgKGxldCBwcm9wIGluIGZyb20pIHtcbiAgICBpZiAoZnJvbVtwcm9wXSkge1xuICAgICAgZGVzdGluYXRpb25bcHJvcF0gPSBmcm9tW3Byb3BdO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZGVzdGluYXRpb247XG59XG5cbi8qKlxuICogU2xpZGVvdXQgY29uc3RydWN0b3JcbiAqL1xuY2xhc3MgU2xpZGVvdXQgZXh0ZW5kcyBFbWl0dGVyIHtcbiAgY29uc3RydWN0b3Ioe3BhbmVsLCBtZW51LCBmeD0nZWFzZScsIGR1cmF0aW9uPTMwMCwgdG9sZXJhbmNlPTcwLCBwYWRkaW5nPTI1Nn09e30pIHtcbiAgICAvLyBTZXRzIGRlZmF1bHQgdmFsdWVzXG4gICAgdGhpcy5fc3RhcnRPZmZzZXRYID0gMDtcbiAgICB0aGlzLl9jdXJyZW50T2Zmc2V0WCA9IDA7XG4gICAgdGhpcy5fb3BlbmluZyA9IGZhbHNlO1xuICAgIHRoaXMuX21vdmVkID0gZmFsc2U7XG4gICAgdGhpcy5fb3BlbmVkID0gZmFsc2U7XG4gICAgdGhpcy5fcHJldmVudE9wZW4gPSBmYWxzZTtcblxuICAgIC8vIFNldHMgcGFuZWxcbiAgICB0aGlzLnBhbmVsID0gcGFuZWw7XG4gICAgdGhpcy5tZW51ID0gbWVudTtcblxuICAgIC8vIFNldHMgIGNsYXNzbmFtZXNcbiAgICB0aGlzLnBhbmVsLmNsYXNzTmFtZSArPSAnIHNsaWRlb3V0LXBhbmVsJztcbiAgICB0aGlzLm1lbnUuY2xhc3NOYW1lICs9ICcgc2xpZGVvdXQtbWVudSc7XG5cbiAgICAvLyBTZXRzIG9wdGlvbnNcbiAgICB0aGlzLl9meCA9IGZ4O1xuICAgIHRoaXMuX2R1cmF0aW9uID0gcGFyc2VJbnQoZHVyYXRpb24sIDEwKTtcbiAgICB0aGlzLl90b2xlcmFuY2UgPSBwYXJzZUludCh0b2xlcmFuY2UsIDEwKTtcbiAgICB0aGlzLl9wYWRkaW5nID0gcGFyc2VJbnQocGFkZGluZywgMTApO1xuXG4gICAgLy8gSW5pdCB0b3VjaCBldmVudHNcbiAgICB0aGlzLl9pbml0VG91Y2hFdmVudHMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPcGVucyB0aGUgc2xpZGVvdXQgbWVudS5cbiAgICovXG4gIG9wZW4oKSB7XG4gICAgdGhpcy5lbWl0KCdiZWZvcmVvcGVuJyk7XG4gICAgaWYgKGh0bWwuY2xhc3NOYW1lLnNlYXJjaCgnc2xpZGVvdXQtb3BlbicpID09PSAtMSkgeyBcbiAgICAgIGh0bWwuY2xhc3NOYW1lICs9ICcgc2xpZGVvdXQtb3Blbic7IFxuICAgIH1cbiAgICB0aGlzLl9zZXRUcmFuc2l0aW9uKCk7XG4gICAgdGhpcy5fdHJhbnNsYXRlWFRvKHRoaXMuX3BhZGRpbmcpO1xuICAgIHRoaXMuX29wZW5lZCA9IHRydWU7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLnBhbmVsLnN0eWxlLnRyYW5zaXRpb24gPSB0aGlzLnBhbmVsLnN0eWxlWyctd2Via2l0LXRyYW5zaXRpb24nXSA9ICcnO1xuICAgICAgdGhpcy5lbWl0KCdvcGVuJyk7XG4gICAgfSwgdGhpcy5fZHVyYXRpb24gKyA1MCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQ2xvc2VzIHNsaWRlb3V0IG1lbnUuXG4gICAqL1xuICBjbG9zZSgpIHtcbiAgICBpZiAoIXRoaXMuaXNPcGVuKCkgJiYgIXRoaXMuX29wZW5pbmcpIHsgcmV0dXJuIHRoaXM7IH1cbiAgICB0aGlzLmVtaXQoJ2JlZm9yZWNsb3NlJyk7XG4gICAgdGhpcy5fc2V0VHJhbnNpdGlvbigpO1xuICAgIHRoaXMuX3RyYW5zbGF0ZVhUbygwKTtcbiAgICB0aGlzLl9vcGVuZWQgPSBmYWxzZTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGh0bWwuY2xhc3NOYW1lID0gaHRtbC5jbGFzc05hbWUucmVwbGFjZSgvIHNsaWRlb3V0LW9wZW4vLCAnJyk7XG4gICAgICB0aGlzLnBhbmVsLnN0eWxlLnRyYW5zaXRpb24gPSB0aGlzLnBhbmVsLnN0eWxlWyctd2Via2l0LXRyYW5zaXRpb24nXSA9ICcnO1xuICAgICAgdGhpcy5lbWl0KCdjbG9zZScpO1xuICAgIH0sIHRoaXMuX2R1cmF0aW9uICsgNTApO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRvZ2dsZXMgKG9wZW4vY2xvc2UpIHNsaWRlb3V0IG1lbnUuXG4gICAqL1xuICB0b2dnbGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNPcGVuKCkgPyB0aGlzLmNsb3NlKCkgOiB0aGlzLm9wZW4oKTtcbiAgfTtcblxuICAvKipcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBzbGlkZW91dCBpcyBjdXJyZW50bHkgb3BlbiwgYW5kIGZhbHNlIGlmIGl0IGlzIGNsb3NlZC5cbiAgICovXG4gIGlzT3BlbigpIHtcbiAgICByZXR1cm4gdGhpcy5fb3BlbmVkO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyYW5zbGF0ZXMgcGFuZWwgYW5kIHVwZGF0ZXMgY3VycmVudE9mZnNldCB3aXRoIGEgZ2l2ZW4gWCBwb2ludFxuICAgKi9cbiAgX3RyYW5zbGF0ZVhUbyh0cmFuc2xhdGVYKSB7XG4gICAgdGhpcy5fY3VycmVudE9mZnNldFggPSB0cmFuc2xhdGVYO1xuICAgIHRoaXMucGFuZWwuc3R5bGVbYCR7cHJlZml4fXRyYW5zZm9ybWBdID0gdGhpcy5wYW5lbC5zdHlsZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlM2QoJHt0cmFuc2xhdGVYfXB4LCAwLCAwKWA7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRyYW5zaXRpb24gcHJvcGVydGllc1xuICAgKi9cbiAgX3NldFRyYW5zaXRpb24oKSB7XG4gICAgdGhpcy5wYW5lbC5zdHlsZVtgJHtwcmVmaXh9dHJhbnNpdGlvbmBdID0gdGhpcy5wYW5lbC5zdHlsZS50cmFuc2l0aW9uID0gYCR7cHJlZml4fXRyYW5zZm9ybSAke3RoaXMuX2R1cmF0aW9ufW1zICR7dGhpcy5fZnh9YDtcbiAgfTtcblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdG91Y2ggZXZlbnRcbiAgICovXG4gIF9pbml0VG91Y2hFdmVudHMoKSB7XG4gICAgLyoqXG4gICAgICogRGVjb3VwbGUgc2Nyb2xsIGV2ZW50XG4gICAgICovXG4gICAgZGVjb3VwbGUoZG9jLCAnc2Nyb2xsJywgKCkgPT4ge1xuICAgICAgaWYgKCF0aGlzLl9tb3ZlZCkge1xuICAgICAgICBjbGVhclRpbWVvdXQoc2Nyb2xsVGltZW91dCk7XG4gICAgICAgIHNjcm9sbGluZyA9IHRydWU7XG4gICAgICAgIHNjcm9sbFRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHNjcm9sbGluZyA9IGZhbHNlLCAyNTApO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogUHJldmVudHMgdG91Y2htb3ZlIGV2ZW50IGlmIHNsaWRlb3V0IGlzIG1vdmluZ1xuICAgICAqL1xuICAgIGRvYy5hZGRFdmVudExpc3RlbmVyKHRvdWNoLm1vdmUsIChldmUpID0+IHtcbiAgICAgIGlmIChzZWxmLl9tb3ZlZCkge1xuICAgICAgICBldmUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFJlc2V0cyB2YWx1ZXMgb24gdG91Y2hzdGFydFxuICAgICAqL1xuICAgIHRoaXMucGFuZWwuYWRkRXZlbnRMaXN0ZW5lcih0b3VjaC5zdGFydCwgZXZlID0+IHtcbiAgICAgIHRoaXMuX21vdmVkID0gZmFsc2U7XG4gICAgICB0aGlzLl9vcGVuaW5nID0gZmFsc2U7XG4gICAgICB0aGlzLl9zdGFydE9mZnNldFggPSBldmUudG91Y2hlc1swXS5wYWdlWDtcbiAgICAgIHRoaXMuX3ByZXZlbnRPcGVuID0gKCF0aGlzLmlzT3BlbigpICYmIHRoaXMubWVudS5jbGllbnRXaWR0aCAhPT0gMCk7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBSZXNldHMgdmFsdWVzIG9uIHRvdWNoY2FuY2VsXG4gICAgICovXG4gICAgdGhpcy5wYW5lbC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGNhbmNlbCcsICgpID0+IHtcbiAgICAgIHRoaXMuX21vdmVkID0gZmFsc2U7XG4gICAgICB0aGlzLl9vcGVuaW5nID0gZmFsc2U7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBUb2dnbGVzIHNsaWRlb3V0IG9uIHRvdWNoZW5kXG4gICAgICovXG4gICAgdGhpcy5wYW5lbC5hZGRFdmVudExpc3RlbmVyKHRvdWNoLmVuZCwgZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoc2VsZi5fbW92ZWQpIHtcbiAgICAgICAgKHNlbGYuX29wZW5pbmcgJiYgTWF0aC5hYnMoc2VsZi5fY3VycmVudE9mZnNldFgpID4gc2VsZi5fdG9sZXJhbmNlKSA/IHNlbGYub3BlbigpIDogc2VsZi5jbG9zZSgpO1xuICAgICAgfVxuICAgICAgc2VsZi5fbW92ZWQgPSBmYWxzZTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFRyYW5zbGF0ZXMgcGFuZWwgb24gdG91Y2htb3ZlXG4gICAgICovXG4gICAgdGhpcy5wYW5lbC5hZGRFdmVudExpc3RlbmVyKHRvdWNoLm1vdmUsIGV2ZSA9PiB7XG5cbiAgICAgIGlmIChzY3JvbGxpbmcgfHwgdGhpcy5fcHJldmVudE9wZW4pIHsgcmV0dXJuOyB9XG5cbiAgICAgIGNvbnN0IGRpZl94ID0gZXZlLnRvdWNoZXNbMF0uY2xpZW50WCAtIHRoaXMuX3N0YXJ0T2Zmc2V0WDtcbiAgICAgIGxldCB0cmFuc2xhdGVYID0gdGhpcy5fY3VycmVudE9mZnNldFggPSBkaWZfeDtcblxuICAgICAgaWYgKE1hdGguYWJzKHRyYW5zbGF0ZVgpID4gdGhpcy5fcGFkZGluZykgeyByZXR1cm47IH1cblxuICAgICAgaWYgKE1hdGguYWJzKGRpZl94KSA+IDIwKSB7XG4gICAgICAgIHRoaXMuX29wZW5pbmcgPSB0cnVlO1xuXG4gICAgICAgIGlmICh0aGlzLl9vcGVuZWQgJiYgZGlmX3ggPiAwIHx8ICF0aGlzLl9vcGVuZWQgJiYgZGlmX3ggPCAwKSB7IHJldHVybjsgfVxuXG4gICAgICAgIGlmICghdGhpcy5fbW92ZWQgJiYgaHRtbC5jbGFzc05hbWUuc2VhcmNoKCdzbGlkZW91dC1vcGVuJykgPT09IC0xKSB7XG4gICAgICAgICAgaHRtbC5jbGFzc05hbWUgKz0gJyBzbGlkZW91dC1vcGVuJztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkaWZfeCA8PSAwKSB7XG4gICAgICAgICAgdHJhbnNsYXRlWCA9IGRpZl94ICsgdGhpcy5fcGFkZGluZztcbiAgICAgICAgICB0aGlzLl9vcGVuaW5nID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnBhbmVsLnN0eWxlW2Ake3ByZWZpeH10cmFuc2Zvcm1gXSA9IHRoaXMucGFuZWwuc3R5bGUudHJhbnNmb3JtID0gYHRyYW5zbGF0ZTNkKCR7dHJhbnNsYXRlWH1weCwgMCwgMClgO1xuICAgICAgICB0aGlzLmVtaXQoJ3RyYW5zbGF0ZScsIHRyYW5zbGF0ZVgpO1xuICAgICAgICB0aGlzLl9tb3ZlZCA9IHRydWU7XG4gICAgICB9XG5cbiAgICB9KTtcbiAgfVxuXG59XG5cblxuLyoqXG4gKiBFeHBvc2UgU2xpZGVvdXRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgU2xpZGVvdXQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciByZXF1ZXN0QW5pbUZyYW1lID0gKGZ1bmN0aW9uKCkge1xuICByZXR1cm4gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgIHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGNhbGxiYWNrLCAxMDAwIC8gNjApO1xuICAgIH07XG59KCkpO1xuXG5mdW5jdGlvbiBkZWNvdXBsZShub2RlLCBldmVudCwgZm4pIHtcbiAgdmFyIGV2ZSxcbiAgICAgIHRyYWNraW5nID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gY2FwdHVyZUV2ZW50KGUpIHtcbiAgICBldmUgPSBlO1xuICAgIHRyYWNrKCk7XG4gIH1cblxuICBmdW5jdGlvbiB0cmFjaygpIHtcbiAgICBpZiAoIXRyYWNraW5nKSB7XG4gICAgICByZXF1ZXN0QW5pbUZyYW1lKHVwZGF0ZSk7XG4gICAgICB0cmFja2luZyA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgIGZuLmNhbGwobm9kZSwgZXZlKTtcbiAgICB0cmFja2luZyA9IGZhbHNlO1xuICB9XG5cbiAgbm9kZS5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBjYXB0dXJlRXZlbnQsIGZhbHNlKTtcbn1cblxuLyoqXG4gKiBFeHBvc2UgZGVjb3VwbGVcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBkZWNvdXBsZTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIEVtaXR0ZXIuXG4gKiBAY2xhc3NcbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYSBuZXcgaW5zdGFuY2Ugb2YgRW1pdHRlci5cbiAqIEBleGFtcGxlXG4gKiAvLyBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIEVtaXR0ZXIuXG4gKiB2YXIgRW1pdHRlciA9IHJlcXVpcmUoJ2VtaXR0ZXInKTtcbiAqXG4gKiB2YXIgZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG4gKi9cbmNsYXNzIEVtaXR0ZXIge1xuXG4gIC8qKlxuICAgKiBBZGRzIGEgbGlzdGVuZXIgdG8gdGhlIGNvbGxlY3Rpb24gZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQuXG4gICAqIEBtZW1iZXJvZiEgRW1pdHRlci5wcm90b3R5cGVcbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCAtIFRoZSBldmVudCBuYW1lLlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lciAtIEEgbGlzdGVuZXIgZnVuY3Rpb24gdG8gYWRkLlxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGFuIGluc3RhbmNlIG9mIEVtaXR0ZXIuXG4gICAqIEBleGFtcGxlXG4gICAqIC8vIEFkZCBhbiBldmVudCBsaXN0ZW5lciB0byBcImZvb1wiIGV2ZW50LlxuICAgKiBlbWl0dGVyLm9uKCdmb28nLCBsaXN0ZW5lcik7XG4gICAqL1xuICBvbihldmVudCwgbGlzdGVuZXIpIHtcbiAgICAvLyBVc2UgdGhlIGN1cnJlbnQgY29sbGVjdGlvbiBvciBjcmVhdGUgaXQuXG4gICAgdGhpcy5fZXZlbnRDb2xsZWN0aW9uID0gdGhpcy5fZXZlbnRDb2xsZWN0aW9uIHx8IHt9O1xuXG4gICAgLy8gVXNlIHRoZSBjdXJyZW50IGNvbGxlY3Rpb24gb2YgYW4gZXZlbnQgb3IgY3JlYXRlIGl0LlxuICAgIHRoaXMuX2V2ZW50Q29sbGVjdGlvbltldmVudF0gPSB0aGlzLl9ldmVudENvbGxlY3Rpb25bZXZlbnRdIHx8IFtdO1xuXG4gICAgLy8gQXBwZW5kcyB0aGUgbGlzdGVuZXIgaW50byB0aGUgY29sbGVjdGlvbiBvZiB0aGUgZ2l2ZW4gZXZlbnRcbiAgICB0aGlzLl9ldmVudENvbGxlY3Rpb25bZXZlbnRdLnB1c2gobGlzdGVuZXIpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhIGxpc3RlbmVyIHRvIHRoZSBjb2xsZWN0aW9uIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IHRoYXQgd2lsbCBiZSBjYWxsZWQgb25seSBvbmNlLlxuICAgKiBAbWVtYmVyb2YhIEVtaXR0ZXIucHJvdG90eXBlXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgLSBUaGUgZXZlbnQgbmFtZS5cbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXIgLSBBIGxpc3RlbmVyIGZ1bmN0aW9uIHRvIGFkZC5cbiAgICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBhbiBpbnN0YW5jZSBvZiBFbWl0dGVyLlxuICAgKiBAZXhhbXBsZVxuICAgKiAvLyBXaWxsIGFkZCBhbiBldmVudCBoYW5kbGVyIHRvIFwiZm9vXCIgZXZlbnQgb25jZS5cbiAgICogZW1pdHRlci5vbmNlKCdmb28nLCBsaXN0ZW5lcik7XG4gICAqL1xuICBvbmNlKGV2ZW50LCBsaXN0ZW5lcikge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgZnVuY3Rpb24gZm4oKSB7XG4gICAgICBzZWxmLm9mZihldmVudCwgZm4pO1xuICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBmbi5saXN0ZW5lciA9IGxpc3RlbmVyO1xuXG4gICAgdGhpcy5vbihldmVudCwgZm4pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBhIGxpc3RlbmVyIGZyb20gdGhlIGNvbGxlY3Rpb24gZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQuXG4gICAqIEBtZW1iZXJvZiEgRW1pdHRlci5wcm90b3R5cGVcbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCAtIFRoZSBldmVudCBuYW1lLlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lciAtIEEgbGlzdGVuZXIgZnVuY3Rpb24gdG8gcmVtb3ZlLlxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGFuIGluc3RhbmNlIG9mIEVtaXR0ZXIuXG4gICAqIEBleGFtcGxlXG4gICAqIC8vIFJlbW92ZSBhIGdpdmVuIGxpc3RlbmVyLlxuICAgKiBlbWl0dGVyLm9mZignZm9vJywgbGlzdGVuZXIpO1xuICAgKi9cbiAgb2ZmKGV2ZW50LCBsaXN0ZW5lcikge1xuXG4gICAgbGV0IGxpc3RlbmVycztcblxuICAgIC8vIERlZmluZXMgbGlzdGVuZXJzIHZhbHVlLlxuICAgIGlmICghdGhpcy5fZXZlbnRDb2xsZWN0aW9uIHx8ICEobGlzdGVuZXJzID0gdGhpcy5fZXZlbnRDb2xsZWN0aW9uW2V2ZW50XSkpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGxpc3RlbmVycy5mb3JFYWNoKChmbiwgaSkgPT4ge1xuICAgICAgaWYgKGZuID09PSBsaXN0ZW5lciB8fCBmbi5saXN0ZW5lciA9PT0gbGlzdGVuZXIpIHtcbiAgICAgICAgLy8gUmVtb3ZlcyB0aGUgZ2l2ZW4gbGlzdGVuZXIuXG4gICAgICAgIGxpc3RlbmVycy5zcGxpY2UoaSwgMSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBSZW1vdmVzIGFuIGVtcHR5IGV2ZW50IGNvbGxlY3Rpb24uXG4gICAgaWYgKGxpc3RlbmVycy5sZW5ndGggPT09IDApIHtcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudENvbGxlY3Rpb25bZXZlbnRdO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4ZWN1dGUgZWFjaCBpdGVtIGluIHRoZSBsaXN0ZW5lciBjb2xsZWN0aW9uIGluIG9yZGVyIHdpdGggdGhlIHNwZWNpZmllZCBkYXRhLlxuICAgKiBAbWVtYmVyb2YhIEVtaXR0ZXIucHJvdG90eXBlXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgLSBUaGUgbmFtZSBvZiB0aGUgZXZlbnQgeW91IHdhbnQgdG8gZW1pdC5cbiAgICogQHBhcmFtIHsuLi5PYmplY3R9IGRhdGEgLSBEYXRhIHRvIHBhc3MgdG8gdGhlIGxpc3RlbmVycy5cbiAgICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBhbiBpbnN0YW5jZSBvZiBFbWl0dGVyLlxuICAgKiBAZXhhbXBsZVxuICAgKiAvLyBFbWl0cyB0aGUgXCJmb29cIiBldmVudCB3aXRoICdwYXJhbTEnIGFuZCAncGFyYW0yJyBhcyBhcmd1bWVudHMuXG4gICAqIGVtaXR0ZXIuZW1pdCgnZm9vJywgJ3BhcmFtMScsICdwYXJhbTInKTtcbiAgICovXG4gIGVtaXQoZXZlbnQsIC4uLmFyZ3MpIHtcbiAgICBsZXQgbGlzdGVuZXJzO1xuXG4gICAgLy8gRGVmaW5lcyBsaXN0ZW5lcnMgdmFsdWUuXG4gICAgaWYgKCF0aGlzLl9ldmVudENvbGxlY3Rpb24gfHwgIShsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudENvbGxlY3Rpb25bZXZlbnRdKSkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLy8gQ2xvbmUgbGlzdGVuZXJzXG4gICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLnNsaWNlKDApO1xuXG4gICAgbGlzdGVuZXJzLmZvckVhY2goZm4gPT4gZm4uYXBwbHkodGhpcywgYXJncykpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxufVxuXG4vKipcbiAqIEV4cG9ydHMgRW1pdHRlclxuICovXG5leHBvcnQgZGVmYXVsdCBFbWl0dGVyO1xuIl19
