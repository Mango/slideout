!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Slideout=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/**
 * Module dependencies
 */
var decouple = require('decouple');
var Emitter = require('emitter');

/**
 * Privates
 */
var scrollTimeout;
var scrolling = false;
var doc = window.document;
var html = doc.documentElement;
var msPointerSupported = window.navigator.msPointerEnabled;
var touch = {
  'start': msPointerSupported ? 'MSPointerDown' : 'touchstart',
  'move': msPointerSupported ? 'MSPointerMove' : 'touchmove',
  'end': msPointerSupported ? 'MSPointerUp' : 'touchend'
};
var prefix = (function prefix() {
  var regex = /^(Webkit|Khtml|Moz|ms|O)(?=[A-Z])/;
  var styleDeclaration = doc.getElementsByTagName('script')[0].style;
  for (var prop in styleDeclaration) {
    if (regex.test(prop)) {
      return '-' + prop.match(regex)[0].toLowerCase() + '-';
    }
  }
  // Nothing found so far? Webkit does not enumerate over the CSS properties of the style object.
  // However (prop in style) returns the correct value, so we'll have to test for
  // the precence of a specific property
  if ('WebkitOpacity' in styleDeclaration) { return '-webkit-'; }
  if ('KhtmlOpacity' in styleDeclaration) { return '-khtml-'; }
  return '';
}());
function extend(destination, from) {
  for (var prop in from) {
    if (from[prop]) {
      destination[prop] = from[prop];
    }
  }
  return destination;
}
function inherits(child, uber) {
  child.prototype = extend(child.prototype || {}, uber.prototype);
}

/**
 * Slideout constructor
 */
function Slideout(options) {
  options = options || {};
  // Store the options
  this._options = options;

  // Sets default values
  this._startOffsetX = 0;
  this._currentOffsetX = 0;
  this._opening = false;
  this._moved = false;
  this._opened = false;
  this._preventOpen = false;
  this._touch = options.touch === undefined ? true : options.touch && true;

  // Sets panel
  this.panel = options.panel;
  this.menu = options.menu;

  // Sets  classnames
  if(this.panel.className.search('slideout-panel') === -1) { this.panel.className += ' slideout-panel'; }
  if(this.menu.className.search('slideout-menu') === -1) { this.menu.className += ' slideout-menu'; }

  if ((options.itemToMove == 'menu' || options.itemToMove == 'both') && this.menu.className.search('slideout-menu--move') === -1) {
    this.menu.className += ' slideout-menu--move';
  }

  // Sets options
  this._fx = options.fx || 'ease';
  this._duration = parseInt(options.duration, 10) || 300;
  this._tolerance = parseInt(options.tolerance, 10) || 70;
  this._padding = this._translateTo = parseInt(options.padding, 10) || 256;
  this._orientation = options.side === 'right' ? -1 : 1;
  this._translateTo *= this._orientation;

  // Init touch events
  if (this._touch) {
    this._initTouchEvents();
  }
}

/**
 * Inherits from Emitter
 */
inherits(Slideout, Emitter);

/**
 * Opens the slideout menu.
 */
Slideout.prototype.open = function() {
  var self = this;
  this.emit('beforeopen');
  if (html.className.search('slideout-open') === -1) { html.className += ' slideout-open'; }
  this._setTransition();
  self._recalculateAll();
  this._translateXTo(this._translateTo);
  this._opened = true;
  setTimeout(function() {
    if (self._options.itemToMove == "panel" || self._options.itemToMove == "both" || self._options.itemToMove == undefined) {
      self.panel.style.transition = self.panel.style['-webkit-transition'] = '';
    }
    if (self._options.itemToMove == "menu" || self._options.itemToMove == "both") {
      self.menu.style.transition = self.menu.style['-webkit-transition'] = '';
    }
    self.emit('open');
  }, this._duration + 50);
  return this;
};

/**
 * Closes slideout menu.
 */
Slideout.prototype.close = function() {
  var self = this;
  if (!this.isOpen() && !this._opening) {
    return this;
  }
  this.emit('beforeclose');
  this._setTransition();
  this._translateXTo(0);
  this._opened = false;
  setTimeout(function() {
    html.className = html.className.replace(/ slideout-open/, '');
    if (self._options.itemToMove == "panel" || self._options.itemToMove == "both" || self._options.itemToMove == undefined) {
      self.panel.style.transition = self.panel.style['-webkit-transition'] = self.panel.style[prefix + 'transform'] = self.panel.style.transform = '';
    }
    if (self._options.itemToMove == "menu" || self._options.itemToMove == "both") {
      self.menu.style.transition = self.menu.style['-webkit-transition'] = self.menu.style[prefix + 'transform'] = self.menu.style.transform = '';
    }
    self.emit('close');
  }, this._duration + 50);
  return this;
};

/**
 * Toggles (open/close) slideout menu.
 */
Slideout.prototype.toggle = function() {
  return this.isOpen() ? this.close() : this.open();
};

/**
 * Returns true if the slideout is currently open, and false if it is closed.
 */
Slideout.prototype.isOpen = function() {
  return this._opened;
};

/**
 * Recalculates the slide out
 */
Slideout.prototype._recalculateAll = function () {

    //this._options.padding = this.menu.clientWidth;

    // Sets default values
    this._startOffsetX = 0;
    this._currentOffsetX = 0;
    this._opening = false;
    this._moved = false;
    this._opened = false;
    this._preventOpen = false;
    this._touch = this._options.touch === undefined ? true : this._options.touch && true;
    this._menuTriggerWidth = this._options.menuTriggerWidth === undefined ? 70 : this._options.menuTriggerWidth;

    // Sets panel
    this.panel = this._options.panel;
    this.menu = this._options.menu;

    // Sets  classnames
    if (this.panel.className.search('slideout-panel') === -1) { this.panel.className += ' slideout-panel'; }
    if (this.menu.className.search('slideout-menu') === -1) { this.menu.className += ' slideout-menu'; }


    // Sets options
    this._fx = this._options.fx || 'ease';
    this._duration = parseInt(this._options.duration, 10) || 300;
    this._tolerance = parseInt(this._options.tolerance, 10) || 70;
    this._padding = this._translateTo = parseInt(this._options.padding, 10) || 256;
    this._orientation = this._options.side === 'right' ? -1 : 1;
    this._translateTo *= this._orientation;
}

/**
 * Translates panel and updates currentOffset with a given X point
 */
Slideout.prototype._translateXTo = function(translateX) {
  this._currentOffsetX = translateX;
  if (this._options.itemToMove == "panel" || this._options.itemToMove == "both" || this._options.itemToMove == undefined) {
    this.panel.style[prefix + 'transform'] = this.panel.style.transform = 'translateX(' + translateX + 'px)';
  }
  if (this._options.itemToMove == "menu" || this._options.itemToMove == "both") {
    this.menu.style[prefix + 'transform'] = this.menu.style.transform = 'translate3d(' + (translateX - this.menu.clientWidth) + 'px, 0, 0)';
  }

  return this;
};

/**
 * Set transition properties
 */
Slideout.prototype._setTransition = function() {
  if (this._options.itemToMove == "panel" || this._options.itemToMove == "both" || this._options.itemToMove == undefined) {
    this.panel.style[prefix + 'transition'] = this.panel.style.transition = prefix + 'transform ' + this._duration + 'ms ' + this._fx;
  }
  if (this._options.itemToMove == "menu" || this._options.itemToMove == "both") {
    this.menu.style[prefix + 'transition'] = this.menu.style.transition = prefix + 'transform ' + this._duration + 'ms ' + this._fx;
  }

  return this;
};

