'use strict';

var gutil   = require('gulp-util');
var through = require('through2');
var lodash  = require('lodash');
var path    = require('path');

var templateUrlRegExp = /templateUrl\:[^\'\"]*(\'|\")([^\'\"]+)(\'|\")/gm;

function expandTemplateUrlPlugin(options) {

  var opts = lodash.extend({ root: '' }, options);
  return through.obj(objectStream);

  function objectStream(file, enc, cb) {
    /* jshint validthis: true */

    var _this = this;

    if (file.isNull()) {
      this.push(file);
      return cb();
    }

    if (file.isStream()) {
      _this.emit('error', pluginError('Streaming not supported'));
      return cb();
    }

    try {
      var relPath = path.relative(file.base, path.dirname(file.path));
      var contents = file.contents.toString();
      file.contents = new Buffer(expandTemplateUrls(contents, relPath, opts));
    } catch (err) {
      err.fileName = file.path;
      _this.emit('error', pluginError(err));
    }

    _this.push(file);
    cb();
  }
}

function pluginError(msg) {
  return new gutil.PluginError('gulp-strip-line', msg);
}

function expandTemplateUrls(content, relPath, opts) {
  if (!content) { return content; }

  var output = content.toString();
  var expansion = path.join(opts.root, relPath, '$2');
  return output.replace(templateUrlRegExp, 'templateUrl: \'' + expansion + '\',');
}

module.exports = expandTemplateUrlPlugin;
