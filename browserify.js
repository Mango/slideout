'use strict';

var fs = require('fs');
var browserify = require('browserify');
var babelify = require('babelify');

if (!fs.existsSync('./dist')) {
  fs.mkdirSync('./dist');
}

browserify({'debug': true, 'standalone': 'Slideout'})
  .transform(babelify, {'global': true})
  .require('./index.js', {'entry': true})
  .bundle()
  .on('error', function(err) { console.log('Error : ' + err.message); })
  .pipe(fs.createWriteStream('dist/slideout.js'));
