/*
 * yact
 * https://github.com/richardschneider/yact
 *
 * Copyright (c) 2015 Richard Schneider
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');
var dot = require('dot');
dot.templateSettings.strip = false;
var dots = dot.process({ path: path.dirname(module.filename)});

module.exports.script = function(config) {
  config.primaryKey = config.primaryKey || config.table + '_id';
  return dots.trigger(config);
};

module.exports.auditScript = function() {
  return dots.audit({});
};
