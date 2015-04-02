'use strict';

/**
 * Module dependencies
 */
import decouple from 'decouple';
import Emitter from 'emitter';

/**
 * Constants
 */
const doc = window.document;
const html = doc.documentElement;
const msPointerSupported = window.navigator.msPointerEnabled;
const touch = {
  'start': msPointerSupported ? 'MSPointerDown' : 'touchstart',
  'move': msPointerSupported ? 'MSPointerMove' : 'touchmove',
  'end': msPointerSupported ? 'MSPointerUp' : 'touchend'
};

/**
 * Module scope variables
 */
let scrollTimeout;
let scrolling = false;

/**
 * Helpers
 */
const prefix = (() => {
  const regex = /^(Webkit|Khtml|Moz|ms|O)(?=[A-Z])/;
  const styleDeclaration = doc.getElementsByTagName('script')[0].style;
  for (let prop in styleDeclaration) {
    if (regex.test(prop)) {
      return `-${prop.match(regex)[0].toLowerCase()}-`;
    }
  }
  // Nothing found so far? Webkit does not enumerate over the CSS properties of the style object.
  // However (prop in style) returns the correct value, so we'll have to test for
  // the precence of a specific property
  if ('WebkitOpacity' in styleDeclaration) { return '-webkit-'; }
  if ('KhtmlOpacity' in styleDeclaration) { return '-khtml-'; }
  return '';
}());

const extend = (destination, from) => {
  for (let prop in from) {
    if (from[prop]) {
      destination[prop] = from[prop];
    }
  }
  return destination;
};

/**
 * Slideout constructor
 */
class Slideout extends Emitter {
  constructor({panel, menu, fx='ease', duration=300, tolerance=70, padding=256}={}) {
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
    this.panel.className += ' slideout-panel';
    this.menu.className += ' slideout-menu';

    // Sets options
    this._fx = fx;
    this._duration = parseInt(duration, 10);
    this._tolerance = parseInt(tolerance, 10);
    this._padding = parseInt(padding, 10);

    // Init touch events
    this._initTouchEvents();
  }

  /**
   * Opens the slideout menu.
   */
  open() {
    this.emit('beforeopen');
    if (html.className.search('slideout-open') === -1) { 
      html.className += ' slideout-open'; 
    }
    this._setTransition();
    this._translateXTo(this._padding);
    this._opened = true;
    setTimeout(() => {
      this.panel.style.transition = this.panel.style['-webkit-transition'] = '';
      this.emit('open');
    }, this._duration + 50);
    return this;
  }

  /**
   * Closes slideout menu.
   */
  close() {
    if (!this.isOpen() && !this._opening) { return this; }
    this.emit('beforeclose');
    this._setTransition();
    this._translateXTo(0);
    this._opened = false;
    setTimeout(() => {
      html.className = html.className.replace(/ slideout-open/, '');
      this.panel.style.transition = this.panel.style['-webkit-transition'] = '';
      this.emit('close');
    }, this._duration + 50);
    return this;
  }

  /**
   * Toggles (open/close) slideout menu.
   */
  toggle() {
    return this.isOpen() ? this.close() : this.open();
  };

  /**
   * Returns true if the slideout is currently open, and false if it is closed.
   */
  isOpen() {
    return this._opened;
  }

  /**
   * Translates panel and updates currentOffset with a given X point
   */
  _translateXTo(translateX) {
    this._currentOffsetX = translateX;
    this.panel.style[`${prefix}transform`] = this.panel.style.transform = `translate3d(${translateX}px, 0, 0)`;
  }

  /**
   * Set transition properties
   */
  _setTransition() {
    this.panel.style[`${prefix}transition`] = this.panel.style.transition = `${prefix}transform ${this._duration}ms ${this._fx}`;
  };

  /**
   * Initializes touch event
   */
  _initTouchEvents() {
    /**
     * Decouple scroll event
     */
    decouple(doc, 'scroll', () => {
      if (!this._moved) {
        clearTimeout(scrollTimeout);
        scrolling = true;
        scrollTimeout = setTimeout(() => scrolling = false, 250);
      }
    });

    /**
     * Prevents touchmove event if slideout is moving
     */
    doc.addEventListener(touch.move, (eve) => {
      if (self._moved) {
        eve.preventDefault();
      }
    });

    /**
     * Resets values on touchstart
     */
    this.panel.addEventListener(touch.start, eve => {
      this._moved = false;
      this._opening = false;
      this._startOffsetX = eve.touches[0].pageX;
      this._preventOpen = (!this.isOpen() && this.menu.clientWidth !== 0);
    });

    /**
     * Resets values on touchcancel
     */
    this.panel.addEventListener('touchcancel', () => {
      this._moved = false;
      this._opening = false;
    });

    /**
     * Toggles slideout on touchend
     */
    this.panel.addEventListener(touch.end, function() {
      if (self._moved) {
        (self._opening && Math.abs(self._currentOffsetX) > self._tolerance) ? self.open() : self.close();
      }
      self._moved = false;
    });

    /**
     * Translates panel on touchmove
     */
    this.panel.addEventListener(touch.move, eve => {

      if (scrolling || this._preventOpen) { return; }

      const dif_x = eve.touches[0].clientX - this._startOffsetX;
      let translateX = this._currentOffsetX = dif_x;

      if (Math.abs(translateX) > this._padding) { return; }

      if (Math.abs(dif_x) > 20) {
        this._opening = true;

        if (this._opened && dif_x > 0 || !this._opened && dif_x < 0) { return; }

        if (!this._moved && html.className.search('slideout-open') === -1) {
          html.className += ' slideout-open';
        }

        if (dif_x <= 0) {
          translateX = dif_x + this._padding;
          this._opening = false;
        }

        this.panel.style[`${prefix}transform`] = this.panel.style.transform = `translate3d(${translateX}px, 0, 0)`;
        this.emit('translate', translateX);
        this._moved = true;
      }

    });
  }
}

/**
 * Expose Slideout
 */
export default Slideout;
