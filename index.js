'use strict';

/**
 * Module dependencies
 */
var Emitter = require('jvent');

/**
 * Classnames
 */
var SLIDEOUT_PANEL = 'slideout-panel';
var SLIDEOUT_MENU = 'slideout-menu';
var SLIDEOUT_OPEN = 'slideout-open';
var SLIDEOUT_MOVE = 'slideout-move';

/**
 * CSS prefixed properties
 */
var WEBKIT_TRANSFORM = '-webkit-transform';
var WEBKIT_TRANSITION = '-webkit-transition';

/**
 * Privates
 */
var scrolling = false;

var html = document.documentElement;

var msPointerSupported = navigator.msPointerEnabled;

var touch = {
  'start': msPointerSupported ? 'MSPointerDown' : 'touchstart',
  'move': msPointerSupported ? 'MSPointerMove' : 'touchmove',
  'end': msPointerSupported ? 'MSPointerUp' : 'touchend'
};

var touchPassiveListener = touch.start === 'touchstart' ? { passive: true, capture: false } : false;
var movePassiveListener = touch.start === 'touchstart' ? { passive: false, capture: false } : false;

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

function hasIgnoredElements(el) {
  while (el.parentNode) {
    if (el.getAttribute('data-slideout-ignore') !== null) {
      return el;
    }
    el = el.parentNode;
  }
  return null;
}

/**
 * Slideout constructor
 */
