'use strict';

/**
 * Module dependencies
 */
var decouple = require('decouple');
var Emitter = require('jvent');

/**
 * Classnames
 */
var SLIDEOUT_PANEL = 'slideout-panel';
var SLIDEOUT_MENU = 'slideout-menu';
var SLIDEOUT_OPEN = 'slideout-open';

/**
 * CSS prefixed properties
 */
var WEBKIT_TRANSFORM = '-webkit-transform';
var WEBKIT_TRANSITION = '-webkit-transition';

/**
 * Privates
 */
var scrollTimeout;

var scrolling = false;

var html = document.documentElement;

var msPointerSupported = navigator.msPointerEnabled;

var touch = {
  'start': msPointerSupported ? 'MSPointerDown' : 'touchstart',
  'move': msPointerSupported ? 'MSPointerMove' : 'touchmove',
  'end': msPointerSupported ? 'MSPointerUp' : 'touchend'
};

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
  this._currentOffsetX = 0;
  this._opening = false;
  this._moved = false;
  this._opened = false;
  this._preventOpen = false;

  // Sets slideout elements
  this.panel = options.panel;
  this.menu = options.menu;
  this.itemToMove = options.itemToMove === 'panel' ? this.panel : this.menu;
  this.dimmer = document.querySelector('.slideout-dimmer');

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
  this.emit('beforeopen');
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
  this.emit('beforeclose');
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
  this.itemToMove.style[WEBKIT_TRANSFORM] = this.itemToMove.transform = 'translateX(' + translateX + 'px)';
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
   * Decouple scroll event
   */
  this._onScrollFn = decouple(document, 'scroll', function() {
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

  document.addEventListener(touch.move, this._preventMove);

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

    var offset = self._startOffsetX;
    if (self._side === 'right') {
      offset = html.clientWidth - self._startOffsetX;
    }
    self._preventOpen = !self._touch || (this === self.panel && offset > self._grabWidth);
  };

  this.panel.addEventListener(touch.start, this._resetTouchFn);
  this.menu.addEventListener(touch.start, this._resetTouchFn);

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
      self.emit('translateend');
      (self._opening && Math.abs(self._currentOffsetX) > self._tolerance) ? self.open() : self.close();
    }
    self._moved = false;
  };

  this.panel.addEventListener(touch.end, this._onTouchEndFn);
  this.menu.addEventListener(touch.end, this._onTouchEndFn);

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

      if (!(self._moved && html.classList.contains(SLIDEOUT_OPEN))) {
        html.classList.add(SLIDEOUT_OPEN);
      }
      self._translateXTo(translateX);
      self.emit('translate', translateX);
      self._moved = true;
    }

  };

  this.panel.addEventListener(touch.move, this._onTouchMoveFn);
  this.menu.addEventListener(touch.move, this._onTouchMoveFn);

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
  document.removeEventListener(touch.move, this._preventMove);
  this.panel.removeEventListener(touch.start, this._resetTouchFn);
  this.panel.removeEventListener('touchcancel', this._onTouchCancelFn);
  this.panel.removeEventListener(touch.end, this._onTouchEndFn);
  this.panel.removeEventListener(touch.move, this._onTouchMoveFn);
  document.removeEventListener('scroll', this._onScrollFn);

  // Remove methods
  this.open = this.close = function() {};

  // Return the instance so it can be easily dereferenced
  return this;
};

/**
 * Expose Slideout
 */
module.exports = Slideout;
