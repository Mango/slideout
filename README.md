# Slideout.js [![NPM version][npm-image]][npm-link] [![Build status][travis-image]][travis-link] [![devDependency status][devdeps-image]][devdeps-link]

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
<script src="https://cdnjs.cloudflare.com/ajax/libs/slideout/0.1.11/slideout.min.js"></script>
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
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  z-index: 0;
  width: 256px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  display: none;
}

.slideout-panel {
  position:relative;
  z-index: 1;
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

Then you just include Slideout.js and create a new instance with some options:

```html
<script src="dist/slideout.min.js"></script>
<script>
  var slideout = new Slideout({
    'panel': document.getElementById('panel'),
    'menu': document.getElementById('menu'),
    'padding': 256,
    'tolerance': 70
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
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        display: none;
      }

      .slideout-panel {
        position:relative;
        z-index: 1;
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
- IE 10+ (desktop)

## API

### Slideout(options)
Create a new instance of `Slideout`.

- `options` (Object) - Options to customize a new instance of Slideout.
- `options.panel` (HTMLElement) - The DOM element that contains all your application content (`.slideout-panel`).
- `options.menu` (HTMLElement) - The DOM element that contains your menu application (`.slideout-menu`).
- `[options.duration]` (Number) - The time (milliseconds) to open/close the slideout. Default: `300`.
- `[options.fx]` (String) - The CSS effect to use when animating the opening and closing of the slideout. Default: `ease`.
- `[options.padding]` (Number) - Default: `256`.
- `[options.tolerance]` (Number) - Default: `70`.
- `[options.touch]` (Boolean) - Set this option to false to disable Slideout touch events. Default: `true`.
- `[options.side]` (String) - The side to open the slideout (`left` or `right`). Default: `left`.

```js
var slideout = new Slideout({
  'panel': document.getElementById('main'),
  'menu': document.getElementById('menu'),
  'padding': 256,
  'tolerance': 70
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
- `translate`

The slideout emits `translate` event only when it is opening/closing via touch events.

```js
slideout.on('translate', function(translated) {
  console.log(translated); // 120 in px
});
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

You should define `left: auto` on the class `.slideout-menu`.
```css
.slideout-menu {
  left: auto;
}
```

Then, use the `side` option with the value `right`.
```js
var slideout = new Slideout({
  'panel': document.getElementById('content'),
  'menu': document.getElementById('menu'),
  'side': 'right'
});
```

## With ❤ by
- Guille Paz (Front-end developer | Web standards lover)
- E-mail: [guille87paz@gmail.com](mailto:guille87paz@gmail.com)
- Twitter: [@pazguille](http://twitter.com/pazguille)
- Web: [http://pazguille.me](http://pazguille.me)

## License
MIT license. Copyright © 2015 [Mango](http://getmango.com).

[npm-image]: https://img.shields.io/npm/v/slideout.svg?style=flat
[npm-link]: https://npmjs.org/package/slideout
[travis-image]: https://img.shields.io/travis/Mango/slideout.svg?style=flat
[travis-link]: https://travis-ci.org/Mango/slideout
[devdeps-image]: https://img.shields.io/david/dev/mango/slideout.svg?style=flat
[devdeps-link]: https://david-dm.org/mango/slideout#info=peerDependencies
