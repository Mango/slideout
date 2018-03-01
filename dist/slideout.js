var Slideout =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./index.js":
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\n/**\n * Module dependencies\n */\nvar Emitter = __webpack_require__(/*! jvent */ \"./node_modules/jvent/index.js\");\n\n/**\n * Classnames\n */\nvar SLIDEOUT_PANEL = 'slideout-panel';\nvar SLIDEOUT_MENU = 'slideout-menu';\nvar SLIDEOUT_OPEN = 'slideout-open';\nvar SLIDEOUT_MOVE = 'slideout-move';\n\n/**\n * CSS prefixed properties\n */\nvar WEBKIT_TRANSFORM = '-webkit-transform';\nvar WEBKIT_TRANSITION = '-webkit-transition';\n\n/**\n * Privates\n */\nvar scrollTimeout;\n\nvar scrolling = false;\n\nvar html = document.documentElement;\n\nvar msPointerSupported = navigator.msPointerEnabled;\n\nvar touch = {\n  'start': msPointerSupported ? 'MSPointerDown' : 'touchstart',\n  'move': msPointerSupported ? 'MSPointerMove' : 'touchmove',\n  'end': msPointerSupported ? 'MSPointerUp' : 'touchend'\n};\n\nfunction extend(destination, from) {\n  for (var prop in from) {\n    if (from[prop]) {\n      destination[prop] = from[prop];\n    }\n  }\n  return destination;\n}\n\nfunction inherits(child, uber) {\n  child.prototype = extend(child.prototype || {}, uber.prototype);\n}\n\nfunction hasIgnoredElements(el) {\n  while (el.parentNode) {\n    if (el.getAttribute('data-slideout-ignore') !== null) {\n      return el;\n    }\n    el = el.parentNode;\n  }\n  return null;\n}\n\n/**\n * Slideout constructor\n */\nfunction Slideout(options) {\n  options = options || {};\n\n  // Sets default values\n  this._startOffsetX = 0;\n  this._currentOffsetX = 0;\n  this._opening = false;\n  this._moved = false;\n  this._opened = false;\n  this._preventOpen = false;\n\n  // Sets slideout elements\n  this.panel = options.panel;\n  this.menu = options.menu;\n  this.itemToMove = options.itemToMove === 'panel' ? this.panel : this.menu;\n  this.dimmer = document.createElement('div');\n  this.dimmer.className = 'slideout-dimmer';\n  this.panel.insertBefore(this.dimmer, this.panel.firstChild);\n\n  // Sets options\n  this._touch = options.touch === undefined ? true : options.touch && true;\n  this._side = options.side || 'left';\n  this._easing = options.fx || options.easing || 'ease';\n  this._duration = parseInt(options.duration, 10) || 300;\n  this._tolerance = parseInt(options.tolerance, 10) || 70;\n  this._padding = this._translateTo = parseInt(options.padding, 10) || 256;\n  this._orientation = this._side === 'right' ? -1 : 1;\n  this._translateTo *= this._orientation;\n\n  this._grabWidth = parseInt(options.grabWidth, 10) || Math.round(html.clientWidth / 3);\n\n  // Sets  classnames\n  if (!this.panel.classList.contains(SLIDEOUT_PANEL)) {\n    this.panel.classList.add(SLIDEOUT_PANEL);\n  }\n  if (!this.panel.classList.contains(SLIDEOUT_PANEL + '-' + this._side)) {\n    this.panel.classList.add(SLIDEOUT_PANEL + '-' + this._side);\n  }\n  if (!this.menu.classList.contains(SLIDEOUT_MENU)) {\n    this.menu.classList.add(SLIDEOUT_MENU);\n  }\n  if (!this.menu.classList.contains(SLIDEOUT_MENU + '-' + this._side)) {\n    this.menu.classList.add(SLIDEOUT_MENU + '-' + this._side);\n  }\n  if (options.itemToMove === 'panel') {\n    this.panel.classList.add(SLIDEOUT_MOVE);\n  } else {\n    this.menu.classList.add(SLIDEOUT_MOVE);\n  }\n\n  var self = this;\n  this._closeByDimmer = function(eve) {\n    if (self._opened) {\n      eve.preventDefault();\n      eve.stopPropagation();\n      self.close();\n    }\n  };\n\n  // Init touch events\n  if (this._touch) {\n    this._initTouchEvents();\n  }\n}\n\n/**\n * Inherits from Emitter\n */\ninherits(Slideout, Emitter);\n\n/**\n * Opens the slideout menu.\n */\nSlideout.prototype.open = function() {\n  var self = this;\n  this.emit('before:open');\n  if (!html.classList.contains(SLIDEOUT_OPEN)) {\n    html.classList.add(SLIDEOUT_OPEN);\n  }\n  this._addTransition();\n  this._translateXTo(this._translateTo);\n  this.panel.addEventListener('click', this._closeByDimmer, true);\n  this._opened = true;\n  setTimeout(function() {\n    self._removeTransition();\n    self.emit('open');\n  }, this._duration + 50);\n  return this;\n};\n\n/**\n * Closes slideout menu.\n */\nSlideout.prototype.close = function() {\n  var self = this;\n  if (!this.isOpen() && !this._opening) {\n    return this;\n  }\n  this.emit('before:close');\n  this._addTransition();\n  this._translateXTo(0);\n  this.panel.removeEventListener('click', this._closeByDimmer);\n  this._opened = false;\n  setTimeout(function() {\n    html.classList.remove(SLIDEOUT_OPEN);\n    self.itemToMove.style[WEBKIT_TRANSFORM] = self.itemToMove.style.transform = null;\n    self._removeTransition();\n    self.emit('close');\n  }, this._duration + 50);\n  return this;\n};\n\n/**\n * Toggles (open/close) slideout menu.\n */\nSlideout.prototype.toggle = function() {\n  return this.isOpen() ? this.close() : this.open();\n};\n\n/**\n * Returns true if the slideout is currently open, and false if it is closed.\n */\nSlideout.prototype.isOpen = function() {\n  return this._opened;\n};\n\n/**\n * Translates panel and updates currentOffset with a given X point\n */\nSlideout.prototype._translateXTo = function(translateX) {\n  this._currentOffsetX = translateX;\n  this.itemToMove.style[WEBKIT_TRANSFORM] = this.itemToMove.style.transform = 'translateX(' + translateX + 'px)';\n  this.dimmer.style.opacity = (Math.abs(translateX) / this.menu.offsetWidth).toFixed(4); // smooth\n  return this;\n};\n\n/**\n * Add transition properties\n */\nSlideout.prototype._addTransition = function() {\n  this.itemToMove.style[WEBKIT_TRANSITION] = WEBKIT_TRANSFORM + ' ' + this._duration + 'ms ' + this._easing;\n  this.itemToMove.style.transition = 'transform ' + this._duration + 'ms ' + this._easing;\n  this.dimmer.style[WEBKIT_TRANSITION] = this.dimmer.style.transition = 'opacity ' + this._duration + 'ms ' + this._easing;\n  return this;\n};\n\n/**\n * Remove transition properties\n */\nSlideout.prototype._removeTransition = function() {\n  this.itemToMove.style.transition = this.itemToMove.style[WEBKIT_TRANSITION] = null;\n  this.dimmer.style.transition = this.dimmer.style[WEBKIT_TRANSITION] = null;\n  this.dimmer.style.opacity = null;\n  return this;\n};\n\n/**\n * Initializes touch event\n */\nSlideout.prototype._initTouchEvents = function() {\n  var self = this;\n\n  /**\n   * Decouple scroll event\n   */\n   this._onScrollFn = function _onScrollFn() {\n    if (!self._moved) {\n      clearTimeout(scrollTimeout);\n      scrolling = true;\n      scrollTimeout = setTimeout(function() {\n        scrolling = false;\n      }, 250);\n    }\n  };\n  document.addEventListener('scroll', this._onScrollFn, { passive: true });\n\n  /**\n   * Resets values on touchstart\n   */\n  this._resetTouchFn = function(eve) {\n    if (typeof eve.touches === 'undefined') {\n      return;\n    }\n\n    self._moved = false;\n    self._opening = false;\n    self._startOffsetX = eve.touches[0].pageX;\n\n    var offset = self._startOffsetX;\n    if (self._side === 'right') {\n      offset = html.clientWidth - self._startOffsetX;\n    }\n    self._preventOpen = !self._touch || (this === self.panel && offset > self._grabWidth);\n  };\n\n  this.panel.addEventListener(touch.start, this._resetTouchFn);\n  this.menu.addEventListener(touch.start, this._resetTouchFn);\n\n  /**\n   * Resets values on touchcancel\n   */\n  this._onTouchCancelFn = function() {\n    self._moved = false;\n    self._opening = false;\n  };\n\n  this.panel.addEventListener('touchcancel', this._onTouchCancelFn);\n  this.menu.addEventListener('touchcancel', this._onTouchCancelFn);\n\n  /**\n   * Toggles slideout on touchend\n   */\n  this._onTouchEndFn = function() {\n    if (self._moved) {\n      self.emit('translate:end');\n      (self._opening && Math.abs(self._currentOffsetX) > self._tolerance) ? self.open() : self.close();\n    }\n    self._moved = false;\n  };\n\n  this.panel.addEventListener(touch.end, this._onTouchEndFn);\n  this.menu.addEventListener(touch.end, this._onTouchEndFn);\n\n  /**\n   * Translates panel on touchmove\n   */\n  this._onTouchMoveFn = function(eve) {\n    if (\n      scrolling ||\n      self._preventOpen ||\n      typeof eve.touches === 'undefined' ||\n      hasIgnoredElements(eve.target)\n    ) {\n      return;\n    }\n\n    var dif_x = eve.touches[0].clientX - self._startOffsetX;\n    var translateX = self._currentOffsetX = dif_x;\n\n\n    if (Math.abs(translateX) > self._padding) {\n      return;\n    }\n\n    if (Math.abs(dif_x) > 20) {\n\n      self._opening = true;\n\n      var oriented_dif_x = dif_x * self._orientation;\n\n      if (self._opened && oriented_dif_x > 0 || !self._opened && oriented_dif_x < 0) {\n        return;\n      }\n\n      if (!self._moved) {\n        self.emit('translate:start');\n      }\n\n      if (oriented_dif_x <= 0) {\n        translateX = dif_x + self._padding * self._orientation;\n        self._opening = false;\n      }\n\n      if (!(self._moved && html.classList.contains(SLIDEOUT_OPEN))) {\n        html.classList.add(SLIDEOUT_OPEN);\n      }\n      self._translateXTo(translateX);\n      self.emit('translate', translateX);\n      self._moved = true;\n    }\n\n  };\n\n  this.panel.addEventListener(touch.move, this._onTouchMoveFn, { passive: true });\n  this.menu.addEventListener(touch.move, this._onTouchMoveFn, { passive: true });\n\n  return this;\n};\n\n/**\n * Enable opening the slideout via touch events.\n */\nSlideout.prototype.enableTouch = function() {\n  this._touch = true;\n  return this;\n};\n\n/**\n * Disable opening the slideout via touch events.\n */\nSlideout.prototype.disableTouch = function() {\n  this._touch = false;\n  return this;\n};\n\n/**\n * Destroy an instance of slideout.\n */\nSlideout.prototype.destroy = function() {\n  // Close before clean\n  this.close();\n\n  // Remove event listeners\n  this.panel.removeEventListener(touch.start, this._resetTouchFn);\n  this.panel.removeEventListener('touchcancel', this._onTouchCancelFn);\n  this.panel.removeEventListener(touch.end, this._onTouchEndFn);\n  this.panel.removeEventListener(touch.move, this._onTouchMoveFn);\n  document.removeEventListener('scroll', this._onScrollFn);\n\n  // Remove methods\n  this.open = this.close = function() {};\n\n  // Return the instance so it can be easily dereferenced\n  return this;\n};\n\n/**\n * Expose Slideout\n */\nmodule.exports = Slideout;\n\n\n//# sourceURL=webpack://Slideout/./index.js?");

