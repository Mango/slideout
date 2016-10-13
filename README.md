# Slideout.js
This is a fork of the slideout.js project: https://github.com/Mango/slideout

## Features
I forked this to add a feature that a company wanted: The ability to slide over instead of pushing the entire page.

I therefore made this an option when you initialize your slideout.js menu.

All changes to the code is marked with:
```js
// Slideover fork feature
```

## Usage
See the original project page for more details. This only covers this fork's changes.

Slideout menu initialization:
```html
<script>
  // Setup the slideout menu
  var slideout = new Slideout({
    'panel':     document.getElementById('panel'),
    'menu':      document.getElementById('menu'),
    'mode':      'slide' // <---- New option (slide|push)
  });
</script>
```

### CSS
I created a set of CSS classes for doing slide left, slide right, push left and push right.

#### Push left
The default configuration is push left.


#### Push right
```css
.slideout-right-menu {
  position: fixed;
  left: auto;
  right: 0;
}
```
```html
<nav id="menu" class="menu slideout-right-menu">
```

#### Slide left
```css
.slideout-slide-menu {
  left: -256px;
  display: block;
  z-index: 10;
  will-change: transform;
}
```
```html
<nav id="menu" class="menu slideout-slide-menu">
```

#### Slide right
```css
.slideout-right-menu {
  position: fixed;
  left: auto;
  right: 0;
}

.slideout-slide-menu {
  left: -256px;
  display: block;
  z-index: 10;
  will-change: transform;
}

.slideout-slide-menu.slideout-right-menu {
  right: -256px;
  left: auto;
}
```
```html
<nav id="menu" class="menu slideout-slide-menu slideout-right-menu">
```
