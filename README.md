# Slideout.js

[![NPM version][npm-image]][npm-link] [![License][lic-image]][npm-link] [![Build status][travis-image]][travis-link] [![Coverage Status][coverage-image]][coverage-link] [![Dependency status][deps-image]][deps-link] [![devDependency status][devdeps-image]][devdeps-link] [![downloads][dt-image]][npm-link]

> A touch slideout navigation menu for your mobile web apps.

## Features

- Dependency-free.
- Simple markup.
- Native scrolling.
- Easy customization.
- CSS transforms & transitions.
- Just 2 Kb! (min & gzip)

## Demo

[Check out the demo](https://mango.github.io/slideout/) to see it in action (on your mobile or emulate touches on your browser).

<img src="https://i.imgur.com/AWgwlVW.gif" alt="Slideout.js demo">

## Installation

Slideout is available on cdnjs

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/slideout/1.0.1/slideout.min.js"></script>
```

Also you can use one of many package managers

    $ npm install slideout

    $ spm install slideout

    $ bower install slideout.js

    $ component install mango/slideout

## Usage

Implementing Slideout.js into your project is easy.

First of all, you'll need to create your markup. You should have a menu (`#menu`) and a main content (`#panel`) into your body.

```html
<nav id="menu">
  <header>
    <h2>Menu</h2>
  </header>
</nav>

<main id="panel">
  <header>
    <h2>Panel</h2>
  </header>
</main>
```

Add the Slideout.js styles (index.css) in your web application.

```css
body {
  width: 100%;
  height: 100%;
}

.slideout-menu {
  position: fixed;
  top: 0;
  bottom: 0;
  width: 256px;
  min-height: 100vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  z-index: 0;
  display: none;
}

.slideout-menu-left {
  left: 0;
}

.slideout-menu-right {
  right: 0;
}

.slideout-panel {
  position: relative;
  z-index: 1;
  will-change: transform;
  background-color: #FFF; /* A background-color is required */
  min-height: 100vh;
}

.slideout-open,
.slideout-open body,
.slideout-open .slideout-panel {
  overflow: hidden;
}

.slideout-open .slideout-menu {
  display: block;
}
```

Then you just include Slideout.js, create a new instance with some options and call the toggle method:

```html
<script src="dist/slideout.min.js"></script>
<script>
  var slideout = new Slideout({
    'panel': document.getElementById('panel'),
    'menu': document.getElementById('menu'),
    'padding': 256,
    'tolerance': 70
  });

  // Toggle button
  document.querySelector('.toggle-button').addEventListener('click', function() {
    slideout.toggle();
  });
</script>
```

#### Full example

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Slideout Demo</title>
    <meta http-equiv="cleartype" content="on">
    <meta name="MobileOptimized" content="320">
    <meta name="HandheldFriendly" content="True">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <style>
      body {
        width: 100%;
        height: 100%;
      }

      .slideout-menu {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        right: 0;
        z-index: 0;
        width: 256px;
        overflow-y: scroll;
        -webkit-overflow-scrolling: touch;
        display: none;
      }

      .slideout-panel {
        position: relative;
        z-index: 1;
        will-change: transform;
      }

      .slideout-open,
      .slideout-open body,
      .slideout-open .slideout-panel {
        overflow: hidden;
      }

      .slideout-open .slideout-menu {
        display: block;
      }
    </style>
  </head>
  <body>

    <nav id="menu">
      <h2>Menu</h2>
    </nav>

    <main id="panel">
      <header>
        <button class="toggle-button">☰</button>
        <h2>Panel</h2>
      </header>
    </main>

    <script src="dist/slideout.min.js"></script>
    <script>
      var slideout = new Slideout({
        'panel': document.getElementById('panel'),
        'menu': document.getElementById('menu'),
        'padding': 256,
        'tolerance': 70
      });

      // Toggle button
      document.querySelector('.toggle-button').addEventListener('click', function() {
        slideout.toggle();
      });
    </script>

  </body>
</html>
```

## Browser Support

- Chrome (IOS, Android, desktop)
- Firefox (Android, desktop)
- Safari (IOS, Android, desktop)
- Opera (desktop)
- IE 10+ (desktop and mobile)

## API

### Slideout(options)
Create a new instance of `Slideout`.

- `options` (Object) - Options to customize a new instance of Slideout.
- `options.panel` (HTMLElement) - The DOM element that contains all your application content (`.slideout-panel`).
- `options.menu` (HTMLElement) - The DOM element that contains your menu application (`.slideout-menu`).
- `[options.duration]` (Number) - The time (milliseconds) to open/close the slideout. Default: `300`.
- `[options.easing]` (String) - The CSS effect to use when animating the opening and closing of the slideout. Default: `ease`. Possible values:
    - `ease`
    - `linear`
    - `ease-in`
    - `ease-out`
    - `ease-in-out`
    - `step-start`
    - `step-end`
    - [`cubic-bezier`](http://cubic-bezier.com/)
- `[options.padding]` (Number) - Default: `256`.
- `[options.tolerance]` (Number) - The number of `px` needed for the menu can be opened completely, otherwise it closes. Default: `70`.
- `[options.touch]` (Boolean) - Set this option to false to disable Slideout touch events. Default: `true`.
- `[options.side]` (String) - The side to open the slideout (`left` or `right`). Default: `left`.

```js
var slideout = new Slideout({
  'panel': document.getElementById('main'),
  'menu': document.getElementById('menu'),
  'padding': 256,
  'tolerance': 70,
  'easing': 'cubic-bezier(.32,2,.55,.27)'
});
```

### Slideout.open();
Opens the slideout menu. It emits `beforeopen` and `open` events.

```js
slideout.open();
```

### Slideout.close();
Closes the slideout menu. It emits `beforeclose` and `close` events.

```js
slideout.close();
```

### Slideout.toggle();
Toggles (open/close) the slideout menu.

```js
slideout.toggle();
```

### Slideout.isOpen();
Returns `true` if the slideout is currently open, and `false` if it is closed.

```js
slideout.isOpen(); // true or false
```

### Slideout.destroy();
Cleans up the instance so another slideout can be created on the same area.

```js
slideout.destroy();
```

### Slideout.enableTouch();
Enables opening the slideout via touch events.

```js
slideout.enableTouch();
```

### Slideout.disableTouch();
Disables opening the slideout via touch events.

```js
slideout.disableTouch();
```

### Slideout.on(event, listener);
```js
slideout.on('open', function() { ... });
```

### Slideout.once(event, listener);
```js
slideout.once('open', function() { ... });
```

### Slideout.off(event, listener);
```js
slideout.off('open', listener);
```

### Slideout.emit(event, ...data);
```js
slideout.emit('open');
```

## Events

An instance of Slideout emits the following events:

- `beforeclose`
- `close`
- `beforeopen`
- `open`
- `translatestart`
- `translate`
- `translateend`

The slideout emits `translatestart`, `translate` and `translateend` events only when it is opening/closing via touch events.

```js
slideout.on('translatestart', function() {
  console.log('Start');
});

slideout.on('translate', function(translated) {
  console.log('Translate: ' + translated); // 120 in px
});

slideout.on('translateend', function() {
  console.log('End');
});

// 'Start'
// 'Translate 120'
// 'End'
```

## `data-slideout-ignore` attribute
You can use the special HTML attribute `data-slideout-ignore` to disable dragging on some elements. For example, if you have to prevent `slideout` will open when touch on carousels, maps, iframes, etc.

```html
<main id="panel">
  <header>
    <h2>Panel</h2>
  </header>
  <div id="carousel" data-slideout-ignore>
    <h2>Carousel</h2>
    ...
  </div>
</main>
```

## npm-scripts
```
$ npm run build
```

```
$ npm run dist
```

```
$ npm test
```

```
$ npm run hint
```

## FAQ

### How to add a toggle button.

```js
// vanilla js
document.querySelector('.toggle-button').addEventListener('click', function() {
  slideout.toggle();
});

// jQuery
$('.toggle-button').on('click', function() {
    slideout.toggle();
});
```

### How to open slideout from right side.

You should use the `side` option with the value `right`.
```js
var slideout = new Slideout({
  'panel': document.getElementById('content'),
  'menu': document.getElementById('menu'),
  'side': 'right'
});
```

### How to enable slideout only on mobile devices.

You should use `mediaqueries`:
```css
@media screen and (min-width: 780px) {
  .slideout-panel {
    margin-left: 256px;
  }

  .slideout-menu {
    display: block;
  }

  .btn-hamburger {
    display: none;
  }
}
```
Demo: http://codepen.io/pazguille/pen/mEdQvX

### How to use slideout with a fixed header.

First, you should define the styles for your fixed header:
```css
.fixed-header {
  position: fixed;
  width: 100%;
  height: 50px;
  backface-visibility: hidden;
  z-index: 2;
  background-color: red;
}
```

Then, using slideout's events you should translate the fixed header:
```js
var fixed = document.querySelector('.fixed-header');

slideout.on('translate', function(translated) {
  fixed.style.transform = 'translateX(' + translated + 'px)';
});

slideout.on('beforeopen', function () {
  fixed.style.transition = 'transform 300ms ease';
  fixed.style.transform = 'translateX(256px)';
});

slideout.on('beforeclose', function () {
  fixed.style.transition = 'transform 300ms ease';
  fixed.style.transform = 'translateX(0px)';
});

slideout.on('open', function () {
  fixed.style.transition = '';
});

slideout.on('close', function () {
  fixed.style.transition = '';
});
```

Demo: http://codepen.io/pazguille/pen/ZBxdgw


### How to disable dragging on some elements.
You can use the attribute `data-slideout-ignore` to disable dragging on some elements:

```html
<nav id="menu">
  <header>
    <h2>Menu</h2>
  </header>
</nav>

<main id="panel">
  <header>
    <h2>Panel</h2>
  </header>
  <div id="carousel" data-slideout-ignore>
    <h2>Carousel</h2>
    ...
  </div>
</main>
```

### How to add an overlay to close the menu on click.
You can do that using the powerful `slideout` API and a little extra CSS:

```css
.panel:before {
  content: '';
  display: block;
  background-color: rgba(0,0,0,0);
  transition: background-color 0.5s ease-in-out;
}

.panel-open:before {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
  background-color: rgba(0,0,0,.5);
  z-index: 99;
}
```

```js
function close(eve) {
  eve.preventDefault();
  slideout.close();
}

slideout
  .on('beforeopen', function() {
    this.panel.classList.add('panel-open');
  })
  .on('open', function() {
    this.panel.addEventListener('click', close);
  })
  .on('beforeclose', function() {
    this.panel.classList.remove('panel-open');
    this.panel.removeEventListener('click', close);
  });
```

Demo: http://codepen.io/pazguille/pen/BQYRYK

## With :heart: by
- Guille Paz (Front-end developer | Web standards lover)
- E-mail: [guille87paz@gmail.com](mailto:guille87paz@gmail.com)
- Twitter: [@pazguille](http://twitter.com/pazguille)
- Web: [http://pazguille.me](http://pazguille.me)

## License
MIT license. Copyright © 2015 [Mango](http://getmango.com).

[npm-image]: https://img.shields.io/npm/v/slideout.svg
[lic-image]: https://img.shields.io/npm/l/slideout.svg
[npm-link]: https://npmjs.org/package/slideout
[travis-image]: https://img.shields.io/travis/Mango/slideout.svg
[travis-link]: https://travis-ci.org/Mango/slideout
[deps-image]: https://img.shields.io/david/mango/slideout.svg
[deps-link]: https://david-dm.org/mango/slideout
[devdeps-image]: https://img.shields.io/david/dev/mango/slideout.svg
[devdeps-link]: https://david-dm.org/mango/slideout#info=devDependencies
[dt-image]: https://img.shields.io/npm/dt/slideout.svg
[coverage-image]: https://img.shields.io/coveralls/Mango/slideout.svg
[coverage-link]: https://coveralls.io/github/Mango/slideout