/***/ }),

/***/ "./node_modules/jvent/index.js":
/*!*************************************!*\
  !*** ./node_modules/jvent/index.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nfunction Jvent() {}\n\n/**\n * Adds a listener to the collection for a specified event.\n * @public\n * @function\n * @name Jvent#on\n * @param {string} event Event name.\n * @param {function} listener Listener function.\n * @example\n * // Will add a event listener to the \"ready\" event\n * var startDoingStuff = function (event, param1, param2, ...) {\n *   // Some code here!\n * };\n *\n * me.on(\"ready\", startDoingStuff);\n */\nJvent.prototype.on = function(event, listener) {\n  this._collection = this._collection || {};\n  this._collection[event] = this._collection[event] || [];\n  this._collection[event].push(listener);\n  return this;\n};\n\n/**\n * Adds a one time listener to the collection for a specified event. It will execute only once.\n * @public\n * @function\n * @name Jvent#once\n * @param {string} event Event name.\n * @param {function} listener Listener function.\n * @returns itself\n * @example\n * // Will add a event handler to the \"contentLoad\" event once\n * me.once(\"contentLoad\", startDoingStuff);\n */\nJvent.prototype.once = function (event, listener) {\n  var that = this;\n\n  function fn() {\n    that.off(event, fn);\n    listener.apply(this, arguments);\n  }\n\n  fn.listener = listener;\n\n  this.on(event, fn);\n\n  return this;\n};\n\n/**\n * Removes a listener from the collection for a specified event.\n * @public\n * @function\n * @name Jvent#off\n * @param {string} event Event name.\n * @param {function} listener Listener function.\n * @returns itself\n * @example\n * // Will remove event handler to the \"ready\" event\n * var startDoingStuff = function () {\n *   // Some code here!\n * };\n *\n * me.off(\"ready\", startDoingStuff);\n */\nJvent.prototype.off = function (event, listener) {\n\n  var listeners = this._collection && this._collection[event],\n      j = 0;\n\n  if (listeners !== undefined) {\n    for (j; j < listeners.length; j += 1) {\n      if (listeners[j] === listener || listeners[j].listener === listener) {\n        listeners.splice(j, 1);\n        break;\n      }\n    }\n\n    if (listeners.length === 0) {\n      this.removeAllListeners(event);\n    }\n  }\n\n  return this;\n};\n\n/**\n * Removes all listeners from the collection for a specified event.\n * @public\n * @function\n * @name Jvent#removeAllListeners\n * @param {string} event Event name.\n * @returns itself\n * @example\n * me.removeAllListeners(\"ready\");\n */\nJvent.prototype.removeAllListeners = function (event) {\n  this._collection = this._collection || {};\n  delete this._collection[event];\n  return this;\n};\n\n/**\n * Returns all listeners from the collection for a specified event.\n * @public\n * @function\n * @name Jvent#listeners\n * @param {string} event Event name.\n * @returns Array\n * @example\n * me.listeners(\"ready\");\n */\nJvent.prototype.listeners = function (event) {\n  this._collection = this._collection || {};\n  return this._collection[event];\n};\n\n/**\n * Execute each item in the listener collection in order with the specified data.\n * @name Jvent#emit\n * @public\n * @protected\n * @param {string} event The name of the event you want to emit.\n * @param {...object} var_args Data to pass to the listeners.\n * @example\n * // Will emit the \"ready\" event with \"param1\" and \"param2\" as arguments.\n * me.emit(\"ready\", \"param1\", \"param2\");\n */\nJvent.prototype.emit = function () {\n  if (this._collection === undefined) {\n    return this;\n  }\n\n  var args = [].slice.call(arguments, 0), // converted to array\n      event = args.shift(),\n      listeners = this._collection[event],\n      i = 0,\n      len;\n\n  if (listeners) {\n    listeners = listeners.slice(0);\n    len = listeners.length;\n    for (i; i < len; i += 1) {\n      listeners[i].apply(this, args);\n    }\n  }\n\n  return this;\n};\n\n/**\n * Expose Jvent\n */\nmodule.exports = Jvent;\n\n\n//# sourceURL=webpack://Slideout/./node_modules/jvent/index.js?");

/***/ })

/******/ });