function Slideout(options) {
  options = options || {};

  // Sets default values
  this._startOffsetX = 0;
  this._startOffsetY = 0;
  this._currentOffsetX = 0;
  this._opening = false;
  this._moved = false;
  this._opened = false;
  this._preventOpen = false;

  // Sets slideout elements
  this.panel = options.panel;
  this.menu = options.menu;
  this.itemToMove = options.itemToMove === 'panel' ? this.panel : this.menu;
  this.dimmer = document.createElement('div');
  this.dimmer.className = 'slideout-dimmer';
  this.panel.insertBefore(this.dimmer, this.panel.firstChild);

  // Sets options
  this._touch = options.touch === undefined ? true : options.touch && true;
  this._side = options.side || 'left';
  this._easing = options.fx || options.easing || 'ease';
  this._duration = parseInt(options.duration, 10) || 300;
  this._tolerance = parseInt(options.tolerance, 10) || 70;
  this._padding = this._translateTo = parseInt(options.padding, 10) || 256;
  this._orientation = this._side === 'right' ? -1 : 1;
  this._translateTo *= this._orientation;

  this._grabWidth = parseInt(options.grabWidth, 10) || Math.round(html.clientWidth / 3);

  // Sets  classnames
  if (!this.panel.classList.contains(SLIDEOUT_PANEL)) {
    this.panel.classList.add(SLIDEOUT_PANEL);
  }
  if (!this.panel.classList.contains(SLIDEOUT_PANEL + '-' + this._side)) {
    this.panel.classList.add(SLIDEOUT_PANEL + '-' + this._side);
  }
  if (!this.menu.classList.contains(SLIDEOUT_MENU)) {
    this.menu.classList.add(SLIDEOUT_MENU);
  }
  if (!this.menu.classList.contains(SLIDEOUT_MENU + '-' + this._side)) {
    this.menu.classList.add(SLIDEOUT_MENU + '-' + this._side);
  }
  if (options.itemToMove === 'panel') {
    this.panel.classList.add(SLIDEOUT_MOVE);
  } else {
    this.menu.classList.add(SLIDEOUT_MOVE);
  }

  var self = this;
  this._closeByDimmer = function(eve) {
    if (self._opened) {
      eve.preventDefault();
      eve.stopPropagation();
      self.close();
    }
  };

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
  this.emit('before:open');
  if (!html.classList.contains(SLIDEOUT_OPEN)) {
    html.classList.add(SLIDEOUT_OPEN);
  }
  this._addTransition();
  this._translateXTo(this._translateTo);
  this.panel.addEventListener('click', this._closeByDimmer, true);
  this._opened = true;
  setTimeout(function() {
    self._removeTransition();
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
  this.emit('before:close');
  this._addTransition();
  this._translateXTo(0);
  this.panel.removeEventListener('click', this._closeByDimmer);
  this._opened = false;
  setTimeout(function() {
    html.classList.remove(SLIDEOUT_OPEN);
    self.itemToMove.style[WEBKIT_TRANSFORM] = self.itemToMove.style.transform = null;
    self._removeTransition();
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
 * Translates panel and updates currentOffset with a given X point
 */
Slideout.prototype._translateXTo = function(translateX) {
  this._currentOffsetX = translateX;
  this.itemToMove.style[WEBKIT_TRANSFORM] = this.itemToMove.style.transform = 'translateX(' + translateX + 'px)';
  this.dimmer.style.opacity = (Math.abs(translateX) / this.menu.offsetWidth).toFixed(4); // smooth
  return this;
};

/**
 * Add transition properties
 */
Slideout.prototype._addTransition = function() {
  this.itemToMove.style[WEBKIT_TRANSITION] = WEBKIT_TRANSFORM + ' ' + this._duration + 'ms ' + this._easing;
  this.itemToMove.style.transition = 'transform ' + this._duration + 'ms ' + this._easing;
  this.dimmer.style[WEBKIT_TRANSITION] = this.dimmer.style.transition = 'opacity ' + this._duration + 'ms ' + this._easing;
  return this;
};

/**
 * Remove transition properties
 */
Slideout.prototype._removeTransition = function() {
  this.itemToMove.style.transition = this.itemToMove.style[WEBKIT_TRANSITION] = null;
  this.dimmer.style.transition = this.dimmer.style[WEBKIT_TRANSITION] = null;
  this.dimmer.style.opacity = null;
  return this;
};

/**
 * Initializes touch event
 */
Slideout.prototype._initTouchEvents = function() {
  var self = this;

 /**
  * Prevents touchmove event if slideout is moving
  */
  this._preventMove = function(eve) {
    if (self._moved) {
      eve.preventDefault();
    }
  };
  document.addEventListener(touch.move, this._preventMove, movePassiveListener);

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
    self._startOffsetY = eve.touches[0].pageY;

    var offset = self._startOffsetX;
    if (self._side === 'right') {
      offset = html.clientWidth - self._startOffsetX;
    }
    self._preventOpen = !self._touch || (this === self.panel && offset > self._grabWidth);
  };

  this.panel.addEventListener(touch.start, this._resetTouchFn, touchPassiveListener);
  this.menu.addEventListener(touch.start, this._resetTouchFn, touchPassiveListener);

  /**
   * Resets values on touchcancel
   */
  this._onTouchCancelFn = function() {
    self._moved = false;
    self._opening = false;
  };

  this.panel.addEventListener('touchcancel', this._onTouchCancelFn);
  this.menu.addEventListener('touchcancel', this._onTouchCancelFn);

  /**
   * Toggles slideout on touchend
   */
  this._onTouchEndFn = function() {
    if (self._moved) {
      self.emit('translate:end');
      (self._opening && Math.abs(self._currentOffsetX) > self._tolerance) ? self.open() : self.close();
    }
    self._moved = false;
    scrolling = false;
  };

  this.panel.addEventListener(touch.end, this._onTouchEndFn, touchPassiveListener);
  this.menu.addEventListener(touch.end, this._onTouchEndFn, touchPassiveListener);

  /**
   * Translates panel on touchmove
   */
  this._onTouchMoveFn = function(eve) {
    if (
      scrolling ||
      self._preventOpen ||
      typeof eve.touches === 'undefined' ||
      hasIgnoredElements(eve.target)
    ) {
      return;
    }

    var dif_x = eve.touches[0].pageX - self._startOffsetX;
    var dif_y = eve.touches[0].pageY - self._startOffsetY;
    var touchAngle = (Math.atan2(Math.abs(dif_y), Math.abs(dif_x)) * 180) / Math.PI;
    var isScrolling = touchAngle > 45;

    if (isScrolling && !self._opening) {
      scrolling = true;
      return;
    }

    if (eve.cancelable) {
      eve.preventDefault();
    }
    eve.stopPropagation();

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
        self.emit('translate:start');
      }

      if (oriented_dif_x <= 0) {
        translateX = dif_x + self._padding * self._orientation;
        self._opening = false;
      }

      if (!(self._moved && html.classList.contains(SLIDEOUT_OPEN))) {
        html.classList.add(SLIDEOUT_OPEN);
      }
      self._translateXTo(translateX);
      self.emit('translate', translateX);
      self._moved = true;
    }

  };

  this.panel.addEventListener(touch.move, this._onTouchMoveFn, movePassiveListener);
  this.menu.addEventListener(touch.move, this._onTouchMoveFn, movePassiveListener);

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
  document.removeEventListener(touch.move, this._preventMove, movePassiveListener);
  this.panel.removeEventListener(touch.start, this._resetTouchFn, touchPassiveListener);
  this.panel.removeEventListener('touchcancel', this._onTouchCancelFn);
  this.panel.removeEventListener(touch.end, this._onTouchEndFn, touchPassiveListener);
  this.panel.removeEventListener(touch.move, this._onTouchMoveFn, movePassiveListener);

  // Remove methods
  this.open = this.close = function() {};

  // Return the instance so it can be easily dereferenced
  return this;
};

/**
 * Expose Slideout
 */
module.exports = Slideout;