/**
 * Initializes touch event
 */
Slideout.prototype._initTouchEvents = function() {
  var self = this;

  /**
   * Decouple scroll event
   */
  this._onScrollFn = decouple(doc, 'scroll', function() {
    if (!self._moved) {
      clearTimeout(scrollTimeout);
      scrolling = true;
      scrollTimeout = setTimeout(function() {
        scrolling = false;
      }, 250);
    }
  });

  /**
   * Prevents touchmove event if slideout is moving
   */
  this._preventMove = function(eve) {
    if (self._moved) {
      eve.preventDefault();
    }
  };

  doc.addEventListener(touch.move, this._preventMove);

  /**
   * Resets values on touchstart
   */
  this._resetTouchFn = function(eve) {
    if (typeof eve.touches === 'undefined') {
      return;
    }

    self._moved = false;
    self._opening = false;
    self._startOffsetX = eve.touches[0].pageX;
    self._preventOpen = (!self._touch || (!self.isOpen() && self.menu.clientWidth !== 0));
  };

  this.panel.addEventListener(touch.start, this._resetTouchFn);

  /**
   * Resets values on touchcancel
   */
  this._onTouchCancelFn = function() {
    self._moved = false;
    self._opening = false;
  };

  this.panel.addEventListener('touchcancel', this._onTouchCancelFn);

  /**
   * Toggles slideout on touchend
   */
  this._onTouchEndFn = function() {
    if (self._moved) {
      self.emit('translateend');
      (self._opening && Math.abs(self._currentOffsetX) > self._tolerance) ? self.open() : self.close();
    }
    self._moved = false;
  };

  this.panel.addEventListener(touch.end, this._onTouchEndFn);

  /**
   * Translates panel on touchmove
   */
  this._onTouchMoveFn = function(eve) {

    if (self._startOffsetX > self._menuTriggerWidth && !self.isOpen() && self._options.itemToMove == 'menu') {
      return;
    }

    if (scrolling || self._preventOpen || typeof eve.touches === 'undefined') {
      return;
    }

    var dif_x = eve.touches[0].clientX - self._startOffsetX;
    var translateX = self._currentOffsetX = dif_x;

    if (Math.abs(translateX) > self._padding) {
      return;
    }

    if (Math.abs(dif_x) > 20) {

      self._opening = true;

      var oriented_dif_x = dif_x * self._orientation;

      if (self._opened && oriented_dif_x > 0 || !self._opened && oriented_dif_x < 0) {
        return;
      }

      if (!self._moved) {
        self.emit('translatestart');
      }

      if (oriented_dif_x <= 0) {
        translateX = dif_x + self._padding * self._orientation;
        self._opening = false;
      }

      if (!self._moved && html.className.search('slideout-open') === -1) {
        html.className += ' slideout-open';
      }

      if (self._options.itemToMove == "panel" || self._options.itemToMove == "both" || self._options.itemToMove == undefined) {
        self.panel.style[prefix + 'transform'] = self.panel.style.transform = 'translateX(' + translateX + 'px)';
      }
      if (self._options.itemToMove == "menu" || self._options.itemToMove == "both") {
        self.menu.style[prefix + 'transform'] = self.menu.style.transform = 'translate3d(' + (translateX - self.menu.clientWidth) + 'px, 0, 0)';
      }

      self.emit('translate', translateX);
      self._moved = true;
    }

  };

  this.panel.addEventListener(touch.move, this._onTouchMoveFn);

  return this;
};

/**
 * Enable opening the slideout via touch events.
 */
Slideout.prototype.enableTouch = function() {
  this._touch = true;
  return this;
};

/**
 * Disable opening the slideout via touch events.
 */
Slideout.prototype.disableTouch = function() {
  this._touch = false;
  return this;
};

/**
 * Destroy an instance of slideout.
 */
Slideout.prototype.destroy = function() {
  // Close before clean
  this.close();

  // Remove event listeners
  doc.removeEventListener(touch.move, this._preventMove);
  this.panel.removeEventListener(touch.start, this._resetTouchFn);
  this.panel.removeEventListener('touchcancel', this._onTouchCancelFn);
  this.panel.removeEventListener(touch.end, this._onTouchEndFn);
  this.panel.removeEventListener(touch.move, this._onTouchMoveFn);
  doc.removeEventListener('scroll', this._onScrollFn);

  // Remove methods
  this.open = this.close = function() {};

  // Return the instance so it can be easily dereferenced
  return this;
};

/**
 * Expose Slideout
 */
module.exports = Slideout;

},{"decouple":2,"emitter":3}],2:[function(require,module,exports){
'use strict';

var requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60);
    };
}());

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

  return captureEvent;
}

/**
 * Expose decouple
 */
module.exports = decouple;

},{}],3:[function(require,module,exports){
"use strict";

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

exports.__esModule = true;
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

  Emitter.prototype.on = function on(event, listener) {
    // Use the current collection or create it.
    this._eventCollection = this._eventCollection || {};

    // Use the current collection of an event or create it.
    this._eventCollection[event] = this._eventCollection[event] || [];

    // Appends the listener into the collection of the given event
    this._eventCollection[event].push(listener);

    return this;
  };

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

  Emitter.prototype.once = function once(event, listener) {
    var self = this;

    function fn() {
      self.off(event, fn);
      listener.apply(this, arguments);
    }

    fn.listener = listener;

    this.on(event, fn);

    return this;
  };

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

  Emitter.prototype.off = function off(event, listener) {

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
  };

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

  Emitter.prototype.emit = function emit(event) {
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
  };

  return Emitter;
})();

/**
 * Exports Emitter
 */
