if (exports) {
  var fs = require('fs');
  var jsdom = require('jsdom');
  var html = fs.readFileSync('./test/index.html', 'utf-8');
  window = jsdom.jsdom(html).parentWindow;
  var Slideout = require('../');
  var assert = require('better-assert');
}

var doc = window.document;
var slideout = new Slideout({
  'panel': doc.getElementById('panel'),
  'menu': doc.getElementById('menu')
});

var slideoutRight = new Slideout({
  'panel': doc.getElementById('panel'),
  'menu': doc.getElementById('menu-right'),
  'position': 'right'
});

describe('Slideout', function () {

  it('should be defined.', function () {
    assert(Slideout !== undefined);
  });

  it('should be a function.', function () {
    assert(typeof Slideout === 'function');
  });

  it('should return a new instance.', function () {
    assert(slideout instanceof Slideout);
  });

  describe('should have the following methods:', function () {
    var methods = ['open', 'close', 'toggle', 'isOpen', '_initTouchEvents', '_translateXTo', '_setTransition'];
    var i = 0;
    var len = methods.length;
    for (i; i < len; i += 1) {
      (function (i) {
        it('.' + methods[i] + '()', function (done) {
          assert(typeof slideout[methods[i]] === 'function');
          done()
        });
      }(i));
    }
  });

  describe('should define the following properties:', function () {
    var properties = [
      'panel',
      'menu',
      '_startOffsetX',
      '_currentOffsetX',
      '_opening',
      '_moved',
      '_opened',
      '_fx',
      '_duration',
      '_tolerance',
      '_padding'
    ];
    var i = 0;
    var len = properties.length;
    for (i; i < len; i += 1) {
      (function (i) {
        it('.' + properties[i] + '()', function (done) {
          assert(slideout[properties[i]] !== undefined);
          done()
        });
      }(i));
    }
  });

  it('should add classnames to panel and menu DOM elements.', function () {
    assert(slideout.panel.className.search('slideout-panel') !== -1);
    assert(slideout.menu.className.search('slideout-menu') !== -1);
  });

  describe('.open()', function () {
    it('should add "slideout-open" classname to HTML.', function () {
      assert(doc.documentElement.className.search('slideout-open') === -1);
      slideout.open();
      assert(doc.documentElement.className.search('slideout-open') !== -1);
    });

    it('should translateX the panel to the given padding.', function () {
      var translate3d = exports ? 'translate3d(256px, 0, 0)' : 'translate3d(256px, 0px, 0px)';
      assert(slideout.panel.style.transform === translate3d);
      assert(slideout.panel.style.transition.search(/transform 300ms ease/) !== -1);
    });

    it('should translateX the panel to a negative padding when using right position.', function () {
      var translate3d = exports ? 'translate3d(-256px, 0, 0)' : 'translate3d(-256px, 0px, 0px)';
      slideoutRight.open();
      assert(slideoutRight.panel.style.transform === translate3d);
      assert(slideoutRight.panel.style.transition.search(/transform 300ms ease/) !== -1);
      slideoutRight.close();
    });

    it('should set the menu\'s visibility to visible.', function () {
      assert(slideout.menu.style.visibility === 'visible');
    });

    it('should set _opened to true.', function () {
      assert(slideout._opened === true);
    });
  });

  describe('.isOpen()', function () {
    it('should return true if the slideout is opened.', function () {
      assert(slideout.isOpen());
    });
  });

  describe('.close()', function () {
    it('should remove "slideout-open" classname to HTML.', function (done) {
      assert(doc.documentElement.className.search('slideout-open') !== -1);
      slideout.close();
      setTimeout(function(){
        assert(doc.documentElement.className.search('slideout-open') === -1);
        done();
      }, 350);

    });

    it('should translateX the panel to 0.', function () {
      var translate3d = exports ? 'translate3d(0px, 0, 0)' : 'translate3d(0px, 0px, 0px)';
      assert(slideout.panel.style.transform === translate3d);
      assert(slideout.panel.style.transition === '');
    });

    it('should set the menu\'s visibility to hidden.', function () {
      assert(slideout.menu.style.visibility === 'hidden');
    });

    it('should set _opened to false.', function () {
      assert(slideout._opened === false);
    });
  });

  describe('.toggle()', function () {
    it('should show the slideout if it is not opened.', function (done) {
      assert(doc.documentElement.className.search('slideout-open') === -1);
      slideout.toggle();
      assert(doc.documentElement.className.search('slideout-open') !== -1);
      slideout.toggle();
      setTimeout(function(){
        assert(doc.documentElement.className.search('slideout-open') === -1);
        done()
      }, 350);
    });
  });
});
