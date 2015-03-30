# Slideout.js [![NPM version][npm-image]][npm-link] [![Build status][travis-image]][travis-link] [![devDependency status][devdeps-image]][devdeps-link]

> A touch slideout navigation menu for your mobile web apps.

## Features

- Dependency-free.
- Simple markup.
- Native scrolling.
- Easy customization.
- CSS transforms & transitions.
- Just 4 Kb!

## Demo

[Check out the demo](https://mango.github.io/slideout/) to see it in action (on your mobile or emulate touches on your browser).

<img src="https://i.imgur.com/AWgwlVW.gif" alt="Slideout.js demo">

## Installation

    $ npm install slideout

    $ spm install slideout

    $ bower install https://github.com/Mango/slideout.git

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
        <button>☰</button>
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

```js
var slideout = new Slideout({
  'panel': document.getElementById('main'),
  'menu': document.getElementById('menu'),
  'padding': 256,
  'tolerance': 70
});
```

### Slideout.open();
Opens the slideout menu.

```js
slideout.open();
```

### Slideout.close();
Closes the slideout menu.

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

### Slideout.change(callback);
Adds `callback` to the list of functions to be called after the slideout finishes
changing state.

```js
slideout.change(function () {
  alert('open? ' + slideout.isOpen());
}); // alerts the user after a state change.
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