exports["default"] = Emitter;
module.exports = exports["default"];
},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3Nlci1wYWNrXFxfcHJlbHVkZS5qcyIsImluZGV4LmpzIiwibm9kZV9tb2R1bGVzXFxkZWNvdXBsZVxcaW5kZXguanMiLCJub2RlX21vZHVsZXNcXGVtaXR0ZXJcXGRpc3RcXGluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxWUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcclxuXHJcbi8qKlxyXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzXHJcbiAqL1xyXG52YXIgZGVjb3VwbGUgPSByZXF1aXJlKCdkZWNvdXBsZScpO1xyXG52YXIgRW1pdHRlciA9IHJlcXVpcmUoJ2VtaXR0ZXInKTtcclxuXHJcbi8qKlxyXG4gKiBQcml2YXRlc1xyXG4gKi9cclxudmFyIHNjcm9sbFRpbWVvdXQ7XHJcbnZhciBzY3JvbGxpbmcgPSBmYWxzZTtcclxudmFyIGRvYyA9IHdpbmRvdy5kb2N1bWVudDtcclxudmFyIGh0bWwgPSBkb2MuZG9jdW1lbnRFbGVtZW50O1xyXG52YXIgbXNQb2ludGVyU3VwcG9ydGVkID0gd2luZG93Lm5hdmlnYXRvci5tc1BvaW50ZXJFbmFibGVkO1xyXG52YXIgdG91Y2ggPSB7XHJcbiAgJ3N0YXJ0JzogbXNQb2ludGVyU3VwcG9ydGVkID8gJ01TUG9pbnRlckRvd24nIDogJ3RvdWNoc3RhcnQnLFxyXG4gICdtb3ZlJzogbXNQb2ludGVyU3VwcG9ydGVkID8gJ01TUG9pbnRlck1vdmUnIDogJ3RvdWNobW92ZScsXHJcbiAgJ2VuZCc6IG1zUG9pbnRlclN1cHBvcnRlZCA/ICdNU1BvaW50ZXJVcCcgOiAndG91Y2hlbmQnXHJcbn07XHJcbnZhciBwcmVmaXggPSAoZnVuY3Rpb24gcHJlZml4KCkge1xyXG4gIHZhciByZWdleCA9IC9eKFdlYmtpdHxLaHRtbHxNb3p8bXN8TykoPz1bQS1aXSkvO1xyXG4gIHZhciBzdHlsZURlY2xhcmF0aW9uID0gZG9jLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKVswXS5zdHlsZTtcclxuICBmb3IgKHZhciBwcm9wIGluIHN0eWxlRGVjbGFyYXRpb24pIHtcclxuICAgIGlmIChyZWdleC50ZXN0KHByb3ApKSB7XHJcbiAgICAgIHJldHVybiAnLScgKyBwcm9wLm1hdGNoKHJlZ2V4KVswXS50b0xvd2VyQ2FzZSgpICsgJy0nO1xyXG4gICAgfVxyXG4gIH1cclxuICAvLyBOb3RoaW5nIGZvdW5kIHNvIGZhcj8gV2Via2l0IGRvZXMgbm90IGVudW1lcmF0ZSBvdmVyIHRoZSBDU1MgcHJvcGVydGllcyBvZiB0aGUgc3R5bGUgb2JqZWN0LlxyXG4gIC8vIEhvd2V2ZXIgKHByb3AgaW4gc3R5bGUpIHJldHVybnMgdGhlIGNvcnJlY3QgdmFsdWUsIHNvIHdlJ2xsIGhhdmUgdG8gdGVzdCBmb3JcclxuICAvLyB0aGUgcHJlY2VuY2Ugb2YgYSBzcGVjaWZpYyBwcm9wZXJ0eVxyXG4gIGlmICgnV2Via2l0T3BhY2l0eScgaW4gc3R5bGVEZWNsYXJhdGlvbikgeyByZXR1cm4gJy13ZWJraXQtJzsgfVxyXG4gIGlmICgnS2h0bWxPcGFjaXR5JyBpbiBzdHlsZURlY2xhcmF0aW9uKSB7IHJldHVybiAnLWtodG1sLSc7IH1cclxuICByZXR1cm4gJyc7XHJcbn0oKSk7XHJcbmZ1bmN0aW9uIGV4dGVuZChkZXN0aW5hdGlvbiwgZnJvbSkge1xyXG4gIGZvciAodmFyIHByb3AgaW4gZnJvbSkge1xyXG4gICAgaWYgKGZyb21bcHJvcF0pIHtcclxuICAgICAgZGVzdGluYXRpb25bcHJvcF0gPSBmcm9tW3Byb3BdO1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gZGVzdGluYXRpb247XHJcbn1cclxuZnVuY3Rpb24gaW5oZXJpdHMoY2hpbGQsIHViZXIpIHtcclxuICBjaGlsZC5wcm90b3R5cGUgPSBleHRlbmQoY2hpbGQucHJvdG90eXBlIHx8IHt9LCB1YmVyLnByb3RvdHlwZSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTbGlkZW91dCBjb25zdHJ1Y3RvclxyXG4gKi9cclxuZnVuY3Rpb24gU2xpZGVvdXQob3B0aW9ucykge1xyXG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xyXG4gIC8vIFN0b3JlIHRoZSBvcHRpb25zXHJcbiAgdGhpcy5fb3B0aW9ucyA9IG9wdGlvbnM7XHJcblxyXG4gIC8vIFNldHMgZGVmYXVsdCB2YWx1ZXNcclxuICB0aGlzLl9zdGFydE9mZnNldFggPSAwO1xyXG4gIHRoaXMuX2N1cnJlbnRPZmZzZXRYID0gMDtcclxuICB0aGlzLl9vcGVuaW5nID0gZmFsc2U7XHJcbiAgdGhpcy5fbW92ZWQgPSBmYWxzZTtcclxuICB0aGlzLl9vcGVuZWQgPSBmYWxzZTtcclxuICB0aGlzLl9wcmV2ZW50T3BlbiA9IGZhbHNlO1xyXG4gIHRoaXMuX3RvdWNoID0gb3B0aW9ucy50b3VjaCA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IG9wdGlvbnMudG91Y2ggJiYgdHJ1ZTtcclxuXHJcbiAgLy8gU2V0cyBwYW5lbFxyXG4gIHRoaXMucGFuZWwgPSBvcHRpb25zLnBhbmVsO1xyXG4gIHRoaXMubWVudSA9IG9wdGlvbnMubWVudTtcclxuXHJcbiAgLy8gU2V0cyAgY2xhc3NuYW1lc1xyXG4gIGlmKHRoaXMucGFuZWwuY2xhc3NOYW1lLnNlYXJjaCgnc2xpZGVvdXQtcGFuZWwnKSA9PT0gLTEpIHsgdGhpcy5wYW5lbC5jbGFzc05hbWUgKz0gJyBzbGlkZW91dC1wYW5lbCc7IH1cclxuICBpZih0aGlzLm1lbnUuY2xhc3NOYW1lLnNlYXJjaCgnc2xpZGVvdXQtbWVudScpID09PSAtMSkgeyB0aGlzLm1lbnUuY2xhc3NOYW1lICs9ICcgc2xpZGVvdXQtbWVudSc7IH1cclxuXHJcbiAgaWYgKChvcHRpb25zLml0ZW1Ub01vdmUgPT0gJ21lbnUnIHx8IG9wdGlvbnMuaXRlbVRvTW92ZSA9PSAnYm90aCcpICYmIHRoaXMubWVudS5jbGFzc05hbWUuc2VhcmNoKCdzbGlkZW91dC1tZW51LS1tb3ZlJykgPT09IC0xKSB7XHJcbiAgICB0aGlzLm1lbnUuY2xhc3NOYW1lICs9ICcgc2xpZGVvdXQtbWVudS0tbW92ZSc7XHJcbiAgfVxyXG5cclxuICAvLyBTZXRzIG9wdGlvbnNcclxuICB0aGlzLl9meCA9IG9wdGlvbnMuZnggfHwgJ2Vhc2UnO1xyXG4gIHRoaXMuX2R1cmF0aW9uID0gcGFyc2VJbnQob3B0aW9ucy5kdXJhdGlvbiwgMTApIHx8IDMwMDtcclxuICB0aGlzLl90b2xlcmFuY2UgPSBwYXJzZUludChvcHRpb25zLnRvbGVyYW5jZSwgMTApIHx8IDcwO1xyXG4gIHRoaXMuX3BhZGRpbmcgPSB0aGlzLl90cmFuc2xhdGVUbyA9IHBhcnNlSW50KG9wdGlvbnMucGFkZGluZywgMTApIHx8IDI1NjtcclxuICB0aGlzLl9vcmllbnRhdGlvbiA9IG9wdGlvbnMuc2lkZSA9PT0gJ3JpZ2h0JyA/IC0xIDogMTtcclxuICB0aGlzLl90cmFuc2xhdGVUbyAqPSB0aGlzLl9vcmllbnRhdGlvbjtcclxuXHJcbiAgLy8gSW5pdCB0b3VjaCBldmVudHNcclxuICBpZiAodGhpcy5fdG91Y2gpIHtcclxuICAgIHRoaXMuX2luaXRUb3VjaEV2ZW50cygpO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEluaGVyaXRzIGZyb20gRW1pdHRlclxyXG4gKi9cclxuaW5oZXJpdHMoU2xpZGVvdXQsIEVtaXR0ZXIpO1xyXG5cclxuLyoqXHJcbiAqIE9wZW5zIHRoZSBzbGlkZW91dCBtZW51LlxyXG4gKi9cclxuU2xpZGVvdXQucHJvdG90eXBlLm9wZW4gPSBmdW5jdGlvbigpIHtcclxuICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgdGhpcy5lbWl0KCdiZWZvcmVvcGVuJyk7XHJcbiAgaWYgKGh0bWwuY2xhc3NOYW1lLnNlYXJjaCgnc2xpZGVvdXQtb3BlbicpID09PSAtMSkgeyBodG1sLmNsYXNzTmFtZSArPSAnIHNsaWRlb3V0LW9wZW4nOyB9XHJcbiAgdGhpcy5fc2V0VHJhbnNpdGlvbigpO1xyXG4gIHNlbGYuX3JlY2FsY3VsYXRlQWxsKCk7XHJcbiAgdGhpcy5fdHJhbnNsYXRlWFRvKHRoaXMuX3RyYW5zbGF0ZVRvKTtcclxuICB0aGlzLl9vcGVuZWQgPSB0cnVlO1xyXG4gIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoc2VsZi5fb3B0aW9ucy5pdGVtVG9Nb3ZlID09IFwicGFuZWxcIiB8fCBzZWxmLl9vcHRpb25zLml0ZW1Ub01vdmUgPT0gXCJib3RoXCIgfHwgc2VsZi5fb3B0aW9ucy5pdGVtVG9Nb3ZlID09IHVuZGVmaW5lZCkge1xyXG4gICAgICBzZWxmLnBhbmVsLnN0eWxlLnRyYW5zaXRpb24gPSBzZWxmLnBhbmVsLnN0eWxlWyctd2Via2l0LXRyYW5zaXRpb24nXSA9ICcnO1xyXG4gICAgfVxyXG4gICAgaWYgKHNlbGYuX29wdGlvbnMuaXRlbVRvTW92ZSA9PSBcIm1lbnVcIiB8fCBzZWxmLl9vcHRpb25zLml0ZW1Ub01vdmUgPT0gXCJib3RoXCIpIHtcclxuICAgICAgc2VsZi5tZW51LnN0eWxlLnRyYW5zaXRpb24gPSBzZWxmLm1lbnUuc3R5bGVbJy13ZWJraXQtdHJhbnNpdGlvbiddID0gJyc7XHJcbiAgICB9XHJcbiAgICBzZWxmLmVtaXQoJ29wZW4nKTtcclxuICB9LCB0aGlzLl9kdXJhdGlvbiArIDUwKTtcclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBDbG9zZXMgc2xpZGVvdXQgbWVudS5cclxuICovXHJcblNsaWRlb3V0LnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKCkge1xyXG4gIHZhciBzZWxmID0gdGhpcztcclxuICBpZiAoIXRoaXMuaXNPcGVuKCkgJiYgIXRoaXMuX29wZW5pbmcpIHtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuICB0aGlzLmVtaXQoJ2JlZm9yZWNsb3NlJyk7XHJcbiAgdGhpcy5fc2V0VHJhbnNpdGlvbigpO1xyXG4gIHRoaXMuX3RyYW5zbGF0ZVhUbygwKTtcclxuICB0aGlzLl9vcGVuZWQgPSBmYWxzZTtcclxuICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgaHRtbC5jbGFzc05hbWUgPSBodG1sLmNsYXNzTmFtZS5yZXBsYWNlKC8gc2xpZGVvdXQtb3Blbi8sICcnKTtcclxuICAgIGlmIChzZWxmLl9vcHRpb25zLml0ZW1Ub01vdmUgPT0gXCJwYW5lbFwiIHx8IHNlbGYuX29wdGlvbnMuaXRlbVRvTW92ZSA9PSBcImJvdGhcIiB8fCBzZWxmLl9vcHRpb25zLml0ZW1Ub01vdmUgPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIHNlbGYucGFuZWwuc3R5bGUudHJhbnNpdGlvbiA9IHNlbGYucGFuZWwuc3R5bGVbJy13ZWJraXQtdHJhbnNpdGlvbiddID0gc2VsZi5wYW5lbC5zdHlsZVtwcmVmaXggKyAndHJhbnNmb3JtJ10gPSBzZWxmLnBhbmVsLnN0eWxlLnRyYW5zZm9ybSA9ICcnO1xyXG4gICAgfVxyXG4gICAgaWYgKHNlbGYuX29wdGlvbnMuaXRlbVRvTW92ZSA9PSBcIm1lbnVcIiB8fCBzZWxmLl9vcHRpb25zLml0ZW1Ub01vdmUgPT0gXCJib3RoXCIpIHtcclxuICAgICAgc2VsZi5tZW51LnN0eWxlLnRyYW5zaXRpb24gPSBzZWxmLm1lbnUuc3R5bGVbJy13ZWJraXQtdHJhbnNpdGlvbiddID0gc2VsZi5tZW51LnN0eWxlW3ByZWZpeCArICd0cmFuc2Zvcm0nXSA9IHNlbGYubWVudS5zdHlsZS50cmFuc2Zvcm0gPSAnJztcclxuICAgIH1cclxuICAgIHNlbGYuZW1pdCgnY2xvc2UnKTtcclxuICB9LCB0aGlzLl9kdXJhdGlvbiArIDUwKTtcclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBUb2dnbGVzIChvcGVuL2Nsb3NlKSBzbGlkZW91dCBtZW51LlxyXG4gKi9cclxuU2xpZGVvdXQucHJvdG90eXBlLnRvZ2dsZSA9IGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB0aGlzLmlzT3BlbigpID8gdGhpcy5jbG9zZSgpIDogdGhpcy5vcGVuKCk7XHJcbn07XHJcblxyXG4vKipcclxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBzbGlkZW91dCBpcyBjdXJyZW50bHkgb3BlbiwgYW5kIGZhbHNlIGlmIGl0IGlzIGNsb3NlZC5cclxuICovXHJcblNsaWRlb3V0LnByb3RvdHlwZS5pc09wZW4gPSBmdW5jdGlvbigpIHtcclxuICByZXR1cm4gdGhpcy5fb3BlbmVkO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJlY2FsY3VsYXRlcyB0aGUgc2xpZGUgb3V0XHJcbiAqL1xyXG5TbGlkZW91dC5wcm90b3R5cGUuX3JlY2FsY3VsYXRlQWxsID0gZnVuY3Rpb24gKCkge1xyXG5cclxuICAgIC8vdGhpcy5fb3B0aW9ucy5wYWRkaW5nID0gdGhpcy5tZW51LmNsaWVudFdpZHRoO1xyXG5cclxuICAgIC8vIFNldHMgZGVmYXVsdCB2YWx1ZXNcclxuICAgIHRoaXMuX3N0YXJ0T2Zmc2V0WCA9IDA7XHJcbiAgICB0aGlzLl9jdXJyZW50T2Zmc2V0WCA9IDA7XHJcbiAgICB0aGlzLl9vcGVuaW5nID0gZmFsc2U7XHJcbiAgICB0aGlzLl9tb3ZlZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5fb3BlbmVkID0gZmFsc2U7XHJcbiAgICB0aGlzLl9wcmV2ZW50T3BlbiA9IGZhbHNlO1xyXG4gICAgdGhpcy5fdG91Y2ggPSB0aGlzLl9vcHRpb25zLnRvdWNoID09PSB1bmRlZmluZWQgPyB0cnVlIDogdGhpcy5fb3B0aW9ucy50b3VjaCAmJiB0cnVlO1xyXG4gICAgdGhpcy5fbWVudVRyaWdnZXJXaWR0aCA9IHRoaXMuX29wdGlvbnMubWVudVRyaWdnZXJXaWR0aCA9PT0gdW5kZWZpbmVkID8gNzAgOiB0aGlzLl9vcHRpb25zLm1lbnVUcmlnZ2VyV2lkdGg7XHJcblxyXG4gICAgLy8gU2V0cyBwYW5lbFxyXG4gICAgdGhpcy5wYW5lbCA9IHRoaXMuX29wdGlvbnMucGFuZWw7XHJcbiAgICB0aGlzLm1lbnUgPSB0aGlzLl9vcHRpb25zLm1lbnU7XHJcblxyXG4gICAgLy8gU2V0cyAgY2xhc3NuYW1lc1xyXG4gICAgaWYgKHRoaXMucGFuZWwuY2xhc3NOYW1lLnNlYXJjaCgnc2xpZGVvdXQtcGFuZWwnKSA9PT0gLTEpIHsgdGhpcy5wYW5lbC5jbGFzc05hbWUgKz0gJyBzbGlkZW91dC1wYW5lbCc7IH1cclxuICAgIGlmICh0aGlzLm1lbnUuY2xhc3NOYW1lLnNlYXJjaCgnc2xpZGVvdXQtbWVudScpID09PSAtMSkgeyB0aGlzLm1lbnUuY2xhc3NOYW1lICs9ICcgc2xpZGVvdXQtbWVudSc7IH1cclxuXHJcblxyXG4gICAgLy8gU2V0cyBvcHRpb25zXHJcbiAgICB0aGlzLl9meCA9IHRoaXMuX29wdGlvbnMuZnggfHwgJ2Vhc2UnO1xyXG4gICAgdGhpcy5fZHVyYXRpb24gPSBwYXJzZUludCh0aGlzLl9vcHRpb25zLmR1cmF0aW9uLCAxMCkgfHwgMzAwO1xyXG4gICAgdGhpcy5fdG9sZXJhbmNlID0gcGFyc2VJbnQodGhpcy5fb3B0aW9ucy50b2xlcmFuY2UsIDEwKSB8fCA3MDtcclxuICAgIHRoaXMuX3BhZGRpbmcgPSB0aGlzLl90cmFuc2xhdGVUbyA9IHBhcnNlSW50KHRoaXMuX29wdGlvbnMucGFkZGluZywgMTApIHx8IDI1NjtcclxuICAgIHRoaXMuX29yaWVudGF0aW9uID0gdGhpcy5fb3B0aW9ucy5zaWRlID09PSAncmlnaHQnID8gLTEgOiAxO1xyXG4gICAgdGhpcy5fdHJhbnNsYXRlVG8gKj0gdGhpcy5fb3JpZW50YXRpb247XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUcmFuc2xhdGVzIHBhbmVsIGFuZCB1cGRhdGVzIGN1cnJlbnRPZmZzZXQgd2l0aCBhIGdpdmVuIFggcG9pbnRcclxuICovXHJcblNsaWRlb3V0LnByb3RvdHlwZS5fdHJhbnNsYXRlWFRvID0gZnVuY3Rpb24odHJhbnNsYXRlWCkge1xyXG4gIHRoaXMuX2N1cnJlbnRPZmZzZXRYID0gdHJhbnNsYXRlWDtcclxuICBpZiAodGhpcy5fb3B0aW9ucy5pdGVtVG9Nb3ZlID09IFwicGFuZWxcIiB8fCB0aGlzLl9vcHRpb25zLml0ZW1Ub01vdmUgPT0gXCJib3RoXCIgfHwgdGhpcy5fb3B0aW9ucy5pdGVtVG9Nb3ZlID09IHVuZGVmaW5lZCkge1xyXG4gICAgdGhpcy5wYW5lbC5zdHlsZVtwcmVmaXggKyAndHJhbnNmb3JtJ10gPSB0aGlzLnBhbmVsLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGVYKCcgKyB0cmFuc2xhdGVYICsgJ3B4KSc7XHJcbiAgfVxyXG4gIGlmICh0aGlzLl9vcHRpb25zLml0ZW1Ub01vdmUgPT0gXCJtZW51XCIgfHwgdGhpcy5fb3B0aW9ucy5pdGVtVG9Nb3ZlID09IFwiYm90aFwiKSB7XHJcbiAgICB0aGlzLm1lbnUuc3R5bGVbcHJlZml4ICsgJ3RyYW5zZm9ybSddID0gdGhpcy5tZW51LnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUzZCgnICsgKHRyYW5zbGF0ZVggLSB0aGlzLm1lbnUuY2xpZW50V2lkdGgpICsgJ3B4LCAwLCAwKSc7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBTZXQgdHJhbnNpdGlvbiBwcm9wZXJ0aWVzXHJcbiAqL1xyXG5TbGlkZW91dC5wcm90b3R5cGUuX3NldFRyYW5zaXRpb24gPSBmdW5jdGlvbigpIHtcclxuICBpZiAodGhpcy5fb3B0aW9ucy5pdGVtVG9Nb3ZlID09IFwicGFuZWxcIiB8fCB0aGlzLl9vcHRpb25zLml0ZW1Ub01vdmUgPT0gXCJib3RoXCIgfHwgdGhpcy5fb3B0aW9ucy5pdGVtVG9Nb3ZlID09IHVuZGVmaW5lZCkge1xyXG4gICAgdGhpcy5wYW5lbC5zdHlsZVtwcmVmaXggKyAndHJhbnNpdGlvbiddID0gdGhpcy5wYW5lbC5zdHlsZS50cmFuc2l0aW9uID0gcHJlZml4ICsgJ3RyYW5zZm9ybSAnICsgdGhpcy5fZHVyYXRpb24gKyAnbXMgJyArIHRoaXMuX2Z4O1xyXG4gIH1cclxuICBpZiAodGhpcy5fb3B0aW9ucy5pdGVtVG9Nb3ZlID09IFwibWVudVwiIHx8IHRoaXMuX29wdGlvbnMuaXRlbVRvTW92ZSA9PSBcImJvdGhcIikge1xyXG4gICAgdGhpcy5tZW51LnN0eWxlW3ByZWZpeCArICd0cmFuc2l0aW9uJ10gPSB0aGlzLm1lbnUuc3R5bGUudHJhbnNpdGlvbiA9IHByZWZpeCArICd0cmFuc2Zvcm0gJyArIHRoaXMuX2R1cmF0aW9uICsgJ21zICcgKyB0aGlzLl9meDtcclxuICB9XG5cclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBJbml0aWFsaXplcyB0b3VjaCBldmVudFxyXG4gKi9cclxuU2xpZGVvdXQucHJvdG90eXBlLl9pbml0VG91Y2hFdmVudHMgPSBmdW5jdGlvbigpIHtcclxuICB2YXIgc2VsZiA9IHRoaXM7XHJcblxyXG4gIC8qKlxyXG4gICAqIERlY291cGxlIHNjcm9sbCBldmVudFxyXG4gICAqL1xyXG4gIHRoaXMuX29uU2Nyb2xsRm4gPSBkZWNvdXBsZShkb2MsICdzY3JvbGwnLCBmdW5jdGlvbigpIHtcclxuICAgIGlmICghc2VsZi5fbW92ZWQpIHtcclxuICAgICAgY2xlYXJUaW1lb3V0KHNjcm9sbFRpbWVvdXQpO1xyXG4gICAgICBzY3JvbGxpbmcgPSB0cnVlO1xyXG4gICAgICBzY3JvbGxUaW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICBzY3JvbGxpbmcgPSBmYWxzZTtcclxuICAgICAgfSwgMjUwKTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgLyoqXHJcbiAgICogUHJldmVudHMgdG91Y2htb3ZlIGV2ZW50IGlmIHNsaWRlb3V0IGlzIG1vdmluZ1xyXG4gICAqL1xyXG4gIHRoaXMuX3ByZXZlbnRNb3ZlID0gZnVuY3Rpb24oZXZlKSB7XHJcbiAgICBpZiAoc2VsZi5fbW92ZWQpIHtcclxuICAgICAgZXZlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgZG9jLmFkZEV2ZW50TGlzdGVuZXIodG91Y2gubW92ZSwgdGhpcy5fcHJldmVudE1vdmUpO1xyXG5cclxuICAvKipcclxuICAgKiBSZXNldHMgdmFsdWVzIG9uIHRvdWNoc3RhcnRcclxuICAgKi9cclxuICB0aGlzLl9yZXNldFRvdWNoRm4gPSBmdW5jdGlvbihldmUpIHtcclxuICAgIGlmICh0eXBlb2YgZXZlLnRvdWNoZXMgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBzZWxmLl9tb3ZlZCA9IGZhbHNlO1xyXG4gICAgc2VsZi5fb3BlbmluZyA9IGZhbHNlO1xyXG4gICAgc2VsZi5fc3RhcnRPZmZzZXRYID0gZXZlLnRvdWNoZXNbMF0ucGFnZVg7XHJcbiAgICBzZWxmLl9wcmV2ZW50T3BlbiA9ICghc2VsZi5fdG91Y2ggfHwgKCFzZWxmLmlzT3BlbigpICYmIHNlbGYubWVudS5jbGllbnRXaWR0aCAhPT0gMCkpO1xyXG4gIH07XHJcblxyXG4gIHRoaXMucGFuZWwuYWRkRXZlbnRMaXN0ZW5lcih0b3VjaC5zdGFydCwgdGhpcy5fcmVzZXRUb3VjaEZuKTtcclxuXHJcbiAgLyoqXHJcbiAgICogUmVzZXRzIHZhbHVlcyBvbiB0b3VjaGNhbmNlbFxyXG4gICAqL1xyXG4gIHRoaXMuX29uVG91Y2hDYW5jZWxGbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgc2VsZi5fbW92ZWQgPSBmYWxzZTtcclxuICAgIHNlbGYuX29wZW5pbmcgPSBmYWxzZTtcclxuICB9O1xyXG5cclxuICB0aGlzLnBhbmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoY2FuY2VsJywgdGhpcy5fb25Ub3VjaENhbmNlbEZuKTtcclxuXHJcbiAgLyoqXHJcbiAgICogVG9nZ2xlcyBzbGlkZW91dCBvbiB0b3VjaGVuZFxyXG4gICAqL1xyXG4gIHRoaXMuX29uVG91Y2hFbmRGbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKHNlbGYuX21vdmVkKSB7XHJcbiAgICAgIHNlbGYuZW1pdCgndHJhbnNsYXRlZW5kJyk7XHJcbiAgICAgIChzZWxmLl9vcGVuaW5nICYmIE1hdGguYWJzKHNlbGYuX2N1cnJlbnRPZmZzZXRYKSA+IHNlbGYuX3RvbGVyYW5jZSkgPyBzZWxmLm9wZW4oKSA6IHNlbGYuY2xvc2UoKTtcclxuICAgIH1cclxuICAgIHNlbGYuX21vdmVkID0gZmFsc2U7XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5wYW5lbC5hZGRFdmVudExpc3RlbmVyKHRvdWNoLmVuZCwgdGhpcy5fb25Ub3VjaEVuZEZuKTtcclxuXHJcbiAgLyoqXHJcbiAgICogVHJhbnNsYXRlcyBwYW5lbCBvbiB0b3VjaG1vdmVcclxuICAgKi9cclxuICB0aGlzLl9vblRvdWNoTW92ZUZuID0gZnVuY3Rpb24oZXZlKSB7XHJcblxyXG4gICAgaWYgKHNlbGYuX3N0YXJ0T2Zmc2V0WCA+IHNlbGYuX21lbnVUcmlnZ2VyV2lkdGggJiYgIXNlbGYuaXNPcGVuKCkgJiYgc2VsZi5fb3B0aW9ucy5pdGVtVG9Nb3ZlID09ICdtZW51Jykge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHNjcm9sbGluZyB8fCBzZWxmLl9wcmV2ZW50T3BlbiB8fCB0eXBlb2YgZXZlLnRvdWNoZXMgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgZGlmX3ggPSBldmUudG91Y2hlc1swXS5jbGllbnRYIC0gc2VsZi5fc3RhcnRPZmZzZXRYO1xyXG4gICAgdmFyIHRyYW5zbGF0ZVggPSBzZWxmLl9jdXJyZW50T2Zmc2V0WCA9IGRpZl94O1xyXG5cclxuICAgIGlmIChNYXRoLmFicyh0cmFuc2xhdGVYKSA+IHNlbGYuX3BhZGRpbmcpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChNYXRoLmFicyhkaWZfeCkgPiAyMCkge1xyXG5cclxuICAgICAgc2VsZi5fb3BlbmluZyA9IHRydWU7XHJcblxyXG4gICAgICB2YXIgb3JpZW50ZWRfZGlmX3ggPSBkaWZfeCAqIHNlbGYuX29yaWVudGF0aW9uO1xyXG5cclxuICAgICAgaWYgKHNlbGYuX29wZW5lZCAmJiBvcmllbnRlZF9kaWZfeCA+IDAgfHwgIXNlbGYuX29wZW5lZCAmJiBvcmllbnRlZF9kaWZfeCA8IDApIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghc2VsZi5fbW92ZWQpIHtcclxuICAgICAgICBzZWxmLmVtaXQoJ3RyYW5zbGF0ZXN0YXJ0Jyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChvcmllbnRlZF9kaWZfeCA8PSAwKSB7XHJcbiAgICAgICAgdHJhbnNsYXRlWCA9IGRpZl94ICsgc2VsZi5fcGFkZGluZyAqIHNlbGYuX29yaWVudGF0aW9uO1xyXG4gICAgICAgIHNlbGYuX29wZW5pbmcgPSBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCFzZWxmLl9tb3ZlZCAmJiBodG1sLmNsYXNzTmFtZS5zZWFyY2goJ3NsaWRlb3V0LW9wZW4nKSA9PT0gLTEpIHtcclxuICAgICAgICBodG1sLmNsYXNzTmFtZSArPSAnIHNsaWRlb3V0LW9wZW4nO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoc2VsZi5fb3B0aW9ucy5pdGVtVG9Nb3ZlID09IFwicGFuZWxcIiB8fCBzZWxmLl9vcHRpb25zLml0ZW1Ub01vdmUgPT0gXCJib3RoXCIgfHwgc2VsZi5fb3B0aW9ucy5pdGVtVG9Nb3ZlID09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIHNlbGYucGFuZWwuc3R5bGVbcHJlZml4ICsgJ3RyYW5zZm9ybSddID0gc2VsZi5wYW5lbC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlWCgnICsgdHJhbnNsYXRlWCArICdweCknO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChzZWxmLl9vcHRpb25zLml0ZW1Ub01vdmUgPT0gXCJtZW51XCIgfHwgc2VsZi5fb3B0aW9ucy5pdGVtVG9Nb3ZlID09IFwiYm90aFwiKSB7XHJcbiAgICAgICAgc2VsZi5tZW51LnN0eWxlW3ByZWZpeCArICd0cmFuc2Zvcm0nXSA9IHNlbGYubWVudS5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlM2QoJyArICh0cmFuc2xhdGVYIC0gc2VsZi5tZW51LmNsaWVudFdpZHRoKSArICdweCwgMCwgMCknO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzZWxmLmVtaXQoJ3RyYW5zbGF0ZScsIHRyYW5zbGF0ZVgpO1xyXG4gICAgICBzZWxmLl9tb3ZlZCA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gIH07XHJcblxyXG4gIHRoaXMucGFuZWwuYWRkRXZlbnRMaXN0ZW5lcih0b3VjaC5tb3ZlLCB0aGlzLl9vblRvdWNoTW92ZUZuKTtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vKipcclxuICogRW5hYmxlIG9wZW5pbmcgdGhlIHNsaWRlb3V0IHZpYSB0b3VjaCBldmVudHMuXHJcbiAqL1xyXG5TbGlkZW91dC5wcm90b3R5cGUuZW5hYmxlVG91Y2ggPSBmdW5jdGlvbigpIHtcclxuICB0aGlzLl90b3VjaCA9IHRydWU7XHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vKipcclxuICogRGlzYWJsZSBvcGVuaW5nIHRoZSBzbGlkZW91dCB2aWEgdG91Y2ggZXZlbnRzLlxyXG4gKi9cclxuU2xpZGVvdXQucHJvdG90eXBlLmRpc2FibGVUb3VjaCA9IGZ1bmN0aW9uKCkge1xyXG4gIHRoaXMuX3RvdWNoID0gZmFsc2U7XHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vKipcclxuICogRGVzdHJveSBhbiBpbnN0YW5jZSBvZiBzbGlkZW91dC5cclxuICovXHJcblNsaWRlb3V0LnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XHJcbiAgLy8gQ2xvc2UgYmVmb3JlIGNsZWFuXHJcbiAgdGhpcy5jbG9zZSgpO1xyXG5cclxuICAvLyBSZW1vdmUgZXZlbnQgbGlzdGVuZXJzXHJcbiAgZG9jLnJlbW92ZUV2ZW50TGlzdGVuZXIodG91Y2gubW92ZSwgdGhpcy5fcHJldmVudE1vdmUpO1xyXG4gIHRoaXMucGFuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcih0b3VjaC5zdGFydCwgdGhpcy5fcmVzZXRUb3VjaEZuKTtcclxuICB0aGlzLnBhbmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoY2FuY2VsJywgdGhpcy5fb25Ub3VjaENhbmNlbEZuKTtcclxuICB0aGlzLnBhbmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIodG91Y2guZW5kLCB0aGlzLl9vblRvdWNoRW5kRm4pO1xyXG4gIHRoaXMucGFuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcih0b3VjaC5tb3ZlLCB0aGlzLl9vblRvdWNoTW92ZUZuKTtcclxuICBkb2MucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgdGhpcy5fb25TY3JvbGxGbik7XHJcblxyXG4gIC8vIFJlbW92ZSBtZXRob2RzXHJcbiAgdGhpcy5vcGVuID0gdGhpcy5jbG9zZSA9IGZ1bmN0aW9uKCkge307XHJcblxyXG4gIC8vIFJldHVybiB0aGUgaW5zdGFuY2Ugc28gaXQgY2FuIGJlIGVhc2lseSBkZXJlZmVyZW5jZWRcclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBFeHBvc2UgU2xpZGVvdXRcclxuICovXHJcbm1vZHVsZS5leHBvcnRzID0gU2xpZGVvdXQ7XHJcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHJlcXVlc3RBbmltRnJhbWUgPSAoZnVuY3Rpb24oKSB7XG4gIHJldHVybiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgIGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgd2luZG93LnNldFRpbWVvdXQoY2FsbGJhY2ssIDEwMDAgLyA2MCk7XG4gICAgfTtcbn0oKSk7XG5cbmZ1bmN0aW9uIGRlY291cGxlKG5vZGUsIGV2ZW50LCBmbikge1xuICB2YXIgZXZlLFxuICAgICAgdHJhY2tpbmcgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBjYXB0dXJlRXZlbnQoZSkge1xuICAgIGV2ZSA9IGU7XG4gICAgdHJhY2soKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRyYWNrKCkge1xuICAgIGlmICghdHJhY2tpbmcpIHtcbiAgICAgIHJlcXVlc3RBbmltRnJhbWUodXBkYXRlKTtcbiAgICAgIHRyYWNraW5nID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGUoKSB7XG4gICAgZm4uY2FsbChub2RlLCBldmUpO1xuICAgIHRyYWNraW5nID0gZmFsc2U7XG4gIH1cblxuICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGNhcHR1cmVFdmVudCwgZmFsc2UpO1xuXG4gIHJldHVybiBjYXB0dXJlRXZlbnQ7XG59XG5cbi8qKlxuICogRXhwb3NlIGRlY291cGxlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZGVjb3VwbGU7XG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBfY2xhc3NDYWxsQ2hlY2sgPSBmdW5jdGlvbiAoaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfTtcclxuXHJcbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIEVtaXR0ZXIuXHJcbiAqIEBjbGFzc1xyXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGEgbmV3IGluc3RhbmNlIG9mIEVtaXR0ZXIuXHJcbiAqIEBleGFtcGxlXHJcbiAqIC8vIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgRW1pdHRlci5cclxuICogdmFyIEVtaXR0ZXIgPSByZXF1aXJlKCdlbWl0dGVyJyk7XHJcbiAqXHJcbiAqIHZhciBlbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcclxuICovXHJcblxyXG52YXIgRW1pdHRlciA9IChmdW5jdGlvbiAoKSB7XHJcbiAgZnVuY3Rpb24gRW1pdHRlcigpIHtcclxuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBFbWl0dGVyKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZHMgYSBsaXN0ZW5lciB0byB0aGUgY29sbGVjdGlvbiBmb3IgdGhlIHNwZWNpZmllZCBldmVudC5cclxuICAgKiBAbWVtYmVyb2YhIEVtaXR0ZXIucHJvdG90eXBlXHJcbiAgICogQGZ1bmN0aW9uXHJcbiAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IC0gVGhlIGV2ZW50IG5hbWUuXHJcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXIgLSBBIGxpc3RlbmVyIGZ1bmN0aW9uIHRvIGFkZC5cclxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGFuIGluc3RhbmNlIG9mIEVtaXR0ZXIuXHJcbiAgICogQGV4YW1wbGVcclxuICAgKiAvLyBBZGQgYW4gZXZlbnQgbGlzdGVuZXIgdG8gXCJmb29cIiBldmVudC5cclxuICAgKiBlbWl0dGVyLm9uKCdmb28nLCBsaXN0ZW5lcik7XHJcbiAgICovXHJcblxyXG4gIEVtaXR0ZXIucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gb24oZXZlbnQsIGxpc3RlbmVyKSB7XHJcbiAgICAvLyBVc2UgdGhlIGN1cnJlbnQgY29sbGVjdGlvbiBvciBjcmVhdGUgaXQuXHJcbiAgICB0aGlzLl9ldmVudENvbGxlY3Rpb24gPSB0aGlzLl9ldmVudENvbGxlY3Rpb24gfHwge307XHJcblxyXG4gICAgLy8gVXNlIHRoZSBjdXJyZW50IGNvbGxlY3Rpb24gb2YgYW4gZXZlbnQgb3IgY3JlYXRlIGl0LlxyXG4gICAgdGhpcy5fZXZlbnRDb2xsZWN0aW9uW2V2ZW50XSA9IHRoaXMuX2V2ZW50Q29sbGVjdGlvbltldmVudF0gfHwgW107XHJcblxyXG4gICAgLy8gQXBwZW5kcyB0aGUgbGlzdGVuZXIgaW50byB0aGUgY29sbGVjdGlvbiBvZiB0aGUgZ2l2ZW4gZXZlbnRcclxuICAgIHRoaXMuX2V2ZW50Q29sbGVjdGlvbltldmVudF0ucHVzaChsaXN0ZW5lcik7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQWRkcyBhIGxpc3RlbmVyIHRvIHRoZSBjb2xsZWN0aW9uIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IHRoYXQgd2lsbCBiZSBjYWxsZWQgb25seSBvbmNlLlxyXG4gICAqIEBtZW1iZXJvZiEgRW1pdHRlci5wcm90b3R5cGVcclxuICAgKiBAZnVuY3Rpb25cclxuICAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgLSBUaGUgZXZlbnQgbmFtZS5cclxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lciAtIEEgbGlzdGVuZXIgZnVuY3Rpb24gdG8gYWRkLlxyXG4gICAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYW4gaW5zdGFuY2Ugb2YgRW1pdHRlci5cclxuICAgKiBAZXhhbXBsZVxyXG4gICAqIC8vIFdpbGwgYWRkIGFuIGV2ZW50IGhhbmRsZXIgdG8gXCJmb29cIiBldmVudCBvbmNlLlxyXG4gICAqIGVtaXR0ZXIub25jZSgnZm9vJywgbGlzdGVuZXIpO1xyXG4gICAqL1xyXG5cclxuICBFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24gb25jZShldmVudCwgbGlzdGVuZXIpIHtcclxuICAgIHZhciBzZWxmID0gdGhpcztcclxuXHJcbiAgICBmdW5jdGlvbiBmbigpIHtcclxuICAgICAgc2VsZi5vZmYoZXZlbnQsIGZuKTtcclxuICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuICAgIH1cclxuXHJcbiAgICBmbi5saXN0ZW5lciA9IGxpc3RlbmVyO1xyXG5cclxuICAgIHRoaXMub24oZXZlbnQsIGZuKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmVzIGEgbGlzdGVuZXIgZnJvbSB0aGUgY29sbGVjdGlvbiBmb3IgdGhlIHNwZWNpZmllZCBldmVudC5cclxuICAgKiBAbWVtYmVyb2YhIEVtaXR0ZXIucHJvdG90eXBlXHJcbiAgICogQGZ1bmN0aW9uXHJcbiAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IC0gVGhlIGV2ZW50IG5hbWUuXHJcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXIgLSBBIGxpc3RlbmVyIGZ1bmN0aW9uIHRvIHJlbW92ZS5cclxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGFuIGluc3RhbmNlIG9mIEVtaXR0ZXIuXHJcbiAgICogQGV4YW1wbGVcclxuICAgKiAvLyBSZW1vdmUgYSBnaXZlbiBsaXN0ZW5lci5cclxuICAgKiBlbWl0dGVyLm9mZignZm9vJywgbGlzdGVuZXIpO1xyXG4gICAqL1xyXG5cclxuICBFbWl0dGVyLnByb3RvdHlwZS5vZmYgPSBmdW5jdGlvbiBvZmYoZXZlbnQsIGxpc3RlbmVyKSB7XHJcblxyXG4gICAgdmFyIGxpc3RlbmVycyA9IHVuZGVmaW5lZDtcclxuXHJcbiAgICAvLyBEZWZpbmVzIGxpc3RlbmVycyB2YWx1ZS5cclxuICAgIGlmICghdGhpcy5fZXZlbnRDb2xsZWN0aW9uIHx8ICEobGlzdGVuZXJzID0gdGhpcy5fZXZlbnRDb2xsZWN0aW9uW2V2ZW50XSkpIHtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgbGlzdGVuZXJzLmZvckVhY2goZnVuY3Rpb24gKGZuLCBpKSB7XHJcbiAgICAgIGlmIChmbiA9PT0gbGlzdGVuZXIgfHwgZm4ubGlzdGVuZXIgPT09IGxpc3RlbmVyKSB7XHJcbiAgICAgICAgLy8gUmVtb3ZlcyB0aGUgZ2l2ZW4gbGlzdGVuZXIuXHJcbiAgICAgICAgbGlzdGVuZXJzLnNwbGljZShpLCAxKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gUmVtb3ZlcyBhbiBlbXB0eSBldmVudCBjb2xsZWN0aW9uLlxyXG4gICAgaWYgKGxpc3RlbmVycy5sZW5ndGggPT09IDApIHtcclxuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50Q29sbGVjdGlvbltldmVudF07XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogRXhlY3V0ZSBlYWNoIGl0ZW0gaW4gdGhlIGxpc3RlbmVyIGNvbGxlY3Rpb24gaW4gb3JkZXIgd2l0aCB0aGUgc3BlY2lmaWVkIGRhdGEuXHJcbiAgICogQG1lbWJlcm9mISBFbWl0dGVyLnByb3RvdHlwZVxyXG4gICAqIEBmdW5jdGlvblxyXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCAtIFRoZSBuYW1lIG9mIHRoZSBldmVudCB5b3Ugd2FudCB0byBlbWl0LlxyXG4gICAqIEBwYXJhbSB7Li4uT2JqZWN0fSBkYXRhIC0gRGF0YSB0byBwYXNzIHRvIHRoZSBsaXN0ZW5lcnMuXHJcbiAgICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBhbiBpbnN0YW5jZSBvZiBFbWl0dGVyLlxyXG4gICAqIEBleGFtcGxlXHJcbiAgICogLy8gRW1pdHMgdGhlIFwiZm9vXCIgZXZlbnQgd2l0aCAncGFyYW0xJyBhbmQgJ3BhcmFtMicgYXMgYXJndW1lbnRzLlxyXG4gICAqIGVtaXR0ZXIuZW1pdCgnZm9vJywgJ3BhcmFtMScsICdwYXJhbTInKTtcclxuICAgKi9cclxuXHJcbiAgRW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uIGVtaXQoZXZlbnQpIHtcclxuICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcblxyXG4gICAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBBcnJheShfbGVuID4gMSA/IF9sZW4gLSAxIDogMCksIF9rZXkgPSAxOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XHJcbiAgICAgIGFyZ3NbX2tleSAtIDFdID0gYXJndW1lbnRzW19rZXldO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBsaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XHJcblxyXG4gICAgLy8gRGVmaW5lcyBsaXN0ZW5lcnMgdmFsdWUuXHJcbiAgICBpZiAoIXRoaXMuX2V2ZW50Q29sbGVjdGlvbiB8fCAhKGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50Q29sbGVjdGlvbltldmVudF0pKSB7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENsb25lIGxpc3RlbmVyc1xyXG4gICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLnNsaWNlKDApO1xyXG5cclxuICAgIGxpc3RlbmVycy5mb3JFYWNoKGZ1bmN0aW9uIChmbikge1xyXG4gICAgICByZXR1cm4gZm4uYXBwbHkoX3RoaXMsIGFyZ3MpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIEVtaXR0ZXI7XHJcbn0pKCk7XHJcblxyXG4vKipcclxuICogRXhwb3J0cyBFbWl0dGVyXHJcbiAqL1xyXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IEVtaXR0ZXI7XHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1tcImRlZmF1bHRcIl07Il19
